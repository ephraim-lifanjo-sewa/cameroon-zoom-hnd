/* eslint-disable react-hooks/set-state-in-effect */
"use client";

import Link from 'next/link';
import { Search, User, Shield, LogOut, Plus, LayoutDashboard } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { useState, useEffect } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useUser, useAuth, useFirestore, useDoc, useMemoFirebase } from '@/firebase';
import { useRouter, usePathname } from 'next/navigation';
import { doc } from 'firebase/firestore';
import { signOut } from 'firebase/auth';
import { Input } from '@/components/ui/input';

export function Navbar() {
  const { user } = useUser();
  const auth = useAuth();
  const db = useFirestore();
  const router = useRouter();
  const pathname = usePathname();
  const [isMounted, setIsMounted] = useState(false);
  const [headerSearch, setHeaderSearch] = useState('');

  useEffect(() => { setIsMounted(true); }, []);

  const userDocRef = useMemoFirebase(() => (db && user) ? doc(db, 'users', user.uid) : null, [db, user]);
  const { data: profile } = useDoc(userDocRef);

  const handleLogout = async () => {
    if (auth) {
      await signOut(auth);
      router.push('/login');
    }
  };

  const onHeaderSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (headerSearch.trim()) {
      router.push(`/search?q=${encodeURIComponent(headerSearch)}`);
      setHeaderSearch('');
    } else {
      router.push('/search');
    }
  };

  if (!isMounted) return null;

  const isAdmin = user?.email?.toLowerCase() === 'admin@gmail.com' || profile?.isAdmin;
  const isHomePage = pathname === '/';
  const isSearchPage = pathname === '/search';

  // Use real user name first letter or fallback
  const avatarLetter = profile?.fullName?.[0]?.toUpperCase() || user?.displayName?.[0]?.toUpperCase() || 'M';
  const displayName = profile?.fullName || user?.displayName || 'Member';

  return (
    <nav className="bg-white border-b border-[#E5E5E1] h-18 flex items-center w-full relative z-50">
      <div className="container mx-auto px-4 flex items-center justify-between gap-6 max-w-7xl">
        <Link href="/" className="flex items-center shrink-0">
          <span className="font-black text-xr tracking-tighter uppercase text-primary">Cameroon</span>
          <span className="font-black text-xr tracking-tighter uppercase text-secondary ml-1">Zoom</span>
        </Link>

        {/* Search Bar */}
        <div className="grow max-w-md hidden md:block">
          {!isHomePage && !isSearchPage && (
            <form onSubmit={onHeaderSearch} className="relative flex items-center bg-muted/30 rounded-xl border border-[#E5E5E1] p-0.5 focus-within:border-primary transition-all">
              <Input
                value={headerSearch}
                onChange={e => setHeaderSearch(e.target.value)}
                placeholder="Search..." 
                className="h-10 bg-transparent border-none shadow-none focus-visible:ring-0 text-xs font-bold px-4"
              />
              <Button type="submit" size="icon" variant="ghost" className="h-9 w-9 text-secondary hover:text-primary shrink-0">
                <Search className="w-4 h-4" />
              </Button>
            </form>
          )}
        </div>

        {/* Right Side */}
        <div className="flex items-center gap-2">
          {isHomePage && (
            <Button variant="ghost" size="icon" onClick={() => router.push('/search')} className="text-secondary hover:text-primary">
              <Search className="w-5 h-5" />
            </Button>
          )}

          {user ? (
            <Sheet>
              <SheetTrigger asChild>
                <button className="flex items-center gap-2 hover:opacity-80 transition-all focus:outline-none">
                  <Avatar className="h-10 w-10 border border-[#E5E5E1] rounded-lg">
                    <AvatarImage src={profile?.profilePhoto || undefined} className="object-cover" />
                    <AvatarFallback className="font-black bg-primary text-white">{avatarLetter}</AvatarFallback>
                  </Avatar>
                </button>
              </SheetTrigger>
              <SheetContent side="right" className="w-75 p-0 flex flex-col border-l border-[#E5E5E1]">
                <SheetHeader className="p-8 bg-muted/5 border-b border-[#E5E5E1]">
                  <SheetTitle className="text-lg font-black uppercase text-secondary truncate">{displayName}</SheetTitle>
                  <p className="text-[10px] font-bold text-muted-foreground uppercase">{profile?.city || 'Douala'}, CM</p>
                </SheetHeader>
                <div className="grow p-4 space-y-1">
                  <Link href="/profile" className="flex items-center gap-4 h-12 px-4 font-bold text-[11px] uppercase tracking-widest hover:bg-muted/50 rounded-xl text-secondary">
                    <User className="w-4 h-4 text-primary" /> My Profile
                  </Link>
                  <Link href="/profile?tab=management" className="flex items-center gap-4 h-12 px-4 font-bold text-[11px] uppercase tracking-widest hover:bg-muted/50 rounded-xl text-secondary">
                    <LayoutDashboard className="w-4 h-4 text-primary" /> Business Dashboard
                  </Link>
                  <Link href="/add-business" className="flex items-center gap-4 h-12 px-4 font-bold text-[11px] uppercase tracking-widest hover:bg-muted/50 rounded-xl text-secondary">
                    <Plus className="w-4 h-4 text-primary" /> Add Business
                  </Link>
                  {isAdmin && (
                    <Link href="/admin" className="flex items-center gap-4 h-12 px-4 font-bold text-[11px] uppercase tracking-widest text-primary hover:bg-muted/50 rounded-xl">
                      <Shield className="w-4 h-4" /> Admin Dashboard
                    </Link>
                  )}
                </div>
                <div className="p-6 border-t border-[#E5E5E1] mt-auto">
                  <Button onClick={handleLogout} variant="ghost" className="w-full text-secondary font-bold text-[10px] uppercase border border-[#E5E5E1] rounded-xl hover:bg-muted">
                    <LogOut className="w-4 h-4 mr-2" /> Log Out
                  </Button>
                </div>
              </SheetContent>
            </Sheet>
          ) : (
            <div className="flex items-center gap-2">
              <Button asChild variant="ghost" className="text-[10px] font-bold uppercase h-10 px-2"><Link href="/login">Login</Link></Button>
              <Button asChild className="text-[10px] font-bold uppercase h-10 px-1 bg-primary text-white rounded-xl hover:bg-black"><Link href="/signup">Sign Up</Link></Button>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}