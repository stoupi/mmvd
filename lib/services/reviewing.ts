import { prisma } from '@/lib/prisma';
import type { ReviewDecision, OverlapAssessment } from '@/app/generated/prisma';

// Reviewer Selection
export async function getEligibleReviewers(proposalMainAreaId?: string) {
  const users = await prisma.user.findMany({
    where: {
      permissions: { has: 'REVIEWING' },
      isActive: true
    },
    include: {
      reviewTopics: true,
      _count: {
        select: {
          reviews: {
            where: { isDeleted: false }
          }
        }
      }
    }
  });

  return users
    .map((user) => ({
      id: user.id,
      name: `${user.firstName || ''} ${user.lastName || ''}`.trim() || user.email,
      email: user.email,
      assignmentCount: user._count.reviews,
      hasTopicMatch: proposalMainAreaId
        ? user.reviewTopics.some((topic) => topic.id === proposalMainAreaId)
        : false
    }))
    .sort((a, b) => {
      // Topic match first
      if (a.hasTopicMatch && !b.hasTopicMatch) return -1;
      if (!a.hasTopicMatch && b.hasTopicMatch) return 1;
      // Then alphabetical
      return a.name.localeCompare(b.name);
    });
}

// Draft Assignment Management
export async function createDraftAssignment(data: {
  proposalId: string;
  reviewerId: string;
  deadline: Date;
}) {
  // Check if assignment already exists (draft or validated)
  const existingReview = await prisma.review.findUnique({
    where: {
      proposalId_reviewerId: {
        proposalId: data.proposalId,
        reviewerId: data.reviewerId
      }
    }
  });

  if (existingReview && !existingReview.isDeleted) {
    throw new Error('This reviewer is already assigned to this proposal');
  }

  // If there's a deleted review, reactivate it instead of creating a new one
  if (existingReview && existingReview.isDeleted) {
    return prisma.review.update({
      where: {
        proposalId_reviewerId: {
          proposalId: data.proposalId,
          reviewerId: data.reviewerId
        }
      },
      data: {
        isDeleted: false,
        isDraft: true,
        deadline: data.deadline,
        status: 'PENDING'
      },
      include: {
        reviewer: true,
        proposal: {
          include: {
            mainArea: true
          }
        }
      }
    });
  }

  // Check if there are already 3 reviewers assigned
  const reviewCount = await prisma.review.count({
    where: {
      proposalId: data.proposalId,
      isDeleted: false
    }
  });

  if (reviewCount >= 3) {
    throw new Error('Maximum of 3 reviewers per proposal');
  }

  return prisma.review.create({
    data: {
      proposalId: data.proposalId,
      reviewerId: data.reviewerId,
      deadline: data.deadline,
      isDraft: true,
      status: 'PENDING'
    },
    include: {
      reviewer: true,
      proposal: {
        include: {
          mainArea: true
        }
      }
    }
  });
}

export async function updateDraftAssignment(reviewId: string, data: { deadline: Date }) {
  const review = await prisma.review.findUnique({
    where: { id: reviewId }
  });

  if (!review) {
    throw new Error('Review not found');
  }

  if (!review.isDraft) {
    throw new Error('Cannot update validated assignment');
  }

  return prisma.review.update({
    where: { id: reviewId },
    data: { deadline: data.deadline }
  });
}

export async function removeDraftAssignment(reviewId: string) {
  const review = await prisma.review.findUnique({
    where: { id: reviewId }
  });

  if (!review) {
    throw new Error('Review not found');
  }

  if (!review.isDraft) {
    throw new Error('Cannot remove validated assignment');
  }

  return prisma.review.update({
    where: { id: reviewId },
    data: { isDeleted: true }
  });
}

export async function getDraftAssignmentsByWindow(windowId: string) {
  return prisma.review.findMany({
    where: {
      isDraft: true,
      isDeleted: false,
      proposal: {
        submissionWindowId: windowId
      }
    },
    include: {
      reviewer: true,
      proposal: {
        include: {
          mainArea: true,
          piUser: true
        }
      }
    },
    orderBy: {
      assignedAt: 'desc'
    }
  });
}

