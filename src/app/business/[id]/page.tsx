"use client";

import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';

import {
  Star, MapPin, Phone, Loader2, Building2, Clock,
  ChevronRight, MessageCircle, ChevronDown, ChevronUp,
  ExternalLink, Send, Mail, Share2,
  Camera, Globe, CheckCircle2,
  ChevronLeft, X, Shield
} from 'lucide-react';

import { Navbar } from '@/components/layout/Navbar';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';

import { useFirestore, useUser, useMemoFirebase, useCollection, useDoc } from '@/firebase';
import { doc, collection, query, where } from 'firebase/firestore';
import { Enterprise, Review } from '@/app/lib/types';
import { WriteReviewModal } from '@/components/modals/WriteReviewModal';
import { ShareModal } from '@/components/modals/ShareModal';
import { cn } from '@/lib/utils';

// ─── Star Rating ─────────────────────────────────────────────────────────────

function StarRating({ rating, size = 'md' }: { rating: number; size?: 'sm' | 'md' | 'lg' }) {
  const sizes = { sm: 'w-3 h-3', md: 'w-4 h-4', lg: 'w-5 h-5' };
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map(i => (
        <Star
          key={i}
          className={cn(sizes[size], i <= rating ? 'fill-[#FF1A1A] text-[#FF1A1A]' : 'fill-gray-200 text-gray-200')}
        />
      ))}
    </div>
  );
}

// ─── Rating Bar ──────────────────────────────────────────────────────────────

function RatingBar({ label, value }: { label: string; value: number }) {
  return (
    <div className="flex items-center gap-3 text-sm">
      <span className="w-28 text-[#0066CC] font-medium shrink-0">{label}</span>
      <div className="flex-1 bg-gray-200 rounded-full h-2">
        <div className="bg-[#FF1A1A] h-2 rounded-full" style={{ width: `${(value / 5) * 100}%` }} />
      </div>
      <span className="text-sm font-semibold text-gray-700 w-6 shrink-0">{value}</span>
    </div>
  );
}

// ─── Map (OpenStreetMap — free, no API key needed) ────────────────────────────

function DetailMap({ lat, lng, businessName }: { lat: number; lng: number; businessName: string }) {
  return (
    <div className="w-full overflow-hidden rounded-lg border border-gray-200">
      <iframe
        src={`https://www.openstreetmap.org/export/embed.html?bbox=${lng - 0.005}%2C${lat - 0.005}%2C${lng + 0.005}%2C${lat + 0.005}&layer=mapnik&marker=${lat}%2C${lng}`}
        className="w-full h-[220px] border-0"
        loading="lazy"
        title={businessName}
      />
    </div>
  );
}

// ─── Photo Gallery (top hero) ─────────────────────────────────────────────────

