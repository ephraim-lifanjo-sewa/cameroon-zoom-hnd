"use client";

import { Star, MessageCircle, ChevronRight, MapPin, X, ShoppingCart, Building2 } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import "leaflet/dist/leaflet.css";
import { cn } from '@/lib/utils';

// ----- Types directly in this file -----
interface BusinessService {
  id: string;
  name: string;
  description?: string;
  price?: number;
  image?: string;
  link?: string;
}

interface Business {
  id: string;
  name: string;
  category?: string;
  city?: string;
  averageRating?: number;
  totalReviews?: number;
  coverPhoto?: string;
  logo?: string;
  bookingLink?: string;
  website?: string;
  whatsapp?: string;
  services?: BusinessService[];
}

interface MapBusinessCardProps {
  business: Business;
  onClose: () => void;
}

// ----- Component -----
export function MapBusinessCard({ business, onClose }: MapBusinessCardProps) {
  if (!business) return null;

  const hasOrderLink = !!business.bookingLink || !!business.website;

  return (
    <div className="bg-white rounded-[8px] shadow-2xl border-2 overflow-hidden relative group animate-in slide-in-from-bottom-4 duration-300 w-full max-w-[340px] mx-auto">
      <button 
        onClick={onClose}
        className="absolute top-2 right-2 z-10 bg-white/90 p-1.5 rounded-full shadow-sm hover:bg-black hover:text-white transition-colors border"
      >
        <X className="w-3 h-3" />
      </button>

      <div className="flex h-[100px] sm:h-30">
        <Link href={`/business/${business.id}`} className="relative w-[100px] sm:w-[120px] shrink-0 bg-muted flex items-center justify-center overflow-hidden">
          {business.coverPhoto || business.logo ? (
            <Image 
              src={business.coverPhoto || business.logo!} 
              alt={business.name}
              fill
              className="object-cover"
            />
          ) : (
            <div className="flex flex-col items-center gap-1 opacity-20">
              <Building2 className="w-8 h-8 text-secondary" />
              <span className="text-[6px] font-black uppercase tracking-widest text-secondary">AVATAR</span>
            </div>
          )}
          <Badge className="absolute top-1 left-1 bg-primary text-[7px] font-black uppercase rounded-[2px] border-none px-1.5 py-0.5 shadow-md">
            {business.category}
          </Badge>
        </Link>

        <div className="p-3 grow flex flex-col justify-between overflow-hidden">
          <Link href={`/business/${business.id}`} className="block hover:opacity-80 transition-opacity">
            <h3 className="font-black text-[12px] sm:text-[14px] uppercase tracking-tight truncate leading-none text-secondary">
              {business.name}
            </h3>
            <div className="flex items-center gap-1 mt-1">
              <div className="flex">
                {[1, 2, 3, 4, 5].map(i => (
                  <Star 
                    key={i} 
                    className={cn(
                      "w-2.5 h-2.5",
                      i <= Math.round(business.averageRating || 0) ? 'fill-primary text-primary' : 'text-gray-200'
                    )} 
                  />
                ))}
              </div>
              <span className="text-[9px] font-black text-secondary ml-0.5">({business.totalReviews || 0})</span>
            </div>
            <p className="text-[9px] font-bold text-muted-foreground flex items-center gap-1 mt-1 truncate">
              <MapPin className="w-2 h-2 text-primary shrink-0" /> {business.city}
            </p>
          </Link>

          <div className="flex gap-1.5 mt-1">
            {hasOrderLink ? (
              <Button 
                size="sm" 
                className="h-8 px-2 rounded-[4px] flex-1 bg-primary hover:bg-black text-white font-black uppercase text-[9px] tracking-widest shadow-md border-none"
                asChild
              >
                <a href={business.bookingLink || business.website} target="_blank">
                  <ShoppingCart className="w-3 h-3 mr-1" /> Order
                </a>
              </Button>
            ) : (
              <Button 
                size="sm" 
                variant="outline"
                className="h-8 px-2 rounded-sm flex-1 border-2 text-[#25D366] border-[#25D366] font-black uppercase text-[9px] tracking-widest transition-all"
                asChild
              >
                <a href={`https://wa.me/${business.whatsapp}`} target="_blank">
                  <MessageCircle className="w-3 h-3 mr-1" /> Chat
                </a>
              </Button>
            )}
            
            <Button size="sm" className="h-8 w-8 p-0 rounded-[4px] bg-secondary text-white hover:bg-black transition-colors shrink-0" asChild>
              <Link href={`/business/${business.id}`}><ChevronRight className="w-4 h-4" /></Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}