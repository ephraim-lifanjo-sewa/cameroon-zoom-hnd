"use client";

import { useState, useMemo, Suspense, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { Navbar } from '@/components/layout/Navbar';
import { useFirestore } from '@/firebase';
import { collection, query, where, limit, onSnapshot } from 'firebase/firestore';
import { EnterpriseCard } from '@/components/enterprise/EnterpriseCard';
import { Button } from '@/components/ui/button';
import { MapPin, Map as MapIcon, X, SearchX, Loader2 } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Enterprise } from '@/app/lib/types';
import { Skeleton } from '@/components/ui/skeleton';
import dynamic from 'next/dynamic';
import SearchInput from '@/components/search/SearchInput';

const SearchMap = dynamic(() => import('@/components/search/SearchMap'), { 
  ssr: false,
  loading: () => <div className="w-full h-full bg-muted animate-pulse rounded-none" />
});

const CATEGORIES = ["Everything", "Food & Hospitality", "Health & Wellness", "Technology & IT", "Business & Professional", "Home & Lifestyle", "Creative & Media", "Education & Training", "Events & Entertainment", "Services"];
const TOWNS = ["Douala", "Ngaoundéré"];
const ITEMS_PER_PAGE = 30;

function SearchContent() {
  const searchParams = useSearchParams();
  const db = useFirestore();
  
  const searchTerm = searchParams.get('q') || '';
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get('category') || 'Everything');
  const [selectedCity, setSelectedCity] = useState(searchParams.get('city') || 'All Towns');
  const [highlightedId, setHighlightedId] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [showMapMobile, setShowMapMobile] = useState(false);
  const [enterprises, setEnterprises] = useState<Enterprise[]>([]);
  const [isInitialLoading, setIsInitialLoading] = useState(true);

  useEffect(() => {
    if (!db) return;
    let baseQuery = collection(db, 'businesses');
    const queryConstraints: any[] = [];
    if (selectedCategory !== 'Everything') queryConstraints.push(where('category', '==', selectedCategory));
    if (selectedCity !== 'All Towns') queryConstraints.push(where('city', '==', selectedCity));
    const finalQuery = query(baseQuery, ...queryConstraints, limit(300));
    
    const unsubscribe = onSnapshot(finalQuery, (snapshot) => {
      const results = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Enterprise[];
      setEnterprises(results);
      setIsInitialLoading(false);
    });
    return () => unsubscribe();
  }, [db, selectedCategory, selectedCity]);

  const filteredEnterprises = useMemo(() => {
    const term = searchTerm.toLowerCase().trim();
    if (!term) return enterprises;
    return enterprises.filter(bus => 
      (bus.businessName || bus.name || "").toLowerCase().includes(term) || 
      (bus.description || "").toLowerCase().includes(term) ||
      (bus.category || "").toLowerCase().includes(term) ||
      (bus.city || "").toLowerCase().includes(term)
    );
  }, [enterprises, searchTerm]);

  const totalPages = Math.ceil(filteredEnterprises.length / ITEMS_PER_PAGE);
  const paginatedEnterprises = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredEnterprises.slice(start, start + ITEMS_PER_PAGE);
  }, [filteredEnterprises, currentPage]);

  return (
    <div className="min-h-screen bg-white font-body flex flex-col">
      <Navbar />
      <div className="bg-white border-b border-[#E5E5E1] py-6 px-4">
        <div className="container mx-auto max-w-7xl flex flex-col lg:flex-row gap-4 items-center">
          <div className="flex-1 w-full">
            <SearchInput />
          </div>
          <div className="flex gap-3 shrink-0 w-full lg:w-auto">
            <Button variant="outline" className="lg:hidden h-14 border-[#E5E5E1] font-black uppercase text-[10px] rounded-xl flex-1" onClick={() => setShowMapMobile(true)}><MapIcon className="w-4 h-4 mr-2 text-primary" /> Map</Button>
            <Select value={selectedCity} onValueChange={setSelectedCity}>
              <SelectTrigger className="h-14 border-[#E5E5E1] font-black uppercase text-[10px] rounded-xl min-w-[140px] flex-1 lg:flex-initial"><MapPin className="w-4 h-4 mr-2 text-primary" /><SelectValue placeholder="Town" /></SelectTrigger>
              <SelectContent><SelectItem value="All Towns">All Towns</SelectItem>{TOWNS.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent>
            </Select>
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="h-14 border-[#E5E5E1] font-black uppercase text-[10px] rounded-xl min-w-[180px] flex-1 lg:flex-initial"><SelectValue placeholder="Work Type" /></SelectTrigger>
              <SelectContent>{CATEGORIES.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
            </Select>
          </div>
        </div>
      </div>

      <main className="flex-grow flex flex-col lg:flex-row relative">
        <div className="w-full lg:w-[60%] bg-white shrink-0 lg:border-r border-[#E5E5E1] p-8">
          <div className="flex items-center justify-between border-b border-[#E5E5E1] pb-6 mb-8">
            <h2 className="text-xl font-black uppercase">{filteredEnterprises.length} Enterprises Found</h2>
            {totalPages > 1 && <div className="text-[10px] font-bold text-muted-foreground uppercase">Page {currentPage} of {totalPages}</div>}
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {isInitialLoading ? Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-64 rounded-2xl" />) : paginatedEnterprises.map(bus => (
              <div 
                key={bus.id} 
                onMouseEnter={() => setHighlightedId(bus.id)} 
                onMouseLeave={() => setHighlightedId(null)}
              >
                <EnterpriseCard enterprise={bus} isHighlighted={highlightedId === bus.id} />
              </div>
            ))}
          </div>
          
          {!isInitialLoading && filteredEnterprises.length === 0 && (
            <div className="text-center py-40 opacity-20">
              <SearchX className="w-20 h-20 mx-auto" />
              <p className="font-black uppercase text-sm mt-4">Nothing Found</p>
            </div>
          )}
          
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-8 pt-12">
              <Button onClick={() => { setCurrentPage(p => Math.max(1, p - 1)); window.scrollTo(0,0); }} disabled={currentPage === 1} variant="outline" className="h-12 rounded-full font-black text-[10px] uppercase px-8 border-[#E5E5E1]">Back</Button>
              <Button onClick={() => { setCurrentPage(p => Math.min(totalPages, p + 1)); window.scrollTo(0,0); }} disabled={currentPage === totalPages} variant="outline" className="h-12 rounded-full font-black text-[10px] uppercase px-8 border-[#E5E5E1]">Next</Button>
            </div>
          )}
        </div>
        
        <div className="hidden lg:block lg:w-[40%] h-screen sticky top-0 bg-muted">
          <SearchMap businesses={paginatedEnterprises} onMarkerClick={ent => setHighlightedId(ent.id)} highlightedId={highlightedId} />
        </div>
        
        {showMapMobile && (
          <div className="fixed inset-0 z-[100] bg-white flex flex-col lg:hidden">
            <header className="h-16 border-b border-[#E5E5E1] flex items-center justify-between px-6">
              <span className="font-black uppercase text-xs">Enterprise Map</span>
              <Button variant="ghost" onClick={() => setShowMapMobile(false)}><X className="w-5 h-5" /></Button>
            </header>
            <div className="flex-grow">
              <SearchMap businesses={paginatedEnterprises} onMarkerClick={ent => setHighlightedId(ent.id)} highlightedId={highlightedId} isMobileOnly onCloseMobile={() => setShowMapMobile(false)} />
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense fallback={<div className="h-screen flex items-center justify-center"><Loader2 className="animate-spin text-primary" /></div>}>
      <SearchContent />
    </Suspense>
  );
}
