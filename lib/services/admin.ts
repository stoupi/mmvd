import { prisma } from '@/lib/prisma';
import type { AppPermission, WindowStatus } from '@/app/generated/prisma';
import { createId } from '@paralleldrive/cuid2';

// Main Areas Management
export async function createMainArea(data: { label: string; description?: string }) {
  return prisma.mainArea.create({
    data
  });
}

export async function updateMainArea(id: string, data: { label?: string; description?: string }) {
  return prisma.mainArea.update({
    where: { id },
    data
  });
}

export async function deleteMainArea(id: string) {
  const proposalCount = await prisma.proposal.count({
    where: { mainAreaId: id }
  });

  if (proposalCount > 0) {
    throw new Error('Cannot delete main area with existing proposals');
  }

  return prisma.mainArea.delete({
    where: { id }
  });
}

export async function getAllMainAreas() {
  return prisma.mainArea.findMany({
    include: {
      _count: {
        select: {
          proposals: {
            where: {
              status: {
                not: 'DRAFT'
              },
              isDeleted: false
            }
          }
        }
      }
    },
    orderBy: { label: 'asc' }
  });
}

// Users Management
export async function getAllUsers() {
  return prisma.user.findMany({
    select: {
      id: true,
      email: true,
      firstName: true,
      lastName: true,
      title: true,
      affiliation: true,
      centreId: true,
      centre: {
        select: {
          code: true,
          name: true
        }
      },
      permissions: true,
      isActive: true,
      createdAt: true,
      reviewTopics: {
        select: {
          id: true,
          label: true
        }
      },
      _count: {
        select: {
          proposalsAsPi: true,
          reviews: true
        }
      }
    },
    orderBy: { createdAt: 'desc' }
  });
}

export async function updateUserPermissions(userId: string, permissions: AppPermission[]) {
  return prisma.user.update({
    where: { id: userId },
    data: { permissions }
  });
}

export async function updateUserStatus(userId: string, isActive: boolean) {
  return prisma.user.update({
    where: { id: userId },
    data: { isActive }
  });
}

export async function updateUserProfile(
  userId: string,
  data: {
    firstName?: string;
    lastName?: string;
    affiliation?: string;
    centreId?: string;
  }
) {
  return prisma.user.update({
    where: { id: userId },
    data
  });
}

export async function createUser(data: {
  email: string;
  firstName: string;
  lastName: string;
  title?: string;
  affiliation?: string;
  centreId: string;
  permissions: AppPermission[];
}) {
  const existingUser = await prisma.user.findUnique({
    where: { email: data.email }
  });

  if (existingUser) {
    throw new Error('A user with this email already exists');
  }

  return prisma.user.create({
    data: {
      id: createId(),
      email: data.email,
      firstName: data.firstName,
      lastName: data.lastName,
      name: `${data.firstName} ${data.lastName}`,
      title: data.title || null,
      affiliation: data.affiliation || null,
      centreId: data.centreId,
      permissions: data.permissions,
      isActive: true,
      emailVerified: false
    }
  });
}

export async function createPlaceholderUser(data: {
  email: string;
  firstName?: string;
  lastName?: string;
  title?: string;
  affiliation?: string;
  centreId: string;
  permissions: AppPermission[];
  locale?: string;
}) {
  const existingUser = await prisma.user.findUnique({
    where: { email: data.email }
  });

  if (existingUser) {
    throw new Error('A user with this email already exists');
  }

  return prisma.user.create({
    data: {
      id: createId(),
      email: data.email,
      firstName: data.firstName || null,
      lastName: data.lastName || null,
      name: [data.firstName, data.lastName].filter(Boolean).join(' ') || data.email,
      title: data.title || null,
      affiliation: data.affiliation || null,
      centreId: data.centreId,
      permissions: data.permissions,
      locale: data.locale || null,
      isActive: true,
      emailVerified: false
    }
  });
}

export async function updateUserReviewTopics(userId: string, mainAreaIds: string[]) {
  return prisma.user.update({
    where: { id: userId },
    data: {
      reviewTopics: {
        set: mainAreaIds.map(id => ({ id }))
      }
    },
    include: {
      reviewTopics: true
    }
  });
}

// Submission Windows Management
export async function createSubmissionWindow(data: {
  name: string;
  submissionOpenAt: Date;
  submissionCloseAt: Date;
  reviewStartAt?: Date;
  reviewDeadlineDefault?: Date;
  responseDeadline?: Date;
  nextWindowOpensAt?: Date;
}) {
  return prisma.submissionWindow.create({
    data: {
      ...data,
      status: 'UPCOMING'
    }
  });
}

