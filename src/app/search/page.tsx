"use client";

import { useState, useMemo, Suspense, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Navbar } from '@/components/layout/Navbar';
import { useFirestore } from '@/firebase';
import { collection, query, where, limit, onSnapshot } from 'firebase/firestore';
import { EnterpriseCard } from '@/components/enterprise/EnterpriseCard';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { 
  SearchX,
  MapPin,
  Loader2,
  Briefcase,
  Search,
  Zap,
  ChevronLeft,
  ChevronRight,
  Database,
  Map as MapIcon,
  X
} from 'lucide-react';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { Enterprise } from '@/app/lib/types';
import { Skeleton } from '@/components/ui/skeleton';
import dynamic from 'next/dynamic';
import { cn } from '@/lib/utils';
import { saveMultipleToCache, getCachedByCity } from '@/lib/offline-db';

const SearchMap = dynamic(() => import('@/components/search/SearchMap'), { 
  ssr: false,
  loading: () => <div className="w-full h-full bg-muted animate-pulse rounded-none" />
});

const CATEGORIES = [
  "Everything",
  "Food & Hospitality",
  "Health & Wellness",
  "Technology & IT",
  "Business & Professional",
  "Home & Lifestyle",
  "Creative & Media",
  "Education & Training",
  "Events & Entertainment"
];

const TOWNS = ["Douala", "Ngaoundéré"];
const ITEMS_PER_PAGE = 20;

