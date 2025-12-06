'use client';
import { useState } from 'react';
import { useAction } from 'next-safe-action/hooks';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { setPasswordFromInviteAction } from '../actions';
import { useTranslations } from 'next-intl';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

export function ClientForm({ token, locale }: { token: string; locale: string }) {
	const t = useTranslations('welcome');
	const { execute, isExecuting } = useAction(setPasswordFromInviteAction, {
		onSuccess() {
			window.location.href = `/${locale}/admin`;
		},
	});
	const [password, setPassword] = useState('');
	const [confirm, setConfirm] = useState('');
	const [error, setError] = useState<string | null>(null);

	async function onSubmit(e: React.FormEvent) {
		e.preventDefault();
		setError(null);
		try {
			await execute({ token, password, confirm });
		} catch (e) {
			setError(t('genericError'));
		}
	}

	return (
		<form onSubmit={onSubmit} className="space-y-4">
			<div>
				<label className="block text-sm font-medium mb-2">{t('password')}</label>
				<Input
					type="password"
					value={password}
					onChange={(e) => setPassword(e.target.value)}
					required
					minLength={6}
					placeholder="••••••••"
				/>
			</div>
			<div>
				<label className="block text-sm font-medium mb-2">{t('confirmPassword')}</label>
				<Input
					type="password"
					value={confirm}
					onChange={(e) => setConfirm(e.target.value)}
					required
					minLength={6}
					placeholder="••••••••"
				/>
			</div>
			{error && (
				<Alert variant="destructive">
					<AlertTitle>{t('errorTitle')}</AlertTitle>
					<AlertDescription>{error}</AlertDescription>
				</Alert>
			)}
			<Button type="submit" disabled={isExecuting} className="w-full">
				{isExecuting ? t('saving') : t('setPassword')}
			</Button>
		</form>
	);
}
