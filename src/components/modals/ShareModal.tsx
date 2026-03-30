/* eslint-disable react-hooks/set-state-in-effect */
"use client";

import { 
  Dialog, 
  DialogContent, 
  DialogTitle,
  DialogDescription
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Copy, MessageCircle, X } from 'lucide-react';
import { useState, useEffect } from 'react';

interface ShareModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  businessName: string;
  businessId: string;
}

export function ShareModal({ open, onOpenChange, businessName, businessId }: ShareModalProps) {
  const { toast } = useToast();
  const [shareUrl, setShareUrl] = useState('');

  useEffect(() => {
    if (typeof window !== 'undefined' && open) {
      setShareUrl(`${window.location.origin}/business/${businessId}`);
    }
  }, [businessId, open]);

  const copyToClipboard = () => {
    navigator.clipboard.writeText(shareUrl).then(() => {
      toast({ title: "Link Copied" });
    });
  };

  const shareOnWhatsApp = () => {
    window.open(`https://wa.me/?text=${encodeURIComponent(`Check out ${businessName}: ${shareUrl}`)}`, '_blank');
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-75 rounded-md border-2 p-6 gap-4 shadow-2xl">
        <DialogTitle className="sr-only">Share {businessName}</DialogTitle>
        <DialogDescription className="sr-only">Choose a platform to share this enterprise profile.</DialogDescription>
        
        <Button className="w-full h-12 bg-[#25D366] text-white font-black uppercase text-[10px] rounded-md" onClick={shareOnWhatsApp}>
          <MessageCircle className="w-4 h-4 mr-2" /> WhatsApp
        </Button>
        <Button variant="outline" className="w-full h-12 border-2 font-black uppercase text-[10px] rounded-md" onClick={copyToClipboard}>
          <Copy className="w-4 h-4 mr-2" /> Copy Link
        </Button>
        <Button variant="ghost" className="w-full h-10 font-black uppercase text-[10px] text-muted-foreground rounded-md" onClick={() => onOpenChange(false)}>
          <X className="w-4 h-4 mr-2" /> Close
        </Button>
      </DialogContent>
    </Dialog>
  );
}
