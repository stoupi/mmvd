import { getTypedSession } from '@/lib/auth-helpers';
import { NavbarClient } from './navbar-client';

export const dynamic = 'force-dynamic';

export async function Navbar() {
	const session = await getTypedSession();
	return <NavbarClient user={session?.user} />;
}
