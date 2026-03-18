"use client";

import { Navbar } from '@/components/layout/Navbar';
import { CategoryScroll } from '@/components/business/CategoryScroll';
import { TownScroll } from '@/components/business/TownScroll';
import { Button } from '@/components/ui/button';
import { Play, Pause } from 'lucide-react';
import Link from 'next/link';
import { useLanguage } from '@/components/layout/LanguageProvider';
import { useFirestore, useMemoFirebase, useDoc, useCollection } from '@/firebase';
import { collection, query, limit, doc } from 'firebase/firestore';
import { Input } from '@/components/ui/input';
import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { cn } from '@/lib/utils';
import { Enterprise } from './lib/types';
import Image from 'next/image';
import { EnterpriseCard } from '@/components/enterprise/EnterpriseCard';

export default function Home() {
  const { t } = useLanguage();
  const db = useFirestore();
  const router = useRouter();
  const [searchVal, setSearchVal] = useState("");
  const [isMounted, setIsMounted] = useState(false);

  const [currentImgIndex, setCurrentImgIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);

  const visualsDocRef = useMemoFirebase(() => db ? doc(db, 'settings', 'visuals') : null, [db]);
  const { data: siteVisuals } = useDoc(visualsDocRef);

  const featuredQuery = useMemoFirebase(() => db ? query(
    collection(db, 'businesses'), 
    limit(50)
  ) : null, [db]);
  const { data: allEnterprises, isLoading } = useCollection<Enterprise>(featuredQuery);

  const enterprises = useMemo(() => {
    return (allEnterprises || [])
      .filter(b => (b.businessName || b.name) && (b.businessName !== "" && b.name !== ""))
      .sort((a, b) => {
        if (b.averageRating !== a.averageRating) {
          return (b.averageRating || 0) - (a.averageRating || 0);
        }
        return (b.totalReviews || 0) - (a.totalReviews || 0);
      })
      .slice(0, 12);
  }, [allEnterprises]);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const heroImages = useMemo(() => {
    const ids = ['hero-douala-port', 'hero-yaounde-admin', 'hero-douala-business', 'hero-ngaoundere-plateau', 'hero-reunification'];
    const fallbacks = ids.map(id => PlaceHolderImages.find(img => img.id === id)?.imageUrl || '').filter(Boolean);
    const dynamic = [siteVisuals?.hero1, siteVisuals?.hero2, siteVisuals?.hero3, siteVisuals?.hero4, siteVisuals?.hero5].filter(Boolean);
    return dynamic.length > 0 ? dynamic : fallbacks;
  }, [siteVisuals]);

  useEffect(() => {
    if (!isPlaying || !isMounted) return;
    const interval = setInterval(() => {
      setCurrentImgIndex((prev) => (prev + 1) % heroImages.length);
    }, 4500); 
    return () => clearInterval(interval);
  }, [isPlaying, heroImages.length, isMounted]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchVal.trim()) router.push(`/search?q=${encodeURIComponent(searchVal)}`);
    else router.push('/search');
  };

  if (!isMounted) return null;

  return (
    <div className="min-h-screen bg-white font-body flex flex-col">
      <Navbar />
      
      {/* ANIMATED HERO BANNER */}
      <div className="relative h-[500px] sm:h-[650px] overflow-hidden shrink-0">
        <div className="absolute inset-0">
          {heroImages.map((imgUrl, idx) => (
            <div
              key={idx}
              className={cn(
                "absolute inset-0 transition-opacity ease-in-out",
                idx === currentImgIndex ? "opacity-100 scale-105" : "opacity-0 scale-100"
              )}
              style={{ 
                transitionProperty: 'opacity, transform',
                transitionDuration: '2000ms'
              }}
            >
              <Image 
                src={imgUrl} 
                alt="Cameroon economy" 
                fill
                className="object-cover"
                priority={idx === 0}
                unoptimized
              />
              <div className="absolute inset-0 bg-black/40" />
            </div>
          ))}
        </div>

        <div className="relative z-10 h-full flex flex-col justify-center items-center">
          <div className="w-full flex justify-end px-8 absolute top-8">
            <button onClick={() => setIsPlaying(!isPlaying)} className="text-white p-2 bg-black/20 rounded-full hover:bg-black/40 transition-all active:scale-90">
              {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 fill-current" />}
            </button>
          </div>

          <div className="text-center px-4 w-full max-w-4xl animate-in fade-in slide-in-from-top-8 duration-1000">
            <h1 className="text-4xl sm:text-6xl font-black text-white uppercase tracking-tighter mb-4 leading-tight drop-shadow-2xl">
              {t('discover_best')}
            </h1>
            <p className="text-white/90 font-bold text-lg sm:text-xl mb-10 max-w-2xl mx-auto leading-relaxed italic drop-shadow-md">
              Find and contact places that real people trust.
            </p>
            
            <form onSubmit={handleSearch} className="flex bg-white p-1 rounded-2xl shadow-2xl overflow-hidden border-4 border-white focus-within:border-primary transition-all max-w-2xl mx-auto transform hover:scale-[1.02]">
              <Input 
                placeholder={t('search_placeholder')}
                className="h-14 border-none shadow-none focus-visible:ring-0 w-full text-base font-bold px-6 rounded-none"
                value={searchVal}
                onChange={(e) => setSearchVal(e.target.value)}
              />
              <Button type="submit" className="bg-primary hover:bg-black rounded-xl m-1 px-8 h-12 font-black text-xs uppercase tracking-widest text-white transition-colors shrink-0">
                {t('search')}
              </Button>
            </form>
          </div>
        </div>
      </div>

      <div className="flex-grow container mx-auto px-4 py-16 space-y-24 max-w-7xl">
        <section className="animate-in fade-in slide-in-from-bottom-8 duration-1000">
          <CategoryScroll />
        </section>

        <section className="space-y-10">
          <header className="text-center sm:text-left space-y-2 border-b-4 border-muted/20 pb-6">
            <h2 className="text-3xl font-black uppercase tracking-tight leading-none">{t('featured_listings')}</h2>
            <p className="text-muted-foreground font-bold text-[10px] uppercase tracking-[0.2em]">Our Top Choices for You</p>
          </header>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {isLoading ? (
              Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="animate-pulse space-y-4">
                  <div className="bg-muted aspect-video rounded-xl" />
                  <div className="h-4 bg-muted w-3/4 rounded" />
                  <div className="h-3 bg-muted w-1/2 rounded" />
                </div>
              ))
            ) : (
              enterprises?.map((bus, idx) => (
                <div key={bus.id} className="animate-in fade-in slide-in-from-bottom-8" style={{ animationDelay: `${idx * 100}ms`, animationFillMode: 'both' }}>
                  <EnterpriseCard enterprise={bus} />
                </div>
              ))
            )}
          </div>
          
          <div className="pt-10 flex justify-center">
            <Button asChild variant="outline" className="h-14 px-12 border-4 border-secondary font-black uppercase text-xs tracking-widest hover:bg-secondary hover:text-white transition-all rounded-full shadow-[8px_8px_0px_0px_rgba(0,0,0,0.1)] active:translate-y-1 active:shadow-none">
              <Link href="/search">{t('view_all')}</Link>
            </Button>
          </div>
        </section>

        <section className="pt-16 border-t-4 border-muted/20 space-y-12">
          <div className="text-center space-y-8">
            <h2 className="text-4xl font-black uppercase tracking-tight text-secondary leading-none">Towns to Explore</h2>
            <TownScroll />
          </div>
        </section>
      </div>

      <footer className="bg-white text-secondary py-16 shrink-0 border-t-4 border-muted/20">
        <div className="container mx-auto px-4 max-w-7xl text-center space-y-4">
          <p className="text-[11px] font-black uppercase tracking-[0.4em] text-muted-foreground opacity-50">
            {t('footer_text')}
          </p>
        </div>
      </footer>
    </div>
  );
}
