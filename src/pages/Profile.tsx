import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import { LogOut, Star, ShieldCheck, Leaf, Loader2, Package } from 'lucide-react';
import { ListingCard } from '@/components/listings/ListingCard';
import type { Listing, Profile as ProfileType } from '@/types/database.types';

export default function Profile() {
  const { user, signOut } = useAuth();
  const [profile, setProfile] = useState<ProfileType | null>(null);
  const [myListings, setMyListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user?.id) fetchProfileData();
  }, [user]);

  const fetchProfileData = async () => {
    setLoading(true);
    try {
      const [profileRes, listingsRes] = await Promise.all([
        supabase.from('profiles').select('*').eq('id', user?.id).single(),
        supabase.from('listings').select('*, profiles(name, college_verified)').eq('user_id', user?.id)
      ]);

      if (profileRes.data) setProfile(profileRes.data);
      if (listingsRes.data) setMyListings(listingsRes.data as Listing[]);
    } catch (error) {
      console.error('Error fetching profile:', error);
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

  return (
    <div className="space-y-8 pb-20">
      
      {/* Profile Header — Apple Luxury Dark Chassis */}
      <div className="luxury-surface rounded-3xl p-6 sm:p-8 flex flex-col sm:flex-row items-center sm:items-start gap-6 text-center sm:text-left">
        <div className="w-20 h-20 rounded-2xl luxury-inset-sm flex items-center justify-center text-3xl font-bold text-white shrink-0">
          {profile?.name?.charAt(0) || user?.email?.charAt(0).toUpperCase() || 'U'}
        </div>
        
        <div className="flex-1 space-y-2">
          <div className="flex flex-col sm:flex-row sm:items-center gap-2.5">
            <h1 className="text-2xl font-bold tracking-tight text-white">
              {profile?.name || user?.email?.split('@')[0] || 'Campus Student'}
            </h1>
            {profile?.college_verified ? (
              <span className="luxury-pill text-blue-400 px-2.5 py-0.5 rounded-full text-xs font-semibold inline-flex items-center gap-1 mx-auto sm:mx-0">
                <ShieldCheck className="w-3.5 h-3.5" /> Verified Student
              </span>
            ) : (
              <span className="luxury-inset-sm text-zinc-400 px-2.5 py-0.5 rounded-full text-xs font-mono mx-auto sm:mx-0">
                Student Account
              </span>
            )}
          </div>
          
          <p className="text-xs text-zinc-400 font-mono tracking-tight">
            {profile?.department || 'Department'} · {profile?.semester || 'Campus Member'} · {user?.email}
          </p>
          
          <div className="flex flex-wrap justify-center sm:justify-start gap-2.5 pt-2">
            <div className="luxury-pill px-3 py-1 rounded-xl flex items-center gap-1.5 text-xs font-medium text-zinc-200">
              <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
              <span className="tabular-nums">{profile?.trust_score || '5.0'} Trust Index</span>
            </div>
            <div className="luxury-pill px-3 py-1 rounded-xl flex items-center gap-1.5 text-xs font-medium text-zinc-200">
              <Leaf className="w-3.5 h-3.5 text-emerald-400" />
              <span className="tabular-nums">{profile?.sustainability_score || 0} Eco Karma</span>
            </div>
          </div>
        </div>
        
        <button 
          onClick={signOut} 
          className="luxury-pill px-3.5 py-2 rounded-xl text-xs font-medium text-zinc-400 hover:text-red-400 transition-colors inline-flex items-center gap-1.5 shrink-0"
        >
          <LogOut className="w-3.5 h-3.5" />
          <span>Sign Out</span>
        </button>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="luxury-surface rounded-2xl p-4 text-center">
          <span className="font-mono text-[10px] uppercase tracking-widest text-zinc-500">Sold</span>
          <h3 className="text-2xl font-bold text-white mt-1 tabular-nums">
            {myListings.filter(l => l.type === 'sell').length}
          </h3>
        </div>
        <div className="luxury-surface rounded-2xl p-4 text-center">
          <span className="font-mono text-[10px] uppercase tracking-widest text-zinc-500">Borrowed / Lent</span>
          <h3 className="text-2xl font-bold text-white mt-1 tabular-nums">
            {myListings.filter(l => l.type === 'lend').length}
          </h3>
        </div>
        <div className="luxury-surface rounded-2xl p-4 text-center">
          <span className="font-mono text-[10px] uppercase tracking-widest text-zinc-500">Donations</span>
          <h3 className="text-2xl font-bold text-white mt-1 tabular-nums">
            {myListings.filter(l => l.type === 'free').length}
          </h3>
        </div>
        <div className="luxury-surface rounded-2xl p-4 text-center">
          <span className="font-mono text-[10px] uppercase tracking-widest text-zinc-500">Trust Rate</span>
          <h3 className="text-2xl font-bold text-emerald-400 mt-1 tabular-nums">
            100%
          </h3>
        </div>
      </div>

      {/* User's Listings Section */}
      <div className="space-y-4 pt-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
            My Published Listings
            <span className="font-mono text-xs font-normal text-zinc-500 tabular-nums">
              [ {myListings.length} ]
            </span>
          </h2>
        </div>
        
        {myListings.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {myListings.map(listing => (
              <ListingCard key={listing.id} listing={listing} />
            ))}
          </div>
        ) : (
          <div className="text-center py-16 px-4 rounded-3xl luxury-surface">
            <Package className="w-10 h-10 text-zinc-500 mx-auto mb-2 opacity-60" />
            <p className="text-base font-semibold text-white mb-1">No active listings posted yet</p>
            <p className="text-xs text-zinc-400 tracking-tight">Declutter your dorm room or lend unused books to your peers.</p>
          </div>
        )}
      </div>

    </div>
  );
}
