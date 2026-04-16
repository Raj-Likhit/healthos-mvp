'use client';

import { useHealthStore } from '@/lib/store';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import StatusBar from '@/components/StatusBar';
import CommandPalette from '@/components/CommandPalette';

const PUBLIC_ROUTES = ['/', '/onboarding'];

export default function AuthGate({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { userRole } = useHealthStore();
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (!isMounted) return;

    const isPublicRoute = PUBLIC_ROUTES.includes(pathname || '');
    
    // If user has no role and tries to access a private route, redirect to onboarding
    if (userRole === null && !isPublicRoute) {
      router.push('/onboarding');
    }
  }, [userRole, pathname, router, isMounted]);

  // Don't render until mounted to avoid hydration mismatch
  if (!isMounted) {
    return null;
  }

  const isPublicRoute = PUBLIC_ROUTES.includes(pathname || '');
  
  // Wait to redirect
  if (userRole === null && !isPublicRoute) {
    return null;
  }

  // Public route wrapper (no top gap, full screen)
  if (isPublicRoute) {
    return <main className="flex-1 flex flex-col">{children}</main>;
  }

  // Private route wrapper (with StatusBar, CommandPalette, and top padding)
  return (
    <>
      <StatusBar />
      <CommandPalette />
      <main className="flex-1 flex flex-col pt-10">
        {children}
      </main>
    </>
  );
}
