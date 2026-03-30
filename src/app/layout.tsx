"use client";

import './globals.css';
import { Toaster } from "@/components/ui/toaster";
import { FirebaseClientProvider } from '@/firebase';
import { LanguageProvider } from '@/components/layout/LanguageProvider';
import { useEffect } from 'react';

/**
 * ROOT LAYOUT - PRODUCTION STABILITY
 * Implements automated chunk recovery and institutional fonts.
 */
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  
  useEffect(() => {
    // SELF-HEALING: Reload if Next.js chunks fail to load during deployment
    const handleChunkError = (e: ErrorEvent) => {
      if (
        e.message?.includes('Loading chunk') || 
        e.message?.includes('ChunkLoadError') ||
        e.error?.name === 'ChunkLoadError'
      ) {
        console.warn("ChunkLoadError detected. Re-initializing...");
        window.location.reload();
      }
    };

    window.addEventListener('error', handleChunkError);
    return () => window.removeEventListener('error', handleChunkError);
  }, []);

  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <title>Cameroon Zoom - Business Directory</title>
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=0" />
        <meta name="theme-color" content="#D71616" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=PT+Sans:wght@400;700&display=swap" rel="stylesheet" />
      </head>
      <body className="font-body antialiased bg-white text-foreground overflow-x-hidden">
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
