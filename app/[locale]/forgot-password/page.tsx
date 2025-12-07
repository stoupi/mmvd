import { redirectIfAuthenticated } from '@/lib/auth-guard';
import { ForgotPasswordForm } from './components/forgot-password-form';

export default async function ForgotPasswordPage() {
	await redirectIfAuthenticated();

	return (
		<div className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
			<ForgotPasswordForm />
		</div>
	);
}
