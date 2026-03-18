"use client";

import { useMemo } from 'react';
import { Navbar } from '@/components/layout/Navbar';
import { useLanguage } from '@/components/layout/LanguageProvider';
import { ShoppingBag, ArrowRight, MapPin, SearchX, Building2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { collection, query, limit } from 'firebase/firestore';
import { Business } from '@/app/lib/types';
import { Skeleton } from '@/components/ui/skeleton';

export default function StorePage() {
  const { t } = useLanguage();
  const db = useFirestore();

  const bizQuery = useMemoFirebase(() => {
    if (!db) return null;
    return query(collection(db, 'businesses'), limit(50));
  }, [db]);

  const { data: businesses, isLoading } = useCollection<Business>(bizQuery);

  const aggregatedProducts = useMemo(() => {
    if (!businesses) return [];
    return businesses.flatMap(biz => 
      (biz.services || []).map((service, idx) => ({
        ...service,
        id: `${biz.id}-service-${idx}`,
        businessId: biz.id,
        businessName: biz.name,
        city: biz.city,
        category: biz.category,
        businessLogo: biz.logo || biz.logo_url
      }))
    );
  }, [businesses]);

  return (
    <div className="min-h-screen bg-[#F7F7F7] pb-24 font-body">
      <Navbar />
      
      <div className="bg-white border-b py-16">
        <div className="container mx-auto px-4 max-w-7xl text-center space-y-4">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 text-primary mb-2">
            <ShoppingBag className="w-8 h-8" />
          </div>
          <h1 className="text-4xl sm:text-5xl font-black uppercase tracking-tighter text-secondary">{t('hub_store')}</h1>
          <p className="text-muted-foreground font-bold uppercase text-xs tracking-[0.3em]">{t('browse_services')}</p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-16 max-w-7xl">
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {[1,2,3,4,5,6,7,8].map(i => (
              <div key={i} className="bg-white border-2 rounded-md overflow-hidden p-6 space-y-4">
                <Skeleton className="aspect-square w-full rounded-md" />
                <Skeleton className="h-6 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
              </div>
            ))}
          </div>
        ) : aggregatedProducts.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {aggregatedProducts.map((product) => (
              <div 
                key={product.id} 
                className="bg-white border-2 rounded-md overflow-hidden flex flex-col group hover:shadow-2xl transition-all"
              >
                <div className="relative aspect-square bg-muted overflow-hidden flex items-center justify-center">
                  {product.image ? (
                    <img 
                      src={product.image}
                      alt={product.name}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform"
                    />
                  ) : (
                    <div className="flex flex-col items-center gap-3 opacity-20">
                      <Building2 className="w-16 h-16 text-secondary" />
                      <span className="text-[8px] font-black uppercase">Work Photo</span>
                    </div>
                  )}
                  <div className="absolute top-3 left-3 bg-white/90 px-3 py-1 rounded-sm border shadow-sm">
                    <span className="text-[9px] font-black uppercase text-primary">{product.category}</span>
                  </div>
                </div>

                <div className="p-6 flex-grow flex flex-col gap-4">
                  <div className="space-y-1">
                    <h3 className="font-black text-[16px] uppercase tracking-tight text-secondary line-clamp-1">
                      {product.name}
                    </h3>
                    <p className="text-[11px] text-muted-foreground font-medium italic line-clamp-2">
                      "{product.description}"
                    </p>
                  </div>

                  <div className="mt-auto pt-4 border-t space-y-4">
                    <Link href={`/business/${product.businessId}`} className="flex items-center gap-3">
                      <div className="relative w-8 h-8 rounded-full overflow-hidden border-2 bg-muted shrink-0 flex items-center justify-center">
                        {product.businessLogo ? (
                          <img src={product.businessLogo} className="w-full h-full object-cover" alt="logo" />
                        ) : (
                          <Building2 className="w-4 h-4 text-primary/30" />
                        )}
                      </div>
                      <div className="min-w-0">
                        <p className="text-[10px] font-black uppercase truncate text-secondary">
                          {product.businessName}
                        </p>
                        <p className="text-[8px] font-bold text-muted-foreground uppercase flex items-center gap-1">
                          <MapPin className="w-2 h-2 text-primary" /> {product.city}
                        </p>
                      </div>
                    </Link>

                    <Button asChild className="w-full bg-secondary text-white font-black uppercase text-[10px] h-10">
                      <Link href={`/business/${product.businessId}`}>
                        {t('visit_hub')} <ArrowRight className="w-3.5 h-3.5 ml-2" />
                      </Link>
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-32 bg-white rounded-xl border-2 border-dashed space-y-6 flex flex-col items-center">
            <SearchX className="w-16 h-16 text-muted-foreground/20" />
            <div className="space-y-2">
              <p className="font-black text-secondary uppercase tracking-[0.2em] text-sm">Market is empty</p>
              <p className="text-[11px] font-bold text-muted-foreground uppercase">No items found yet.</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
