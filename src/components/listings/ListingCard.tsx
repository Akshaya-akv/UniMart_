import { Heart, ArrowUpRight, Book, Laptop, Sparkles, ShieldCheck, Tag } from 'lucide-react';
import type { Listing } from '@/types/database.types';
import { Link } from 'react-router-dom';
import { useState } from 'react';

export function ListingCard({ listing }: { listing: Listing }) {
  const [isSaved, setIsSaved] = useState(false);
  const sellerName = listing.profiles?.name || 'Campus Student';
  const isVerified = listing.profiles?.college_verified || false;

  const getCategoryIcon = () => {
    const cat = listing.category_id?.toLowerCase() || '';
    if (cat.includes('elect') || cat.includes('tech') || cat.includes('gadget')) {
      return <Laptop className="w-3.5 h-3.5 text-zinc-400" />;
    }
    if (cat.includes('book') || cat.includes('note') || cat.includes('academic')) {
      return <Book className="w-3.5 h-3.5 text-zinc-400" />;
    }
    return <Sparkles className="w-3.5 h-3.5 text-zinc-400" />;
  };

  const getTypeBadge = () => {
    switch (listing.type) {
      case 'free':
        return (
          <span className="font-mono text-[10px] font-semibold uppercase tracking-wider text-emerald-400 bg-emerald-950/50 border border-emerald-500/30 px-2 py-0.5 rounded-md">
            Free
          </span>
        );
      case 'lend':
        return (
          <span className="font-mono text-[10px] font-semibold uppercase tracking-wider text-amber-300 bg-amber-950/50 border border-amber-500/30 px-2 py-0.5 rounded-md">
            Borrow
          </span>
        );
      default:
        return (
          <span className="font-mono text-[10px] font-semibold uppercase tracking-wider text-zinc-300 bg-zinc-900/80 border border-white/[0.08] px-2 py-0.5 rounded-md">
            Sale
          </span>
        );
    }
  };

  return (
    <Link 
      to={`/listing/${listing.id}`} 
      className="group relative rounded-2xl luxury-surface-interactive p-4 sm:p-5 flex flex-col justify-between block select-none focus:outline-none focus-visible:ring-1 focus-visible:ring-white/30"
    >
      {/* Top Bar: Category Pill & Save Action */}
      <div className="flex items-center justify-between gap-2 mb-3">
        <div className="flex items-center gap-1.5">
          <span className="flex items-center gap-1 font-mono text-[10px] font-medium text-zinc-400 px-2.5 py-1 rounded-md luxury-inset-sm">
            {getCategoryIcon()}
            <span className="tracking-tight">{listing.category_id || 'General'}</span>
          </span>
          {getTypeBadge()}
        </div>

        <button 
          onClick={(e) => {
            e.preventDefault();
            setIsSaved(!isSaved);
          }}
          className="w-7 h-7 rounded-full luxury-pill flex items-center justify-center text-zinc-400 hover:text-rose-400 transition-colors"
          title={isSaved ? "Saved to wishlist" : "Save to wishlist"}
          aria-label={isSaved ? "Saved" : "Save"}
        >
          <Heart className={`w-3.5 h-3.5 transition-transform active:scale-125 ${isSaved ? 'fill-rose-500 text-rose-500' : ''}`} />
        </button>
      </div>

      {/* Image Container with Luxury Dark Backdrop */}
      <div className="relative aspect-[16/10] w-full rounded-xl overflow-hidden mb-4 luxury-inset-sm bg-black/60 flex items-center justify-center">
        {listing.image_url ? (
          <img 
            src={listing.image_url} 
            alt={listing.title} 
            className="w-full h-full object-cover transition-transform duration-500 ease-out group-hover:scale-105"
            loading="lazy"
            onError={(e) => {
              (e.target as HTMLElement).style.display = 'none';
            }}
          />
        ) : (
          <div className="flex flex-col items-center justify-center text-zinc-600 gap-1.5">
            <Tag className="w-6 h-6 stroke-[1.2]" />
            <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest">Campus Item</span>
          </div>
        )}

        {/* Condition Tag */}
        {listing.condition && (
          <span className="absolute bottom-2 left-2 font-mono text-[9px] uppercase font-semibold tracking-wider px-2 py-0.5 rounded bg-black/85 backdrop-blur-md text-zinc-300 border border-white/10">
            {listing.condition}
          </span>
        )}
      </div>

      {/* Content Section */}
      <div className="space-y-1 mb-4 flex-1">
        <h3 className="font-semibold text-white text-sm sm:text-base leading-snug line-clamp-1 tracking-tight group-hover:text-zinc-200 transition-colors">
          {listing.title}
        </h3>

        {/* Seller Info */}
        <div className="flex items-center gap-1.5 pt-1 text-xs text-zinc-400">
          <div className="w-4 h-4 rounded-full bg-zinc-800 text-zinc-300 flex items-center justify-center text-[9px] font-bold">
            {sellerName.charAt(0).toUpperCase()}
          </div>
          <span className="truncate max-w-[120px] tracking-tight">{sellerName}</span>
          {isVerified && (
            <span title="Verified Campus Student" className="inline-flex">
              <ShieldCheck className="w-3.5 h-3.5 text-zinc-300 shrink-0" />
            </span>
          )}
        </div>
      </div>

      {/* Bottom Pricing & CTA */}
      <div className="pt-3 border-t border-white/[0.08] flex items-center justify-between gap-2 mt-auto">
        <div className="flex flex-col">
          <span className="font-mono text-[9px] text-zinc-500 uppercase tracking-widest font-medium">
            {listing.type === 'lend' ? 'Deposit' : 'Price'}
          </span>
          <span className="font-bold text-base sm:text-lg text-white tracking-tight tabular-nums">
            {listing.type === 'free' ? 'FREE' : `₹${listing.price}`}
          </span>
        </div>

        <div className="luxury-btn-ghost px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1 group-hover:bg-white group-hover:text-black group-hover:border-white transition-all">
          <span>{listing.type === 'lend' ? 'Borrow' : 'View'}</span>
          <ArrowUpRight className="w-3 h-3 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
        </div>
      </div>
    </Link>
  );
}
