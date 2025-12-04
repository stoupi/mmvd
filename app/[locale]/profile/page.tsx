import { requireAuth } from '@/lib/auth-guard';
import { getUserProfile } from '@/lib/services/profile';
import { ProfileForm } from './components/profile-form';
import { AvatarUpload } from './components/avatar-upload';
import { redirect } from 'next/navigation';

export default async function ProfilePage() {
  const session = await requireAuth();
  const user = await getUserProfile(session.user.id);

  if (!user) {
    redirect('/');
  }

  return (
    <div className='p-8 max-w-5xl mx-auto'>
      <div className='mb-8'>
        <h1 className='text-3xl font-bold mb-2'>Profile</h1>
      </div>

      <div className='bg-white rounded-lg border'>
        <div className='p-6 border-b'>
          <AvatarUpload
            currentAvatarUrl={user.avatarUrl}
            userName={user.firstName && user.lastName
              ? `${user.title ? user.title + ' ' : ''}${user.firstName} ${user.lastName}`
              : user.email
            }
          />
        </div>

        <div className='p-6'>
          <h2 className='text-lg font-semibold mb-6'>Account information</h2>

          <div className='space-y-6'>
            <div className='flex items-center justify-between py-3'>
              <div className='w-48'>
                <span className='text-sm font-medium'>Title</span>
              </div>
              <div className='flex-1'>
                <span className='text-sm'>{user.title || 'None'}</span>
              </div>
              <div className='w-32'></div>
            </div>

            <div className='flex items-center justify-between py-3'>
              <div className='w-48'>
                <span className='text-sm font-medium'>First name</span>
              </div>
              <div className='flex-1'>
                <span className='text-sm'>{user.firstName || '-'}</span>
              </div>
              <div className='w-32'></div>
            </div>

            <div className='flex items-center justify-between py-3'>
              <div className='w-48'>
                <span className='text-sm font-medium'>Last name</span>
              </div>
              <div className='flex-1'>
                <span className='text-sm'>{user.lastName || '-'}</span>
              </div>
              <div className='w-32'></div>
            </div>

            <div className='flex items-center justify-between py-3'>
              <div className='w-48'>
                <span className='text-sm font-medium'>Email</span>
              </div>
              <div className='flex-1'>
                <span className='text-sm'>{user.email}</span>
              </div>
              <div className='w-32'></div>
            </div>

            <div className='flex items-center justify-between py-3'>
              <div className='w-48'>
                <span className='text-sm font-medium'>Centre</span>
              </div>
              <div className='flex-1'>
                <span className='text-sm'>
                  {user.centre
                    ? `${user.centre.code} - ${user.centre.name} (${user.centre.city}, ${user.centre.countryCode})`
                    : '-'
                  }
                </span>
              </div>
              <div className='w-32'></div>
            </div>

            <div className='py-3'>
              <ProfileForm affiliation={user.affiliation || ''} />
            </div>

            <div className='flex items-center justify-between py-3'>
              <div className='w-48'>
                <span className='text-sm font-medium'>Permissions</span>
              </div>
              <div className='flex-1 flex gap-2'>
                {user.permissions.length > 0 ? (
                  user.permissions.map((permission) => (
                    <span
                      key={permission}
                      className='px-3 py-1 bg-primary/10 text-primary rounded-md text-sm font-medium'
                    >
                      {permission}
                    </span>
                  ))
                ) : (
                  <span className='text-sm text-muted-foreground'>No permissions</span>
                )}
              </div>
              <div className='w-32'></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