// Validation & Email Sending
export async function validateAssignments(windowId: string) {
  // Get all draft reviews for this window
  const draftReviews = await prisma.review.findMany({
    where: {
      isDraft: true,
      isDeleted: false,
      proposal: {
        submissionWindowId: windowId,
        status: 'SUBMITTED'
      }
    },
    include: {
      reviewer: true,
      proposal: {
        include: {
          piUser: true,
          mainArea: true
        }
      }
    }
  });

  if (draftReviews.length === 0) {
    throw new Error('No draft assignments to validate');
  }

  // Group reviews by reviewer for email batching
  const reviewsByReviewer = draftReviews.reduce((acc, review) => {
    const reviewerId = review.reviewerId;
    if (!acc[reviewerId]) {
      acc[reviewerId] = [];
    }
    acc[reviewerId].push(review);
    return acc;
  }, {} as Record<string, typeof draftReviews>);

  // Send emails to each reviewer (will be imported from email service)
  const sendReviewAssignmentEmail = (await import('./email')).sendReviewAssignmentEmail;

  for (const [reviewerId, reviews] of Object.entries(reviewsByReviewer)) {
    const reviewer = reviews[0].reviewer;
    await sendReviewAssignmentEmail({
      to: reviewer.email,
      reviewerName: `${reviewer.firstName || ''} ${reviewer.lastName || ''}`.trim() || reviewer.email,
      proposals: reviews.map((review) => ({
        title: review.proposal.title,
        piName: `${review.proposal.piUser.firstName || ''} ${review.proposal.piUser.lastName || ''}`.trim() || review.proposal.piUser.email,
        mainArea: review.proposal.mainArea.label,
        deadline: review.deadline
      }))
    });
  }

  // Mark reviews as validated
  await prisma.review.updateMany({
    where: {
      id: {
        in: draftReviews.map((review) => review.id)
      }
    },
    data: {
      isDraft: false,
      emailSentAt: new Date()
    }
  });

  // Update proposal statuses to UNDER_REVIEW
  const proposalIds = [...new Set(draftReviews.map((review) => review.proposalId))];
  await prisma.proposal.updateMany({
    where: {
      id: { in: proposalIds }
    },
    data: {
      status: 'UNDER_REVIEW'
    }
  });

  return {
    reviewCount: draftReviews.length,
    proposalCount: proposalIds.length,
    reviewerCount: Object.keys(reviewsByReviewer).length
  };
}

export async function resendReviewerEmail(reviewId: string) {
  const review = await prisma.review.findUnique({
    where: { id: reviewId },
    include: {
      reviewer: true,
      proposal: {
        include: {
          piUser: true,
          mainArea: true
        }
      }
    }
  });

  if (!review) {
    throw new Error('Review not found');
  }

  if (review.isDraft) {
    throw new Error('Cannot resend email for draft assignment');
  }

  // Send email
  const sendReviewAssignmentEmail = (await import('./email')).sendReviewAssignmentEmail;
  await sendReviewAssignmentEmail({
    to: review.reviewer.email,
    reviewerName: `${review.reviewer.firstName || ''} ${review.reviewer.lastName || ''}`.trim() || review.reviewer.email,
    proposals: [
      {
        title: review.proposal.title,
        piName: `${review.proposal.piUser.firstName || ''} ${review.proposal.piUser.lastName || ''}`.trim() || review.proposal.piUser.email,
        mainArea: review.proposal.mainArea.label,
        deadline: review.deadline
      }
    ]
  });

  // Update emailSentAt
  await prisma.review.update({
    where: { id: reviewId },
    data: { emailSentAt: new Date() }
  });
}

