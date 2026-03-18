"use client";

import { Review } from '@/app/lib/types';
import { ChevronDown, ChevronUp, Star } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useState } from 'react';
import Image from 'next/image';
import { ImageModal } from '@/components/modals/ImageModal';

interface ReviewCardProps {
  review: Review;
  hideUser?: boolean;
}

/**
 * MINIMAL REVIEW CARD
 * Using simple English and clean borders.
 */
export function ReviewCard({ review, hideUser = false }: ReviewCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [previewImg, setPreviewImg] = useState<string | null>(null);
  
  const TEXT_LIMIT = 150;
  const isLongText = (review.reviewText || "").length > TEXT_LIMIT;
  const displayText = isExpanded ? review.reviewText : (review.reviewText || "").slice(0, TEXT_LIMIT);

  const safeDate = (dateStr: string) => {
    try {
      const date = new Date(dateStr);
      return isNaN(date.getTime()) ? "Recently" : date.toLocaleDateString();
    } catch {
      return "Recently";
    }
  };

  const defaultUser = "https://s3-media0.fl.yelpcdn.com/srv0/yelp_styleguide/bf5ff8a79310/assets/img/default_avatars/user_medium_square.png";

  return (
    <div className="space-y-6 py-8 border-b border-[#E5E5E1] last:border-0">
      <div className="flex gap-4 items-start">
        {!hideUser && (
          <div className="shrink-0">
            <img 
              className={cn(
                "rounded-xl object-cover bg-muted border border-[#E5E5E1] w-12 h-12 transition-transform active:scale-90",
                review.userPhoto ? "cursor-pointer" : "cursor-default"
              )} 
              src={review.userPhoto || defaultUser} 
              alt={review.userName} 
              onClick={() => review.userPhoto && setPreviewImg(review.userPhoto)}
            />
          </div>
        )}
        
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-3">
              <div className="flex gap-0.5">
                {[1,2,3,4,5].map(i => <Star key={i} className={cn("w-3.5 h-3.5", i <= review.rating ? 'fill-[#FF643D] text-[#FF643D]' : 'text-gray-200')} />)}
              </div>
              <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">{safeDate(review.createdDate)}</span>
            </div>
          </div>
          
          <div className="text-[14px] leading-relaxed">
            <span className="font-bold uppercase text-xs mr-2">{hideUser ? review.businessName : review.userName}</span>
            <span className="text-secondary/80 font-medium italic">"{displayText}{!isExpanded && isLongText && "..."}"</span>
          </div>
          
          {isLongText && (
            <div className="mt-3">
              <button 
                onClick={() => setIsExpanded(!isExpanded)}
                className="text-[10px] font-bold uppercase text-primary hover:underline flex items-center gap-1 tracking-widest transition-all"
              >
                <span>{isExpanded ? "Read less" : "Read more"}</span>
                {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
              </button>
            </div>
          )}
        </div>
      </div>

      {review.photos && review.photos.length > 0 && (
        <div className={cn("flex gap-3 overflow-x-auto py-2 hide-scrollbar", !hideUser ? "ml-16" : "ml-0")}>
          {review.photos.map((photo, i) => {
            if (!photo || typeof photo !== 'string') return null;
            return (
              <div 
                key={i} 
                className="relative w-32 h-32 shrink-0 rounded-xl cursor-pointer hover:scale-[1.02] active:scale-95 transition-all overflow-hidden border border-[#E5E5E1]" 
                onClick={() => setPreviewImg(photo)}
              >
                <Image 
                  src={photo} 
                  alt="Review Photo" 
                  fill
                  className="object-cover"
                  unoptimized
                />
              </div>
            );
          })}
        </div>
      )}

      <ImageModal open={!!previewImg} onOpenChange={(o) => !o && setPreviewImg(null)} src={previewImg} />
    </div>
  );
}