'use client';

import { useState, useRef } from 'react';
import { useAction } from 'next-safe-action/hooks';
import { updateAvatarAction } from '@/lib/actions/profile-actions';
import { Button } from '@/components/ui/button';
import { Camera, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import Image from 'next/image';

interface AvatarUploadProps {
  currentAvatarUrl: string | null;
  userName: string;
}

export function AvatarUpload({ currentAvatarUrl, userName }: AvatarUploadProps) {
  const [preview, setPreview] = useState<string | null>(currentAvatarUrl);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { execute, status } = useAction(updateAvatarAction, {
    onSuccess: () => {
      toast.success('Profile photo updated successfully');
      setUploading(false);
    },
    onError: ({ error }) => {
      toast.error(error.serverError || 'Failed to update profile photo');
      setPreview(currentAvatarUrl);
      setUploading(false);
    }
  });

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image size must be less than 5MB');
      return;
    }

    setUploading(true);

    const reader = new FileReader();
    reader.onloadend = () => {
      const base64 = reader.result as string;
      setPreview(base64);
      execute({ avatarUrl: base64 });
    };
    reader.onerror = () => {
      toast.error('Failed to read image file');
      setUploading(false);
    };
    reader.readAsDataURL(file);
  };

  const handleButtonClick = () => {
    fileInputRef.current?.click();
  };

  const getInitials = () => {
    const names = userName.split(' ');
    if (names.length >= 2) {
      return `${names[0][0]}${names[names.length - 1][0]}`.toUpperCase();
    }
    return userName.slice(0, 2).toUpperCase();
  };

  return (
    <div className='flex flex-col items-center gap-4'>
      <div className='relative'>
        <div className='h-32 w-32 rounded-full overflow-hidden bg-gradient-to-r from-blue-500 to-indigo-500 flex items-center justify-center'>
          {preview ? (
            <Image
              src={preview}
              alt={userName}
              width={128}
              height={128}
              className='h-full w-full object-cover'
            />
          ) : (
            <span className='text-white text-4xl font-bold'>
              {getInitials()}
            </span>
          )}
        </div>
        {uploading && (
          <div className='absolute inset-0 rounded-full bg-black/50 flex items-center justify-center'>
            <Loader2 className='h-8 w-8 text-white animate-spin' />
          </div>
        )}
      </div>

      <input
        ref={fileInputRef}
        type='file'
        accept='image/*'
        onChange={handleFileChange}
        className='hidden'
      />

      <Button
        type='button'
        variant='outline'
        size='sm'
        onClick={handleButtonClick}
        disabled={uploading || status === 'executing'}
      >
        <Camera className='h-4 w-4 mr-2' />
        {preview ? 'Change Photo' : 'Upload Photo'}
      </Button>
    </div>
  );
}