function PhotoGallery({ photos, name }: { photos?: string[]; name: string }) {
  const [activeIdx, setActiveIdx] = useState(0);
  const [lightbox, setLightbox] = useState(false);

  const imgs = photos?.length ? photos : [];
  if (!imgs.length) return null;

  return (
    <>
      <div className="relative w-full h-[420px] bg-black overflow-hidden border-b border-gray-200">
        <img
          src={imgs[activeIdx]}
          alt={name}
          className="w-full h-full object-cover cursor-zoom-in opacity-90"
          onClick={() => setLightbox(true)}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent pointer-events-none" />

        {imgs.length > 1 && (
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
            {imgs.slice(0, 6).map((src, i) => (
              <button
                key={i}
                onClick={() => setActiveIdx(i)}
                className={cn(
                  "w-14 h-10 rounded overflow-hidden border-2 transition-all",
                  i === activeIdx ? "border-white scale-110" : "border-transparent opacity-60 hover:opacity-100"
                )}
              >
                <img src={src} alt="" className="w-full h-full object-cover" />
              </button>
            ))}
            {imgs.length > 6 && (
              <button className="w-14 h-10 rounded bg-black/60 border-2 border-transparent text-white text-xs font-bold flex items-center justify-center">
                +{imgs.length - 6}
              </button>
            )}
          </div>
        )}

        {imgs.length > 1 && (
          <>
            <button
              onClick={() => setActiveIdx(p => (p - 1 + imgs.length) % imgs.length)}
              className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 bg-black/50 rounded-full flex items-center justify-center hover:bg-black/70 transition-colors"
            >
              <ChevronLeft className="w-5 h-5 text-white" />
            </button>
            <button
              onClick={() => setActiveIdx(p => (p + 1) % imgs.length)}
              className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 bg-black/50 rounded-full flex items-center justify-center hover:bg-black/70 transition-colors"
            >
              <ChevronRight className="w-5 h-5 text-white" />
            </button>
          </>
        )}

        <span className="absolute top-4 right-4 bg-black/50 text-white text-xs font-semibold px-3 py-1 rounded-full">
          {activeIdx + 1} / {imgs.length}
        </span>
      </div>

      {/* Lightbox */}
      {lightbox && (
        <div className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center" onClick={() => setLightbox(false)}>
          {imgs.length > 1 && (
            <button
              className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/20 hover:bg-white/40 rounded-full flex items-center justify-center transition-colors z-10"
              onClick={e => { e.stopPropagation(); setActiveIdx(p => (p - 1 + imgs.length) % imgs.length); }}
            >
              <ChevronLeft className="w-6 h-6 text-white" />
            </button>
          )}
          <img
            src={imgs[activeIdx]}
            alt={name}
            className="max-w-[90vw] max-h-[90vh] object-contain rounded-lg shadow-2xl"
            onClick={e => e.stopPropagation()}
          />
          {imgs.length > 1 && (
            <button
              className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/20 hover:bg-white/40 rounded-full flex items-center justify-center transition-colors z-10"
              onClick={e => { e.stopPropagation(); setActiveIdx(p => (p + 1) % imgs.length); }}
            >
              <ChevronRight className="w-6 h-6 text-white" />
            </button>
          )}
          <button
            className="absolute top-4 right-4 w-10 h-10 bg-white/20 hover:bg-white/40 rounded-full flex items-center justify-center transition-colors"
            onClick={() => setLightbox(false)}
          >
            <X className="w-5 h-5 text-white" />
          </button>
          <span className="absolute bottom-4 left-1/2 -translate-x-1/2 text-white/70 text-sm font-medium">
            {activeIdx + 1} / {imgs.length}
          </span>
        </div>
      )}
    </>
  );
}

// ─── Photo Grid (Photos tab) with lightbox ────────────────────────────────────

function PhotoGrid({ photos, name }: { photos: string[]; name: string }) {
  const [lightboxIdx, setLightboxIdx] = useState<number | null>(null);

  return (
    <>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {photos.map((src, i) => (
          <div
            key={i}
            className="aspect-square rounded-lg overflow-hidden bg-gray-100 cursor-zoom-in"
            onClick={() => setLightboxIdx(i)}
          >
            <img src={src} alt="" className="w-full h-full object-cover hover:scale-105 transition-transform duration-300" />
          </div>
        ))}
      </div>

      {lightboxIdx !== null && (
        <div className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center" onClick={() => setLightboxIdx(null)}>
          <button
            className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/20 hover:bg-white/40 rounded-full flex items-center justify-center z-10"
            onClick={e => { e.stopPropagation(); setLightboxIdx(p => p !== null ? (p - 1 + photos.length) % photos.length : 0); }}
          >
            <ChevronLeft className="w-6 h-6 text-white" />
          </button>
          <img
            src={photos[lightboxIdx]}
            alt={name}
            className="max-w-[90vw] max-h-[90vh] object-contain rounded-lg shadow-2xl"
            onClick={e => e.stopPropagation()}
          />
          <button
            className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/20 hover:bg-white/40 rounded-full flex items-center justify-center z-10"
            onClick={e => { e.stopPropagation(); setLightboxIdx(p => p !== null ? (p + 1) % photos.length : 0); }}
          >
            <ChevronRight className="w-6 h-6 text-white" />
          </button>
          <button
            className="absolute top-4 right-4 w-10 h-10 bg-white/20 hover:bg-white/40 rounded-full flex items-center justify-center"
            onClick={() => setLightboxIdx(null)}
          >
            <X className="w-5 h-5 text-white" />
          </button>
          <span className="absolute bottom-4 left-1/2 -translate-x-1/2 text-white/70 text-sm font-medium">
            {lightboxIdx + 1} / {photos.length}
          </span>
        </div>
      )}
    </>
  );
}

// ─── Review Card ─────────────────────────────────────────────────────────────

