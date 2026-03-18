"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';

/**
 * Redirect Wrapper
 * The landing page screen has been removed in favor of direct full-screen login/signup.
 */
export default function AuthPage() {
  const router = useRouter();

  useEffect(() => {
    router.push('/login');
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <Loader2 className="animate-spin text-primary w-10 h-10" />
    </div>
  );
}
