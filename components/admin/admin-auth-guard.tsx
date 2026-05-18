'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/auth-store';

export function AdminAuthGuard({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, checkAuth } = useAuthStore();
  const router = useRouter();

  useEffect(() => {
    if (!checkAuth()) {
      router.push('/admin');
    }
  }, [checkAuth, router]);

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-pulse text-muted-foreground">Loading...</div>
      </div>
    );
  }

  return <>{children}</>;
}