function YelpReviewCard({ review }: { review: Review }) {
  const [expanded, setExpanded] = useState(false);
  const isLong = (review.comment || '').length > 280;

  return (
    <div className="py-6 border-b border-gray-100 last:border-0">
      <div className="flex gap-4">
        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-red-400 to-orange-400 flex items-center justify-center text-white font-bold text-sm shrink-0">
          {(review.userName || 'U')[0].toUpperCase()}
        </div>

        <div className="flex-1 space-y-2">
          <div className="flex items-start justify-between gap-2">
            <div>
              <p className="font-bold text-sm text-gray-900">{review.userName || 'Anonymous'}</p>
              <p className="text-xs text-gray-400">
                {review.createdAt
                  ? new Date(review.createdAt.seconds * 1000).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
                  : 'Recently'}
              </p>
            </div>
            <StarRating rating={Math.round(review.rating || 0)} size="sm" />
          </div>

          <p className="text-sm text-gray-700 leading-relaxed">
            {isLong && !expanded ? review.comment?.slice(0, 280) + '…' : review.comment}
          </p>

          {isLong && (
            <button
              onClick={() => setExpanded(p => !p)}
              className="text-[#0066CC] text-xs font-semibold hover:underline"
            >
              {expanded ? 'Show less' : 'Read more'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Main Page ───────────────────────────────────────────────────────────────

function BusinessDetailContent() {
  const { id } = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const db = useFirestore();

  const [showReviewModal, setShowReviewModal] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [showFullHours, setShowFullHours] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(searchParams.get('new') === 'true');
  const [enquiry, setEnquiry] = useState({ name: '', email: '', message: '' });
  const [isSendingEnquiry, setIsSendingEnquiry] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'reviews' | 'photos'>('overview');

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
      alert("Message sent successfully!");
    }, 1000);
  };

  if (isBusinessLoading && !business) return (
    <div className="h-screen flex items-center justify-center">
      <Loader2 className="animate-spin text-[#FF1A1A] w-10 h-10" />
    </div>
  );
  if (!business) return (
    <div className="py-32 text-center">
      <p className="text-gray-500 text-sm font-semibold">Business not found</p>
      <Link href="/" className="text-[#0066CC] text-sm hover:underline mt-2 inline-block">← Back to home</Link>
    </div>
  );

  const avgRating = business.averageRating || 0;
  const totalReviews = business.totalReviews || 0;

  const ratingDist = [
    { label: 'Atmosphere', value: Math.min(5, Math.round(avgRating * 0.95)) },
    { label: 'Service',    value: Math.min(5, Math.round(avgRating * 1.0))  },
    { label: 'Value',      value: Math.min(5, Math.round(avgRating * 0.9))  },
  ];

  const TABS = [
    { key: 'overview', label: 'Overview' },
    { key: 'reviews',  label: `Reviews (${totalReviews})` },
    { key: 'photos',   label: 'Photos' },
  ] as const;

  return (
    <div className="min-h-screen bg-[#F5F5F5] font-sans text-gray-900">
      <Navbar />

      {/* Photo Gallery — renders only if photos exist */}
      <PhotoGallery photos={business.photos} name={business.businessName || business.name} />

      <div className="max-w-[1080px] mx-auto px-4 sm:px-6">

        {/* Breadcrumb */}
        <nav className="flex items-center gap-1.5 text-xs text-gray-400 py-3 border-b border-gray-200">
          <Link href="/" className="hover:text-[#0066CC] transition-colors">Home</Link>
          <ChevronRight className="w-3 h-3" />
          <Link href={`/search?category=${business.category}`} className="hover:text-[#0066CC] transition-colors">{business.category}</Link>
          <ChevronRight className="w-3 h-3" />
          <Link href={`/search?city=${business.city}`} className="hover:text-[#0066CC] transition-colors">{business.city}</Link>
          <ChevronRight className="w-3 h-3" />
          <span className="text-gray-600 font-medium truncate max-w-[180px]">{business.businessName || business.name}</span>
        </nav>

        {/* ── Hero — no background card ── */}
        <div className="mt-5 mb-2">
          <div className="flex flex-col sm:flex-row gap-5">

            {/* Logo */}
            <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-xl border-2 border-gray-200 bg-white overflow-hidden flex items-center justify-center shrink-0 shadow-sm">
              {business.logo
                ? <img src={business.logo} alt="Logo" className="w-full h-full object-contain p-2" />
                : <Building2 className="w-10 h-10 text-gray-300" />
              }
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-2xl sm:text-3xl font-black text-gray-900 tracking-tight leading-tight">
                  {business.businessName || business.name}
                </h1>
                {business.isVerified && (
                  <div className="flex items-center gap-1 bg-green-50 text-green-700 text-[10px] font-bold uppercase px-2 py-0.5 rounded-full border border-green-200">
                    <Shield className="w-3 h-3" />
                    Verified
                  </div>
                )}
              </div>

              {/* Rating */}
              <div className="flex items-center gap-2 mt-2 flex-wrap">
                <span className="text-[#FF1A1A] font-black text-lg leading-none">{avgRating.toFixed(1)}</span>
                <StarRating rating={Math.round(avgRating)} size="md" />
                <span className="text-gray-500 text-sm">
                  ({totalReviews} {totalReviews === 1 ? 'review' : 'reviews'})
                </span>
                <span className="text-gray-300">·</span>
                <span className="text-gray-600 text-sm font-medium">{business.category}</span>
                <span className="text-gray-300">·</span>
                <span className="text-gray-600 text-sm">{business.city}</span>
              </div>

              {/* Address */}
              <p className="text-sm text-gray-500 mt-1.5 flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                {business.address}, {business.city}
              </p>

              {/* CTAs */}
              <div className="flex flex-wrap gap-3 mt-4">
                <button
                  onClick={() => window.open(`tel:${business.phoneNumber}`)}
                  className="flex items-center gap-2 bg-[#FF1A1A] hover:bg-[#e00] text-white font-bold text-sm px-5 py-2.5 rounded-lg transition-colors shadow-sm"
                >
                  <Phone className="w-4 h-4" />
                  Call
                </button>

                <button
                  onClick={() => window.open(`https://wa.me/${(business.whatsapp || business.phoneNumber || '').replace(/\s+/g, '')}`)}
                  className="flex items-center gap-2 bg-[#25D366] hover:bg-[#1fba58] text-white font-bold text-sm px-5 py-2.5 rounded-lg transition-colors shadow-sm"
                >
                  <MessageCircle className="w-4 h-4" />
                  WhatsApp
                </button>

                <button
                  onClick={() => setShowReviewModal(true)}
                  className="flex items-center gap-2 bg-white hover:bg-gray-50 text-gray-700 font-bold text-sm px-5 py-2.5 rounded-lg border border-gray-300 transition-colors"
                >
                  <Star className="w-4 h-4 text-[#FF1A1A]" />
                  Write a Review
                </button>

                <button
                  onClick={() => setShowShareModal(true)}
                  className="flex items-center gap-2 bg-white hover:bg-gray-50 text-gray-700 font-bold text-sm px-5 py-2.5 rounded-lg border border-gray-300 transition-colors"
                >
                  <Share2 className="w-4 h-4" />
                  Share
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex items-center mt-6 border-b border-gray-200 bg-white rounded-t-lg">
          {TABS.map(tab => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={cn(
                "px-5 py-3.5 text-sm font-bold transition-colors border-b-2 -mb-px",
                activeTab === tab.key
                  ? "text-[#FF1A1A] border-[#FF1A1A]"
                  : "text-gray-500 border-transparent hover:text-gray-900"
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Content Grid */}
        <div className="flex flex-col lg:flex-row gap-6 py-6 pb-20">

          {/* Left */}
          <div className="flex-1 min-w-0 space-y-6">

            {activeTab === 'overview' && (
              <>
                {/* About */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                  <h2 className="text-lg font-black mb-4">About the Business</h2>
                  <p className="text-[15px] text-gray-700 leading-relaxed">
                    {business.description || 'No description provided yet.'}
                  </p>

                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mt-6 pt-5 border-t border-gray-100">
                    <div>
                      <p className="text-xs text-gray-400 uppercase tracking-wider font-semibold mb-1">Category</p>
                      <p className="text-sm font-bold text-gray-800">{business.category}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-400 uppercase tracking-wider font-semibold mb-1">Founded</p>
                      <p className="text-sm font-bold text-gray-800">{business.yearFounded || '—'}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-400 uppercase tracking-wider font-semibold mb-1">Employees</p>
                      <p className="text-sm font-bold text-gray-800">{business.employeeCount || '1–10'}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-400 uppercase tracking-wider font-semibold mb-1">Manager</p>
                      <p className="text-sm font-bold text-gray-800">{business.ceoName || 'Private'}</p>
                    </div>
                    {business.website && (
                      <div>
                        <p className="text-xs text-gray-400 uppercase tracking-wider font-semibold mb-1">Website</p>
                        <a href={business.website} target="_blank" rel="noreferrer" className="text-sm font-bold text-[#0066CC] hover:underline flex items-center gap-1">
                          <Globe className="w-3.5 h-3.5" />
                          Visit site
                        </a>
                      </div>
                    )}
                  </div>
                </div>

                {/* Reviews preview */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                  <div className="flex items-center justify-between mb-5">
                    <h2 className="text-lg font-black">Reviews</h2>
                    <button onClick={() => setActiveTab('reviews')} className="text-[#0066CC] text-sm font-semibold hover:underline">
                      See all reviews
                    </button>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-6 pb-6 border-b border-gray-100">
                    <div className="text-center">
                      <div className="text-5xl font-black text-gray-900">{avgRating.toFixed(1)}</div>
                      <StarRating rating={Math.round(avgRating)} size="md" />
                      <p className="text-xs text-gray-400 mt-1">{totalReviews} reviews</p>
                    </div>
                    <div className="flex-1 space-y-2.5">
                      {ratingDist.map(r => <RatingBar key={r.label} label={r.label} value={r.value} />)}
                    </div>
                  </div>

                  <div>
                    {reviews && reviews.length > 0
                      ? reviews.slice(0, 2).map(r => <YelpReviewCard key={r.id} review={r} />)
                      : <p className="py-12 text-center text-sm text-gray-400">No reviews yet — be the first!</p>
                    }
                  </div>

                  <button
                    onClick={() => setShowReviewModal(true)}
                    className="mt-4 w-full border-2 border-[#FF1A1A] text-[#FF1A1A] font-bold text-sm py-2.5 rounded-lg hover:bg-red-50 transition-colors"
                  >
                    Write a Review
                  </button>
                </div>
              </>
            )}

            {activeTab === 'reviews' && (
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-lg font-black">{totalReviews} Reviews</h2>
                  <button
                    onClick={() => setShowReviewModal(true)}
                    className="flex items-center gap-2 bg-[#FF1A1A] hover:bg-[#e00] text-white font-bold text-sm px-4 py-2 rounded-lg transition-colors"
                  >
                    <Star className="w-4 h-4" />
                    Write a Review
                  </button>
                </div>

                <div className="flex flex-col sm:flex-row gap-6 p-5 bg-gray-50 rounded-xl mb-6">
                  <div className="text-center">
                    <div className="text-5xl font-black">{avgRating.toFixed(1)}</div>
                    <StarRating rating={Math.round(avgRating)} size="lg" />
                    <p className="text-xs text-gray-400 mt-1">{totalReviews} reviews</p>
                  </div>
                  <div className="flex-1 space-y-2.5">
                    {ratingDist.map(r => <RatingBar key={r.label} label={r.label} value={r.value} />)}
                  </div>
                </div>

                <div>
                  {reviews && reviews.length > 0
                    ? reviews.map(r => <YelpReviewCard key={r.id} review={r} />)
                    : <p className="py-16 text-center text-sm text-gray-400">No reviews yet — be the first!</p>
                  }
                </div>
              </div>
            )}

            {activeTab === 'photos' && (
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h2 className="text-lg font-black mb-5">Photos</h2>
                {business.photos?.length ? (
                  <PhotoGrid photos={business.photos} name={business.businessName || business.name} />
                ) : (
                  <div className="py-20 text-center">
                    <Camera className="w-10 h-10 text-gray-300 mx-auto mb-3" />
                    <p className="text-gray-400 text-sm">No photos available</p>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Right Sidebar */}
          <div className="w-full lg:w-[300px] xl:w-[320px] shrink-0 space-y-5">

            {/* Location & Contact */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5 space-y-4">
              <h3 className="font-black text-base">Location & Contact</h3>

              <div className="space-y-3 text-sm">
                <div className="flex items-start gap-3">
                  <MapPin className="w-4 h-4 text-[#FF1A1A] mt-0.5 shrink-0" />
                  <address className="not-italic text-gray-700 leading-relaxed">
                    {business.address}<br />{business.city}, Cameroon
                  </address>
                </div>

                {business.phoneNumber && (
                  <a href={`tel:${business.phoneNumber}`} className="flex items-center gap-3 text-[#0066CC] hover:underline">
                    <Phone className="w-4 h-4 shrink-0" />
                    {business.phoneNumber}
                  </a>
                )}

                {business.email && (
                  <a href={`mailto:${business.email}`} className="flex items-center gap-3 text-[#0066CC] hover:underline truncate">
                    <Mail className="w-4 h-4 shrink-0" />
                    {business.email}
                  </a>
                )}

                {business.website && (
                  <a href={business.website} target="_blank" rel="noreferrer" className="flex items-center gap-3 text-[#0066CC] hover:underline truncate">
                    <Globe className="w-4 h-4 shrink-0" />
                    {business.website.replace(/^https?:\/\//, '')}
                  </a>
                )}
              </div>

              {business.latitude && business.longitude && (
                <>
                  <DetailMap lat={business.latitude} lng={business.longitude} businessName={business.businessName || business.name} />
                  <button
                    onClick={() => window.open(`https://www.openstreetmap.org/directions?from=&to=${business.latitude}%2C${business.longitude}`, '_blank')}
                    className="w-full flex items-center justify-center gap-2 border border-gray-300 text-gray-700 font-bold text-sm py-2.5 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <ExternalLink className="w-4 h-4" />
                    Get Directions
                  </button>
                </>
              )}
            </div>

            {/* Hours */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5 space-y-3">
              <h3 className="font-black text-base flex items-center gap-2">
                <Clock className="w-4 h-4" />
                Hours
              </h3>

              <div className={cn(
                "text-sm text-gray-600 leading-relaxed whitespace-pre-line overflow-hidden transition-all",
                !showFullHours && "max-h-[3.5rem]"
              )}>
                {business.hours || 'Hours not specified'}
              </div>

              <button
                onClick={() => setShowFullHours(p => !p)}
                className="flex items-center gap-1 text-[#0066CC] text-xs font-semibold hover:underline"
              >
                {showFullHours
                  ? <><ChevronUp className="w-3 h-3" />Show less</>
                  : <><ChevronDown className="w-3 h-3" />Show full hours</>
                }
              </button>
            </div>

            {/* Ask a Question */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5 space-y-4">
              <h3 className="font-black text-base">Ask a Question</h3>

              <form onSubmit={handleEnquiry} className="space-y-3">
                <Input
                  required
                  placeholder="Your name"
                  value={enquiry.name}
                  onChange={e => setEnquiry({ ...enquiry, name: e.target.value })}
                  className="h-9 text-sm border-gray-200 rounded-lg"
                />
                <Input
                  required
                  type="email"
                  placeholder="Your email"
                  value={enquiry.email}
                  onChange={e => setEnquiry({ ...enquiry, email: e.target.value })}
                  className="h-9 text-sm border-gray-200 rounded-lg"
                />
                <Textarea
                  required
                  placeholder="Your message…"
                  rows={4}
                  value={enquiry.message}
                  onChange={e => setEnquiry({ ...enquiry, message: e.target.value })}
                  className="text-sm border-gray-200 rounded-lg resize-none"
                />
                <button
                  type="submit"
                  disabled={isSendingEnquiry}
                  className="w-full flex items-center justify-center gap-2 bg-[#FF1A1A] hover:bg-[#e00] disabled:opacity-60 text-white font-bold text-sm py-2.5 rounded-lg transition-colors"
                >
                  {isSendingEnquiry
                    ? <Loader2 className="animate-spin w-4 h-4" />
                    : <><Send className="w-4 h-4" />Send Message</>
                  }
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>

      {/* Modals */}
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
        <DialogContent className="sm:max-w-[380px] rounded-2xl">
          <DialogHeader>
            <DialogTitle className="text-xl font-black">🎉 Business Created!</DialogTitle>
            <DialogDescription className="text-sm text-gray-500">
              Your business is now live on Cameroon Zoom. Add more details to attract customers.
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col gap-3 pt-2">
            <button
              onClick={() => router.push(`/manage-business/${id}`)}
              className="w-full bg-[#FF1A1A] hover:bg-[#e00] text-white font-bold py-2.5 rounded-lg text-sm transition-colors"
            >
              Complete My Profile
            </button>
            <button
              onClick={() => setShowOnboarding(false)}
              className="w-full border border-gray-200 text-gray-600 font-semibold py-2.5 rounded-lg text-sm hover:bg-gray-50 transition-colors"
            >
              I'll do it later
            </button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default function BusinessDetailPage() {
  return (
    <Suspense fallback={
      <div className="h-screen flex items-center justify-center">
        <Loader2 className="animate-spin text-[#FF1A1A] w-10 h-10" />
      </div>
    }>
      <BusinessDetailContent />
    </Suspense>
  );
}