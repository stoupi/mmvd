import type { AppPermission } from '@/app/generated/prisma';

type WelcomeEmailParams = {
	to: string;
	firstName?: string;
	lastName?: string;
	title?: string;
	setupLink: string;
	permissions: AppPermission[];
	centreCode?: string;
	centreName?: string;
	customSubject?: string;
	customHtml?: string;
	customText?: string;
};

function getPermissionType(permissions: AppPermission[]): 'admin' | 'submission-reviewer' | 'submission' | 'reviewer' {
	const hasSubmission = permissions.includes('SUBMISSION');
	const hasReviewing = permissions.includes('REVIEWING');
	const hasAdmin = permissions.includes('ADMIN');

	if (hasAdmin) return 'admin';
	if (hasSubmission && hasReviewing) return 'submission-reviewer';
	if (hasSubmission) return 'submission';
	return 'reviewer';
}

function getPermissionDescription(permissionType: string): string {
	const descriptions: Record<string, string> = {
		admin: 'You have been granted <strong>Administrator</strong> access to the MMVD platform. This gives you full access to manage users, review proposals, submit proposals, and configure the platform.',
		'submission-reviewer': 'You have been granted <strong>Submission and Reviewing</strong> access to the MMVD platform. You can submit new research proposals and review proposals from other investigators.',
		submission: 'You have been granted <strong>Submission</strong> access to the MMVD platform. You can submit new research proposals and track their review status.',
		reviewer: 'You have been granted <strong>Reviewer</strong> access to the MMVD platform. You can review and evaluate research proposals submitted by other investigators.'
	};

	return descriptions[permissionType];
}

export function generateEmailPreview(params: Omit<WelcomeEmailParams, 'to' | 'setupLink'> & { setupLink?: string }) {
	const setupLink = params.setupLink || '[ACCOUNT_SETUP_LINK]';
	return renderWelcomeEmail({ ...params, to: '', setupLink });
}

function renderWelcomeEmail({
	firstName,
	lastName,
	title,
	setupLink,
	permissions,
	centreCode,
	centreName,
	customSubject,
	customHtml,
	customText,
}: WelcomeEmailParams) {
	if (customSubject && customHtml && customText) {
		return { subject: customSubject, html: customHtml, text: customText };
	}

	const fullName = [title, firstName, lastName].filter(Boolean).join(' ') || undefined;
	const permissionType = getPermissionType(permissions);

	// Template spécial pour SUBMISSION only
	if (permissionType === 'submission') {
		const subject = 'MMVD Study: Invitation to Access the Ancillary Study Platform';
		const piName = fullName || 'Principal Investigator';
		const centreInfo = centreCode && centreName ? `Center ${centreCode} – ${centreName}` : 'your center';

		const text = `Dear ${piName},
Principal Investigator for ${centreInfo},

We hope you are doing well.

As the Principal Investigator of your center for the EACVI MMVD study, you play a key role in shaping and advancing the ancillary study program. We are delighted to invite you to join our new online platform dedicated to the submission, tracking, and evaluation of ancillary study proposals.

To activate your account, please click on the link below and set your password:
${setupLink}

Once logged in, you will be able to:
- submit new ancillary study proposals,
- follow the review process and status of each submission,
- access feedback from the Steering Committee,
- collaborate more easily with investigators across participating centers.

Our goal is to make this process smoother, more transparent, and more collaborative for all investigators involved in the MMVD study.

If you have any questions or experience any difficulty accessing the platform, please feel free to contact us. We are always here to support you.

Thank you once again for your involvement and continued commitment to the MMVD study. Your contribution is essential to the scientific success of this international project.

Warm regards,
MMVD Study Team`;

		const html = `<!DOCTYPE html>
<html>
  <head>
    <meta charset="UTF-8" />
    <title>MMVD Study: Invitation to Access the Ancillary Study Platform</title>
  </head>
  <body style="font-family: Arial, Helvetica, sans-serif; font-size: 14px; color: #222222; line-height: 1.6;">

    <p>Dear ${piName},<br>
    Principal Investigator for ${centreInfo},</p>
    <br>

    <p>We hope you are doing well.</p>
    <br>

    <p>
      As the <strong>Principal Investigator of your center for the EACVI MMVD study</strong>, you play a key role
      in shaping and advancing the ancillary study program. We are delighted to invite you to join our new
      <strong>online platform dedicated to the submission, tracking, and evaluation of ancillary study proposals</strong>.
    </p>
    <br>

    <p>
      To activate your account, please click on the link below and set your password:<br><br>
      👉 <a href="${setupLink}" style="color: #0066cc; text-decoration: none; font-weight: 600;">Create your password</a>
    </p>
    <br>

    <p>Once logged in, you will be able to:</p>
    <ul>
      <li>submit new ancillary study proposals,</li>
      <li>follow the review process and status of each submission,</li>
      <li>access feedback from the Steering Committee,</li>
      <li>collaborate more easily with investigators across participating centers.</li>
    </ul>
    <br>

    <p>
      Our goal is to make this process smoother, more transparent, and more collaborative for all investigators
      involved in the MMVD study.
    </p>
    <br>

    <p>
      If you have any questions or experience any difficulty accessing the platform, please feel free to contact us.
      We are always here to support you.
    </p>
    <br>

    <p>
      Thank you once again for your involvement and continued commitment to the MMVD study.<br>
      Your contribution is essential to the scientific success of this international project.
    </p>
    <br>

    <p>
      Warm regards,<br>
      <strong>MMVD Study Team</strong>
    </p>

  </body>
</html>`;

		return { subject, text, html };
	}

	// Template générique pour les autres types (admin, reviewer, submission-reviewer)
	const subject = 'Welcome to MMVD portal';
	const greeting = 'Dear';
	const nameLine = fullName ? ` ${fullName}` : '';
	const roleDescription = getPermissionDescription(permissionType);
	const intro = 'We are pleased to invite you to join the MMVD platform.';
	const ctaText = 'Set up my account';
	const linkInstruction = 'Please click the link below to set up your account and create your password:';
	const expiryNote = 'This link will expire in 7 days.';

	const text = `${greeting}${nameLine},\n\n${intro}\n\n${roleDescription.replace(/<\/?strong>/g, '')}\n\n${linkInstruction}\n\n${setupLink}\n\n${expiryNote}`;

	const html = `
    <div style="font-family: Inter, system-ui, -apple-system, Segoe UI, Roboto, Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <p>${greeting}${nameLine},</p>
      <p>${intro}</p>
      <p style="margin: 16px 0; padding: 16px; background: #f9fafb; border-left: 3px solid #db2777; border-radius: 4px;">
        ${roleDescription}
      </p>
      <p>${linkInstruction}</p>
      <p style="margin: 24px 0;">
        <a href="${setupLink}" style="background:#db2777;color:#fff;padding:12px 24px;border-radius:6px;text-decoration:none;display:inline-block">${ctaText}</a>
      </p>
      <p style="color:#666;font-size:14px;">${expiryNote}</p>
    </div>
  `;
	return { subject, text, html };
}

