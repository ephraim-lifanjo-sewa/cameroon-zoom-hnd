'use client';

import { useState } from 'react';
import { 
  Dialog, 
  DialogContent, 
  DialogTitle, 
  DialogDescription,
  DialogHeader
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Star, X, CheckCircle2, Camera, Trash2 } from 'lucide-react';
import { useFirestore, useUser, setDocumentNonBlocking, updateDocumentNonBlocking } from '@/firebase';
import { doc, increment, collection } from 'firebase/firestore';
import { cn } from '@/lib/utils';

interface WriteReviewModalProps {
  open: boolean; 
  onOpenChange: (open: boolean) => void;
  businessId: string;
  businessName: string;
  currentAverageRating: number;
  currentTotalReviews: number;
}

/**
 * ULTRA SIMPLE WRITE REVIEW MODAL
 * Direct, simple English, large icons. Anyone can understand it.
 */
export function WriteReviewModal({ 
  open, 
  onOpenChange, 
  businessId, 
  businessName,
  currentAverageRating,
  currentTotalReviews
}: WriteReviewModalProps) {
  const [rating, setRating] = useState(0);
  const [text, setText] = useState('');
  const [images, setImages] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  
  const { toast } = useToast();
  const db = useFirestore();
  const { user } = useUser();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;
    Array.from(files).forEach(file => {
      const reader = new FileReader();
      reader.onloadend = () => setImages(prev => [...prev, reader.result as string]);
      reader.readAsDataURL(file);
    });
  };

  const handleSubmit = () => {
    if (!user || !db) return;
    if (rating === 0) {
      toast({ title: "Please pick stars" });
      return;
    }
    if (!text.trim()) {
      toast({ title: "Please write something" });
      return;
    }

    setIsSubmitting(true);
    const reviewId = doc(collection(db, 'reviews')).id;
    const reviewData = {
      id: reviewId,
      businessId,
      businessName,
      reviewerId: user.uid,
      userName: user.displayName || user.email?.split('@')[0] || 'Member',
      userPhoto: user.photoURL || '',
      rating,
      reviewText: text,
      photos: images,
      createdDate: new Date().toISOString(),
      modifiedDate: new Date().toISOString(),
      isHelpfulCount: 0
    };

    setDocumentNonBlocking(doc(db, 'reviews', reviewId), reviewData, { merge: true });

    const newTotalReviews = (currentTotalReviews || 0) + 1;
    const newAverageRating = (((currentAverageRating || 0) * (currentTotalReviews || 0)) + rating) / newTotalReviews;

    updateDocumentNonBlocking(doc(db, 'businesses', businessId), {
      totalReviews: increment(1),
      averageRating: Number(newAverageRating.toFixed(1))
    });

    setIsSuccess(true);
    setTimeout(() => {
      onOpenChange(false);
      setIsSuccess(false);
      setRating(0);
      setText('');
      setImages([]);
      setIsSubmitting(false);
    }, 1500);
  };

  return (
    <Dialog open={open} onOpenChange={(o) => !isSubmitting && onOpenChange(o)}>
      <DialogContent className="sm:max-w-[450px]">
        <DialogHeader className="p-6 border-b bg-muted/10">
          <DialogTitle className="text-xl font-black uppercase text-center leading-none truncate px-4">{businessName}</DialogTitle>
          <DialogDescription className="text-[10px] font-bold uppercase text-center tracking-widest mt-2">Write a simple review</DialogDescription>
        </DialogHeader>
        
        <div className="p-8 space-y-8 bg-white">
          {isSuccess ? (
            <div className="py-12 flex flex-col items-center justify-center space-y-4 text-center">
              <CheckCircle2 className="w-16 h-16 text-green-500" />
              <div className="space-y-1">
                <h2 className="text-2xl font-black uppercase">Success!</h2>
                <p className="text-[10px] font-bold text-muted-foreground uppercase">Review posted</p>
              </div>
            </div>
          ) : (
            <>
              <div className="flex flex-col items-center gap-4">
                <p className="text-[10px] font-black uppercase tracking-widest opacity-50">How many stars?</p>
                <div className="flex justify-center gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button key={star} onClick={() => setRating(star)} className="transition-transform active:scale-75">
                      <Star className={cn(
                        "w-10 h-10", 
                        rating >= star ? "fill-primary text-primary" : "text-gray-200"
                      )} />
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <p className="text-[10px] font-black uppercase tracking-widest opacity-50">What do you think?</p>
                <Textarea 
                  value={text} 
                  onChange={(e) => setText(e.target.value)} 
                  placeholder="It was good / It was bad..." 
                  className="min-h-[120px] border-2 rounded-xl font-bold italic" 
                />
              </div>

              <div className="space-y-4">
                <p className="text-[10px] font-black uppercase tracking-widest opacity-50">Add Photos</p>
                <div className="flex gap-3 overflow-x-auto pb-2 hide-scrollbar">
                  {images.map((img, i) => (
                    <div key={i} className="relative w-16 h-16 border rounded-xl overflow-hidden shrink-0 group">
                      <img src={img} className="w-full h-full object-cover" />
                      <button 
                        onClick={() => setImages(p => p.filter((_, idx) => idx !== i))} 
                        className="absolute inset-0 bg-black/60 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                  {images.length < 4 && (
                    <label className="w-16 h-16 flex flex-col items-center justify-center border-2 border-dashed rounded-xl cursor-pointer hover:bg-muted transition-all shrink-0">
                      <Camera className="w-5 h-5 text-muted-foreground" />
                      <input type="file" accept="image/*" multiple onChange={handleFileChange} className="hidden" />
                    </label>
                  )}
                </div>
              </div>

              <Button 
                onClick={handleSubmit} 
                disabled={isSubmitting || rating === 0} 
                className="w-full h-14 bg-secondary text-white font-black uppercase text-xs tracking-widest rounded-xl shadow-lg"
              >
                {isSubmitting ? <Loader2 className="animate-spin w-5 h-5" /> : "Post Review"}
              </Button>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
