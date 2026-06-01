"use client";

import React from 'react';
import { usePathname } from 'next/navigation';
import { AdminSidebar } from '@/components/admin/admin-sidebar';
import { AdminAuthGuard } from '@/components/admin/admin-auth-guard';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  // Allow the root /admin login page to render without the auth guard
  if (pathname === '/admin' || pathname === '/admin/') {
    return <>{children}</>;
  }

  return (
    <AdminAuthGuard>
      <div className="min-h-screen flex bg-background">
        <AdminSidebar />
        <main className="flex-1 p-6 lg:p-8">
          {children}
        </main>
      </div>
    </AdminAuthGuard>
  );
}