export async function sendWelcomeEmail(
	params: WelcomeEmailParams,
): Promise<{ id: string } | { error: string }> {
	const { subject, text, html } = renderWelcomeEmail(params);
	const apiKey = process.env.RESEND_API_KEY;
	if (!apiKey) return { error: 'RESEND_API_KEY missing' };
	const from = process.env.RESEND_FROM || 'noreply@your-domain.com';
	const res = await fetch('https://api.resend.com/emails', {
		method: 'POST',
		headers: {
			Authorization: `Bearer ${apiKey}`,
			'Content-Type': 'application/json',
		},
		body: JSON.stringify({
			from,
			to: [params.to],
			subject,
			text,
			html,
		}),
	});
	if (!res.ok) {
		const errorBody = await res.text();
		console.error('Resend API Error (sendWelcomeEmail):', { status: res.status, body: errorBody });
		return { error: `RESEND_REQUEST_FAILED_${res.status}: ${errorBody}` };
	}
	const json = (await res.json()) as { id?: string };
	console.log('Resend API Response:', json);

	if (!json.id) {
		console.error('Resend API returned success but no email ID:', json);
		return { error: 'RESEND_NO_ID_RETURNED' };
	}

	return { id: json.id };
}

type ResetPasswordEmailParams = {
	to: string;
	resetUrl: string;
};

function renderResetPasswordEmail({ resetUrl }: ResetPasswordEmailParams) {
	const subject = 'Reset your password';
	const greeting = 'Hello,';
	const intro = 'You requested to reset your password. Click the link below to create a new password.';
	const ctaText = 'Reset my password';
	const expiryNote = 'This link will expire in 1 hour. If you did not request this reset, you can ignore this email.';

	const text = `${greeting}\n\n${intro}\n\n${resetUrl}\n\n${expiryNote}`;

	const html = `
    <div style="font-family: Inter, system-ui, -apple-system, Segoe UI, Roboto, Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <p>${greeting}</p>
      <p>${intro}</p>
      <p style="margin: 24px 0;">
        <a href="${resetUrl}" style="background:#111827;color:#fff;padding:12px 24px;border-radius:6px;text-decoration:none;display:inline-block">${ctaText}</a>
      </p>
      <p style="color:#666;font-size:14px;">${expiryNote}</p>
    </div>
  `;
	return { subject, text, html };
}

