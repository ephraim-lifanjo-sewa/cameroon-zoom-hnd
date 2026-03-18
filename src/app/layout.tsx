
"use client";

import './globals.css';
import { Toaster } from "@/components/ui/toaster";
import { FirebaseClientProvider } from '@/firebase';
import { LanguageProvider } from '@/components/layout/LanguageProvider';
import { useEffect } from 'react';

/**
 * ROOT LAYOUT
 * Optimized for High-Performance UX.
 * Includes ChunkLoadError recovery and Smart Inactivity Reload.
 */
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  
  useEffect(() => {
    // CHUNK LOAD ERROR RECOVERY
    // If a chunk fails to load, reload the page once to fix the mismatch.
    const handleChunkError = (e: ErrorEvent) => {
      if (
        e.message?.includes('Loading chunk') || 
        e.message?.includes('ChunkLoadError') ||
        e.error?.name === 'ChunkLoadError'
      ) {
        console.warn("Chunk error detected, recovering...");
        window.location.reload();
      }
    };

    window.addEventListener('error', handleChunkError);

    // SMART RELOAD: If user leaves tab for 15+ mins, refresh data on return.
    let lastActive = Date.now();
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        const timeInactive = Date.now() - lastActive;
        if (timeInactive > 15 * 60 * 1000) {
          window.location.reload();
        }
      } else {
        lastActive = Date.now();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    return () => {
      window.removeEventListener('error', handleChunkError);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);

  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <title>Cameroon Zoom - Business Directory</title>
        <meta name="description" content="Find and contact real businesses in Cameroon. The most reliable professional directory." />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=PT+Sans:wght@400;700&display=swap" rel="stylesheet" />
      </head>
      <body className="font-body antialiased bg-white text-foreground">
        <FirebaseClientProvider>
          <LanguageProvider>
            <div className="flex flex-col min-h-screen">
              <main className="flex-grow">
                {children}
              </main>
              <Toaster />
            </div>
          </LanguageProvider>
        </FirebaseClientProvider>
      </body>
    </html>
  );
}
