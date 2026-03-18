"use client";

import { Business } from '@/app/lib/types';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader,
  DialogTitle,
  DialogDescription
} from '@/components/ui/dialog';
import { 
  Star, 
  MapPin, 
  Phone, 
  Globe, 
  Mail,
  Volume2,
  Loader2,
  ExternalLink,
  MessageCircle,
  Building2
} from 'lucide-react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { useState, useRef } from 'react';
import { textToSpeech } from '@/ai/flows/tts-flow';
import { useToast } from '@/hooks/use-toast';

interface BusinessDetailModalProps {
  business: Business | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function BusinessDetailModal({ business, open, onOpenChange }: BusinessDetailModalProps) {
  const { toast } = useToast();
  const [isSynthesizing, setIsSynthesizing] = useState(false);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  if (!business) return null;

  const displayRating = business.rating ?? business.averageRating ?? 0;
  const lat = business.latitude ?? business.location?.lat;
  const lng = business.longitude ?? business.location?.lng;

  const handleListen = async () => {
    if (audioUrl) {
      audioRef.current?.play();
      return;
    }
    setIsSynthesizing(true);
    try {
      const { audioDataUri } = await textToSpeech({ text: business.description });
      setAudioUrl(audioDataUri);
      setTimeout(() => audioRef.current?.play(), 100);
    } catch (e) {
      toast({ title: "Speech Error", variant: "destructive" });
    } finally {
      setIsSynthesizing(false);
    }
  };

  const phones = business.phone_numbers || [business.phone].filter(Boolean);
  const gallery = business.gallery_images || business.photos || [];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[800px] p-0 overflow-hidden border-none rounded-xl">
        <DialogHeader className="sr-only">
          <DialogTitle>{business.name} Detail</DialogTitle>
          <DialogDescription>Professional enterprise information for {business.name}.</DialogDescription>
        </DialogHeader>

        {/* HERO HEADER */}
        <div className="relative h-48 sm:h-72">
          {business.coverPhoto || business.cover_image_url ? (
            <Image 
              src={business.coverPhoto || business.cover_image_url!} 
              alt={business.name}
              fill
              className="object-cover"
            />
          ) : (
            <div className="absolute inset-0 bg-muted flex items-center justify-center">
              <Building2 className="w-20 h-20 opacity-10" />
            </div>
          )}
          <div className="absolute inset-0 bg-black/40" />
          
          <div className="absolute bottom-6 left-6 flex items-end gap-4 pr-6">
            <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-lg border-4 border-white overflow-hidden bg-white shadow-xl relative shrink-0">
              {business.logo ? (
                <Image src={business.logo} fill className="object-contain" alt="Logo" />
              ) : (
                <div className="flex items-center justify-center h-full"><Building2 className="w-10 h-10 opacity-10" /></div>
              )}
            </div>
            <div className="pb-1 text-white overflow-hidden">
              <h2 className="text-2xl sm:text-3xl font-black uppercase tracking-tight leading-none drop-shadow-md truncate">
                {business.name}
              </h2>
              <div className="flex items-center gap-2 mt-2">
                <div className="flex">
                  {[1,2,3,4,5].map(i => (
                    <Star key={i} className={`w-3.5 h-3.5 ${i <= Math.round(displayRating) ? 'fill-primary text-primary' : 'text-gray-300'}`} />
                  ))}
                </div>
                <span className="text-[10px] font-black uppercase tracking-widest opacity-90 flex items-center gap-2">
                  <MapPin className="w-3 h-3" /> {business.city}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="p-8 bg-white max-h-[65vh] overflow-y-auto custom-scrollbar">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="md:col-span-2 space-y-10">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-[11px] font-black uppercase tracking-[0.2em] text-primary">About the Enterprise</h3>
                  <Button 
                    onClick={handleListen} 
                    disabled={isSynthesizing}
                    variant="ghost" 
                    className="h-8 text-[9px] font-black uppercase tracking-widest text-primary hover:bg-primary/5"
                  >
                    {isSynthesizing ? <Loader2 className="w-3 h-3 animate-spin mr-2" /> : <Volume2 className="w-3 h-3 mr-2" />}
                    Listen
                  </Button>
                  {audioUrl && <audio ref={audioRef} src={audioUrl} className="hidden" />}
                </div>
                <p className="text-[15px] leading-relaxed text-secondary font-medium italic border-l-4 border-primary/20 pl-6">
                  {business.description}
                </p>
              </div>

              {gallery.length > 0 && (
                <div className="space-y-4">
                  <h3 className="text-[11px] font-black uppercase tracking-[0.2em] text-muted-foreground">Photo Gallery</h3>
                  <div className="flex gap-4 overflow-x-auto pb-4 hide-scrollbar">
                    {gallery.map((img, idx) => (
                      <div key={idx} className="relative w-48 h-32 shrink-0 rounded-md overflow-hidden border shadow-sm group">
                        <Image src={img} fill className="object-cover group-hover:scale-110 transition-transform duration-500" alt={`Gallery ${idx}`} />
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="space-y-8 bg-[#F5F5F5] p-6 rounded-lg border">
              <div className="space-y-6">
                <h3 className="text-[11px] font-black uppercase tracking-[0.2em] text-secondary">Contact Information</h3>
                <div className="space-y-4">
                  {phones.map((phone, i) => (
                    <div key={i} className="flex items-center gap-4 group cursor-pointer" onClick={() => window.open(`tel:${phone}`)}>
                      <div className="w-9 h-9 rounded-md bg-white flex items-center justify-center border group-hover:border-primary transition-colors shadow-sm">
                        <Phone className="w-4 h-4 text-primary" />
                      </div>
                      <span className="text-[13px] font-bold truncate">{phone}</span>
                    </div>
                  ))}
                  {business.email && (
                    <div className="flex items-center gap-4 group cursor-pointer" onClick={() => window.open(`mailto:${business.email}`)}>
                      <div className="w-9 h-9 rounded-md bg-white flex items-center justify-center border group-hover:border-primary transition-colors shadow-sm">
                        <Mail className="w-4 h-4 text-primary" />
                      </div>
                      <span className="text-[13px] font-bold truncate">{business.email}</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="pt-4 flex flex-col gap-3">
                <Button 
                  className="w-full h-11 bg-primary hover:bg-black text-white font-black uppercase text-[10px] tracking-widest shadow-lg rounded-md"
                  onClick={() => window.open(`https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`, '_blank')}
                >
                  <ExternalLink className="w-3.5 h-3.5 mr-2" /> Directions
                </Button>
                <Button 
                  variant="outline" 
                  className="w-full h-11 border-2 text-[#25D366] border-[#25D366] hover:bg-[#25D366] hover:text-white font-black uppercase text-[10px] tracking-widest rounded-md transition-all"
                  onClick={() => window.open(`https://wa.me/${business.whatsapp || business.phone}`, '_blank')}
                >
                  <MessageCircle className="w-3.5 h-3.5 mr-2" /> WhatsApp
                </Button>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
