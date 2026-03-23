"use client";

import React, { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import { cn } from '@/lib/utils';
import { CheckCircle2 } from 'lucide-react';

const LottiePlayer = dynamic(() => import('lottie-react').then(mod => mod.default), { 
  ssr: false,
  loading: () => <div className="animate-pulse bg-muted rounded-xl w-full h-full" />
});

interface LottieAnimationProps {
  url: string;
  loop?: boolean;
  className?: string;
}

export function LottieAnimation({ url, loop = true, className }: LottieAnimationProps) {
  const [animationData, setAnimationData] = useState<any>(null);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    let isMounted = true;
    
    fetch(url)
      .then((res) => {
        if (!res.ok) throw new Error('Failed to fetch animation');
        return res.json();
      })
      .then((data) => {
        if (isMounted) setAnimationData(data);
      })
      .catch((err) => {
        if (isMounted) {
          console.warn("Lottie fetch error:", err);
          setHasError(true);
        }
      });
    
    return () => { isMounted = false; };
  }, [url]);

  if (hasError) return <div className={cn(className, "bg-muted rounded-xl flex items-center justify-center")}><CheckCircle2 className="w-12 h-12 text-primary opacity-20" /></div>;
  if (!animationData) return <div className={className} />;

  return (
    <div className={className}>
      <LottiePlayer 
        animationData={animationData} 
        loop={loop}
        style={{ width: '100%', height: '100%' }}
      />
    </div>
  );
}
