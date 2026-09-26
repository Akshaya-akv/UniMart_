import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { CATEGORIES } from '@/lib/mockData';
import { ListingCard } from '@/components/listings/ListingCard';
import { Search, ShieldCheck, Zap, BookOpen, Layers, Plus } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import type { Listing } from '@/types/database.types';

export default function Home() {
  const navigate = useNavigate();
  const searchInputRef = useRef<HTMLInputElement>(null);
  const [activeCategory, setActiveCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchListings();
  }, [activeCategory]);

  const fetchListings = async () => {
    setLoading(true);
    try {
      let query = supabase
        .from('listings')
        .select(`*, profiles(name, college_verified)`)
        .eq('status', 'active')
        .order('created_at', { ascending: false });

      if (activeCategory !== 'All') {
        query = query.eq('category_id', activeCategory);
      }

      const { data, error } = await query;
      if (error) throw error;
      setListings(data as Listing[] || []);
    } catch (error) {
      console.error('Error fetching listings:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
    } else {
      navigate('/search');
    }
  };

  return (
    <div className="space-y-16 pb-20 pt-4 md:pt-10">
      
      {/* Hero Section — Titanium Sheen & Apple Pro Keynote Aesthetic */}
      <section className="flex flex-col items-center text-center space-y-7 max-w-3xl mx-auto">
        
        {/* Status Pill */}
        <div className="luxury-pill px-4 py-1.5 rounded-full inline-flex items-center gap-2 text-xs font-mono text-zinc-300 font-medium">
          <span className="w-2 h-2 rounded-full bg-emerald-400 relative">
            <span className="absolute -inset-0.5 rounded-full bg-emerald-400/40 animate-ping" />
          </span>
          <span className="tracking-wide">CAMPUS PROTOCOL 2.0</span>
          <span className="text-zinc-600">/</span>
          <span className="text-zinc-400 font-normal tracking-tight">VERIFIED PEER EXCHANGE</span>
        </div>

        {/* Hero Title with Apple Titanium Sheen */}
        <h1 className="text-4xl sm:text-6xl md:text-7xl font-extrabold tracking-[-0.035em] leading-[1.05]">
          <span className="titanium-title block">The Campus Exchange.</span>
          <span className="titanium-sub font-normal block mt-1">Engineered for Precision.</span>
        </h1>

        <p className="text-sm sm:text-base text-zinc-400 max-w-xl leading-relaxed font-normal tracking-tight">
          Trade textbooks, scientific hardware, and verified lecture notes directly with campus peers. Zero markups. Verified university accounts only.
        </p>

        {/* Clean Unified Search Console - Perfectly Centered Inset Button with Ambient Glow */}
        <div className="relative w-full max-w-xl mx-auto group">
          {/* Subtle Ambient Radial Glow behind Search Console on Focus/Hover */}
          <div className="absolute -inset-1 rounded-full bg-gradient-to-r from-sky-500/15 via-white/10 to-emerald-500/15 opacity-0 group-hover:opacity-100 group-focus-within:opacity-100 transition-opacity duration-700 blur-xl -z-10" />

          <form 
            onSubmit={handleSearchSubmit} 
            className="w-full flex items-center bg-[#09090b]/80 backdrop-blur-xl border border-white/[0.12] hover:border-white/[0.24] focus-within:border-white/[0.4] focus-within:ring-2 focus-within:ring-white/10 transition-all rounded-full pl-4 pr-1.5 py-1.5 shadow-[0_8px_32px_rgba(0,0,0,0.8)]"
          >
            <Search className="w-4 h-4 text-zinc-400 shrink-0 mr-3" />
            <input 
              ref={searchInputRef}
              type="text" 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search course codes (CS201), textbooks, electronics..." 
              className="flex-1 bg-transparent text-white placeholder:text-zinc-500 focus:outline-none text-sm tracking-tight py-2 min-w-0"
            />
            <button 
              type="submit" 
              className="h-10 px-6 rounded-full bg-white text-black font-semibold text-xs tracking-tight hover:bg-zinc-200 active:scale-[0.98] transition-all shrink-0 flex items-center justify-center shadow-sm select-none"
            >
              Search
            </button>
          </form>
        </div>

        {/* Clean Precision Feature Boxes - Monochromatic Hairline Tiles with Frosted Depth */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 w-full pt-2">
          <div className="group rounded-2xl border border-white/[0.08] bg-[#09090b]/75 backdrop-blur-md hover:bg-[#0e0e12]/90 hover:border-white/[0.18] p-4 transition-all duration-200 flex items-center gap-3.5 text-left">
            <div className="w-9 h-9 rounded-xl bg-white/[0.04] border border-white/[0.08] flex items-center justify-center shrink-0 group-hover:bg-white/[0.08] group-hover:border-white/[0.16] transition-all">
              <ShieldCheck className="w-4 h-4 text-zinc-300 group-hover:text-white transition-colors stroke-[1.5]" />
            </div>
            <div>
              <p className="text-xs font-semibold text-white tracking-tight">.EDU Verified</p>
              <p className="text-[11px] text-zinc-400 tracking-tight mt-0.5">Zero anonymous accounts</p>
            </div>
          </div>

          <div className="group rounded-2xl border border-white/[0.08] bg-[#09090b]/75 backdrop-blur-md hover:bg-[#0e0e12]/90 hover:border-white/[0.18] p-4 transition-all duration-200 flex items-center gap-3.5 text-left">
            <div className="w-9 h-9 rounded-xl bg-white/[0.04] border border-white/[0.08] flex items-center justify-center shrink-0 group-hover:bg-white/[0.08] group-hover:border-white/[0.16] transition-all">
              <Zap className="w-4 h-4 text-zinc-300 group-hover:text-white transition-colors stroke-[1.5]" />
            </div>
            <div>
              <p className="text-xs font-semibold text-white tracking-tight">Zero Platform Fees</p>
              <p className="text-[11px] text-zinc-400 tracking-tight mt-0.5">Direct peer hand-offs</p>
            </div>
          </div>

          <div className="group rounded-2xl border border-white/[0.08] bg-[#09090b]/75 backdrop-blur-md hover:bg-[#0e0e12]/90 hover:border-white/[0.18] p-4 transition-all duration-200 flex items-center gap-3.5 text-left">
            <div className="w-9 h-9 rounded-xl bg-white/[0.04] border border-white/[0.08] flex items-center justify-center shrink-0 group-hover:bg-white/[0.08] group-hover:border-white/[0.16] transition-all">
              <BookOpen className="w-4 h-4 text-zinc-300 group-hover:text-white transition-colors stroke-[1.5]" />
            </div>
            <div>
              <p className="text-xs font-semibold text-white tracking-tight">Notes & Exam Hub</p>
              <p className="text-[11px] text-zinc-400 tracking-tight mt-0.5">Peer study materials</p>
            </div>
          </div>
        </div>

      </section>

      {/* Explore Section */}
      <section className="space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-white/[0.08] pb-4">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-white flex items-center gap-2">
              Explore Marketplace
              <span className="font-mono text-xs font-normal text-zinc-500">
                [ {listings.length} Active ]
              </span>
            </h2>
            <p className="text-xs text-zinc-400 mt-0.5 tracking-tight">Filter by category or browse recent listings across campus.</p>
          </div>

          {/* Quick List Action */}
          <button 
            onClick={() => navigate('/create')}
            className="luxury-btn-white px-4 py-2 rounded-xl text-xs font-semibold inline-flex items-center gap-1.5"
          >
            <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
            <span>List Gear</span>
          </button>
        </div>

        {/* Category Selector */}
        <div className="p-1.5 rounded-2xl luxury-inset-sm flex gap-1.5 overflow-x-auto scrollbar-hide">
          <button
            onClick={() => setActiveCategory('All')}
            className={`px-4 py-2 rounded-xl text-xs font-medium transition-all duration-150 whitespace-nowrap ${
              activeCategory === 'All'
                ? 'bg-white text-black font-semibold shadow-sm'
                : 'text-zinc-400 hover:text-white hover:bg-white/[0.05]'
            }`}
          >
            All Categories
          </button>
          {CATEGORIES.map(cat => (
            <button 
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-4 py-2 rounded-xl text-xs font-medium transition-all duration-150 whitespace-nowrap ${
                activeCategory === cat
                  ? 'bg-white text-black font-semibold shadow-sm'
                  : 'text-zinc-400 hover:text-white hover:bg-white/[0.05]'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Listings Grid with Luxury Skeletons */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 py-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="luxury-surface rounded-2xl p-5 space-y-4 animate-pulse">
                <div className="h-4 w-24 bg-zinc-800/80 rounded" />
                <div className="aspect-[16/10] bg-zinc-800/40 rounded-xl" />
                <div className="h-5 w-3/4 bg-zinc-800/80 rounded" />
                <div className="h-4 w-1/2 bg-zinc-800/50 rounded" />
              </div>
            ))}
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
              <Layers className="w-6 h-6" />
            </div>
            <p className="text-base font-semibold text-white mb-1">No items found in {activeCategory}</p>
            <p className="text-xs text-zinc-400 max-w-sm mx-auto mb-6">
              Be the first student to list something in this category or check back later!
            </p>
            <button 
              onClick={() => navigate('/create')}
              className="luxury-btn-white px-4 py-2 rounded-xl text-xs font-semibold inline-flex items-center gap-2"
            >
              <Plus className="w-4 h-4 stroke-[2.5]" />
              <span>Post New Listing</span>
            </button>
          </div>
        )}
      </section>

    </div>
  );
}
