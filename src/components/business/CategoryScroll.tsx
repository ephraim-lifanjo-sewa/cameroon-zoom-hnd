
"use client";

import Link from 'next/link';
import { cn } from '@/lib/utils';

const CATEGORIES = [
  { id: 'food', name: 'Food & Hospitality', icon: 'https://s3-media0.fl.yelpcdn.com/assets/srv0/yelp_design_cdn/8bc05b287157/assets/img/svg_illustrations/40x40_food_v2.svg' },
  { id: 'health', name: 'Health & Wellness', icon: 'https://s3-media0.fl.yelpcdn.com/assets/srv0/yelp_design_cdn/5bd5d2648742/assets/img/svg_illustrations/40x40_barbers_v2.svg' },
  { id: 'tech', name: 'Technology & IT', icon: 'https://s3-media0.fl.yelpcdn.com/assets/srv0/yelp_design_cdn/1397897c21a5/assets/img/svg_illustrations/40x40_new_v2.svg' },
  { id: 'business', name: 'Business & Professional', icon: 'https://s3-media0.fl.yelpcdn.com/assets/srv0/yelp_design_cdn/488aeb87ef6e/assets/img/svg_illustrations/40x40_gift_shops_v2.svg' },
  { id: 'home', name: 'Home & Lifestyle', icon: 'https://s3-media0.fl.yelpcdn.com/assets/srv0/yelp_design_cdn/7fc312973cf8/assets/img/svg_illustrations/40x40_home_services_v2.svg' },
  { id: 'creative', name: 'Creative & Media', icon: 'https://s3-media0.fl.yelpcdn.com/assets/srv0/yelp_design_cdn/0372f8e93aa9/assets/img/svg_illustrations/40x40_set_objective_v2.svg' },
  { id: 'education', name: 'Education & Training', icon: 'https://s3-media0.fl.yelpcdn.com/assets/public/40x40_more_v2.yji-1d02ed29aa1c9fef.svg' },
  { id: 'events', name: 'Events & Entertainment', icon: 'https://s3-media0.fl.yelpcdn.com/assets/srv0/yelp_design_cdn/5967f38fe621/assets/img/svg_illustrations/40x40_auto_v2.svg' }
];

/**
 * CLEAN CATEGORY SCROLL
 * Removed heavy black borders. Using light stone borders.
 */
export function CategoryScroll() {
  return (
    <div className="w-full">
      <div className="space-y-8">
        <h2 className="text-3xl font-black uppercase tracking-tighter text-secondary leading-none">Find what you need</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {CATEGORIES.map((sector) => (
            <Link 
              key={sector.id} 
              href={`/search?category=${encodeURIComponent(sector.name)}`} 
              className="group border border-[#E5E5E1] rounded-2xl p-6 flex flex-col items-center justify-center text-center space-y-3 transition-all hover:shadow-lg hover:-translate-y-1 bg-white active:scale-95"
            >
              <div className="w-10 h-10 shrink-0 transition-transform group-hover:scale-110">
                <img src={sector.icon} alt={sector.name} className="w-full h-full object-contain" />
              </div>
              <p className="text-[11px] font-black text-secondary uppercase tracking-widest group-hover:text-primary transition-colors">
                {sector.name}
              </p>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