// Reviewer Interface
export async function getReviewerAssignedProposals(reviewerId: string) {
  return prisma.review.findMany({
    where: {
      reviewerId,
      isDraft: false,
      isDeleted: false
    },
    include: {
      proposal: {
        include: {
          piUser: true,
          mainArea: true,
          centre: true
        }
      }
    },
    orderBy: {
      deadline: 'asc'
    }
  });
}

export async function getReviewById(reviewId: string, reviewerId: string) {
  const review = await prisma.review.findUnique({
    where: { id: reviewId },
    include: {
      proposal: {
        include: {
          piUser: true,
          mainArea: true,
          centre: true,
          submissionWindow: true
        }
      }
    }
  });

  if (!review) {
    throw new Error('Review not found');
  }

  if (review.reviewerId !== reviewerId) {
    throw new Error('Unauthorized access to this review');
  }

  if (review.isDraft) {
    throw new Error('This review has not been validated yet');
  }

  return review;
}

export async function submitReview(
  reviewId: string,
  data: {
    decision: ReviewDecision;
    overlap: OverlapAssessment;
    overlapDetails?: string;
    commentsForPI?: string;
    commentsForAdmin?: string;
  }
) {
  const review = await prisma.review.findUnique({
    where: { id: reviewId }
  });

  if (!review) {
    throw new Error('Review not found');
  }

  if (review.status === 'COMPLETED') {
    throw new Error('This review has already been submitted');
  }

  if (review.isDraft) {
    throw new Error('Cannot submit draft review');
  }

  // Check if deadline has passed
  const isLate = new Date() > new Date(review.deadline);

  return prisma.review.update({
    where: { id: reviewId },
    data: {
      decision: data.decision,
      overlap: data.overlap,
      overlapDetails: data.overlapDetails,
      commentsForPI: data.commentsForPI,
      commentsForAdmin: data.commentsForAdmin,
      status: 'COMPLETED',
      completedAt: new Date(),
      isLate
    }
  });
}

// Window-Centric Functions
export async function getWindowReviewingData(windowId: string) {
  const window = await prisma.submissionWindow.findUnique({
    where: { id: windowId },
    include: {
      proposals: {
        where: {
          status: { in: ['SUBMITTED', 'UNDER_REVIEW'] },
          isDeleted: false
        },
        include: {
          piUser: {
            select: {
              id: true,
              email: true,
              firstName: true,
              lastName: true
            }
          },
          centre: {
            select: {
              code: true,
              name: true
            }
          },
          mainArea: {
            select: {
              id: true,
              label: true,
              color: true
            }
          },
          reviews: {
            where: { isDeleted: false },
            include: {
              reviewer: {
                select: {
                  id: true,
                  firstName: true,
                  lastName: true,
                  email: true
                }
              }
            },
            orderBy: { createdAt: 'asc' }
          }
        },
        orderBy: { submittedAt: 'desc' }
      }
    }
  });

  return window;
}

interface ReviewerSummary {
  reviewer: {
    id: string;
    firstName: string | null;
    lastName: string | null;
    email: string;
    centre: {
      code: string;
    } | null;
    reviewTopics: Array<{
      id: string;
      label: string;
      color: string | null;
    }>;
  };
  proposalCount: number;
  draftCount: number;
  validatedCount: number;
  lastEmailSentAt: Date | null;
  reviews: Array<{
    id: string;
    proposalId: string;
    isDraft: boolean;
    emailSentAt: Date | null;
    deadline: Date;
    proposal: {
      id: string;
      title: string;
      piUser: {
        firstName: string | null;
        lastName: string | null;
        email: string;
      };
      mainArea: {
        label: string;
        color: string | null;
      };
      centre: {
        code: string;
      } | null;
    };
  }>;
}

