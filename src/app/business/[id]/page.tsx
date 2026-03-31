"use client";

import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';

import { 
  Star, MapPin, Phone, Loader2, Building2, Clock, 
  ChevronRight, MessageCircle, ChevronDown, ChevronUp,
  ExternalLink, Send, ArrowLeft, Mail, Users, Share2
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Navbar } from '@/components/layout/Navbar';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';

import { useFirestore, useUser, useMemoFirebase, useCollection, useDoc } from '@/firebase';
import { doc, collection, query, where } from 'firebase/firestore';
import { Enterprise, Review } from '@/app/lib/types';
import { WriteReviewModal } from '@/components/modals/WriteReviewModal';
import { ReviewCard } from '@/components/business/ReviewCard';
import { ShareModal } from '@/components/modals/ShareModal';
import { cn } from '@/lib/utils';

function DetailMap({ lat, lng, businessName }: { lat: number; lng: number; businessName: string }) {
  const src = `https://maps.google.com/maps?q=${lat},${lng}&z=15&output=embed`;

  return (
    <div className="w-full overflow-hidden rounded-2xl border border-[#E5E5E1] shadow-sm">
      <iframe
        src={src}
        className="w-full h-[300px] border-0"
        loading="lazy"
        referrerPolicy="no-referrer-when-downgrade"
        title={businessName}
      />
    </div>
  );
}

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
    if (business) document.title = `${business.businessName || business.name} | Cameroon Zoom`;
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
    <div className="min-h-screen bg-[#F7F7F7] font-body text-secondary pb-24">
      <Navbar />

      <div className="container mx-auto px-6 pt-6 max-w-7xl">
        <nav className="mb-8 flex items-center gap-4 text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
          <button onClick={() => router.back()} className="flex items-center gap-1 hover:text-primary transition-colors">
            <ArrowLeft className="w-3 h-3" /> Back
          </button>
          <div className="h-3 w-[1px] bg-muted-foreground/30" />
          <Link href="/" className="hover:text-primary transition-colors">Home</Link>
          <ChevronRight className="w-3 h-3" />
          <span className="text-secondary truncate">{business.businessName || business.name}</span>
        </nav>

        <div className="bg-white rounded-2xl border border-[#E5E5E1] p-8 mb-8 shadow-sm">
          <div className="flex flex-col lg:flex-row gap-8">
            <div className="w-32 h-32 sm:w-44 sm:h-44 rounded-2xl bg-muted shrink-0 overflow-hidden flex items-center justify-center border border-[#E5E5E1]">
              {business.logo ? (
                <img src={business.logo} alt="Logo" className="w-full h-full object-contain p-4" />
              ) : (
                <Building2 className="w-12 h-12 opacity-10" />
              )}
            </div>

            <div className="flex-grow space-y-5">
              <div className="space-y-3">
                <div className="flex items-center gap-3 flex-wrap">
                  <h1 className="text-3xl sm:text-4xl font-black tracking-tight">{business.businessName || business.name}</h1>
                  {business.isVerified && (
                    <div className="bg-primary text-white text-[9px] font-black uppercase px-2 py-1 rounded-md">
                      Verified
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-3 flex-wrap">
                  <Badge variant="outline" className="text-primary border-[#E5E5E1] font-bold text-[10px] uppercase h-7 px-4 rounded-full">
                    {business.category}
                  </Badge>

                  <div className="flex items-center gap-1.5 bg-muted/50 px-3 py-1 rounded-full">
                    <MapPin className="w-3 h-3 text-primary" />
                    <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                      {business.city}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-4 flex-wrap">
                <div className="flex items-center gap-2">
                  <div className="bg-primary text-white px-3 py-1 rounded-lg text-sm font-bold flex items-center gap-1.5">
                    {(business.averageRating || 0).toFixed(1)}
                    <Star className="w-3.5 h-3.5 fill-current" />
                  </div>

                  <span className="text-muted-foreground text-[12px] font-bold">
                    ({business.totalReviews || 0} reviews)
                  </span>

                  <span
                    className="text-[11px] font-bold text-primary cursor-pointer hover:underline"
                    onClick={() => setShowReviewModal(true)}
                  >
                    Add review
                  </span>
                </div>
              </div>

              <div className="flex flex-wrap gap-3 pt-2">
                <Button onClick={() => window.open(`tel:${business.phoneNumber}`)} className="h-11 px-6 rounded-lg font-bold">
                  <Phone className="w-4 h-4 mr-2" />
                  Call
                </Button>

                <Button
                  onClick={() => window.open(`https://wa.me/${(business.whatsapp || business.phoneNumber).replace(/\s+/g, '')}`)}
                  variant="outline"
                  className="h-11 px-6 rounded-lg font-bold"
                >
                  <MessageCircle className="w-4 h-4 mr-2" />
                  WhatsApp
                </Button>

                <Button
                  onClick={() => setShowShareModal(true)}
                  variant="outline"
                  className="h-11 px-6 rounded-lg font-bold"
                >
                  <Share2 className="w-4 h-4 mr-2" />
                  Share
                </Button>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-4 space-y-6">
            <section className="bg-white border border-[#E5E5E1] rounded-2xl p-6 space-y-6 shadow-sm">
              <h3 className="text-lg font-black">Location</h3>

              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <MapPin className="w-4 h-4 text-primary mt-1" />
                  <address className="text-sm font-semibold not-italic">
                    <div>{business.address}</div>
                    <div>{business.city}</div>
                  </address>
                </div>

                {business.latitude && business.longitude && (
                  <DetailMap
                    lat={business.latitude}
                    lng={business.longitude}
                    businessName={business.businessName || business.name}
                  />
                )}

                <Button
                  onClick={() => window.open(`https://www.google.com/maps/dir/?api=1&destination=${business.latitude},${business.longitude}`, '_blank')}
                  className="w-full rounded-lg"
                >
                  <ExternalLink className="w-4 h-4 mr-2" />
                  Directions
                </Button>
              </div>
            </section>

            <section className="bg-white border border-[#E5E5E1] rounded-2xl p-6 space-y-5 shadow-sm">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 font-bold">
                  <Clock className="w-4 h-4" />
                  Work Times
                </div>

                <button
                  onClick={() => setShowFullHours(!showFullHours)}
                  className="text-xs font-bold text-primary flex items-center gap-1"
                >
                  {showFullHours ? "Less" : "More"}
                  {showFullHours ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                </button>
              </div>

              <div className={cn("p-4 bg-muted rounded-xl transition-all", !showFullHours && "max-h-[60px] overflow-hidden")}>
                {business.hours || "Hours not specified"}
              </div>
            </section>

            <section className="bg-white border border-[#E5E5E1] rounded-2xl p-6 space-y-5 shadow-sm">
              <h3 className="font-black text-lg">Ask a Question</h3>

              <form onSubmit={handleEnquiry} className="space-y-3">
                <Input required placeholder="Your name" value={enquiry.name} onChange={e => setEnquiry({...enquiry, name: e.target.value})}/>
                <Input required type="email" placeholder="Your email" value={enquiry.email} onChange={e => setEnquiry({...enquiry, email: e.target.value})}/>
                <Textarea required placeholder="Your message" value={enquiry.message} onChange={e => setEnquiry({...enquiry, message: e.target.value})}/>

                <Button type="submit" disabled={isSendingEnquiry} className="w-full rounded-lg">
                  {isSendingEnquiry ? <Loader2 className="animate-spin w-4 h-4"/> : <>
                    <Send className="w-4 h-4 mr-2"/>
                    Send
                  </>}
                </Button>
              </form>
            </section>
          </div>

          <div className="lg:col-span-8 space-y-8">
            <section className="bg-white border border-[#E5E5E1] rounded-2xl p-8 space-y-5 shadow-sm">
              <h2 className="text-xl font-black">About</h2>

              <p className="text-[15px] leading-relaxed text-secondary/80">
                {business.description || "No description provided."}
              </p>

              <div className="grid grid-cols-2 gap-6 pt-6 border-t">
                <div className="flex gap-3">
                  <Users className="w-5 h-5"/>
                  <div>
                    <div className="text-xs text-muted-foreground">Founder</div>
                    <div className="font-bold">{business.ceoName || "Private"}</div>
                  </div>
                </div>

                <div className="flex gap-3">
                  <Building2 className="w-5 h-5"/>
                  <div>
                    <div className="text-xs text-muted-foreground">Employees</div>
                    <div className="font-bold">{business.employeeCount || "1-10"}</div>
                  </div>
                </div>
              </div>
            </section>

            <section className="bg-white border border-[#E5E5E1] rounded-2xl p-8 space-y-6 shadow-sm">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-black">Reviews</h2>

                <Button onClick={() => setShowReviewModal(true)} className="rounded-lg">
                  Add Review
                </Button>
              </div>

              <div className="divide-y">
                {reviews && reviews.length > 0 ? (
                  reviews.map(rev => <ReviewCard key={rev.id} review={rev} />)
                ) : (
                  <div className="py-20 text-center text-sm text-muted-foreground">
                    No reviews yet
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
        <DialogContent className="sm:max-w-[400px] rounded-2xl">
          <DialogHeader>
            <DialogTitle>Business Created</DialogTitle>
            <DialogDescription>
              Enterprise registered successfully
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3">
            <Button onClick={() => router.push(`/manage-business/${id}`)}>
              Add More Info
            </Button>

            <Button variant="outline" onClick={() => setShowOnboarding(false)}>
              Stay on Page
            </Button>
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