/* eslint-disable react-hooks/set-state-in-effect */
/* eslint-disable @next/next/no-page-custom-font */
"use client";

import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import { FirebaseClientProvider } from "@/firebase";
import { LanguageProvider } from "@/components/layout/LanguageProvider";
import { useEffect, useState } from "react";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [lang, setLang] = useState("en");

  // Detect browser language
  useEffect(() => {
    const browserLang = navigator.language || "en";

    if (browserLang.startsWith("fr")) {
      setLang("fr");
      document.documentElement.lang = "fr";
    } else {
      setLang("en");
      document.documentElement.lang = "en";
    }
  }, []);

  // Chunk recovery
  useEffect(() => {
    const handleChunkError = (e: ErrorEvent) => {
      if (
        e.message?.includes("Loading chunk") ||
        e.message?.includes("ChunkLoadError") ||
        e.error?.name === "ChunkLoadError"
      ) {
        window.location.reload();
      }
    };

    window.addEventListener("error", handleChunkError);
    return () => window.removeEventListener("error", handleChunkError);
  }, []);

  return (
    <html lang={lang} suppressHydrationWarning>
      <head>

        {/* Primary SEO */}
        <title>Cameroon Zoom - Find Businesses in Cameroon</title>

        <meta
          name="description"
          content="Discover businesses in Cameroon. Find restaurants, services, companies and professionals in Douala, Yaoundé, Ngaoundéré and more."
        />

        <meta
          name="keywords"
          content="Cameroon businesses, Douala companies, Yaounde services, Cameroon directory, businesses Cameroon, find companies Cameroon"
        />

        <meta name="author" content="Cameroon Zoom" />

        {/* Mobile */}
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1"
        />

        <meta name="theme-color" content="#D71616" />

        {/* Google SEO */}
        <meta name="robots" content="index, follow" />
        <meta name="googlebot" content="index, follow" />

        {/* Open Graph (WhatsApp / Facebook) */}
        <meta property="og:title" content="Cameroon Zoom" />
        <meta
          property="og:description"
          content="Find businesses and services in Cameroon"
        />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://cameroonzoom.com" />
        <meta
          property="og:image"
          content="https://cameroonzoom.com/og-image.png"
        />

        {/* Twitter SEO */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Cameroon Zoom" />
        <meta
          name="twitter:description"
          content="Find businesses in Cameroon"
        />
        <meta
          name="twitter:image"
          content="https://cameroonzoom.com/og-image.png"
        />

        {/* Canonical */}
        <link rel="canonical" href="https://cameroonzoom.com" />

        {/* Fonts */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />

        <link
          href="https://fonts.googleapis.com/css2?family=PT+Sans:wght@400;700&display=swap"
          rel="stylesheet"
        />

      </head>

      <body className="font-body antialiased bg-white text-foreground overflow-x-hidden">

        <FirebaseClientProvider>
          <LanguageProvider>

            <div className="flex flex-col min-h-screen">
              <main className="grow">{children}</main>
              <Toaster />
            </div>

          </LanguageProvider>
        </FirebaseClientProvider>

      </body>
    </html>
  );
}