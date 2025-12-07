import { Suspense } from 'react';
import { redirectIfAuthenticated } from '@/lib/auth-guard';
import { ResetPasswordForm } from './components/reset-password-form';

export default async function ResetPasswordPage() {
	await redirectIfAuthenticated();

	return (
		<div className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
			<Suspense fallback={<div>Loading...</div>}>
				<ResetPasswordForm />
			</Suspense>
		</div>
	);
}