function SearchContent() {
  const searchParams = useSearchParams();
  const db = useFirestore();
  const router = useRouter();
  
  const [searchTerm, setSearchTerm] = useState(searchParams.get('q') || '');
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get('category') || 'Everything');
  const [selectedCity, setSelectedCity] = useState(searchParams.get('city') || 'All Towns');
  const [highlightedId, setHighlightedId] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [isOfflineMode, setIsOfflineMode] = useState(false);
  const [showMapMobile, setShowMapMobile] = useState(false);
  
  const [enterprises, setEnterprises] = useState<Enterprise[]>([]);
  const [isInitialLoading, setIsInitialLoading] = useState(true);

  useEffect(() => {
    if (!db) return;
    
    if (typeof window !== 'undefined' && !navigator.onLine) {
      setIsOfflineMode(true);
      getCachedByCity(selectedCity).then(cached => {
        setEnterprises(cached);
        setIsInitialLoading(false);
      });
      return;
    }

    let baseQuery = collection(db, 'businesses');
    const queryConstraints: any[] = [];

    if (selectedCategory !== 'Everything') queryConstraints.push(where('category', '==', selectedCategory));
    if (selectedCity !== 'All Towns') queryConstraints.push(where('city', '==', selectedCity));

    const finalQuery = query(baseQuery, ...queryConstraints, limit(200));

    const unsubscribe = onSnapshot(finalQuery, (snapshot) => {
      const results = snapshot.docs
        .map(doc => ({ id: doc.id, ...doc.data() }))
        .filter((bus: any) => (bus.businessName || bus.name)) as Enterprise[];
      
      setEnterprises(results);
      setIsInitialLoading(false);
      setIsOfflineMode(false);
      
      saveMultipleToCache(results);
    }, (err) => {
      setIsOfflineMode(true);
      getCachedByCity(selectedCity).then(cached => {
        setEnterprises(cached);
        setIsInitialLoading(false);
      });
    });

    return () => unsubscribe();
  }, [db, selectedCategory, selectedCity]);

  const filteredEnterprises = useMemo(() => {
    const term = searchTerm.toLowerCase().trim();
    if (!term) return enterprises;

    return enterprises.filter(bus => {
      const name = (bus.businessName || bus.name || "").toLowerCase();
      const desc = (bus.description || "").toLowerCase();
      const cat = (bus.category || "").toLowerCase();
      const city = (bus.city || "").toLowerCase();
      return name.includes(term) || desc.includes(term) || cat.includes(term) || city.includes(term);
    });
  }, [enterprises, searchTerm]);

  const totalPages = Math.ceil(filteredEnterprises.length / ITEMS_PER_PAGE);
  const paginatedEnterprises = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredEnterprises.slice(start, start + ITEMS_PER_PAGE);
  }, [filteredEnterprises, currentPage]);

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(prev => prev + 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handlePrevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(prev => prev - 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  return (
    <div className="min-h-screen bg-white font-body flex flex-col">
      <Navbar />

      <div className="bg-white border-b">
        <div className="container mx-auto max-w-7xl py-6 px-4">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1 flex bg-white border-2 border-muted rounded-xl overflow-hidden focus-within:border-primary transition-all">
              <Input 
                placeholder="Find names, work, and more..."
                className="flex-1 h-14 border-none focus-visible:ring-0 font-bold text-base bg-transparent px-6"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <Button className="h-14 px-8 bg-secondary text-white font-black uppercase text-xs tracking-widest rounded-none hover:bg-primary shrink-0 transition-all">
                <Search className="w-5 h-5" />
              </Button>
            </div>
            
            <div className="flex gap-3 shrink-0 overflow-x-auto lg:overflow-visible hide-scrollbar pb-1 lg:pb-0">
              <Button 
                variant="outline" 
                className="lg:hidden h-14 border-2 border-muted font-black uppercase text-[10px] tracking-widest rounded-xl shrink-0 px-6"
                onClick={() => setShowMapMobile(true)}
              >
                <MapIcon className="w-4 h-4 mr-2 text-primary" />
                Map
              </Button>

              <div className="flex-1 sm:flex-none sm:min-w-[140px] shrink-0">
                <Select value={selectedCity} onValueChange={setSelectedCity}>
                  <SelectTrigger className="h-14 border-2 border-muted font-black uppercase text-[10px] tracking-widest rounded-xl w-full">
                    <MapPin className="w-4 h-4 mr-2 text-primary" />
                    <SelectValue placeholder="Town" />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl border shadow-xl">
                    <SelectItem value="All Towns" className="text-[10px] font-black uppercase">All Towns</SelectItem>
                    {TOWNS.map(town => (
                      <SelectItem key={town} value={town} className="text-[10px] font-black uppercase">{town}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex-1 sm:flex-none sm:min-w-[180px] shrink-0">
                <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                  <SelectTrigger className="h-14 border-2 border-muted font-black uppercase text-[10px] tracking-widest rounded-xl w-full">
                    <Briefcase className="w-4 h-4 mr-2 text-primary" />
                    <SelectValue placeholder="Work Type" />
                  </SelectTrigger>
                  <SelectContent className="max-h-[300px] overflow-y-auto rounded-xl border shadow-xl custom-scrollbar">
                    {CATEGORIES.map(cat => (
                      <SelectItem key={cat} value={cat} className="text-[10px] font-black uppercase">{cat}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        </div>
      </div>

      <main className="flex-grow flex flex-col lg:flex-row relative">
        <div className="w-full lg:w-[62.5%] bg-white shrink-0 lg:border-r min-h-screen">
          <div className="p-8 space-y-8">
            <div className="border-b pb-6 flex items-center justify-between">
              <div className="space-y-1">
                <h2 className="text-xl font-black uppercase tracking-tight text-secondary">
                  {isInitialLoading 
                    ? "Searching for businesses..." 
                    : `${filteredEnterprises.length} businesses found in ${selectedCity === 'All Towns' ? 'Cameroon' : selectedCity}`
                  }
                </h2>
                {isOfflineMode && (
                  <div className="flex items-center gap-3 mt-2">
                    <span className="flex items-center gap-1 bg-secondary text-white px-2.5 py-1 rounded text-[9px] font-black uppercase">
                      <Database className="w-3 h-3" /> Found on Device
                    </span>
                  </div>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {isInitialLoading ? (
                Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-56 w-full border rounded-2xl" />)
              ) : (
                paginatedEnterprises.map((bus) => (
                  <div 
                    key={bus.id} 
                    onMouseEnter={() => setHighlightedId(bus.id)}
                    onMouseLeave={() => setHighlightedId(null)}
                    className="w-full"
                  >
                    <EnterpriseCard enterprise={bus} isHighlighted={highlightedId === bus.id} />
                  </div>
                ))
              )}
            </div>
            
            {!isInitialLoading && filteredEnterprises.length === 0 && (
              <div className="text-center py-40 space-y-6 flex flex-col items-center">
                <SearchX className="w-20 h-20 text-muted-foreground opacity-20" />
                <p className="font-black text-secondary uppercase tracking-widest text-sm">Nothing Found</p>
              </div>
            )}

            {!isInitialLoading && totalPages > 1 && (
              <div className="flex items-center justify-center gap-8 pt-12 pb-20 border-t mt-12">
                <Button onClick={handlePrevPage} disabled={currentPage === 1} variant="outline" className="h-12 border-2 rounded-full font-black text-[10px] uppercase px-8 hover:bg-secondary hover:text-white transition-all">
                  <ChevronLeft className="w-5 h-5 mr-1" /> Back
                </Button>
                <span className="text-[11px] font-black uppercase tracking-[0.2em] text-muted-foreground">
                  Part {currentPage} / {totalPages}
                </span>
                <Button onClick={handleNextPage} disabled={currentPage === totalPages} variant="outline" className="h-12 border-2 rounded-full font-black text-[10px] uppercase px-8 hover:bg-secondary hover:text-white transition-all">
                  Next <ChevronRight className="w-5 h-5 ml-1" />
                </Button>
              </div>
            )}
          </div>
        </div>

        <div className="hidden lg:block lg:w-[37.5%] h-screen sticky top-0 bg-muted overflow-hidden">
          <SearchMap 
            businesses={paginatedEnterprises} 
            onMarkerClick={(ent) => setHighlightedId(ent.id)}
            highlightedId={highlightedId}
          />
        </div>

        {showMapMobile && (
          <div className="fixed inset-0 z-[100] bg-white flex flex-col lg:hidden">
            <div className="h-16 border-b flex items-center justify-between px-6 shrink-0 bg-white">
              <div className="flex items-center gap-2">
                <MapIcon className="w-5 h-5 text-primary" />
                <span className="font-black uppercase text-[12px] tracking-widest text-secondary">Map of Places</span>
              </div>
              <Button variant="ghost" size="icon" className="h-10 w-10 border-2 rounded-lg" onClick={() => setShowMapMobile(false)}>
                <X className="w-5 h-5" />
              </Button>
            </div>
            <div className="flex-grow relative">
              <SearchMap 
                businesses={paginatedEnterprises} 
                onMarkerClick={(ent) => {
                  setHighlightedId(ent.id);
                }}
                highlightedId={highlightedId}
              />
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense fallback={<div className="h-screen flex items-center justify-center bg-white"><Loader2 className="animate-spin text-secondary w-10 h-10" /></div>}>
      <SearchContent />
    </Suspense>
  );
}
