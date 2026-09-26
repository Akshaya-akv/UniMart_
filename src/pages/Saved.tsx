import { useState, useEffect } from 'react';
import { ListingCard } from '@/components/listings/ListingCard';
import { Plus, Bookmark, Loader2 } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import type { Listing } from '@/types/database.types';

export default function Saved() {
  const { session } = useAuth();
  const [activeTab, setActiveTab] = useState<'saved' | 'requests'>('saved');
  const [savedListings, setSavedListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (session?.user.id) fetchSaved();
    else setLoading(false);
  }, [session]);

  const fetchSaved = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('saved_listings')
        .select(`
          listing_id,
          listings (*, profiles(name, college_verified))
        `)
        .eq('user_id', session?.user.id);
        
      if (error) throw error;
      
      const listings = (data?.map(item => item.listings) as unknown) as Listing[] || [];
      setSavedListings(listings);
    } catch (error) {
      console.error('Error fetching saved items:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8 pb-20">
      
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">Wishlist & Requests</h1>
        <p className="text-xs text-zinc-400 mt-1 tracking-tight">Keep track of saved campus deals and post buy-requests to your peers.</p>
      </div>

      {/* Segmented Dark Tabs */}
      <div className="p-1.5 rounded-2xl luxury-inset-sm inline-flex gap-1.5">
        <button
          onClick={() => setActiveTab('saved')}
          className={`px-5 py-2 rounded-xl text-xs font-semibold transition-all duration-150 tabular-nums ${
            activeTab === 'saved' 
              ? 'bg-white text-black shadow-sm' 
              : 'text-zinc-400 hover:text-white hover:bg-white/[0.05]'
          }`}
        >
          Saved Items ({savedListings.length})
        </button>
        <button
          onClick={() => setActiveTab('requests')}
          className={`px-5 py-2 rounded-xl text-xs font-semibold transition-all duration-150 ${
            activeTab === 'requests' 
              ? 'bg-white text-black shadow-sm' 
              : 'text-zinc-400 hover:text-white hover:bg-white/[0.05]'
          }`}
        >
          Campus Requests
        </button>
      </div>

      {/* Tab Content */}
      {activeTab === 'saved' && (
        <div>
          {loading ? (
            <div className="flex justify-center items-center py-24">
              <Loader2 className="w-8 h-8 animate-spin text-white" />
            </div>
          ) : savedListings.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {savedListings.map(listing => (
                <ListingCard key={listing.id} listing={listing} />
              ))}
            </div>
          ) : (
            <div className="text-center py-20 px-4 rounded-3xl luxury-surface">
              <Bookmark className="w-10 h-10 text-zinc-500 mx-auto mb-2 opacity-50" />
              <p className="text-base font-semibold text-white mb-1">Your wishlist is currently empty</p>
              <p className="text-xs text-zinc-400">Tap the heart icon on any gear or textbook to bookmark it for later.</p>
            </div>
          )}
        </div>
      )}

      {activeTab === 'requests' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-semibold text-white tracking-tight">Active Student Inquiries</h2>
            <button className="luxury-btn-white px-3.5 py-1.5 rounded-xl text-xs font-semibold inline-flex items-center gap-1.5">
              <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
              <span>Post Request</span>
            </button>
          </div>

          <div className="luxury-surface rounded-2xl p-5 space-y-3">
            <div className="flex justify-between items-start gap-4">
              <div>
                <span className="font-mono text-[10px] text-zinc-400 luxury-inset-sm px-2 py-0.5 rounded-md uppercase font-semibold">
                  Course Request · CS301
                </span>
                <h3 className="font-semibold text-white text-base mt-2 tracking-tight">
                  Looking for Operating Systems Concepts (Silberschatz Dinosaur book)
                </h3>
                <p className="text-xs text-zinc-400 mt-1 tracking-tight">
                  Need a clean physical copy for midterm preparation. Willing to buy or borrow for 2 weeks.
                </p>
              </div>

              <div className="text-right shrink-0">
                <span className="font-mono text-[10px] uppercase text-zinc-500 block">Target Budget</span>
                <span className="font-bold text-lg text-white tabular-nums">₹350</span>
              </div>
            </div>

            <div className="pt-3 border-t border-white/[0.08] flex items-center justify-between text-xs text-zinc-500 font-mono">
              <span>Posted by 3rd Year CS Student</span>
              <span className="text-emerald-400 font-medium">● Open to offers</span>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
