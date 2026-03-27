'use client';

import Link from 'next/link';
import Image from 'next/image';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { cn } from '@/lib/utils';


const TOWNS = [
  { 
    id: 'ngaoundere', 
    name: 'Ngaoundéré', 
    image: PlaceHolderImages.find(img => img.id === 'town-ngr')?.imageUrl || '/public/images/ngaoundere.jpg',
    color: 'bg-green-400'
  },
  { 
    id: 'douala', 
    name: 'Douala', 
    image: PlaceHolderImages.find(img => img.id === 'town-dla')?.imageUrl || '/public/images/Douala-City-searchcameroon-270x400.jpg',
    color: 'bg-yellow-400'
  },
];

export function TownScroll() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-10 py-12 px-4 max-w-6xl mx-auto w-full">
      {TOWNS.map((town) => (
        <Link 
          key={town.id} 
          href={`/search?city=${encodeURIComponent(town.name)}`} 
          className="group relative block w-full"
        >
          <div className={cn(
            "relative w-full h-80 sm:h-[400px] rounded-[40px] border-[6px] border-secondary overflow-hidden transition-all duration-500",
            "hover:-translate-y-4 hover:translate-x-2 hover:shadow-[16px_16px_0px_0px_#D71616]",
            "shadow-[12px_12px_0px_0px_rgba(0,0,0,1)]",
            town.color
          )}>
            <div className="absolute inset-0 grayscale group-hover:grayscale-0 transition-all duration-700 opacity-40 group-hover:opacity-100">
              <Image 
                src={town.image} 
                alt={town.name} 
                fill 
                className="object-cover"
                unoptimized
              />
            </div>
            
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
            
            <div className="absolute bottom-10 left-0 right-0 text-center">
              <span className="text-4xl sm:text-6xl font-black uppercase tracking-tighter text-white drop-shadow-[4px_4px_0px_rgba(0,0,0,1)]">
                {town.name}
              </span>
              <div className="mt-6 flex justify-center">
                <div className="px-8 py-3 bg-white border-4 border-secondary rounded-full transform -rotate-3 group-hover:rotate-0 transition-transform shadow-lg">
                  <span className="text-[10px] font-black uppercase text-secondary tracking-widest">Explore Now</span>
                </div>
              </div>
            </div>
          </div>
        </Link>
      ))}
    </div>
  );
}
