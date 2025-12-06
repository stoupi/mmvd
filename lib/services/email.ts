type WelcomeEmailParams = {
	to: string;
	locale: 'en' | 'fr';
	firstName?: string;
	lastName?: string;
	title?: string;
	setupLink: string;
};

function renderWelcomeEmail({
	locale,
	firstName,
	lastName,
	title,
	setupLink,
}: WelcomeEmailParams) {
	const fullName = [title, firstName, lastName].filter(Boolean).join(' ') || undefined;
	const subject = locale === 'fr' ? 'Bienvenue sur le portail MMVD' : 'Welcome to MMVD portal';

	const greeting = locale === 'fr' ? 'Bonjour' : 'Dear';
	const nameLine = fullName ? ` ${fullName}` : '';
	const intro =
		locale === 'fr'
			? 'Ceci est un message automatique pour vous inviter à rejoindre la plateforme MMVD.'
			: 'This is an automatic message to invite you to join the MMVD platform.';
	const ctaText = locale === 'fr' ? "Lien d'accès" : 'Set up link';

	const linkInstruction =
		locale === 'fr'
			? 'Veuillez cliquer sur le lien ci-dessous pour configurer votre compte :'
			: 'Please click the link below to set up your account:';

	const text = `${greeting}${nameLine},\n\n${intro}\n\n${linkInstruction}\n\n${setupLink}`;

	const html = `
    <div style="font-family: Inter, system-ui, -apple-system, Segoe UI, Roboto, Arial, sans-serif;">
      <p>${greeting}${nameLine},</p>
      <p>${intro}</p>
      <p><a href="${setupLink}" style="background:#111827;color:#fff;padding:10px 14px;border-radius:6px;text-decoration:none;display:inline-block">${ctaText}</a></p>
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
		return { error: `RESEND_REQUEST_FAILED_${res.status}` };
	}
	const json = (await res.json()) as { id?: string };
	return { id: json.id ?? '' };
}

type ResetPasswordEmailParams = {
	to: string;
	resetUrl: string;
	locale: 'en' | 'fr';
};

function renderResetPasswordEmail({ resetUrl, locale }: ResetPasswordEmailParams) {
	const subject =
		locale === 'fr' ? 'Réinitialisation de votre mot de passe' : 'Reset your password';

	const greeting = locale === 'fr' ? 'Bonjour,' : 'Hello,';
	const intro =
		locale === 'fr'
			? 'Vous avez demandé à réinitialiser votre mot de passe. Cliquez sur le lien ci-dessous pour créer un nouveau mot de passe.'
			: 'You requested to reset your password. Click the link below to create a new password.';
	const ctaText = locale === 'fr' ? 'Réinitialiser mon mot de passe' : 'Reset my password';
	const expiryNote =
		locale === 'fr'
			? "Ce lien expirera dans 1 heure. Si vous n'avez pas demandé cette réinitialisation, vous pouvez ignorer cet e-mail."
			: 'This link will expire in 1 hour. If you did not request this reset, you can ignore this email.';

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
