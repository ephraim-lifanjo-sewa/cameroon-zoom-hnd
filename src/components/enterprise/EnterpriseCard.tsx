"use client";

import { Enterprise } from '@/app/lib/types';
import { Star, MapPin, Building2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { useState } from 'react';
import { ImageModal } from '@/components/modals/ImageModal';

interface EnterpriseCardProps {
  enterprise: Enterprise;
  isHighlighted?: boolean;
}

/**
 * PRODUCTION READY ENTERPRISE CARD
 * Real Black borders. Static placeholder logic.
 */
export function EnterpriseCard({ enterprise, isHighlighted }: EnterpriseCardProps) {
  const router = useRouter();
  const [previewImg, setPreviewImg] = useState<string | null>(null);

  const name = enterprise.businessName || enterprise.name || "Unnamed Place";
  const category = enterprise.category || "General Work";
  const city = enterprise.city || "Cameroon";
  const rating = enterprise.averageRating || 0;
  const reviewsCount = enterprise.totalReviews || 0;
  
  const thumbnail = (typeof enterprise.coverPhoto === 'string' && enterprise.coverPhoto && enterprise.coverPhoto !== "") 
    ? enterprise.coverPhoto 
    : (typeof enterprise.logo === 'string' && enterprise.logo && enterprise.logo !== "") 
    ? enterprise.logo 
    : null;

  const openPreview = (e: React.MouseEvent) => {
    e.stopPropagation();
    // Only open modal if it's a real photo (not a placeholder)
    if (thumbnail && typeof thumbnail === 'string') {
      setPreviewImg(thumbnail);
    } else {
      router.push(`/business/${enterprise.id}`);
    }
  };

  return (
    <div 
      className={cn(
        "group bg-white border-[3px] border-black cursor-pointer flex flex-col transition-all duration-200 overflow-hidden rounded-2xl w-full",
        isHighlighted ? "ring-4 ring-primary/5 shadow-2xl scale-[1.02]" : "shadow-sm hover:shadow-xl"
      )}
      onClick={() => router.push(`/business/${enterprise.id}`)}
    >
      <div 
        className={cn(
          "relative w-full aspect-[16/9] bg-muted flex items-center justify-center overflow-hidden border-b-[3px] border-black",
          thumbnail ? "cursor-pointer" : "cursor-default"
        )}
        onClick={openPreview}
      >
        {thumbnail ? (
          <Image 
            src={thumbnail} 
            alt={name} 
            fill
            className="object-cover transition-transform duration-700 group-hover:scale-110"
            unoptimized
          />
        ) : (
          <div className="flex flex-col items-center gap-2 opacity-10 text-black">
            <Building2 className="w-10 h-10" />
            <span className="text-[10px] font-black uppercase tracking-widest">No Photo</span>
          </div>
        )}
        
        {enterprise.isVerified && (
          <div className="absolute top-3 left-3 bg-primary text-white text-[8px] font-black uppercase px-2 py-1 rounded-md shadow-lg border-2 border-black">
            Checked
          </div>
        )}

        <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
      </div>
      
      <div className="p-5 flex flex-col gap-2 flex-grow bg-white min-w-0">
        <div className="flex justify-between items-start gap-2">
          <div className="min-w-0 flex-grow">
            <h3 className="font-black text-[16px] text-secondary uppercase tracking-tight leading-tight truncate group-hover:text-primary transition-colors">
              {name}
            </h3>
            <p className="text-[10px] font-black uppercase text-muted-foreground tracking-widest mt-1">{category}</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex gap-0.5">
            {[1,2,3,4,5].map(i => (
              <Star 
                key={i} 
                className={cn(
                  "w-3.5 h-3.5", 
                  i <= Math.round(rating) ? "fill-[#FF643D] text-[#FF643D]" : "text-gray-200"
                )} 
              />
            ))}
          </div>
          <span className="text-muted-foreground text-[10px] font-black uppercase tracking-wider">
            ({reviewsCount})
          </span>
        </div>

        <div className="mt-auto pt-4 border-t-2 border-black flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-[10px] font-black text-secondary uppercase tracking-wide">
            <MapPin className="w-3.5 h-3.5 text-primary shrink-0" /> 
            <span className="truncate">{city}, CM</span>
          </div>
          
          <div className="text-[9px] font-black text-primary uppercase tracking-widest group-hover:underline">
            Visit
          </div>
        </div>
      </div>

      <ImageModal open={!!previewImg} onOpenChange={(o) => !o && setPreviewImg(null)} src={previewImg} />
    </div>
  );
}
