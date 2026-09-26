import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search as SearchIcon, Loader2, X, SlidersHorizontal } from 'lucide-react';
import { CATEGORIES } from '@/lib/mockData';
import { ListingCard } from '@/components/listings/ListingCard';
import { supabase } from '@/lib/supabase';
import type { Listing } from '@/types/database.types';

export default function Search() {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialQuery = searchParams.get('q') || '';
  
  const [query, setQuery] = useState(initialQuery);
  const [debouncedQuery, setDebouncedQuery] = useState(initialQuery);
  const [activeFilter, setActiveFilter] = useState<string | null>(null);
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(query);
      if (query) {
        setSearchParams({ q: query });
      } else {
        setSearchParams({});
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [query]);

  useEffect(() => {
    fetchListings();
  }, [debouncedQuery, activeFilter]);

  const fetchListings = async () => {
    setLoading(true);
    try {
      let queryBuilder = supabase
        .from('listings')
        .select(`*, profiles(name, college_verified)`)
        .eq('status', 'active');

      if (debouncedQuery) {
        queryBuilder = queryBuilder.ilike('title', `%${debouncedQuery}%`);
      }

      if (activeFilter) {
        if (['sell', 'lend', 'free'].includes(activeFilter)) {
          queryBuilder = queryBuilder.eq('type', activeFilter);
        } else {
          queryBuilder = queryBuilder.eq('category_id', activeFilter);
        }
      }

      const { data, error } = await queryBuilder;
      if (error) throw error;
      setListings(data as Listing[] || []);
    } catch (error) {
      console.error('Error fetching search results:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8 pb-20">
      
      {/* Header & Search Bar */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">Campus Catalog</h1>
            <p className="text-xs text-zinc-400 font-normal tracking-tight">Search and filter active listings across all campus departments.</p>
          </div>
          <span className="font-mono text-xs text-zinc-500 tabular-nums">
            {listings.length} items found
          </span>
        </div>

        {/* Clean Luxury Search Bar */}
        <div className="relative flex items-center w-full bg-[#0a0a0d] border border-white/[0.1] hover:border-white/[0.18] rounded-2xl px-4 py-3 focus-within:border-white/[0.3] focus-within:ring-1 focus-within:ring-white/20 transition-all">
          <SearchIcon className="h-4 w-4 text-zinc-500 shrink-0 mr-3" />
          <input 
            autoFocus
            type="text"
            placeholder="Search textbooks (DBMS, OS), electronics, lab kits..." 
            className="w-full bg-transparent text-sm text-white placeholder:text-zinc-500 focus:outline-none tracking-tight"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          {query && (
            <button 
              onClick={() => setQuery('')}
              className="p-1 rounded-full text-zinc-400 hover:text-white hover:bg-white/10 transition-colors"
              aria-label="Clear search"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Filter Rail */}
      <div className="p-1.5 rounded-2xl luxury-inset-sm flex gap-1.5 overflow-x-auto scrollbar-hide">
        <button
          onClick={() => setActiveFilter(null)}
          className={`px-3.5 py-1.5 rounded-xl text-xs font-medium transition-all duration-150 whitespace-nowrap ${
            activeFilter === null 
              ? 'bg-white text-black font-semibold shadow-sm' 
              : 'text-zinc-400 hover:text-white hover:bg-white/[0.05]'
          }`}
        >
          All
        </button>

        {['sell', 'lend', 'free'].map(type => (
          <button 
            key={type}
            onClick={() => setActiveFilter(type)}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-medium capitalize transition-all duration-150 whitespace-nowrap ${
              activeFilter === type 
                ? 'bg-white text-black font-semibold shadow-sm' 
                : 'text-zinc-400 hover:text-white hover:bg-white/[0.05]'
            }`}
          >
            {type === 'lend' ? 'Borrow / Lend' : type}
          </button>
        ))}

        <div className="w-[1px] h-4 bg-zinc-800 my-auto mx-1 shrink-0" />

        {CATEGORIES.map(cat => (
          <button 
            key={cat}
            onClick={() => setActiveFilter(cat)}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-medium transition-all duration-150 whitespace-nowrap ${
              activeFilter === cat 
                ? 'bg-white text-black font-semibold shadow-sm' 
                : 'text-zinc-400 hover:text-white hover:bg-white/[0.05]'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Results Grid */}
      {loading ? (
        <div className="flex justify-center items-center py-24">
          <Loader2 className="w-7 h-7 animate-spin text-white" />
        </div>
      ) : listings.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {listings.map(listing => (
            <ListingCard key={listing.id} listing={listing} />
          ))}
        </div>
      ) : (
        <div className="text-center py-20 px-4 rounded-3xl luxury-surface">
          <div className="w-12 h-12 rounded-2xl luxury-inset-sm flex items-center justify-center mx-auto mb-3 text-zinc-500">
            <SlidersHorizontal className="w-5 h-5" />
          </div>
          <p className="text-base font-semibold text-white mb-1">No matching campus listings</p>
          <p className="text-xs text-zinc-400 max-w-sm mx-auto mb-5">
            Try adjusting your search terms or clearing the current category filter.
          </p>
          <button 
            onClick={() => { setQuery(''); setActiveFilter(null); }}
            className="luxury-btn-white px-4 py-2 rounded-xl text-xs font-semibold"
          >
            Reset Filters
          </button>
        </div>
      )}
    </div>
  );
}
