'use client';

import { ReactNode } from 'react';
import { Toaster } from 'sonner';

export function AuthProvider({ children }: { children: ReactNode }) {
  return (
    <>
      {children}
      <Toaster position='top-center' richColors />
    </>
  );
}
