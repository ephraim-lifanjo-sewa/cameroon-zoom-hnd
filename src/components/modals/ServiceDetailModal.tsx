'use client';

import { BusinessService } from '@/app/lib/types';
import { 
  Dialog, 
  DialogContent, 
  DialogTitle, 
  DialogDescription,
  DialogHeader
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { ShoppingCart, ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import Link from 'next/link';

interface ServiceDetailModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  service: BusinessService | null;
  businessName: string;
  businessId: string;
}

/**
 * SERVICE DETAIL MODAL
 * Flat visuals with no border radius on images.
 */
export function ServiceDetailModal({ open, onOpenChange, service, businessName, businessId }: ServiceDetailModalProps) {
  if (!service) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader className="p-6 border-b bg-muted/10">
          <DialogTitle className="text-xl font-black uppercase leading-tight truncate">{service.name}</DialogTitle>
          <DialogDescription className="text-[10px] font-bold uppercase tracking-widest mt-1">{businessName}</DialogDescription>
        </DialogHeader>

        <div className="flex flex-col">
          {/* Image - NO BORDER RADIUS AS REQUESTED */}
          {service.image && (
            <div className="w-full aspect-video bg-muted border-b">
              <img src={service.image} className="w-full h-full object-cover rounded-none" alt={service.name} />
            </div>
          )}

          {/* Info */}
          <div className="p-8 space-y-6 bg-white">
            <div className="space-y-2">
              {service.price && (
                <p className="text-xl font-black text-primary">{service.price} FCFA</p>
              )}
            </div>

            <p className="text-sm font-medium text-secondary/70 leading-relaxed italic">
              "{service.description}"
            </p>

            <div className="pt-6 border-t">
              {service.link ? (
                <Button asChild className="w-full h-14 bg-secondary text-white font-black uppercase text-xs tracking-widest rounded-xl hover:bg-primary">
                  <a href={service.link} target="_blank">Order Now <ShoppingCart className="w-4 h-4 ml-2" /></a>
                </Button>
              ) : (
                <Button asChild className="w-full h-14 bg-secondary text-white font-black uppercase text-xs tracking-widest rounded-xl hover:bg-primary">
                  <Link href={`/business/${businessId}`}>Visit Business <ArrowRight className="w-4 h-4 ml-2" /></Link>
                </Button>
              )}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
