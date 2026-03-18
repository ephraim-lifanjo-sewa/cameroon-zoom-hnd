
"use client";

import React, { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';

/**
 * Dynamically import the Lottie player to avoid SSR/Turbopack resolution issues.
 * This ensures the heavy animation logic only loads in the browser.
 */
const LottiePlayer = dynamic(() => import('lottie-react'), { 
  ssr: false,
  loading: () => <div className="animate-pulse bg-muted rounded-md w-full h-full" />
});

interface LottieAnimationProps {
  url: string;
  loop?: boolean;
  className?: string;
}

/**
 * Reusable Lottie Component
 * Lazily fetches animation JSON from a URL and renders using a client-only player.
 */
export function LottieAnimation({ url, loop = true, className }: LottieAnimationProps) {
  const [animationData, setAnimationData] = useState<any>(null);

  useEffect(() => {
    let isMounted = true;
    
    // Asynchronously fetch the animation JSON
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
          console.error("Lottie fetch error:", err);
        }
      });
    
    return () => { isMounted = false; };
  }, [url]);

  // Return a placeholder div while loading data
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
