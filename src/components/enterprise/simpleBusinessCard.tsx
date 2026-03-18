"use client";

import { Business } from '@/app/lib/types';
import { Star, MapPin, Building2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useRouter } from 'next/navigation';
import Image from 'next/image';

interface SimpleBusinessCardProps {
  business: Business;
}

export function SimpleBusinessCard({ business }: SimpleBusinessCardProps) {
  const router = useRouter();

  return (
    <div 
      className="group bg-[#FFFFFF] flex gap-4 sm:gap-6 p-4 sm:p-6 transition-all border-none hover:shadow-lg cursor-pointer relative rounded-none"
      onClick={() => router.push(`/business/${business.id}`)}
    >
      {/* Image Section - Left aligned */}
      <div className="relative w-20 h-20 sm:w-[120px] sm:h-[120px] md:w-[150px] md:h-[150px] shrink-0 bg-[#F9F9FB] flex items-center justify-center overflow-hidden border border-gray-100 shadow-sm">
        {business.logo || business.coverPhoto ? (
          <Image 
            src={business.logo || business.coverPhoto!} 
            alt={business.name} 
            fill
            className="object-cover"
          />
        ) : (
          <Building2 className="w-8 h-8 opacity-10" />
        )}
        {business.verificationStatus && business.verificationStatus >= 3 && (
          <div className="absolute top-2 left-2 bg-primary text-white text-[7px] font-black uppercase px-1.5 py-0.5 shadow-md">
            Verified
          </div>
        )}
      </div>
      
      {/* Info Section - Right aligned */}
      <div className="flex flex-col flex-1 min-w-0 space-y-1 py-1">
        <h3 className="font-black text-base sm:text-lg md:text-[20px] text-secondary uppercase tracking-tight leading-tight group-hover:underline transition-all">
          {business.name}
        </h3>

        <div className="flex flex-col space-y-1">
          <span className="text-[11px] sm:text-[12px] font-medium text-muted-foreground uppercase tracking-wider">
            {business.category}
          </span>
          <span className="flex items-center gap-1 text-[11px] sm:text-[12px] font-bold text-muted-foreground uppercase">
            <MapPin className="w-3 h-3 text-primary" /> {business.quarter}, {business.city}
          </span>
        </div>

        <div className="flex items-center gap-2 mt-auto pt-2">
          <div className="flex gap-0.5">
            {[1, 2, 3, 4, 5].map(i => (
              <Star 
                key={i} 
                className={cn(
                  "w-3 h-3 sm:w-4 sm:h-4",
                  i <= Math.round(business.averageRating || 0) ? 'fill-primary text-primary' : 'text-gray-200'
                )} 
              />
            ))}
          </div>
          <span className="text-[10px] sm:text-[11px] font-black text-muted-foreground uppercase">
            {business.totalReviews || 0} Reviews
          </span>
        </div>
      </div>
    </div>
  );
}
