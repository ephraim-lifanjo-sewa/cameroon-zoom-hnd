
"use client";

import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import { useState, useEffect, useRef } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, Loader2 } from 'lucide-react';

/**
 * HIGH-PERFORMANCE SEARCH INPUT
 * Fast recommendations without AI.
 * Resets only when cleared on the search page.
 */
export default function SearchInput() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const [query, setQuery] = useState(searchParams.get('q') || '');
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (query.length < 1) {
      setSuggestions([]);
      return;
    }

    const timer = setTimeout(async () => {
      setIsLoading(true);
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(query)}`);
        const data = await res.json();
        setSuggestions(data.suggestions || []);
      } catch (e) {
        console.error("Suggestion error", e);
      } finally {
        setIsLoading(false);
      }
    }, 100); // Super fast debounce

    return () => clearTimeout(timer);
  }, [query]);

  const handleSearch = (e?: React.FormEvent) => {
    e?.preventDefault();
    setShowSuggestions(false);
    if (query.trim()) {
      router.push(`/search?q=${encodeURIComponent(query)}`);
    } else if (pathname === '/search') {
      router.push('/search');
    }
  };

  const selectSuggestion = (s: string) => {
    setQuery(s);
    setShowSuggestions(false);
    router.push(`/search?q=${encodeURIComponent(s)}`);
  };

  return (
    <div ref={containerRef} className="relative w-full max-w-2xl mx-auto">
      <form onSubmit={handleSearch} className="flex bg-white p-1 rounded-2xl shadow-xl border border-[#E5E5E1] focus-within:border-primary transition-all">
        <div className="relative flex-1 flex items-center">
          <Input 
            placeholder="Search Businesses..." 
            className="h-14 border-none shadow-none focus-visible:ring-0 w-full text-base font-bold px-6" 
            value={query} 
            onChange={(e) => {
              const val = e.target.value;
              setQuery(val);
              if (val.length > 0) {
                setShowSuggestions(true);
              } else if (pathname === '/search' && val === '') {
                router.push('/search');
              }
            }} 
            onFocus={() => query.length > 0 && setShowSuggestions(true)}
          />
          {isLoading && <Loader2 className="absolute right-4 w-4 h-4 animate-spin opacity-20 text-primary" />}
        </div>
        <Button type="submit" className="bg-primary hover:bg-black rounded-xl m-1 px-8 h-12 font-black text-xs uppercase text-white shrink-0 shadow-lg">
          <Search className="w-4 h-4 mr-2" /> Find
        </Button>
      </form>

      {showSuggestions && suggestions.length > 0 && (
        <ul className="absolute z-[100] bg-white border border-[#E5E5E1] w-full rounded-xl mt-2 shadow-2xl overflow-hidden py-2">
          {suggestions.map((s) => (
            <li 
              key={s} 
              className="px-6 py-3 hover:bg-muted cursor-pointer font-bold text-sm uppercase text-secondary flex items-center gap-3 transition-colors"
              onClick={() => selectSuggestion(s)}
            >
              <Search className="w-3 h-3 text-primary" /> {s}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
