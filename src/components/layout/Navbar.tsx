
"use client";

import Link from 'next/link';
import { Search, Briefcase, User, Plus, Shield, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { useState, useEffect } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useUser, useAuth, useFirestore, useDoc, useMemoFirebase } from '@/firebase';
import { useRouter } from 'next/navigation';
import { doc } from 'firebase/firestore';
import { signOut } from 'firebase/auth';
import { ConnectionStatus } from './ConnectionStatus';

export function Navbar() {
  const { user } = useUser();
  const auth = useAuth();
  const db = useFirestore();
  const router = useRouter();
  
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const userDocRef = useMemoFirebase(() => (db && user) ? doc(db, 'users', user.uid) : null, [db, user]);
  const { data: profile } = useDoc(userDocRef);

  const handleLogout = async () => {
    if (auth) {
      await signOut(auth);
      router.push('/login');
    }
  };

  if (!isMounted) return null;

  const isAdmin = user?.email?.toLowerCase() === 'admin@gmail.com' || profile?.isAdmin;

  return (
    <nav className="bg-white border-b border-[#E5E5E1] h-[72px] flex items-center w-full relative z-50">
      <ConnectionStatus />
      <div className="container mx-auto px-4 flex items-center justify-between gap-6 max-w-7xl">
        <div className="flex items-center gap-4 sm:gap-8">
          <Link href="/" className="flex items-center shrink-0">
            <span className="font-black text-2xl tracking-tighter uppercase text-primary">Cameroon</span>
            <span className="font-black text-2xl tracking-tighter uppercase text-secondary ml-1">Zoom</span>
          </Link>
        </div>

        <div className="flex items-center gap-2 sm:gap-4">
          <Button variant="ghost" size="icon" onClick={() => router.push('/search')} className="text-secondary hover:text-primary transition-all active:scale-90">
            <Search className="w-5 h-5" />
          </Button>
          
          {user ? (
            <Sheet>
              <SheetTrigger asChild>
                <button className="flex items-center gap-2 hover:opacity-80 transition-all">
                  <Avatar className="h-10 w-10 border border-[#E5E5E1] rounded-lg">
                    <AvatarImage src={profile?.profilePhoto || user?.photoURL || undefined} className="object-cover" />
                    <AvatarFallback className="font-black bg-primary text-white rounded-lg">{profile?.fullName?.[0] || 'M'}</AvatarFallback>
                  </Avatar>
                </button>
              </SheetTrigger>
              <SheetContent side="right" className="w-full sm:w-[320px] p-0 flex flex-col font-body border-l border-[#E5E5E1] shadow-none">
                <SheetHeader className="p-8 bg-[#F9F9FB] border-b border-[#E5E5E1] text-left">
                  <div className="flex items-center gap-4">
                    <Avatar className="h-14 w-14 rounded-xl border border-[#E5E5E1] bg-white">
                      <AvatarImage src={profile?.profilePhoto || user?.photoURL || undefined} className="object-cover" />
                      <AvatarFallback className="font-black bg-primary text-white rounded-lg">{profile?.fullName?.[0] || 'M'}</AvatarFallback>
                    </Avatar>
                    <div className="min-w-0">
                      <SheetTitle className="text-lg font-black uppercase text-secondary leading-none truncate">
                        {profile?.fullName || 'Member'}
                      </SheetTitle>
                      <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mt-1.5">
                        {profile?.city || 'Douala'}, CM
                      </p>
                    </div>
                  </div>
                </SheetHeader>

                <div className="flex-grow py-6 px-4 bg-white">
                  <div className="space-y-1">
                    <Link href="/profile" className="flex items-center gap-4 w-full h-14 px-4 font-bold text-[11px] uppercase tracking-widest text-secondary hover:bg-[#F9F9FB] rounded-xl transition-all">
                      <User className="w-4 h-4 text-primary" /> Profile
                    </Link>
                    <Link href="/profile?tab=businesses" className="flex items-center gap-4 w-full h-14 px-4 font-bold text-[11px] uppercase tracking-widest text-secondary hover:bg-[#F9F9FB] rounded-xl transition-all">
                      <Briefcase className="w-4 h-4 text-primary" /> My Businesses
                    </Link>
                    <Link href="/add-business" className="flex items-center gap-4 w-full h-14 px-4 font-bold text-[11px] uppercase tracking-widest text-secondary hover:bg-[#F9F9FB] rounded-xl transition-all">
                      <Plus className="w-4 h-4 text-primary" /> Add Business
                    </Link>
                    {isAdmin && (
                      <Link href="/admin" className="flex items-center gap-4 w-full h-14 px-4 font-bold text-[11px] uppercase tracking-widest text-primary hover:bg-[#F9F9FB] rounded-xl transition-all border border-primary/10">
                        <Shield className="w-4 h-4" /> Admin Hub
                      </Link>
                    )}
                  </div>
                </div>

                <div className="p-6 border-t border-[#E5E5E1] bg-[#F9F9FB] mt-auto">
                  <Button onClick={handleLogout} variant="ghost" className="w-full h-12 text-secondary font-bold text-[10px] uppercase tracking-[0.2em] transition-all hover:bg-white hover:text-primary justify-center border border-[#E5E5E1] rounded-xl">
                    <LogOut className="w-4 h-4 mr-2" /> Log Out
                  </Button>
                </div>
              </SheetContent>
            </Sheet>
          ) : (
            <div className="flex items-center gap-2">
              <Button asChild variant="ghost" className="text-[10px] font-bold uppercase tracking-widest h-10 px-4">
                <Link href="/login">Log In</Link>
              </Button>
              <Button asChild className="text-[10px] font-bold uppercase tracking-widest h-10 px-6 bg-primary text-white rounded-xl">
                <Link href="/signup">Join Us</Link>
              </Button>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}
