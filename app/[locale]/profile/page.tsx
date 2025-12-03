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
    <div className='p-8 max-w-4xl mx-auto'>
      <div className='mb-8'>
        <h1 className='text-3xl font-bold mb-2'>My Profile</h1>
        <p className='text-muted-foreground'>
          View and manage your profile information
        </p>
      </div>

      <div className='space-y-8'>
        <div className='bg-white rounded-lg p-6 border'>
          <div className='flex items-start gap-6'>
            <div className='flex-shrink-0'>
              <AvatarUpload
                currentAvatarUrl={user.avatarUrl}
                userName={user.firstName && user.lastName
                  ? `${user.title ? user.title + ' ' : ''}${user.firstName} ${user.lastName}`
                  : user.email
                }
              />
            </div>
            <div className='flex-1'>
              <h2 className='text-xl font-semibold mb-4'>Profile Photo</h2>
              <p className='text-sm text-muted-foreground'>
                Upload a profile photo to personalize your account. The photo will be displayed throughout the application.
              </p>
            </div>
          </div>
        </div>

        <div className='bg-white rounded-lg p-6 border'>
          <h2 className='text-xl font-semibold mb-6'>Personal Information</h2>

          <div className='space-y-6 mb-8'>
            <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
              <div>
                <label className='text-sm font-medium text-muted-foreground'>Title</label>
                <p className='text-base mt-1'>
                  {user.title || 'None'}
                </p>
              </div>
              <div>
                <label className='text-sm font-medium text-muted-foreground'>Email</label>
                <p className='text-base mt-1'>{user.email}</p>
              </div>
            </div>

            <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
              <div>
                <label className='text-sm font-medium text-muted-foreground'>First Name</label>
                <p className='text-base mt-1'>{user.firstName || '-'}</p>
              </div>
              <div>
                <label className='text-sm font-medium text-muted-foreground'>Last Name</label>
                <p className='text-base mt-1'>{user.lastName || '-'}</p>
              </div>
            </div>

            <div>
              <label className='text-sm font-medium text-muted-foreground'>Permissions</label>
              <div className='flex gap-2 mt-2'>
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
            </div>
          </div>

          <h3 className='text-lg font-semibold mb-4'>Editable Information</h3>
          <ProfileForm
            centreCode={user.centreCode || ''}
            centreName={user.centreName || ''}
            affiliation={user.affiliation || ''}
          />
        </div>
      </div>
    </div>
  );
}
