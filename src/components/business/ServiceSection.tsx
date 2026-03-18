'use client';

import { BusinessService } from '@/app/lib/types';
import { Building2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ServiceSectionProps {
  services: BusinessService[];
  category: string;
  onServiceClick?: (service: BusinessService) => void;
}

/**
 * ULTRA SIMPLE SERVICE SECTION
 * Just Image, Name, and Price. Like a simple HTML list.
 */
export function ServiceSection({ services, category, onServiceClick }: ServiceSectionProps) {
  if (!services || services.length === 0) return null;

  let label = "Services";
  if (category === 'Food & Hospitality') label = "Menu";
  else if (category === 'Events & Entertainment') label = "Events";

  return (
    <section className="bg-white border border-[#E5E5E1] rounded-2xl p-8 space-y-8 shadow-sm">
      <h2 className="text-xl font-black uppercase tracking-tight border-b border-[#E5E5E1] pb-4">{label}</h2>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6">
        {services.map((item) => (
          <div 
            key={item.id} 
            onClick={() => onServiceClick?.(item)}
            className="group cursor-pointer space-y-3"
          >
            <div className="aspect-square bg-muted rounded-xl overflow-hidden border border-[#E5E5E1]">
              {item.image ? (
                <img src={item.image} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" alt={item.name} />
              ) : (
                <div className="flex items-center justify-center h-full opacity-10">
                  <Building2 className="w-8 h-8" />
                </div>
              )}
            </div>
            <div className="space-y-1">
              <h4 className="font-black text-[12px] uppercase tracking-tight text-secondary truncate">{item.name}</h4>
              {item.price && (
                <p className="text-[11px] font-bold text-primary">{item.price} FCFA</p>
              )}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
