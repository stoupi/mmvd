'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useTranslations, useLocale } from 'next-intl';
import { z } from 'zod';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { AlertCircle, CheckCircle2, Eye, EyeOff, KeyRound } from 'lucide-react';
import { authClient } from '@/lib/auth-client';
import { Link } from '@/app/i18n/navigation';
import { useSearchParams } from 'next/navigation';

export function ResetPasswordForm() {
	const t = useTranslations('auth');
	const locale = useLocale();
	const searchParams = useSearchParams();
	const [isLoading, setIsLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const [isSuccess, setIsSuccess] = useState(false);
	const [showPassword, setShowPassword] = useState(false);
	const [showConfirmPassword, setShowConfirmPassword] = useState(false);
	const [token, setToken] = useState<string | null>(null);
	const [isInvalidToken, setIsInvalidToken] = useState(false);

	useEffect(() => {
		const tokenParam = searchParams.get('token');
		const errorParam = searchParams.get('error');

		if (errorParam === 'INVALID_TOKEN' || !tokenParam) {
			setIsInvalidToken(true);
		} else {
			setToken(tokenParam);
		}
	}, [searchParams]);

	const formSchema = z
		.object({
			password: z
				.string()
				.min(8, t('passwordRequirements'))
				.regex(
					/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
					t('passwordRequirements')
				),
			confirmPassword: z.string(),
		})
		.refine((data) => data.password === data.confirmPassword, {
			message: t('passwordsDoNotMatch'),
			path: ['confirmPassword'],
		});

	type FormData = z.infer<typeof formSchema>;

	const {
		register,
		handleSubmit,
		formState: { errors },
	} = useForm<FormData>({
		resolver: zodResolver(formSchema),
	});

	const handleResetPassword = async (data: FormData) => {
		if (!token) {
			setError(t('invalidTokenTitle'));
			return;
		}

		setIsLoading(true);
		setError(null);

		const { error: resetError } = await authClient.resetPassword({
			newPassword: data.password,
			token,
		});

		setIsLoading(false);

		if (resetError) {
			setError(t('resetPasswordError'));
			return;
		}

		setIsSuccess(true);
	};

	if (isInvalidToken) {
		return (
			<div className='w-md mx-auto'>
				<Card>
					<CardHeader className='text-center space-y-4'>
						<div className='w-12 h-12 bg-destructive/10 rounded-full flex items-center justify-center mx-auto'>
							<AlertCircle className='w-6 h-6 text-destructive' />
						</div>
						<div>
							<CardTitle className='text-xl'>{t('invalidTokenTitle')}</CardTitle>
							<p className='text-muted-foreground mt-2'>
								{t('invalidTokenDescription')}
							</p>
						</div>
					</CardHeader>

					<CardContent>
						<Link href={'/forgot-password'}>
							<Button variant='outline' className='w-full'>
								{t('requestNewLink')}
							</Button>
						</Link>
					</CardContent>
				</Card>
			</div>
		);
	}

	if (isSuccess) {
		return (
			<div className='w-md mx-auto'>
				<Card>
					<CardHeader className='text-center space-y-4'>
						<div className='w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto'>
							<CheckCircle2 className='w-6 h-6 text-green-600' />
						</div>
						<div>
							<CardTitle className='text-xl'>{t('passwordResetSuccess')}</CardTitle>
							<p className='text-muted-foreground mt-2'>
								{t('passwordResetSuccessDescription')}
							</p>
						</div>
					</CardHeader>

					<CardContent>
						<Link href={'/login'}>
							<Button className='w-full'>
								{t('signIn')}
							</Button>
						</Link>
					</CardContent>
				</Card>
			</div>
		);
	}

	return (
		<div className='w-md mx-auto'>
			<Card>
				<CardHeader className='text-center space-y-4'>
					<div className='w-12 h-12 bg-primary rounded-full flex items-center justify-center mx-auto'>
						<KeyRound className='w-6 h-6 text-primary-foreground' />
					</div>
					<div>
						<CardTitle className='text-xl'>{t('resetPasswordTitle')}</CardTitle>
						<p className='text-muted-foreground mt-2'>
							{t('resetPasswordDescription')}
						</p>
					</div>
				</CardHeader>

				<CardContent className='space-y-6'>
					<form onSubmit={handleSubmit(handleResetPassword)} className='space-y-4'>
						<div className='space-y-2'>
							<Label htmlFor='password'>{t('newPassword')}</Label>
							<div className='relative'>
								<Input
									id='password'
									type={showPassword ? 'text' : 'password'}
									{...register('password')}
									placeholder={t('newPasswordPlaceholder')}
									disabled={isLoading}
								/>
								<Button
									type='button'
									variant='ghost'
									size='sm'
									className='absolute right-2 top-1/2 -translate-y-1/2 h-auto p-1'
									onClick={() => setShowPassword((prev) => !prev)}>
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

						<div className='space-y-2'>
							<Label htmlFor='confirmPassword'>{t('confirmPassword')}</Label>
							<div className='relative'>
								<Input
									id='confirmPassword'
									type={showConfirmPassword ? 'text' : 'password'}
									{...register('confirmPassword')}
									placeholder={t('confirmPassword')}
									disabled={isLoading}
								/>
								<Button
									type='button'
									variant='ghost'
									size='sm'
									className='absolute right-2 top-1/2 -translate-y-1/2 h-auto p-1'
									onClick={() => setShowConfirmPassword((prev) => !prev)}>
									{showConfirmPassword ? (
										<EyeOff className='w-4 h-4' />
									) : (
										<Eye className='w-4 h-4' />
									)}
								</Button>
							</div>
							{errors.confirmPassword && (
								<p className='text-sm text-destructive'>
									{errors.confirmPassword.message}
								</p>
							)}
						</div>

						{error && (
							<div className='flex items-center gap-2 text-sm text-destructive'>
								<AlertCircle className='w-4 h-4' />
								{error}
							</div>
						)}

						<Button
							type='submit'
							disabled={isLoading}
							className='w-full py-6'>
							{isLoading ? t('loading') : t('resetPassword')}
						</Button>
					</form>

					<div className='text-center'>
						<Link
							href={'/login'}
							className='text-sm text-primary hover:underline'>
							{t('signIn')}
						</Link>
					</div>
				</CardContent>
			</Card>
		</div>
	);
}
