"use client";

import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

interface ImageModalProps {
  src: string | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

/**
 * UNIVERSAL IMAGE MODAL
 * Pure black backdrop, takes entire screen space on all devices.
 */
export function ImageModal({ src, open, onOpenChange }: ImageModalProps) {
  if (!src || typeof src !== 'string' || src === "") return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className={cn(
        "p-0 border-none bg-black shadow-none max-w-none flex items-center justify-center z-[1000]",
        "fixed inset-0 w-full h-full m-0 rounded-none sm:rounded-none sm:max-w-none sm:max-h-none sm:left-0 sm:top-0 sm:translate-x-0 sm:translate-y-0"
      )}>
        <DialogTitle className="sr-only">View Photo</DialogTitle>
        <DialogDescription className="sr-only">Full size photo viewing mode.</DialogDescription>
        
        <div className="relative w-full h-full flex items-center justify-center p-0">
          <button 
            onClick={() => onOpenChange(false)}
            className="absolute top-6 right-6 z-[1001] bg-black/40 text-white p-3 rounded-full hover:bg-white hover:text-black transition-all active:scale-90"
          >
            <X className="w-6 h-6" />
          </button>
          
          <div className="relative w-full h-full flex items-center justify-center overflow-hidden">
            <img 
              src={src} 
              alt="Full view" 
              className="max-w-full max-h-full object-contain shadow-2xl"
            />
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