export async function updateSubmissionWindow(
  id: string,
  data: {
    name?: string;
    submissionOpenAt?: Date;
    submissionCloseAt?: Date;
    reviewStartAt?: Date;
    reviewDeadlineDefault?: Date;
    responseDeadline?: Date;
    nextWindowOpensAt?: Date;
  }
) {
  return prisma.submissionWindow.update({
    where: { id },
    data
  });
}

export async function updateWindowStatus(id: string, status: WindowStatus) {
  return prisma.submissionWindow.update({
    where: { id },
    data: { status }
  });
}

export async function deleteSubmissionWindow(id: string) {
  const proposalCount = await prisma.proposal.count({
    where: { submissionWindowId: id }
  });

  if (proposalCount > 0) {
    throw new Error('Cannot delete submission window with existing proposals');
  }

  return prisma.submissionWindow.delete({
    where: { id }
  });
}

export async function getAllSubmissionWindows() {
  return prisma.submissionWindow.findMany({
    include: {
      _count: {
        select: {
          proposals: {
            where: {
              status: 'SUBMITTED',
              isDeleted: false
            }
          }
        }
      }
    },
    orderBy: { submissionOpenAt: 'desc' }
  });
}

// Proposals Management (Admin View)
export async function getAllProposals() {
  return prisma.proposal.findMany({
    where: {
      isDeleted: false,
      status: {
        not: 'DRAFT'
      }
    },
    include: {
      piUser: {
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          centreId: true
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
      submissionWindow: {
        select: {
          id: true,
          name: true,
          status: true
        }
      },
      reviews: {
        where: {
          isDeleted: false
        },
        select: {
          id: true,
          decision: true,
          status: true,
          isDraft: true,
          reviewer: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true
            }
          }
        },
        orderBy: {
          createdAt: 'asc'
        }
      }
    },
    orderBy: { createdAt: 'desc' }
  });
}

export async function getProposalsByWindow(windowId: string) {
  return prisma.proposal.findMany({
    where: {
      submissionWindowId: windowId,
      isDeleted: false
    },
    include: {
      piUser: {
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          centreId: true
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
        where: {
          isDeleted: false
        },
        select: {
          id: true,
          decision: true,
          status: true,
          isDraft: true,
          reviewer: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true
            }
          }
        },
        orderBy: {
          createdAt: 'asc'
        }
      }
    },
    orderBy: { createdAt: 'desc' }
  });
}

export async function getProposalsByStatus(status: string) {
  return prisma.proposal.findMany({
    where: {
      status: status as any,
      isDeleted: false
    },
    include: {
      piUser: {
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          centreId: true
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
      submissionWindow: {
        select: {
          id: true,
          name: true,
          status: true
        }
      },
      reviews: {
        where: {
          isDeleted: false
        },
        select: {
          id: true,
          decision: true,
          status: true,
          isDraft: true,
          reviewer: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true
            }
          }
        },
        orderBy: {
          createdAt: 'asc'
        }
      }
    },
    orderBy: { createdAt: 'desc' }
  });
}

export async function getAdminProposalDetails(proposalId: string) {
  return prisma.proposal.findUnique({
    where: {
      id: proposalId,
      isDeleted: false
    },
    include: {
      piUser: {
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          affiliation: true,
          centreId: true
        }
      },
      centre: {
        select: {
          code: true,
          name: true,
          city: true,
          countryCode: true
        }
      },
      mainArea: true,
      submissionWindow: true,
      reviews: {
        where: {
          isDeleted: false
        },
        include: {
          reviewer: {
            select: {
              id: true,
              email: true,
              firstName: true,
              lastName: true
            }
          }
        },
        orderBy: { createdAt: 'desc' }
      }
    }
  });
}

// Statistics
export async function getAdminStatistics() {
  const [
    totalUsers,
    activeUsers,
    totalProposals,
    submittedProposals,
    draftProposals,
    totalWindows,
    openWindows
  ] = await Promise.all([
    prisma.user.count(),
    prisma.user.count({ where: { isActive: true } }),
    prisma.proposal.count({ where: { isDeleted: false } }),
    prisma.proposal.count({ where: { isDeleted: false, status: { not: 'DRAFT' } } }),
    prisma.proposal.count({ where: { isDeleted: false, status: 'DRAFT' } }),
    prisma.submissionWindow.count(),
    prisma.submissionWindow.count({ where: { status: 'OPEN' } })
  ]);

  return {
    users: {
      total: totalUsers,
      active: activeUsers
    },
    proposals: {
      total: totalProposals,
      submitted: submittedProposals,
      drafts: draftProposals
    },
    windows: {
      total: totalWindows,
      open: openWindows
    }
  };
}
