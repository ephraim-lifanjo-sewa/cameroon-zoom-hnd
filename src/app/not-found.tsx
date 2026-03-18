"use client";

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { Navbar } from '@/components/layout/Navbar';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-white font-body flex flex-col">
      <Navbar />
      <main className="flex-grow flex items-center justify-center p-6">
        <section className="max-w-4xl w-full text-center space-y-12">
          <div className="space-y-4">
            <h1 className="text-3xl sm:text-4xl font-black text-secondary uppercase tracking-tight">
              We’re sorry. This page isn’t working right now.
            </h1>
            <p className="text-muted-foreground font-bold uppercase text-xs tracking-widest">
              Please wait a few minutes and try again.
            </p>
          </div>

          <figure className="relative mx-auto w-full max-w-[650px] aspect-[650/520]">
            <picture>
              <source 
                media="(max-width: 599px)" 
                srcSet="https://s3-media0.fl.yelpcdn.com/assets/srv0/yelp_design_cdn/530025df059b/assets/img/svg_illustrations/page_not_available_mobile_375x300_v2.svg" 
              />
              <source 
                media="(min-width: 600px)" 
                srcSet="https://s3-media0.fl.yelpcdn.com/assets/srv0/yelp_design_cdn/cd1528b28ad8/assets/img/svg_illustrations/page_not_available_650x520_v2.svg" 
              />
              <img 
                src="https://s3-media0.fl.yelpcdn.com/assets/srv0/yelp_design_cdn/cd1528b28ad8/assets/img/svg_illustrations/page_not_available_650x520_v2.svg" 
                alt="Page not available"
                className="w-full h-full object-contain"
              />
            </picture>
          </figure>

          <div className="pt-8">
            <Button asChild variant="outline" className="h-12 px-10 border-2 font-black uppercase text-[11px] tracking-widest hover:bg-black hover:text-white transition-all rounded shadow-sm">
              <Link href="/">
                <ArrowLeft className="w-4 h-4 mr-2" /> Return to Cameroon Zoom
              </Link>
            </Button>
          </div>
        </section>
      </main>
    </div>
  );
}