export async function getReviewersSummaryForWindow(
  windowId: string
): Promise<ReviewerSummary[]> {
  const reviews = await prisma.review.findMany({
    where: {
      isDeleted: false,
      proposal: {
        submissionWindowId: windowId,
        status: { in: ['SUBMITTED', 'UNDER_REVIEW'] },
        isDeleted: false
      }
    },
    include: {
      reviewer: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
          centre: {
            select: {
              code: true
            }
          },
          reviewTopics: {
            select: {
              id: true,
              label: true,
              color: true
            }
          }
        }
      },
      proposal: {
        select: {
          id: true,
          title: true,
          piUser: {
            select: {
              firstName: true,
              lastName: true,
              email: true
            }
          },
          mainArea: {
            select: {
              label: true,
              color: true
            }
          },
          centre: {
            select: {
              code: true
            }
          }
        }
      }
    },
    orderBy: {
      reviewerId: 'asc'
    }
  });

  const reviewerMap = new Map<string, ReviewerSummary>();

  for (const review of reviews) {
    const reviewerId = review.reviewerId;

    if (!reviewerMap.has(reviewerId)) {
      reviewerMap.set(reviewerId, {
        reviewer: review.reviewer,
        proposalCount: 0,
        draftCount: 0,
        validatedCount: 0,
        lastEmailSentAt: null,
        reviews: []
      });
    }

    const summary = reviewerMap.get(reviewerId)!;
    summary.proposalCount++;

    if (review.isDraft) {
      summary.draftCount++;
    } else {
      summary.validatedCount++;
    }

    if (review.emailSentAt) {
      if (!summary.lastEmailSentAt || review.emailSentAt > summary.lastEmailSentAt) {
        summary.lastEmailSentAt = review.emailSentAt;
      }
    }

    summary.reviews.push({
      id: review.id,
      proposalId: review.proposalId,
      isDraft: review.isDraft,
      emailSentAt: review.emailSentAt,
      deadline: review.deadline,
      proposal: review.proposal
    });
  }

  return Array.from(reviewerMap.values());
}

export async function sendEmailToReviewer(
  reviewerId: string,
  windowId: string
): Promise<{ reviewCount: number; proposalCount: number }> {
  const reviews = await prisma.review.findMany({
    where: {
      reviewerId,
      isDeleted: false,
      proposal: {
        submissionWindowId: windowId,
        status: { in: ['SUBMITTED', 'UNDER_REVIEW'] },
        isDeleted: false
      }
    },
    include: {
      reviewer: true,
      proposal: {
        include: {
          piUser: true,
          mainArea: true
        }
      }
    }
  });

  if (reviews.length === 0) {
    throw new Error('No reviews found for this reviewer in this window');
  }

  const reviewer = reviews[0].reviewer;

  const sendReviewAssignmentEmail = (await import('./email')).sendReviewAssignmentEmail;
  await sendReviewAssignmentEmail({
    to: reviewer.email,
    reviewerName: `${reviewer.firstName || ''} ${reviewer.lastName || ''}`.trim() || reviewer.email,
    proposals: reviews.map((review) => ({
      title: review.proposal.title,
      piName:
        `${review.proposal.piUser.firstName || ''} ${review.proposal.piUser.lastName || ''}`.trim() ||
        review.proposal.piUser.email,
      mainArea: review.proposal.mainArea.label,
      deadline: review.deadline
    }))
  });

  await prisma.review.updateMany({
    where: {
      id: {
        in: reviews.map((review) => review.id)
      }
    },
    data: {
      isDraft: false,
      emailSentAt: new Date()
    }
  });

  // Update proposal statuses to UNDER_REVIEW if they have reviews
  const proposalIds = [...new Set(reviews.map((review) => review.proposalId))];
  await prisma.proposal.updateMany({
    where: {
      id: { in: proposalIds },
      status: 'SUBMITTED'
    },
    data: {
      status: 'UNDER_REVIEW'
    }
  });

  return {
    reviewCount: reviews.length,
    proposalCount: reviews.length
  };
}

export async function validateAndSendAllEmailsForWindow(windowId: string) {
  return validateAssignments(windowId);
}
