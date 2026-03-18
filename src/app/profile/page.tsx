"use client";

import { useFirestore, useUser, useCollection, useMemoFirebase, useDoc } from '@/firebase';
import { Navbar } from '@/components/layout/Navbar';
import { Button } from '@/components/ui/button';
import { 
  MapPin, 
  Loader2,
  ChevronRight,
  User,
  Building2
} from 'lucide-react';
import { ReviewCard } from '@/components/business/ReviewCard';
import { useState, useMemo, useEffect, Suspense } from 'react';
import { EditProfileModal } from '@/components/modals/EditProfileModal';
import { collection, query, where, doc } from 'firebase/firestore';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Enterprise, Review, UserProfile } from '@/app/lib/types';
import { cn } from '@/lib/utils';

function ProfileContent() {
  const { user, isUserLoading } = useUser();
  const db = useFirestore();
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const [activeTab, setActiveTab] = useState<'reviews' | 'management'>((searchParams.get('tab') as any) || 'reviews');
  const [showEditModal, setShowEditModal] = useState(false);

  useEffect(() => {
    if (!isUserLoading && !user) router.push('/login');
  }, [user, isUserLoading, router]);

  const userDocRef = useMemoFirebase(() => user ? doc(db!, 'users', user.uid) : null, [db, user]);
  const { data: profile, isLoading: isProfileLoading } = useDoc<UserProfile>(userDocRef);

  const myBusinessesQuery = useMemoFirebase(() => {
    if (!db || !user) return null;
    return query(collection(db, 'businesses'), where('ownerId', '==', user.uid));
  }, [db, user]);
  const { data: myBusinesses } = useCollection<Enterprise>(myBusinessesQuery);

  const myReviewsQuery = useMemoFirebase(() => {
    if (!db || !user) return null;
    return query(collection(db, 'reviews'), where('reviewerId', '==', user.uid));
  }, [db, user]);
  const { data: myReviews } = useCollection<Review>(myReviewsQuery);

  const displayProfile = {
    fullName: profile?.fullName || user?.email?.split('@')[0] || "Member",
    city: profile?.city || "Douala",
    profilePhoto: profile?.profilePhoto || user?.photoURL || undefined,
    ...profile
  };

  const sortedReviews = useMemo(() => {
    return (myReviews || []).sort((a, b) => new Date(b.createdDate).getTime() - new Date(a.createdDate).getTime());
  }, [myReviews]);

  if (isUserLoading || isProfileLoading) {
    return (
      <div className="h-screen flex flex-col items-center justify-center bg-white">
        <Loader2 className="w-10 h-10 animate-spin text-secondary" />
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="min-h-screen bg-white font-body text-secondary pb-24">
      <Navbar />
      
      <div className="bg-white border-b border-[#E5E5E1]">
        <div className="container mx-auto px-4 max-w-5xl py-12">
          <div className="flex flex-col md:flex-row items-center md:items-start gap-10">
            <div className="relative">
              <div className="w-32 h-32 md:w-36 md:h-32 border border-[#E5E5E1] bg-muted rounded-2xl shadow-sm overflow-hidden flex items-center justify-center">
                {displayProfile.profilePhoto ? (
                  <img src={displayProfile.profilePhoto} className="w-full h-full object-cover" alt="Profile" />
                ) : (
                  <User className="w-12 h-12 opacity-20" />
                )}
              </div>
            </div>
            
            <div className="text-center md:text-left flex-grow space-y-4 pt-2">
              <div className="space-y-1">
                <h1 className="text-3xl sm:text-4xl font-black tracking-tight uppercase leading-none">{displayProfile.fullName}</h1>
                <p className="text-[14px] font-bold text-secondary flex items-center justify-center md:justify-start gap-1.5 uppercase tracking-widest opacity-60">
                  <MapPin className="w-4 h-4 text-primary" /> {displayProfile.city}
                </p>
              </div>
              
              <div className="flex flex-wrap justify-center md:justify-start gap-6 pt-2">
                <button onClick={() => setActiveTab('reviews')} className="font-bold text-[11px] uppercase tracking-widest hover:text-primary">
                  {myReviews?.length || 0} Reviews
                </button>
                <button onClick={() => setActiveTab('management')} className="font-bold text-[11px] uppercase tracking-widest hover:text-primary">
                  {myBusinesses?.length || 0} Businesses
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 mt-12 max-w-5xl">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          
          <aside className="lg:col-span-3 space-y-3">
            <button 
              onClick={() => setActiveTab('reviews')}
              className={cn(
                "w-full text-left h-12 px-6 font-bold text-[11px] uppercase tracking-widest rounded-xl transition-all border",
                activeTab === 'reviews' ? "bg-secondary text-white border-secondary" : "border-[#E5E5E1] hover:bg-muted"
              )}
            >
              My Reviews
            </button>
            <button 
              onClick={() => setActiveTab('management')}
              className={cn(
                "w-full text-left h-12 px-6 font-bold text-[11px] uppercase tracking-widest rounded-xl transition-all border",
                activeTab === 'management' ? "bg-secondary text-white border-secondary" : "border-[#E5E5E1] hover:bg-muted"
              )}
            >
              My Businesses
            </button>
            
            <div className="pt-8 border-t border-[#E5E5E1] mt-8">
              <button 
                onClick={() => setShowEditModal(true)} 
                className="text-[11px] font-bold text-primary hover:underline uppercase tracking-widest w-full text-left px-6"
              >
                Modify Info
              </button>
            </div>
          </aside>

          <main className="lg:col-span-9 min-h-[400px]">
            {activeTab === 'reviews' && (
              <div className="space-y-8">
                <h2 className="text-xl font-black uppercase tracking-tight border-b border-[#E5E5E1] pb-4">My Reviews</h2>
                <div className="divide-y divide-[#E5E5E1]">
                  {sortedReviews.length > 0 ? sortedReviews.map((r) => (
                    <div key={r.id} className="py-8 first:pt-0">
                      <Link href={`/business/${r.businessId}`} className="block mb-3 group">
                        <h4 className="font-bold text-[18px] uppercase text-secondary group-hover:text-primary transition-colors">
                          {r.businessName}
                        </h4>
                      </Link>
                      <ReviewCard review={r} hideUser />
                    </div>
                  )) : (
                    <div className="text-center py-20 border border-[#E5E5E1] rounded-2xl opacity-30">
                      <p className="text-[12px] uppercase font-bold tracking-widest">No reviews yet.</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {activeTab === 'management' && (
              <div className="space-y-8">
                <div className="flex justify-between items-center border-b border-[#E5E5E1] pb-4">
                  <h2 className="text-xl font-black uppercase tracking-tight">My Businesses</h2>
                  <Button asChild className="bg-secondary text-white font-bold text-[10px] h-10 px-6 rounded-xl transition-all hover:bg-primary">
                    <Link href="/add-business">Add Business</Link>
                  </Button>
                </div>
                <div className="grid gap-4">
                  {myBusinesses?.map((ent) => (
                    <div key={ent.id} className="flex items-center justify-between gap-6 py-6 px-6 border border-[#E5E5E1] rounded-2xl transition-all bg-white shadow-sm hover:shadow-md">
                      <div className="flex items-center gap-4">
                        <div className="w-16 h-16 rounded-xl bg-muted flex items-center justify-center overflow-hidden border border-[#E5E5E1]">
                          {ent.logo ? (
                            <img src={ent.logo} className="w-full h-full object-contain p-2" alt="logo" />
                          ) : (
                            <Building2 className="w-8 h-8 opacity-10" />
                          )}
                        </div>
                        <div>
                          <h4 className="font-bold text-[16px] uppercase tracking-tight text-secondary mb-1 line-clamp-1">
                            {ent.businessName}
                          </h4>
                          <div className="flex items-center gap-3 text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                            <span>{ent.category}</span>
                            <span>• {ent.city}</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex gap-2 shrink-0">
                        <Button variant="outline" size="sm" className="h-10 px-4 text-[10px] rounded-xl font-bold border border-[#E5E5E1] uppercase tracking-widest hover:bg-secondary hover:text-white transition-all" asChild>
                          <Link href={`/manage-business/${ent.id}`}>Modify Info</Link>
                        </Button>
                        <Button size="icon" variant="ghost" className="h-10 w-10 rounded-xl border border-[#E5E5E1] hover:border-black transition-all" asChild>
                          <Link href={`/business/${ent.id}`}><ChevronRight className="w-5 h-5" /></Link>
                        </Button>
                      </div>
                    </div>
                  ))}
                  {!myBusinesses?.length && (
                    <div className="py-20 text-center border border-[#E5E5E1] rounded-2xl opacity-30">
                      <p className="text-[12px] uppercase font-bold tracking-widest">No businesses added yet.</p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </main>
        </div>
      </div>

      <EditProfileModal open={showEditModal} onOpenChange={setShowEditModal} userData={displayProfile} />
    </div>
  );
}

export default function ProfilePage() {
  return (
    <Suspense fallback={<div className="h-screen flex items-center justify-center bg-white"><Loader2 className="w-10 h-10 animate-spin text-secondary" /></div>}>
      <ProfileContent />
    </Suspense>
  );
}