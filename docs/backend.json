"use client";

import { useFirestore, useUser, useCollection, useDoc } from '@/firebase';
import { Navbar } from '@/components/layout/Navbar';
import { Button } from '@/components/ui/button';
import { MapPin, Loader2, ChevronRight, User, Building2 } from 'lucide-react';
import { ReviewCard } from '@/components/business/ReviewCard';
import { useState, useEffect, useMemo, Suspense } from 'react';
import { collection, query, where, doc, setDoc, onSnapshot } from 'firebase/firestore';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Enterprise, Review, UserProfile } from '@/app/lib/types';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { cn } from '@/lib/utils';

function ProfileContent() {
  const { user, isUserLoading } = useUser();
  const db = useFirestore();
  const router = useRouter();
  const searchParams = useSearchParams();

  const [activeTab, setActiveTab] = useState<'reviews' | 'management' | 'settings'>(
    (searchParams.get('tab') as any) || 'reviews'
  );
  const [isUpdating, setIsUpdating] = useState(false);
  const [profile, setProfile] = useState<UserProfile | null>(null);

  // Local form state
  const [editForm, setEditForm] = useState({ fullName: '', city: 'Douala', profilePhotoUrl: '' });

  // Reactive listener for user profile
  useEffect(() => {
    if (!user || !db) return;
    const userRef = doc(db, 'users', user.uid);
    const unsubscribe = onSnapshot(userRef, snap => {
      if (snap.exists()) {
        const data = snap.data() as UserProfile;
        setProfile(data);
        setEditForm({
          fullName: data.fullName || '',
          city: data.city || 'Douala',
          profilePhotoUrl: data.profilePhotoUrl || '',
        });
      }
    });
    return () => unsubscribe();
  }, [user, db]);

  // My businesses
  const myBusinessesQuery = useMemo(() => {
    if (!db || !user) return null;
    return query(collection(db, 'businesses'), where('ownerId', '==', user.uid));
  }, [db, user]);
  const { data: myBusinesses } = useCollection<Enterprise>(myBusinessesQuery);

  // My reviews
  const myReviewsQuery = useMemo(() => {
    if (!db || !user) return null;
    return query(collection(db, 'reviews'), where('reviewerId', '==', user.uid));
  }, [db, user]);
  const { data: myReviews } = useCollection<Review>(myReviewsQuery);

  const sortedReviews = useMemo(
    () =>
      (myReviews || []).sort(
        (a, b) => new Date(b.createdDate).getTime() - new Date(a.createdDate).getTime()
      ),
    [myReviews]
  );

  const handleUpdate = async () => {
    if (!user || !db) return;
    setIsUpdating(true);
    try {
      const userRef = doc(db, 'users', user.uid);
      await setDoc(userRef, {
        ...profile,
        fullName: editForm.fullName,
        city: editForm.city,
        profilePhotoUrl: editForm.profilePhotoUrl,
        updatedAt: new Date().toISOString(),
      }, { merge: true });
      alert('Profile updated successfully');
    } catch (err) {
      console.error(err);
      alert('Error updating profile');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleImage = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () =>
      setEditForm(prev => ({ ...prev, profilePhotoUrl: reader.result as string }));
    reader.readAsDataURL(file);
  };

  if (isUserLoading || !profile) {
    return (
      <div className="h-screen flex items-center justify-center">
        <Loader2 className="animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white font-body text-secondary pb-24">
      <Navbar />
      <div className="container mx-auto px-4 max-w-5xl py-12 border-b border-[#E5E5E1]">
        <div className="flex flex-col md:flex-row items-center md:items-start gap-10">
          <div className="w-32 h-32 md:w-36 md:h-32 border border-[#E5E5E1] bg-muted rounded-2xl overflow-hidden flex items-center justify-center">
            {editForm.profilePhotoUrl ? (
              <img src={editForm.profilePhotoUrl} className="w-full h-full object-cover" />
            ) : (
              <User className="w-12 h-12 opacity-20" />
            )}
          </div>
          <div className="text-center md:text-left flex-grow space-y-4 pt-2">
            <h1 className="text-3xl sm:text-4xl font-black tracking-tight uppercase leading-none">
              {profile.fullName}
            </h1>
            <p className="text-[14px] font-bold text-secondary flex items-center justify-center md:justify-start gap-1.5 uppercase opacity-60">
              <MapPin className="w-4 h-4 text-primary" /> {profile.city}
            </p>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 mt-12 max-w-5xl grid grid-cols-1 lg:grid-cols-12 gap-12">
        <aside className="lg:col-span-3 space-y-3">
          <button
            onClick={() => setActiveTab('reviews')}
            className={cn(
              "w-full text-left h-12 px-6 font-bold text-[11px] uppercase tracking-widest rounded-xl border",
              activeTab === 'reviews' ? "bg-secondary text-white" : "border-[#E5E5E1]"
            )}
          >
            My Reviews
          </button>
          {myBusinesses && myBusinesses.length > 0 && (
            <button
              onClick={() => setActiveTab('management')}
              className={cn(
                "w-full text-left h-12 px-6 font-bold text-[11px] uppercase tracking-widest rounded-xl border",
                activeTab === 'management' ? "bg-secondary text-white" : "border-[#E5E5E1]"
              )}
            >
              My Businesses
            </button>
          )}
          <div className="pt-8 border-t border-[#E5E5E1] mt-8">
            <button
              onClick={() => setActiveTab('settings')}
              className={cn(
                "text-[11px] font-bold uppercase tracking-widest w-full text-left px-6 py-3 rounded-xl",
                activeTab === 'settings' ? "text-primary bg-primary/5" : "text-muted-foreground"
              )}
            >
              Modify Info
            </button>
          </div>
        </aside>

        <main className="lg:col-span-9 min-h-[400px]">
          {activeTab === 'reviews' && (
            <div className="space-y-8">
              <h2 className="text-xl font-black uppercase border-b border-[#E5E5E1] pb-4">My Reviews</h2>
              <div className="divide-y divide-[#E5E5E1]">
                {sortedReviews.map(r => (
                  <div key={r.id} className="py-8 first:pt-0">
                    <Link
                      href={`/business/${r.businessId}`}
                      className="block mb-3 font-bold text-lg uppercase hover:text-primary"
                    >
                      {r.businessName}
                    </Link>
                    <ReviewCard review={r} hideUser />
                  </div>
                ))}
                {!sortedReviews.length && (
                  <p className="py-20 text-center opacity-30 font-bold uppercase text-xs">No reviews yet.</p>
                )}
              </div>
            </div>
          )}

          {activeTab === 'management' && myBusinesses && myBusinesses.length > 0 && (
            <div className="space-y-8">
              <div className="flex justify-between items-center border-b border-[#E5E5E1] pb-4">
                <h2 className="text-xl font-black uppercase">My Businesses</h2>
                <Button asChild className="bg-secondary text-white font-bold text-[10px] h-10 px-6 rounded-xl">
                  <Link href="/add-business">Add Business</Link>
                </Button>
              </div>
              <div className="grid gap-4">
                {myBusinesses.map(ent => (
                  <div
                    key={ent.id}
                    className="flex items-center justify-between p-6 border border-[#E5E5E1] rounded-2xl bg-white shadow-sm"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-16 h-16 rounded-xl bg-muted flex items-center justify-center overflow-hidden border border-[#E5E5E1]">
                        {ent.logoUrl ? (
                          <img src={ent.logoUrl} className="w-full h-full object-contain p-2" />
                        ) : (
                          <Building2 className="w-8 h-8 opacity-10" />
                        )}
                      </div>
                      <div>
                        <h4 className="font-bold text-[16px] uppercase truncate">{ent.name}</h4>
                        <p className="text-[10px] font-bold text-muted-foreground uppercase">{ent.category} • {ent.city}</p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        className="h-10 px-4 text-[10px] font-bold uppercase border-[#E5E5E1]"
                        asChild
                      >
                        <Link href={`/manage-business/${ent.id}`}>Modify Info</Link>
                      </Button>
                      <Button
                        variant="ghost"
                        className="h-10 w-10 border border-[#E5E5E1] rounded-xl"
                        asChild
                      >
                        <Link href={`/business/${ent.id}`}>
                          <ChevronRight className="w-5 h-5" />
                        </Link>
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'settings' && (
            <div className="space-y-10 max-w-xl">
              <h2 className="text-xl font-black uppercase border-b border-[#E5E5E1] pb-4">Modify Info</h2>
              <div className="space-y-6">
                <div className="flex items-center gap-8">
                  <div className="w-24 h-24 rounded-2xl bg-muted overflow-hidden flex items-center justify-center">
                    {editForm.profilePhotoUrl ? (
                      <img src={editForm.profilePhotoUrl} className="w-full h-full object-cover" />
                    ) : (
                      <User className="w-10 h-10 opacity-20" />
                    )}
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase opacity-50 block">Profile Photo</label>
                    <input type="file" accept="image/*" onChange={handleImage} className="text-[10px]" />
                  </div>
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase opacity-50">My Name</label>
                  <Input
                    value={editForm.fullName}
                    onChange={e => setEditForm({ ...editForm, fullName: e.target.value })}
                    className="h-12 border-[#E5E5E1] rounded-xl font-bold"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase opacity-50">Town</label>
                  <Select
                    value={editForm.city}
                    onValueChange={v => setEditForm({ ...editForm, city: v })}
                  >
                    <SelectTrigger className="h-12 border-[#E5E5E1] rounded-xl font-bold">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Douala">Douala</SelectItem>
                      <SelectItem value="Ngaoundéré">Ngaoundéré</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Button
                  onClick={handleUpdate}
                  disabled={isUpdating}
                  className="w-full h-14 bg-secondary text-white font-black uppercase text-xs rounded-xl shadow-lg"
                >
                  {isUpdating ? <Loader2 className="animate-spin" /> : "Save All Changes"}
                </Button>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

export default function ProfilePage() {
  return (
    <Suspense
      fallback={
        <div className="h-screen flex items-center justify-center bg-white">
          <Loader2 className="animate-spin text-secondary" />
        </div>
      }
    >
      <ProfileContent />
    </Suspense>
  );
}