'use client';

import { Link } from '@/app/i18n/navigation';
import { authClient } from '@/lib/auth-client';
import { useRouter } from '@/app/i18n/navigation';
import { useTranslations } from 'next-intl';
import { useState } from 'react';
import { usePathname } from 'next/navigation';
import { getAvailableApps } from '@/lib/app-config';
import { FileText, ClipboardCheck, Settings, User, LogOut } from 'lucide-react';
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import Image from 'next/image';
import type { AppPermission } from '@/app/generated/prisma';

const iconMap = {
	FileText,
	ClipboardCheck,
	Settings,
};

type NavbarUser = {
	id: string;
	email: string;
	name?: string | null;
	avatarUrl?: string | null;
	permissions?: AppPermission[];
};

export function NavbarClient({ user }: { user?: NavbarUser | null }) {
	const t = useTranslations('navigation');
	const router = useRouter();
	const pathname = usePathname();
	const [isLoggingOut, setIsLoggingOut] = useState(false);

	const availableApps = user?.permissions
		? getAvailableApps(user.permissions)
		: [];

	const handleLogout = async () => {
		setIsLoggingOut(true);
		try {
			await authClient.signOut();
			router.push('/');
			router.refresh();
		} catch (error) {
			console.error('Logout error:', error);
		} finally {
			setIsLoggingOut(false);
		}
	};

	return (
		<nav className='sticky top-0 z-50 w-full border-b bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60'>
			<div className='container mx-auto flex h-16 items-center justify-between px-4'>
				<div className='flex items-center space-x-8'>
					<Link href='/' className='flex items-center space-x-2'>
						<Image
							src='/logo.png'
							alt='MMVD Logo'
							width={40}
							height={40}
							className='h-10 w-10'
						/>
						<span className='font-bold text-xl bg-clip-text text-transparent bg-gradient-to-r from-primary to-pink-500'>
							MMVD Study
						</span>
					</Link>

					{availableApps && availableApps.length > 0 && (
						<div className='hidden md:flex items-center space-x-1'>
							{availableApps.map((app) => {
								const Icon = iconMap[app.icon as keyof typeof iconMap];
								const isActive = pathname.startsWith(app.path);
								return (
									<Link
										key={app.id}
										href={app.path}
										className={`inline-flex items-center space-x-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
											isActive
												? 'bg-pink-50 text-primary'
												: 'text-gray-700 hover:bg-pink-50 hover:text-primary'
										}`}>
										<Icon className='h-4 w-4' />
										<span>{app.name}</span>
									</Link>
								);
							})}
						</div>
					)}
				</div>

				<div className='flex items-center space-x-4'>
					{user ? (
						<div className='flex items-center space-x-4'>
							<DropdownMenu>
								<DropdownMenuTrigger asChild>
									<button className='hidden sm:flex items-center space-x-2 hover:opacity-80 transition-opacity cursor-pointer focus:outline-none'>
										<div className='h-8 w-8 rounded-full bg-gradient-to-r from-purple-600 to-pink-500 flex items-center justify-center overflow-hidden'>
											{user.avatarUrl ? (
												<Image
													src={user.avatarUrl}
													alt={user.name || user.email}
													width={32}
													height={32}
													className='h-full w-full object-cover'
												/>
											) : (
												<span className='text-white text-sm font-medium'>
													{user.name?.charAt(0).toUpperCase() ||
														user.email.charAt(0).toUpperCase()}
												</span>
											)}
										</div>
										<span className='text-sm font-medium text-gray-700'>
											{user.name || user.email}
										</span>
									</button>
								</DropdownMenuTrigger>
								<DropdownMenuContent align='end' className='w-48'>
									<DropdownMenuItem asChild>
										<Link
											href='/profile'
											className='flex items-center cursor-pointer'>
											<User className='h-4 w-4 mr-2' />
											{t('myProfile')}
										</Link>
									</DropdownMenuItem>
									<DropdownMenuItem
										onClick={handleLogout}
										disabled={isLoggingOut}
										className='flex items-center cursor-pointer'>
										{isLoggingOut ? (
											<>
												<div className='h-4 w-4 animate-spin rounded-full border-2 border-gray-300 border-t-gray-600 mr-2'></div>
												{t('loggingOut')}
											</>
										) : (
											<>
												<LogOut className='h-4 w-4 mr-2' />
												{t('logout')}
											</>
										)}
									</DropdownMenuItem>
								</DropdownMenuContent>
							</DropdownMenu>
						</div>
					) : (
						<Link
							href='/login'
							className='inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none ring-offset-background bg-primary text-primary-foreground hover:bg-pink-400 h-9 px-4 py-2 shadow-md'>
							Login for investigators
						</Link>
					)}
				</div>
			</div>
		</nav>
	);
}
