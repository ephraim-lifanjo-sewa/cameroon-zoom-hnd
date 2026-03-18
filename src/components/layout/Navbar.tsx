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

/**
 * NAVBAR COMPONENT
 * Ready for Build: Fixed icons and simplified terms.
 */
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
    <nav className="bg-white border-b-2 h-[72px] flex items-center w-full relative z-50">
      <ConnectionStatus />
      <div className="container mx-auto px-4 flex items-center justify-between gap-6 max-w-7xl">
        <div className="flex items-center gap-4 sm:gap-8">
          <Link href="/" className="flex items-center shrink-0 group">
            <span className="font-black text-2xl tracking-tighter uppercase text-primary group-hover:scale-110 transition-transform">Cameroon</span>
            <span className="font-black text-2xl tracking-tighter uppercase text-secondary ml-1 group-hover:scale-110 transition-transform">Zoom</span>
          </Link>
        </div>

        <div className="flex items-center gap-2 sm:gap-4">
          <Button variant="ghost" size="icon" onClick={() => router.push('/search')} className="text-secondary hover:text-primary transition-all active:scale-90">
            <Search className="w-5 h-5" />
          </Button>
          
          {user ? (
            <Sheet>
              <SheetTrigger asChild>
                <button className="flex items-center gap-2 hover:opacity-80 transition-all active:scale-95">
                  <Avatar className="h-10 w-10 border-2 shadow-sm rounded-lg">
                    <AvatarImage src={profile?.profilePhoto || user?.photoURL || undefined} className="object-cover" />
                    <AvatarFallback className="font-black bg-primary text-white rounded-lg">{profile?.fullName?.[0] || 'M'}</AvatarFallback>
                  </Avatar>
                </button>
              </SheetTrigger>
              <SheetContent side="right" className="w-full sm:w-[350px] p-0 flex flex-col font-body border-l-4 shadow-2xl rounded-none border-secondary">
                <SheetHeader className="p-8 bg-muted/30 border-b-2 text-left">
                  <div className="flex items-center gap-4">
                    <Avatar className="h-14 w-14 rounded-xl border-4 border-white shadow-xl">
                      <AvatarImage src={profile?.profilePhoto || user?.photoURL || undefined} className="object-cover" />
                      <AvatarFallback className="font-black bg-primary text-white rounded-xl">{profile?.fullName?.[0] || 'M'}</AvatarFallback>
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
                    <Link href="/profile" className="flex items-center gap-4 w-full h-14 px-4 font-black text-[11px] uppercase tracking-widest text-secondary hover:bg-muted rounded-xl transition-all">
                      <User className="w-4 h-4 text-primary" /> My Page
                    </Link>
                    <Link href="/profile?tab=management" className="flex items-center gap-4 w-full h-14 px-4 font-black text-[11px] uppercase tracking-widest text-secondary hover:bg-muted rounded-xl transition-all">
                      <Briefcase className="w-4 h-4 text-primary" /> My Work
                    </Link>
                    <Link href="/add-business" className="flex items-center gap-4 w-full h-14 px-4 font-black text-[11px] uppercase tracking-widest text-secondary hover:bg-muted rounded-xl transition-all">
                      <Plus className="w-4 h-4 text-primary" /> Add Business
                    </Link>
                    {isAdmin && (
                      <Link href="/admin" className="flex items-center gap-4 w-full h-14 px-4 font-black text-[11px] uppercase tracking-widest text-primary hover:bg-primary/5 rounded-xl transition-all border-2 border-primary/10">
                        <Shield className="w-4 h-4" /> Admin Page
                      </Link>
                    )}
                  </div>
                </div>

                <div className="p-6 border-t-2 bg-muted/5 mt-auto">
                  <Button onClick={handleLogout} variant="ghost" className="w-full h-12 text-secondary font-black text-[10px] uppercase tracking-[0.2em] transition-all hover:bg-red-50 hover:text-primary justify-center border-2 rounded-xl active:scale-95">
                    <LogOut className="w-4 h-4 mr-2" /> Get Out
                  </Button>
                </div>
              </SheetContent>
            </Sheet>
          ) : (
            <div className="flex items-center gap-2">
              <Button asChild variant="ghost" className="text-[10px] font-black uppercase tracking-widest h-10 px-4 hover:bg-muted active:scale-95">
                <Link href="/login">Go In</Link>
              </Button>
              <Button asChild className="text-[10px] font-black uppercase tracking-widest h-10 px-6 bg-primary text-white rounded-xl active:scale-95 shadow-lg">
                <Link href="/signup">Join Us</Link>
              </Button>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}
