import { useParams, useNavigate } from 'react-router-dom';
import { Heart, MapPin, ArrowLeft, MessageCircle, AlertTriangle, Loader2, ShieldCheck, Tag, Calendar } from 'lucide-react';
import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { supabase } from '@/lib/supabase';
import type { Listing } from '@/types/database.types';

export default function ListingDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [listing, setListing] = useState<Listing | null>(null);
  const [loading, setLoading] = useState(true);
  const [isSaved, setIsSaved] = useState(false);

  useEffect(() => {
    if (id) fetchListing();
  }, [id]);

  const fetchListing = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('listings')
        .select(`*, profiles(name, college_verified, department, semester)`)
        .eq('id', id)
        .single();
        
      if (error) throw error;
      setListing(data as Listing);
    } catch (error) {
      console.error('Error fetching listing:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-24">
        <Loader2 className="w-8 h-8 animate-spin text-white" />
      </div>
    );
  }

  if (!listing) {
    return (
      <div className="text-center py-20 luxury-surface rounded-3xl max-w-lg mx-auto p-8">
        <h2 className="text-xl font-bold mb-2 text-white">Item Not Found</h2>
        <p className="text-xs text-zinc-400 mb-6">This listing may have been sold or removed by the seller.</p>
        <button onClick={() => navigate('/')} className="luxury-btn-white px-4 py-2 rounded-xl text-xs font-semibold">
          Return to Marketplace
        </button>
      </div>
    );
  }

  const sellerName = listing.profiles?.name || 'Campus Student';
  const isVerified = listing.profiles?.college_verified || false;

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-20">
      
      {/* Navigation Breadcrumb */}
      <div>
        <button 
          onClick={() => navigate(-1)} 
          className="luxury-pill px-3 py-1.5 rounded-xl text-xs font-medium text-zinc-400 hover:text-white inline-flex items-center gap-1.5 transition-all"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
        
        {/* Left Column: Image Preview Card */}
        <div className="luxury-surface rounded-3xl p-3 space-y-3">
          <div className="relative aspect-square w-full rounded-2xl overflow-hidden luxury-inset-sm bg-black/60 flex items-center justify-center">
            {listing.image_url ? (
              <img 
                src={listing.image_url} 
                alt={listing.title} 
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="flex flex-col items-center justify-center text-zinc-600 gap-2">
                <Tag className="w-12 h-12 stroke-[1.2]" />
                <span className="font-mono text-xs uppercase tracking-widest text-zinc-500">Campus Gear</span>
              </div>
            )}

            {/* Type Overlay */}
            <div className="absolute top-3 left-3">
              <span className="font-mono text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-lg bg-black/85 backdrop-blur-md text-white border border-white/20">
                {listing.type === 'lend' ? 'Borrow' : listing.type}
              </span>
            </div>
          </div>
        </div>

        {/* Right Column: Details & Actions */}
        <div className="luxury-surface rounded-3xl p-6 sm:p-8 space-y-6">
          
          {/* Header & Wishlist Button */}
          <div>
            <div className="flex items-start justify-between gap-4">
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white leading-tight">
                {listing.title}
              </h1>
              
              <button 
                onClick={() => {
                  setIsSaved(!isSaved);
                  toast.success(isSaved ? 'Removed from saved wishlist' : 'Added to your wishlist');
                }}
                className="w-10 h-10 rounded-full luxury-pill flex items-center justify-center text-zinc-400 hover:text-rose-500 transition-colors shrink-0"
                aria-label="Wishlist"
              >
                <Heart className={`w-5 h-5 transition-transform active:scale-125 ${isSaved ? 'fill-rose-500 text-rose-500' : ''}`} />
              </button>
            </div>

            {/* Price Row */}
            <div className="mt-3 flex items-baseline gap-2">
              <span className="text-3xl font-bold tracking-tight text-white tabular-nums">
                {listing.type === 'free' ? 'FREE' : `₹${listing.price}`}
              </span>
              {listing.type === 'lend' && (
                <span className="text-xs text-zinc-400 font-mono">(Refundable Deposit)</span>
              )}
            </div>
          </div>

          {/* Metadata Chips */}
          <div className="flex flex-wrap gap-2 pt-1">
            <span className="font-mono text-xs text-zinc-300 luxury-inset-sm px-2.5 py-1 rounded-lg">
              {listing.category_id}
            </span>
            <span className="font-mono text-xs text-zinc-300 luxury-inset-sm px-2.5 py-1 rounded-lg">
              Condition: {listing.condition || 'Good'}
            </span>
            {listing.course_code && (
              <span className="font-mono text-xs text-white font-semibold luxury-pill px-2.5 py-1 rounded-lg">
                {listing.course_code}
              </span>
            )}
          </div>

          {/* Description */}
          <div className="space-y-1.5 pt-2 border-t border-white/[0.08]">
            <h3 className="font-mono text-xs uppercase tracking-widest text-zinc-500 font-semibold">Description</h3>
            <p className="text-sm text-zinc-300 leading-relaxed whitespace-pre-wrap tracking-tight">
              {listing.description}
            </p>
          </div>

          {/* Lend Details if Applicable */}
          {listing.type === 'lend' && listing.return_date && (
            <div className="luxury-inset-sm p-3.5 rounded-2xl flex items-center gap-3">
              <Calendar className="w-5 h-5 text-amber-400 shrink-0" />
              <div>
                <p className="text-xs font-semibold text-white">Borrow Duration</p>
                <p className="text-[11px] text-zinc-400">Return by: {new Date(listing.return_date).toLocaleDateString()}</p>
              </div>
            </div>
          )}

          {/* Seller Card & Actions */}
          <div className="pt-4 border-t border-white/[0.08] space-y-4">
            <div className="luxury-inset-sm p-3 rounded-2xl flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-white text-black flex items-center justify-center font-bold text-sm shrink-0">
                {sellerName.charAt(0).toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5">
                  <span className="font-semibold text-sm text-white truncate">{sellerName}</span>
                  {isVerified && (
                    <span title="Verified Campus Student" className="inline-flex">
                      <ShieldCheck className="w-4 h-4 text-zinc-300 shrink-0" />
                    </span>
                  )}
                </div>
                <p className="text-[11px] text-zinc-400 font-mono">
                  {listing.department || 'Engineering'} · {listing.semester || 'Campus'}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 text-xs text-zinc-400 px-1">
              <MapPin className="w-3.5 h-3.5 text-zinc-500" />
              <span>Campus Hand-off (Library / Canteen / Dorm)</span>
            </div>

            <div className="flex gap-2.5 pt-1">
              <button 
                onClick={() => navigate('/chats')}
                className="flex-1 luxury-btn-white py-3 rounded-2xl text-xs font-semibold flex items-center justify-center gap-2"
              >
                <MessageCircle className="w-4 h-4 stroke-[2.5]" />
                <span>Message Seller</span>
              </button>
              <button 
                onClick={() => toast.success('Report submitted for campus moderation.')}
                className="w-11 h-11 rounded-2xl luxury-pill flex items-center justify-center text-zinc-400 hover:text-red-400 transition-colors shrink-0"
                title="Report Listing"
                aria-label="Report"
              >
                <AlertTriangle className="w-4 h-4" />
              </button>
            </div>

          </div>

        </div>

      </div>

    </div>
  );
}