export async function sendResetPasswordEmail(
	params: ResetPasswordEmailParams,
): Promise<{ id: string } | { error: string }> {
	const { subject, text, html } = renderResetPasswordEmail(params);
	const apiKey = process.env.RESEND_API_KEY;
	if (!apiKey) return { error: 'RESEND_API_KEY missing' };
	const from = process.env.RESEND_FROM || 'noreply@your-domain.com';
	const res = await fetch('https://api.resend.com/emails', {
		method: 'POST',
		headers: {
			Authorization: `Bearer ${apiKey}`,
			'Content-Type': 'application/json',
		},
		body: JSON.stringify({
			from,
			to: [params.to],
			subject,
			text,
			html,
		}),
	});
	if (!res.ok) {
		return { error: `RESEND_REQUEST_FAILED_${res.status}` };
	}
	const json = (await res.json()) as { id?: string };
	return { id: json.id ?? '' };
}

type ReviewAssignmentEmailParams = {
	to: string;
	reviewerName: string;
	proposals: Array<{
		title: string;
		piName: string;
		mainArea: string;
		deadline: Date;
	}>;
};

function renderReviewAssignmentEmail({ reviewerName, proposals }: ReviewAssignmentEmailParams) {
	const count = proposals.length;
	const subject = `New proposal${count > 1 ? 's' : ''} to review (${count})`;

	const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
	const reviewingLink = `${appUrl}/reviewing`;

	const greeting = `Dear ${reviewerName},`;
	const intro = `You have been assigned as a reviewer for ${count} new proposal${count > 1 ? 's' : ''}:`;

	const proposalsList = proposals.map((proposal, index) => {
		const formattedDeadline = new Date(proposal.deadline).toLocaleDateString('en-US', {
			year: 'numeric',
			month: 'long',
			day: 'numeric'
		});
		return `${index + 1}. ${proposal.title}\n   - PI: ${proposal.piName}\n   - Area: ${proposal.mainArea}\n   - Deadline: ${formattedDeadline}`;
	}).join('\n\n');

	const ctaText = 'Please visit your reviewing dashboard to view and submit your reviews.';

	const text = `${greeting}\n\n${intro}\n\n${proposalsList}\n\n${ctaText}\n\n${reviewingLink}`;

	const proposalsHtml = proposals.map((proposal, index) => {
		const formattedDeadline = new Date(proposal.deadline).toLocaleDateString('en-US', {
			year: 'numeric',
			month: 'long',
			day: 'numeric'
		});
		return `
			<div style="margin: 16px 0; padding: 16px; background: #f9fafb; border-left: 3px solid #111827; border-radius: 4px;">
				<div style="font-weight: 600; margin-bottom: 8px;">${index + 1}. ${proposal.title}</div>
				<div style="font-size: 14px; color: #6b7280; line-height: 1.6;">
					<div><strong>PI:</strong> ${proposal.piName}</div>
					<div><strong>Area:</strong> ${proposal.mainArea}</div>
					<div><strong>Deadline:</strong> ${formattedDeadline}</div>
				</div>
			</div>
		`;
	}).join('');

	const html = `
		<div style="font-family: Inter, system-ui, -apple-system, Segoe UI, Roboto, Arial, sans-serif; max-width: 600px; margin: 0 auto;">
			<p>${greeting}</p>
			<p>${intro}</p>
			${proposalsHtml}
			<p style="margin-top: 24px;">${ctaText}</p>
			<p style="margin: 24px 0;">
				<a href="${reviewingLink}" style="background:#111827;color:#fff;padding:12px 24px;border-radius:6px;text-decoration:none;display:inline-block">View My Proposals</a>
			</p>
		</div>
	`;

	return { subject, text, html };
}

export async function sendReviewAssignmentEmail(
	params: ReviewAssignmentEmailParams,
): Promise<{ id: string } | { error: string }> {
	const { subject, text, html } = renderReviewAssignmentEmail(params);
	const apiKey = process.env.RESEND_API_KEY;
	if (!apiKey) return { error: 'RESEND_API_KEY missing' };
	const from = process.env.RESEND_FROM || 'noreply@your-domain.com';
	const res = await fetch('https://api.resend.com/emails', {
		method: 'POST',
		headers: {
			Authorization: `Bearer ${apiKey}`,
			'Content-Type': 'application/json',
		},
		body: JSON.stringify({
			from,
			to: [params.to],
			subject,
			text,
			html,
		}),
	});
	if (!res.ok) {
		return { error: `RESEND_REQUEST_FAILED_${res.status}` };
	}
	const json = (await res.json()) as { id?: string };
	return { id: json.id ?? '' };
}
