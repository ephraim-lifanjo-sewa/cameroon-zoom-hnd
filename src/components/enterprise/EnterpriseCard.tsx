"use client";

import { Enterprise } from '@/app/lib/types';
import { Star, MapPin, Building2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useRouter } from 'next/navigation';

interface EnterpriseCardProps {
  enterprise: Enterprise;
  isHighlighted?: boolean;
  onMouseEnter?: () => void;
  onMouseLeave?: () => void;
}

/**
 * INSTITUTIONAL ENTERPRISE CARD
 * Optimized for map-sync discovery with hover states.
 */
export function EnterpriseCard({ enterprise, isHighlighted, onMouseEnter, onMouseLeave }: EnterpriseCardProps) {
  const router = useRouter();

  const name = enterprise.businessName || enterprise.name || "Unnamed Place";
  const category = enterprise.category || "General Work";
  const city = enterprise.city || "Cameroon";
  const rating = enterprise.averageRating || 0;
  const reviewsCount = enterprise.totalReviews || 0;
  
  const thumbnail = enterprise.coverPhoto || enterprise.logo || null;

  return (
    <div 
      className={cn(
        "group bg-white border border-[#E5E5E1] cursor-pointer flex flex-col transition-all overflow-hidden rounded-2xl w-full shadow-sm hover:shadow-xl",
        isHighlighted && "ring-4 ring-primary/5 shadow-2xl scale-[1.02] border-primary/30"
      )}
      onClick={() => router.push(`/business/${enterprise.id}`)}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
    >
      <div className="relative w-full aspect-[16/9] bg-muted flex items-center justify-center overflow-hidden border-b border-[#E5E5E1]">
        {thumbnail ? (
          <img src={thumbnail} alt={name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
        ) : (
          <div className="flex flex-col items-center gap-2 opacity-10">
            <Building2 className="w-10 h-10" />
          </div>
        )}
        {enterprise.isVerified && (
          <div className="absolute top-3 left-3 bg-primary text-white text-[8px] font-black uppercase px-2 py-1 rounded-md">Verified</div>
        )}
      </div>
      
      <div className="p-5 flex flex-col gap-2 bg-white">
        <h3 className="font-black text-[16px] text-secondary uppercase tracking-tight truncate group-hover:text-primary transition-colors">{name}</h3>
        <p className="text-[10px] font-black uppercase text-muted-foreground tracking-widest">{category}</p>

        <div className="flex items-center gap-2">
          <div className="flex gap-0.5">
            {[1,2,3,4,5].map(i => (
              <Star key={i} className={cn("w-3.5 h-3.5", i <= Math.round(rating) ? "fill-[#FF643D] text-[#FF643D]" : "text-gray-200")} />
            ))}
          </div>
          <span className="text-muted-foreground text-[10px] font-black uppercase">({reviewsCount})</span>
        </div>

        <div className="mt-auto pt-4 border-t border-[#E5E5E1] flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-[10px] font-black text-secondary uppercase">
            <MapPin className="w-3.5 h-3.5 text-primary" /> {city}
          </div>
          <div className="text-[9px] font-black text-primary uppercase tracking-widest group-hover:underline">Explore</div>
        </div>
      </div>
    </div>
  );
}
