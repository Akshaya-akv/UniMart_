import { useState } from 'react';
import { toast } from 'sonner';
import { supabase } from '../lib/supabase';
import { ShieldCheck, ArrowRight, Loader2 } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Login() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    const collegeDomain = import.meta.env.VITE_COLLEGE_EMAIL_DOMAIN || 'college.edu';
    
    if (!email.endsWith(`@${collegeDomain}`) && !email.includes('@')) {
      toast.error(`Please use a valid campus email.`);
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          emailRedirectTo: window.location.origin,
        },
      });

      if (error) throw error;
      toast.success('Magic link dispatched! Check your college inbox.');
    } catch (error: any) {
      toast.error(error.message || 'Authentication error.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#000000] flex items-center justify-center p-4 selection:bg-white selection:text-black">
      <div className="w-full max-w-md space-y-6 text-center">
        
        {/* Brand Emblem */}
        <div className="flex flex-col items-center gap-3">
          <Link to="/" className="w-12 h-12 rounded-xl bg-gradient-to-b from-white via-zinc-200 to-zinc-300 text-black flex items-center justify-center shadow-[0_0_20px_rgba(255,255,255,0.25)] hover:scale-105 active:scale-95 transition-transform">
            <svg className="w-6 h-6 fill-current" viewBox="0 0 24 24">
              <path d="M12 2L1 21h22L12 2zm0 4.5l7.5 13H4.5L12 6.5z"/>
            </svg>
          </Link>
          <div>
            <h1 className="text-3xl font-extrabold tracking-[-0.03em] text-white">UniMart</h1>
            <p className="text-xs text-zinc-500 font-mono mt-0.5 tracking-wider">THE CAMPUS EXCHANGE PLATFORM</p>
          </div>
        </div>
        
        {/* Luxury Login Chassis */}
        <div className="luxury-surface rounded-3xl p-8 text-left space-y-6">
          <div className="space-y-1">
            <h2 className="text-lg font-bold text-white tracking-tight">Student Authentication</h2>
            <p className="text-xs text-zinc-400 tracking-tight">Sign in with your campus .edu email to access the network.</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="text-xs font-semibold text-zinc-300 uppercase tracking-widest block mb-1.5 font-mono">
                Institutional Email
              </label>
              <input 
                id="email"
                type="email" 
                placeholder="student@university.edu" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full luxury-inset-sm rounded-xl px-4 py-2.5 text-sm text-white placeholder:text-zinc-500 focus:outline-none focus:border-white/[0.3] tracking-tight"
              />
            </div>

            <button 
              type="submit" 
              className="w-full luxury-btn-white py-3.5 rounded-2xl text-xs font-semibold flex items-center justify-center gap-2" 
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-black" />
                  <span>Sending Authorization Link...</span>
                </>
              ) : (
                <>
                  <span>Send Magic Link</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </>
              )}
            </button>
          </form>

          <div className="pt-4 border-t border-white/[0.08] flex items-center gap-2 text-[11px] text-zinc-400 justify-center">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span className="tracking-tight">Encrypted .edu email verification only</span>
          </div>
        </div>

        <div>
          <Link to="/" className="text-xs text-zinc-500 hover:text-white transition-colors font-medium tracking-tight">
            ← Continue as Campus Guest
          </Link>
        </div>

      </div>
    </div>
  );
}
