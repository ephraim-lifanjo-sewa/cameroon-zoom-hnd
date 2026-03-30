
"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';

/**
 * AUTH REDIRECT
 * Standard default export to resolve build validation errors.
 */
export default function AuthRedirectPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/login');
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-white">
      <Loader2 className="animate-spin text-primary w-10 h-10" />
      <p className="ml-3 font-bold uppercase text-xs tracking-widest">Loading it...</p>
    </div>
  );
}
