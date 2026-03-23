
"use client";

import { useState } from 'react';
import { 
  useFirestore, 
  useUser, 
  setDocumentNonBlocking, 
  updateDocumentNonBlocking, 
  useDoc, 
  useMemoFirebase 
} from '@/firebase';
import { doc, increment, collection } from 'firebase/firestore';
import { cn } from '@/lib/utils';
import { UserProfile } from '@/app/lib/types';
import { Loader2, Star, X } from 'lucide-react';

interface WriteReviewModalProps {
  open: boolean; 
  onOpenChange: (open: boolean) => void;
  businessId: string;
  businessName: string;
  currentAverageRating: number;
  currentTotalReviews: number;
}

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
  
  const db = useFirestore();
  const { user } = useUser();

  const userDocRef = useMemoFirebase(() => (db && user) ? doc(db, 'users', user.uid) : null, [db, user]);
  const { data: profile } = useDoc<UserProfile>(userDocRef);

  if (!open) return null;

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;
    // Strict limit of 4 images
    Array.from(files).slice(0, 4).forEach(file => {
      const reader = new FileReader();
      reader.onloadend = () => setImages(prev => [...prev, reader.result as string].slice(0, 4));
      reader.readAsDataURL(file);
    });
  };

  const handleSubmit = () => {
    if (!user || !db || rating === 0 || !text.trim()) return;
    setIsSubmitting(true);
    
    const reviewId = doc(collection(db, 'reviews')).id;
    const reviewData = {
      id: reviewId,
      businessId,
      businessName,
      reviewerId: user.uid,
      userName: profile?.fullName || user.email?.split('@')[0] || 'Member',
      userPhoto: profile?.profilePhoto || '',
      rating,
      reviewText: text,
      photos: images,
      createdDate: new Date().toISOString(),
      isHelpfulCount: 0
    };

    setDocumentNonBlocking(doc(db, 'reviews', reviewId), reviewData, { merge: true });
    
    const newTotal = (currentTotalReviews || 0) + 1;
    const newAvg = (((currentAverageRating || 0) * (currentTotalReviews || 0)) + rating) / newTotal;
    
    updateDocumentNonBlocking(doc(db, 'businesses', businessId), {
      totalReviews: increment(1),
      averageRating: Number(newAvg.toFixed(1))
    });

    setTimeout(() => {
      onOpenChange(false);
      setRating(0);
      setText('');
      setImages([]);
      setIsSubmitting(false);
      alert("Review Shared Successfully");
    }, 1000);
  };

  return (
    <div className="fixed inset-0 bg-white z-[2000] flex flex-col overflow-hidden font-body animate-in fade-in zoom-in-95 duration-200">
      <div className="flex items-center justify-between p-6 border-b border-[#E5E5E1] shrink-0">
        <h2 className="text-xl font-black uppercase text-secondary truncate">{businessName}</h2>
        <button onClick={() => onOpenChange(false)} className="p-2 hover:bg-muted rounded-full transition-colors">
          <X className="w-6 h-6" />
        </button>
      </div>

      <div className="flex-grow overflow-y-auto p-6 sm:p-12 flex flex-col items-center bg-white">
        <div className="w-full max-w-xl space-y-10 py-4">
          
          <div className="flex justify-center gap-2">
            {[1, 2, 3, 4, 5].map((v) => (
              <button
                key={v}
                onClick={() => setRating(v)}
                className="transition-transform active:scale-90 p-1"
              >
                <Star 
                  className={cn(
                    "w-12 h-12",
                    v <= rating ? "fill-primary text-primary" : "text-gray-300"
                  )} 
                />
              </button>
            ))}
          </div>

          <div className="space-y-4">
            <textarea
              rows={6}
              value={text}
              maxLength={300} // Word limit estimate
              onChange={(e) => setText(e.target.value)}
              placeholder="What did you like or dislike? (Max 60 words)"
              className="w-full bg-[#F9F9FB] p-6 outline-none font-bold italic border-2 border-[#E5E5E1] rounded-xl focus:border-primary transition-all"
            />
            <div className="text-right text-[10px] font-black uppercase opacity-30">
              {text.split(/\s+/).filter(Boolean).length} / 60 words
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <label className="text-[10px] font-black uppercase tracking-widest opacity-50">Upload Photos (Max 4)</label>
              {images.length > 0 && <button onClick={() => setImages([])} className="text-[9px] font-black uppercase text-primary">Clear</button>}
            </div>
            <input 
              type="file" 
              multiple 
              accept="image/*" 
              onChange={handleImageChange} 
              className="block w-full text-xs font-bold file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-[10px] file:font-black file:uppercase file:bg-muted file:text-secondary hover:file:bg-gray-200 cursor-pointer" 
            />
            <div className="grid grid-cols-4 gap-2 mt-4">
              {images.map((img, i) => (
                <div key={i} className="relative aspect-square border-2 border-[#E5E5E1] rounded-xl overflow-hidden shadow-sm">
                  <img src={img} className="w-full h-full object-cover" alt="Review" />
                </div>
              ))}
            </div>
          </div>

          <button
            onClick={handleSubmit}
            disabled={isSubmitting || rating === 0 || !text.trim()}
            className="w-full h-16 bg-black text-white hover:bg-primary transition-all flex items-center justify-center disabled:opacity-20 font-black uppercase tracking-widest text-xs rounded-xl shadow-xl"
          >
            {isSubmitting ? <Loader2 className="animate-spin" /> : "Submit Review"}
          </button>
        </div>
      </div>
    </div>
  );
}
