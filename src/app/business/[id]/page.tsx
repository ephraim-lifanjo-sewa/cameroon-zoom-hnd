
"use client";

import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { useState, useEffect, Suspense } from 'react';
import { 
  Star, 
  MapPin, 
  Phone, 
  Loader2, 
  Building2, 
  Clock, 
  ChevronRight,
  MessageCircle,
  ChevronDown,
  ChevronUp,
  ExternalLink,
  Send,
  ArrowLeft,
  Mail,
  Users,
  Share2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Navbar } from '@/components/layout/Navbar';
import { useFirestore, useUser, useMemoFirebase, useCollection, useDoc } from '@/firebase';
import { doc, collection, query, where } from 'firebase/firestore';
import { Enterprise, Review } from '@/app/lib/types';
import { WriteReviewModal } from '@/components/modals/WriteReviewModal';
import { ReviewCard } from '@/components/business/ReviewCard';
import { ShareModal } from '@/components/modals/ShareModal';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import { cn } from '@/lib/utils';

const DetailMap = dynamic(() => import('@/components/business/DetailMap'), { 
  ssr: false,
  loading: () => <div className="w-full h-[200px] bg-muted animate-pulse rounded-none border border-[#E5E5E1]" />
});

function BusinessDetailContent() {
  const { id } = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user } = useUser();
  const db = useFirestore();
  
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [showFullHours, setShowFullHours] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(searchParams.get('new') === 'true');
  const [enquiry, setEnquiry] = useState({ name: '', email: '', message: '' });
  const [isSendingEnquiry, setIsSendingEnquiry] = useState(false);

  const businessRef = useMemoFirebase(() => id ? doc(db, 'businesses', id as string) : null, [db, id]);
  const { data: business, isLoading: isBusinessLoading } = useDoc<Enterprise>(businessRef);

  useEffect(() => {
    if (business) {
      document.title = `${business.businessName || business.name} | Cameroon Zoom`;
    }
  }, [business]);

  const reviewsQuery = useMemoFirebase(() => {
    if (!db || !id) return null;
    return query(collection(db, 'reviews'), where('businessId', '==', id as string));
  }, [db, id]);
  const { data: reviews } = useCollection<Review>(reviewsQuery);

  const handleEnquiry = (e: React.FormEvent) => {
    e.preventDefault();
    if (!enquiry.name || !enquiry.email || !enquiry.message) return;
    setIsSendingEnquiry(true);
    setTimeout(() => {
      setIsSendingEnquiry(false);
      setEnquiry({ name: '', email: '', message: '' });
      alert("Message Sent to Boss");
    }, 1000);
  };

  if (isBusinessLoading && !business) return <div className="h-screen flex items-center justify-center"><Loader2 className="animate-spin text-secondary w-10 h-10" /></div>;
  if (!business) return <div className="py-32 text-center font-black uppercase text-xs">Not Found</div>;

  return (
    <div className="min-h-screen bg-white font-body text-secondary pb-24">
      <Navbar />
      
      <div className="container mx-auto px-4 pt-6 max-w-7xl">
        <nav className="mb-8 flex items-center gap-4 text-[10px] font-bold text-muted-foreground uppercase tracking-widest border-b border-[#E5E5E1] pb-4">
          <button onClick={() => router.back()} className="flex items-center gap-1 hover:text-primary transition-colors">
            <ArrowLeft className="w-3 h-3" /> Back
          </button>
          <div className="h-3 w-[1px] bg-muted-foreground/30" />
          <Link href="/" className="hover:text-primary transition-colors">Home</Link>
          <ChevronRight className="w-3 h-3" />
          <span className="text-secondary truncate">{business.businessName || business.name}</span>
        </nav>

        <div className="py-10 mb-10">
          <div className="flex flex-col lg:flex-row gap-10">
            <div className="w-32 h-32 sm:w-48 sm:h-48 rounded-none bg-muted shrink-0 overflow-hidden flex items-center justify-center border border-[#E5E5E1]">
              {business.logo ? (
                <img src={business.logo} alt="Logo" className="w-full h-full object-contain p-4" />
              ) : (
                <Building2 className="w-12 h-12 opacity-10" />
              )}
            </div>
            
            <div className="flex-grow space-y-6">
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <h1 className="text-3xl sm:text-4xl font-black uppercase tracking-tight leading-none text-secondary">{business.businessName || business.name}</h1>
                  {business.isVerified && (
                    <div className="bg-primary text-white text-[8px] font-black uppercase px-2 py-1 rounded-none shadow-sm">Verified</div>
                  )}
                </div>
                <div className="flex items-center gap-3">
                  <Badge variant="outline" className="text-primary border-[#E5E5E1] font-bold text-[9px] uppercase h-7 px-4 rounded-none">{business.category}</Badge>
                  <div className="flex items-center gap-1.5 bg-muted/50 px-3 py-1 rounded-none">
                    <MapPin className="w-3 h-3 text-primary" />
                    <span className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground">{business.city}</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-6">
                <div className="flex items-center gap-2">
                  <div className="bg-primary text-white px-2.5 py-1 rounded-none text-sm font-bold flex items-center gap-1.5">
                    {(business.averageRating || 0).toFixed(1)} <Star className="w-3.5 h-3.5 fill-current" />
                  </div>
                  <span className="text-muted-foreground text-[11px] font-bold uppercase">({business.totalReviews || 0} Reviews)</span>
                  <div className="mx-1 h-3 w-[1px] bg-muted-foreground/30" />
                  <span className="text-[10px] font-bold text-primary uppercase cursor-pointer hover:underline" onClick={() => setShowReviewModal(true)}>Add Review</span>
                </div>
              </div>

              <div className="flex flex-wrap gap-3 pt-2">
                <Button onClick={() => window.open(`tel:${business.phoneNumber}`)} className="h-12 bg-secondary text-white px-8 font-bold uppercase text-[10px] tracking-widest rounded-none hover:bg-black transition-all">
                  <Phone className="w-4 h-4 mr-2" /> Call Now
                </Button>
                <Button onClick={() => window.open(`https://wa.me/${(business.whatsapp || business.phoneNumber).replace(/\s+/g, '')}`)} variant="outline" className="h-12 border border-[#25D366] text-[#25D366] px-8 font-bold uppercase text-[10px] tracking-widest rounded-none hover:bg-[#25D366] hover:text-white transition-all">
                  <MessageCircle className="w-4 h-4 mr-2" /> WhatsApp
                </Button>
                
                <Button onClick={() => setShowShareModal(true)} variant="outline" className="h-12 border border-[#E5E5E1] text-secondary px-8 font-bold uppercase text-[10px] tracking-widest rounded-none hover:bg-muted transition-all">
                  <Share2 className="w-4 h-4 mr-2" /> Share
                </Button>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          <div className="lg:col-span-4 relative">
            <section className="bg-white border border-[#E5E5E1] rounded-none p-8 space-y-8 shadow-sm lg:sticky lg:top-6">
              <div className="space-y-6">
                <h3 className="text-lg font-black uppercase tracking-tight border-b border-[#E5E5E1] pb-4">Find Us</h3>
                <div className="space-y-6">
                  <div className="flex items-start gap-3">
                    <MapPin className="w-4 h-4 text-primary shrink-0 mt-1" />
                    <address className="text-[13px] font-bold text-secondary not-italic flex flex-col gap-1 uppercase">
                      <span>{business.address}</span>
                      <span>{business.city}</span>
                    </address>
                  </div>
                  
                  {business.latitude && business.longitude && (
                    <div className="h-[200px] w-full rounded-none border border-[#E5E5E1] overflow-hidden relative shadow-sm">
                      <DetailMap lat={business.latitude} lng={business.longitude} businessName={business.businessName || business.name} />
                    </div>
                  )}

                  <div className="grid gap-3">
                    <Button onClick={() => window.open(`https://www.google.com/maps/dir/?api=1&destination=${business.latitude},${business.longitude}`, '_blank')} className="w-full h-12 bg-secondary text-white font-bold uppercase text-[10px] tracking-widest rounded-none hover:bg-black transition-all">
                      <ExternalLink className="w-4 h-4 mr-2" /> Directions
                    </Button>
                    
                    <div className="space-y-4 pt-6 border-t border-[#E5E5E1]">
                      <h4 className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground">Direct Contact</h4>
                      <div className="space-y-3">
                        <div className="flex items-center gap-3 group cursor-pointer" onClick={() => window.open(`tel:${business.phoneNumber}`)}>
                          <div className="w-9 h-9 rounded-none bg-muted/50 border border-[#E5E5E1] flex items-center justify-center group-hover:border-primary transition-all shadow-sm">
                            <Phone className="w-4 h-4 text-primary" />
                          </div>
                          <span className="text-[13px] font-bold truncate uppercase">{business.phoneNumber}</span>
                        </div>
                        {business.email && (
                          <div className="flex items-center gap-3 group cursor-pointer" onClick={() => window.open(`mailto:${business.email}`)}>
                            <div className="w-9 h-9 rounded-none bg-muted/50 border border-[#E5E5E1] flex items-center justify-center group-hover:border-primary transition-all shadow-sm">
                              <Mail className="w-4 h-4 text-primary" />
                            </div>
                            <span className="text-[13px] font-bold truncate lowercase">{business.email}</span>
                          </div>
                        )}
                        {business.website && (
                          <div className="flex items-center gap-3 group cursor-pointer" onClick={() => window.open(business.website?.startsWith('http') ? business.website : `https://${business.website}`, '_blank')}>
                            <div className="w-9 h-9 rounded-none bg-muted/50 border border-[#E5E5E1] flex items-center justify-center group-hover:border-primary transition-all shadow-sm">
                              <ExternalLink className="w-4 h-4 text-primary" />
                            </div>
                            <span className="text-[13px] font-bold truncate lowercase">{business.website?.replace(/^https?:\/\//, '')}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-6 pt-2 border-t border-[#E5E5E1]">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Clock className="w-4 h-4 text-primary" />
                    <span className="text-[12px] font-black uppercase tracking-widest">Work Times</span>
                  </div>
                  <button onClick={() => setShowFullHours(!showFullHours)} className="text-[9px] font-bold text-primary uppercase tracking-widest hover:underline flex items-center gap-1">
                    {showFullHours ? "Less" : "More"}
                    {showFullHours ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                  </button>
                </div>
                <div className={cn("p-4 bg-muted/30 border border-[#E5E5E1] rounded-none overflow-hidden transition-all duration-300", !showFullHours && "max-h-[60px]")}>
                  <p className="text-[12px] font-bold uppercase whitespace-pre-line leading-relaxed text-secondary/70">{business.hours || "Hours not specified"}</p>
                </div>
              </div>

              <div className="space-y-6 pt-8 border-t border-[#E5E5E1]">
                <div className="space-y-1">
                  <h3 className="text-lg font-black uppercase leading-tight text-secondary">Got a Question?</h3>
                  <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Ask the Boss</p>
                </div>
                <form onSubmit={handleEnquiry} className="space-y-4">
                  <Input required placeholder="My Name" className="border border-[#E5E5E1] h-11 text-xs rounded-none font-bold" value={enquiry.name} onChange={e => setEnquiry({...enquiry, name: e.target.value})} />
                  <Input required type="email" placeholder="My Email" className="border border-[#E5E5E1] h-11 text-xs rounded-none font-bold" value={enquiry.email} onChange={e => setEnquiry({...enquiry, email: e.target.value})} />
                  <Textarea required placeholder="My Message..." className="border border-[#E5E5E1] min-h-[100px] text-xs rounded-none italic font-bold" value={enquiry.message} onChange={e => setEnquiry({...enquiry, message: e.target.value})} />
                  <Button disabled={isSendingEnquiry} type="submit" className="w-full bg-secondary text-white font-bold uppercase text-[10px] h-12 rounded-none shadow-md hover:bg-black transition-all">
                    {isSendingEnquiry ? <Loader2 className="animate-spin w-4 h-4" /> : <><Send className="w-4 h-4 mr-2" /> Send Message</>}
                  </Button>
                </form>
              </div>
            </section>
          </div>

          <div className="lg:col-span-8 space-y-10">
            <section className="bg-white border border-[#E5E5E1] rounded-none p-8 space-y-6 shadow-sm">
              <h2 className="text-lg font-black uppercase tracking-tight border-b border-[#E5E5E1] pb-4">About</h2>
              <div className="text-[15px] leading-relaxed font-medium text-secondary/80 italic">
                {business.description || "No description provided."}
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-6 border-t border-[#E5E5E1]">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-none bg-muted/50 border border-[#E5E5E1] flex items-center justify-center">
                    <Users className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-[9px] font-bold uppercase text-muted-foreground tracking-widest">Founder Name</p>
                    <p className="text-sm font-bold uppercase">{business.ceoName || "Private"}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-none bg-muted/50 border border-[#E5E5E1] flex items-center justify-center">
                    <Building2 className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-[9px] font-bold uppercase text-muted-foreground tracking-widest">Worker Count</p>
                    <p className="text-sm font-bold uppercase">{business.employeeCount || "1-10"} People</p>
                  </div>
                </div>
              </div>
            </section>

            <section className="bg-white border border-[#E5E5E1] rounded-none p-8 space-y-10 shadow-sm">
              <div className="flex items-center justify-between border-b border-[#E5E5E1] pb-6">
                <h2 className="text-lg font-black uppercase tracking-tight">Reviews</h2>
                <Button onClick={() => setShowReviewModal(true)} className="h-9 bg-primary text-white font-bold uppercase text-[9px] tracking-widest rounded-none shadow-sm">Add Review</Button>
              </div>

              <div className="divide-y divide-[#E5E5E1]">
                {reviews && reviews.length > 0 ? reviews.map(rev => (
                  <ReviewCard key={rev.id} review={rev} />
                )) : (
                  <div className="py-24 text-center">
                    <p className="text-[10px] font-bold uppercase text-muted-foreground tracking-widest">No reviews yet.</p>
                  </div>
                )}
              </div>
            </section>
          </div>
        </div>
      </div>

      <WriteReviewModal 
        open={showReviewModal} 
        onOpenChange={setShowReviewModal} 
        businessId={id as string} 
        businessName={business.businessName || business.name} 
        currentAverageRating={business.averageRating || 0} 
        currentTotalReviews={business.totalReviews || 0} 
      />

      <ShareModal
        open={showShareModal}
        onOpenChange={setShowShareModal}
        businessId={id as string}
        businessName={business.businessName || business.name}
      />

      <Dialog open={showOnboarding} onOpenChange={setShowOnboarding}>
        <DialogContent className="sm:max-w-[400px] p-10 rounded-2xl border-none shadow-2xl">
          <DialogHeader>
            <DialogTitle className="text-xl font-black uppercase text-center">Business Created!</DialogTitle>
            <DialogDescription className="text-[10px] font-bold uppercase opacity-40 text-center mt-2">Enterprise registered successfully.</DialogDescription>
          </DialogHeader>
          <div className="py-6 space-y-4">
            <p className="text-center text-sm font-medium italic text-muted-foreground">Your page is now live. Would you like to add more details (Menu, Services, Photos) to your dashboard?</p>
            <div className="grid gap-3 pt-4">
              <Button onClick={() => router.push(`/manage-business/${id}`)} className="h-14 bg-black text-white font-black uppercase text-xs rounded-xl shadow-lg">
                Add More Info
              </Button>
              <Button onClick={() => setShowOnboarding(false)} variant="outline" className="h-14 border-2 font-black uppercase text-xs rounded-xl">
                Stay on Page
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default function BusinessDetailPage() {
  return (
    <Suspense fallback={<div className="h-screen flex items-center justify-center"><Loader2 className="animate-spin text-secondary w-10 h-10" /></div>}>
      <BusinessDetailContent />
    </Suspense>
  );
}
