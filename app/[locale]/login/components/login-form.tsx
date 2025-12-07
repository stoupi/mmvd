'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useTranslations, useLocale } from 'next-intl';
import { useAction } from 'next-safe-action/hooks';
import { z } from 'zod';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { AlertCircle, LogIn, Eye, EyeOff } from 'lucide-react';
import { loginAction } from '../actions';
import { authClient } from '@/lib/auth-client';
import { useRouter } from '@/app/i18n/navigation';

export function LoginForm() {
	const t = useTranslations('auth');
	const locale = useLocale();
	const router = useRouter();
	const [showPassword, setShowPassword] = useState(false);
	const { refetch: refetchSession } = authClient.useSession();

	const formSchema = z.object({
		email: z.string().email(t('invalidEmail')),
		password: z.string().min(6, t('passwordMinLength')),
	});

	type FormData = z.infer<typeof formSchema>;

	const {
		register,
		handleSubmit,
		formState: { errors },
		setError,
	} = useForm<FormData>({
		resolver: zodResolver(formSchema),
	});

	const { execute: executeLogin, isExecuting } = useAction(loginAction, {
		onError: ({ error }) => {
			if (error.serverError) {
				setError('root', { message: error.serverError });
			} else {
				setError('root', { message: t('invalidCredentials') });
			}
		},
		onSuccess: async ({ data }) => {
			if (data?.success && data.redirectTo) {
				refetchSession();
				router.push(`/${locale}${data.redirectTo}`);
				router.refresh();
			}
		},
	});

	const handleLogin = async (data: FormData) => {
		executeLogin(data);
	};

	const handlePasswordToggle = () => {
		setShowPassword((prev) => !prev);
	};

	const handleForgotPassword = () => {
		router.push('/forgot-password');
	};

	return (
		<div className='w-md mx-auto'>
			<Card>
				<CardHeader className='text-center space-y-4'>
					<div className='w-12 h-12 bg-primary rounded-full flex items-center justify-center mx-auto'>
						<LogIn className='w-6 h-6 text-primary-foreground' />
					</div>
					<div>
						<CardTitle className='text-xl'>{t('welcomeBack')}</CardTitle>
						<p className='text-muted-foreground mt-2'>
							{t('signInToAccount')}
						</p>
					</div>
				</CardHeader>

				<CardContent className='space-y-6'>
					<form onSubmit={handleSubmit(handleLogin)} className='space-y-4'>
						<div className='space-y-2'>
							<Label htmlFor='email'>{t('email')}</Label>
							<Input
								id='email'
								type='email'
								{...register('email')}
								placeholder={t('emailPlaceholder')}
								disabled={isExecuting}
							/>
							{errors.email && (
								<p className='text-sm text-destructive'>
									{errors.email.message}
								</p>
							)}
						</div>

						<div className='space-y-2'>
							<div className='flex items-center justify-between'>
								<Label htmlFor='password'>{t('password')}</Label>
								<Button
									type='button'
									variant='link'
									className='px-0 h-auto'
									onClick={handleForgotPassword}>
									{t('forgotPassword')}
								</Button>
							</div>
							<div className='relative'>
								<Input
									id='password'
									type={showPassword ? 'text' : 'password'}
									{...register('password')}
									placeholder={t('passwordPlaceholder')}
									disabled={isExecuting}
								/>
								<Button
									type='button'
									variant='ghost'
									size='sm'
									className='absolute right-2 top-1/2 -translate-y-1/2 h-auto p-1'
									onClick={handlePasswordToggle}>
									{showPassword ? (
										<EyeOff className='w-4 h-4' />
									) : (
										<Eye className='w-4 h-4' />
									)}
								</Button>
							</div>
							{errors.password && (
								<p className='text-sm text-destructive'>
									{errors.password.message}
								</p>
							)}
						</div>

						{errors.root && (
							<div className='flex items-center gap-2 text-sm text-destructive'>
								<AlertCircle className='w-4 h-4' />
								{errors.root.message}
							</div>
						)}

						<Button
							type='submit'
							disabled={isExecuting}
							className='w-full py-6'>
							{isExecuting ? t('loading') : t('signIn')}
						</Button>
					</form>

					{/* Demo credentials info */}
					<div className='p-3 bg-muted/50 rounded-lg text-sm text-muted-foreground'>
						<p className='font-medium mb-1'>{t('demoCredentials')}</p>
						<p>{t('userCredentials')}: demo@company.com / password</p>
						<p>{t('adminCredentials')}: admin@company.com / admin123</p>
					</div>
				</CardContent>
			</Card>
		</div>
	);
}
