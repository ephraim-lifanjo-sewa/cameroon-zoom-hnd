"use client";

import './globals.css';
import { Toaster } from "@/components/ui/toaster";
import { FirebaseClientProvider } from '@/firebase';
import { LanguageProvider } from '@/components/layout/LanguageProvider';
import { useEffect } from 'react';
import { Analytics } from "@vercel/analytics/next"

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
        {/* PRIMARY SEO */}
        <title>Cameroon Zoom - Discover Businesses in Cameroon</title>
        <meta name="description" content="Cameroon Zoom helps you discover restaurants, hotels, services, shops and local businesses across Cameroon. Search businesses, view ratings, and contact directly via WhatsApp." />
        <meta name="keywords" content="Cameroon businesses, Yaounde businesses, Douala businesses, Cameroon directory, restaurants Cameroon, hotels Cameroon, services Cameroon, Cameroon Zoom" />
        <meta name="author" content="Cameroon Zoom" />
        <meta name="robots" content="index, follow" />

        {/* MOBILE */}
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=0" />
        <meta name="theme-color" content="#D71616" />

        {/* OPEN GRAPH (FACEBOOK / WHATSAPP / LINK PREVIEW) */}
        <meta property="og:title" content="Cameroon Zoom - Discover Businesses in Cameroon" />
        <meta property="og:description" content="Find restaurants, hotels, and services across Cameroon. Browse local businesses and contact them instantly." />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://cameroonzoom.vercel.app" />
        <meta property="og:image" content="https://cameroonzoom.vercel.app/og-image.png" />

        {/* TWITTER SEO */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Cameroon Zoom - Discover Businesses in Cameroon" />
        <meta name="twitter:description" content="Search and discover businesses across Cameroon with Cameroon Zoom." />
        <meta name="twitter:image" content="https://cameroonzoom.vercel.app/og-image.png" />

        {/* GEO SEO */}
        <meta name="geo.region" content="CM" />
        <meta name="geo.placename" content="Cameroon" />
        <meta name="geo.position" content="3.8480;11.5021" />
        <meta name="ICBM" content="3.8480, 11.5021" />

        {/* GOOGLE */}
        <meta name="google-site-verification" content="cameroon-zoom-verification" />

        {/* FONTS */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=PT+Sans:wght@400;700&display=swap" rel="stylesheet" />

        {/* CANONICAL */}
        <link rel="canonical" href="https://cameroonzoom.vercel.app" />

        {/* FAVICON */}
        <link rel="icon" href="/favicon.ico" />

      </head>

      <body className="font-body antialiased bg-white text-foreground overflow-x-hidden">
        <FirebaseClientProvider>
          <LanguageProvider>
            <div className="flex flex-col min-h-screen">
              <main className="flex-grow">
                {children}
              </main>
              <Toaster />
              <Analytics />
            </div>
          </LanguageProvider>
        </FirebaseClientProvider>
      </body>
    </html>
  );
}