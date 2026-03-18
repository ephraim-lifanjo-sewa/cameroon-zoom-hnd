"use client";

import { useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';

/**
 * REDUNDANT WRAPPER
 * This page is deprecated in favor of the unified Management Hub.
 * Redirecting users to the stable /manage-business route.
 */
export default function EditBusinessRedirectPage() {
  const { id } = useParams();
  const router = useRouter();

  useEffect(() => {
    if (id) router.replace(`/manage-business/${id}`);
    else router.replace('/profile');
  }, [id, router]);

  return (
    <div className="h-screen flex flex-col items-center justify-center bg-white gap-4">
      <Loader2 className="animate-spin text-primary w-10 h-10" />
      <p className="font-black uppercase text-[10px] tracking-widest text-muted-foreground">Redirecting to Management Hub...</p>
    </div>
  );
}
