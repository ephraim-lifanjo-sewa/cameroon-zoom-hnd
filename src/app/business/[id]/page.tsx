"use client";

import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { useState, useEffect, Suspense, useMemo } from 'react';
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
import {
Dialog,
DialogContent,
DialogHeader,
DialogTitle,
DialogDescription
} from '@/components/ui/dialog';

import Link from 'next/link';
import dynamic from 'next/dynamic';
import { cn } from '@/lib/utils';

const DetailMap = dynamic(() => import('@/components/business/DetailMap'), {
ssr: false,
loading: () => (
<div className="w-full h-[200px] bg-muted animate-pulse rounded-xl" />
)
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
const [showOnboarding, setShowOnboarding] =
useState(searchParams.get('new') === 'true');

const [enquiry, setEnquiry] = useState({
name: '',
email: '',
message: ''
});

const [isSendingEnquiry, setIsSendingEnquiry] = useState(false);

const businessRef = useMemoFirebase(
() => (id ? doc(db, 'businesses', id as string) : null),
[db, id]
);

const { data: business, isLoading } =
useDoc<Enterprise>(businessRef);

const reviewsQuery = useMemoFirebase(() => {
if (!db || !id) return null;
return query(
collection(db, 'reviews'),
where('businessId', '==', id as string)
);
}, [db, id]);

const { data: reviews } =
useCollection<Review>(reviewsQuery);

/* -------------------------
SAFE NORMALIZATION
--------------------------*/

const safe = useMemo(() => {
if (!business) return null;

const stringify = (v: any) => {
if (!v) return '';
if (typeof v === 'string') return v;
if (typeof v === 'number') return String(v);
return JSON.stringify(v);
};

return {
name:
stringify(business.businessName) ||
stringify(business.name),

description:
stringify(business.description),

address:
stringify(business.address),

city:
stringify(business.city),

category:
stringify(business.category),

hours:
stringify(business.hours),

phone:
stringify(business.phoneNumber),

email:
stringify(business.email),

website:
stringify(business.website),

ceo:
stringify(business.ceoName),

employees:
stringify(business.employeeCount),

logo: business.logo,
lat: business.latitude,
lng: business.longitude,
rating: business.averageRating || 0,
total: business.totalReviews || 0,
verified: business.isVerified
};
}, [business]);

/* ------------------------- */

if (isLoading && !business)
return (
<div className="h-screen flex items-center justify-center">
<Loader2 className="animate-spin w-8 h-8"/>
</div>
);

if (!business || !safe)
return (
<div className="py-40 text-center">
Business not found
</div>
);

return (
<div className="min-h-screen bg-white pb-32">

<Navbar />

{/* MOBILE HEADER (WhatsApp style) */}

<div className="lg:hidden sticky top-0 z-30 bg-white border-b">
<div className="flex items-center gap-3 p-3">

<button onClick={() => router.back()}>
<ArrowLeft />
</button>

<div className="flex-1">
<h1 className="font-bold text-sm truncate">
{safe.name}
</h1>
<p className="text-xs text-muted-foreground">
{safe.city}
</p>
</div>

<button onClick={()=>setShowShareModal(true)}>
<Share2 size={18}/>
</button>

</div>
</div>

<div className="max-w-7xl mx-auto p-4 grid lg:grid-cols-12 gap-8">

{/* LEFT */}

<div className="lg:col-span-4 space-y-6">

<div className="bg-white border rounded-2xl p-6">

<div className="flex gap-4">

<div className="w-24 h-24 bg-muted rounded-xl overflow-hidden">

{safe.logo ? (
<img src={safe.logo} className="w-full h-full object-cover"/>
) : (
<Building2 className="w-full h-full p-6 opacity-30"/>
)}

</div>

<div className="flex-1 space-y-2">

<h1 className="text-xl font-bold">
{safe.name}
</h1>

<p className="text-sm text-muted-foreground">
{safe.category}
</p>

<div className="flex items-center gap-2">
<Star className="fill-yellow-400 w-4"/>
{safe.rating.toFixed(1)}
<span className="text-xs text-muted-foreground">
({safe.total})
</span>
</div>

</div>
</div>

{/* ACTION BUTTONS */}

<div className="grid grid-cols-3 gap-2 mt-6">

<Button
onClick={()=>window.open(`tel:${safe.phone}`)}
variant="outline"
>
<Phone className="w-4 h-4"/>
</Button>

<Button
onClick={()=>window.open(`https://wa.me/${safe.phone}`)}
variant="outline"
>
<MessageCircle className="w-4 h-4"/>
</Button>

<Button
onClick={()=>setShowReviewModal(true)}
>
Review
</Button>

</div>

</div>

{/* ABOUT */}

<div className="bg-white border rounded-2xl p-6 space-y-4">
<h3 className="font-bold">About</h3>
<p className="text-sm text-muted-foreground">
{safe.description || "No description"}
</p>
</div>

{/* CONTACT */}

<div className="bg-white border rounded-2xl p-6 space-y-4">

<h3 className="font-bold">Contact</h3>

<p>{safe.phone}</p>
<p>{safe.email}</p>
<p>{safe.website}</p>

</div>

</div>

{/* RIGHT */}

<div className="lg:col-span-8 space-y-8">

{/* MAP */}

{safe.lat && safe.lng && (
<div className="border rounded-2xl overflow-hidden">
<DetailMap
lat={safe.lat}
lng={safe.lng}
businessName={safe.name}
/>
</div>
)}

{/* HOURS */}

<div className="bg-white border rounded-2xl p-6">

<div className="flex justify-between">

<h3 className="font-bold">
Opening Hours
</h3>

<button
onClick={()=>setShowFullHours(!showFullHours)}
>
{showFullHours ? "Less" : "More"}
</button>

</div>

<p className={cn(
"text-sm mt-3 whitespace-pre-line",
!showFullHours && "line-clamp-3"
)}>
{safe.hours || "Not specified"}
</p>

</div>

{/* REVIEWS */}

<div className="bg-white border rounded-2xl p-6">

<div className="flex justify-between">

<h3 className="font-bold">Reviews</h3>

<Button
onClick={()=>setShowReviewModal(true)}
>
Add Review
</Button>

</div>

<div className="mt-6 space-y-4">

{reviews?.length ? (
reviews.map(r=>(
<ReviewCard
key={r.id}
review={r}
/>
))
) : (
<p className="text-sm text-muted-foreground">
No reviews yet
</p>
)}

</div>

</div>

</div>

</div>

{/* MODALS */}

<WriteReviewModal
open={showReviewModal}
onOpenChange={setShowReviewModal}
businessId={id as string}
businessName={safe.name}
currentAverageRating={safe.rating}
currentTotalReviews={safe.total}
/>

<ShareModal
open={showShareModal}
onOpenChange={setShowShareModal}
businessId={id as string}
businessName={safe.name}
/>

</div>
);
}

export default function BusinessDetailPage() {
return (
<Suspense fallback={
<div className="h-screen flex items-center justify-center">
<Loader2 className="animate-spin"/>
</div>
}>
<BusinessDetailContent />
</Suspense>
);
}