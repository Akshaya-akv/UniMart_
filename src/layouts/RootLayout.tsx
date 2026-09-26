import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { useEffect } from 'react';
import { 
  Compass, 
  Search, 
  FileText, 
  Plus, 
  Heart, 
  MessageSquare, 
  User, 
  LogOut 
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

export const RootLayout = () => {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const { user, signOut } = useAuth();

  // Smooth Global Keyboard Shortcut (⌘K or / to open/focus search)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        navigate('/search');
      } else if (e.key === '/' && document.activeElement?.tagName !== 'INPUT' && document.activeElement?.tagName !== 'TEXTAREA') {
        e.preventDefault();
        navigate('/search');
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [navigate]);

  const navLinks = [
    { name: 'Browse', path: '/', icon: Compass },
    { name: 'Search', path: '/search', icon: Search },
    { name: 'Notes Hub', path: '/notes', icon: FileText },
    { name: 'Messages', path: '/chats', icon: MessageSquare },
    { name: 'Saved', path: '/saved', icon: Heart },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-[#050507] text-[#f4f4f6] font-sans antialiased selection:bg-white selection:text-black relative overflow-x-hidden">
      
      {/* Dynamic Ambient Background Architecture (Vercel & Apple Pro Aesthetics) */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden -z-10 select-none">
        
        {/* Layer 1: Top Edge Laser Horizon Shimmer */}
        <div className="absolute top-0 inset-x-0 h-[1px] bg-gradient-to-r from-transparent via-white/20 to-transparent overflow-hidden">
          <div className="w-1/3 h-full bg-gradient-to-r from-transparent via-white/80 to-transparent animate-beam-shimmer" />
        </div>

        {/* Layer 2: Precision Engineering Grid with Vignette Mask */}
        <div 
          className="absolute inset-0 opacity-40 animate-grid-breath"
          style={{
            backgroundImage: `linear-gradient(to right, rgba(255, 255, 255, 0.04) 1px, transparent 1px), linear-gradient(to bottom, rgba(255, 255, 255, 0.04) 1px, transparent 1px)`,
            backgroundSize: '48px 48px',
            maskImage: 'radial-gradient(ellipse 70% 60% at 50% 10%, #000 30%, transparent 80%)',
            WebkitMaskImage: 'radial-gradient(ellipse 70% 60% at 50% 10%, #000 30%, transparent 80%)'
          }}
        />

        {/* Layer 3: Central Pure Titanium Keynote Spotlight (Pulses smoothly) */}
        <div className="absolute top-0 left-1/2 w-[720px] h-[360px] rounded-full bg-gradient-to-b from-white/[0.08] via-zinc-400/[0.02] to-transparent blur-[110px] animate-pulse-glow" />

        {/* Layer 4: Deep Azure / Ice Cobalt Floating Orb (Drifts smoothly top-left) */}
        <div className="absolute -top-16 -left-20 w-[580px] h-[480px] rounded-full bg-gradient-to-br from-sky-500/[0.12] via-blue-600/[0.03] to-transparent blur-[130px] animate-ambient-1" />

        {/* Layer 5: Stealth Emerald Mint Protocol Aura (Drifts top-right) */}
        <div className="absolute -top-10 -right-20 w-[520px] h-[420px] rounded-full bg-gradient-to-bl from-emerald-500/[0.09] via-teal-600/[0.02] to-transparent blur-[130px] animate-ambient-2" />

        {/* Layer 6: Mid-Body Floating Ambient Core */}
        <div 
          className="absolute top-[38%] left-1/2 -translate-x-1/2 w-[850px] h-[550px] rounded-full bg-[radial-gradient(ellipse_at_center,rgba(56,189,248,0.04)_0%,rgba(255,255,255,0.015)_45%,transparent_70%)] blur-[140px] animate-ambient-1" 
          style={{ animationDirection: 'reverse', animationDuration: '22s' }} 
        />

        {/* Layer 7: Bottom Grounding Vignette (Prevents visual clipping into black) */}
        <div className="absolute bottom-0 inset-x-0 h-64 bg-gradient-to-t from-[#000000] via-[#000000]/60 to-transparent" />
      </div>

      {/* Top Header - Apple / Vercel Ultra-Luxury Frosted Glass Dock */}
      <header className="sticky top-0 z-40 w-full px-4 sm:px-8 pt-4 pb-2">
        <div className="max-w-6xl mx-auto flex items-center justify-between h-16 px-5 sm:px-6 rounded-2xl luxury-dock">
          
          {/* Brand Mark */}
          <Link to="/" className="flex items-center gap-3 group focus:outline-none">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-b from-white via-zinc-200 to-zinc-300 text-black flex items-center justify-center shadow-[0_0_15px_rgba(255,255,255,0.2)] transition-transform group-hover:scale-105 active:scale-95">
              <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                <path d="M12 2L1 21h22L12 2zm0 4.5l7.5 13H4.5L12 6.5z"/>
              </svg>
            </div>
            <div className="flex flex-col">
              <span className="font-bold text-sm tracking-[-0.02em] text-white flex items-center gap-1.5">
                UniMart
                <span className="font-mono text-[9px] px-1.5 py-0.5 rounded bg-zinc-900 text-zinc-300 border border-white/[0.08] tracking-widest font-semibold">STUDIO</span>
              </span>
              <span className="font-mono text-[10px] text-zinc-500 -mt-0.5 hidden sm:inline-block tracking-tight">campus precision exchange</span>
            </div>
          </Link>

          {/* Desktop Navigation - Smooth Minimalist Pills */}
          <nav className="hidden md:flex items-center gap-1 p-1 rounded-xl luxury-inset-sm">
            {navLinks.map((link) => {
              const isActive = pathname === link.path;
              return (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all duration-150 ${
                    isActive
                      ? 'bg-white text-black shadow-sm font-semibold'
                      : 'text-zinc-400 hover:text-white hover:bg-white/[0.05]'
                  }`}
                >
                  {link.name}
                </Link>
              );
            })}
          </nav>

          {/* Right Action Stack */}
          <div className="flex items-center gap-2.5">
            {/* Quick Search Trigger */}
            <Link
              to="/search"
              className="hidden lg:flex items-center gap-2 px-3 py-1.5 rounded-xl luxury-inset-sm text-xs text-zinc-400 hover:text-white hover:border-white/[0.15] transition-all"
              title="Search"
            >
              <Search className="w-3.5 h-3.5 text-zinc-500" />
              <span className="tracking-tight">Search</span>
            </Link>

            <Link
              to="/create"
              className="hidden sm:inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl luxury-btn-white text-xs font-semibold"
            >
              <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
              <span>List Item</span>
            </Link>

            {user ? (
              <div className="flex items-center gap-2">
                <Link
                  to="/profile"
                  className="w-9 h-9 rounded-xl luxury-pill flex items-center justify-center text-zinc-300 hover:text-white transition-all"
                  title="Profile"
                >
                  <User className="w-4 h-4" />
                </Link>
                <button
                  onClick={signOut}
                  className="p-2 rounded-xl text-zinc-400 hover:text-red-400 transition-colors hidden sm:inline-block"
                  title="Sign Out"
                >
                  <LogOut className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              <Link
                to="/login"
                className="px-3.5 py-1.5 rounded-xl luxury-btn-ghost text-xs font-medium"
              >
                Sign In
              </Link>
            )}
          </div>

        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 w-full max-w-6xl mx-auto px-4 sm:px-8 py-8 md:py-12">
        <Outlet />
      </main>

      {/* Apple-style Floating Bottom Dock for Mobile */}
      <div className="md:hidden fixed bottom-4 inset-x-0 z-50 flex justify-center px-4 pointer-events-none">
        <nav className="flex items-center justify-around w-full max-w-sm px-4 py-2 rounded-full luxury-dock pointer-events-auto">
          <Link
            to="/"
            className={`p-2 rounded-full transition-colors ${
              pathname === '/' ? 'text-white bg-white/10' : 'text-zinc-500 hover:text-zinc-300'
            }`}
            aria-label="Home"
          >
            <Compass className="w-5 h-5" />
          </Link>
          <Link
            to="/search"
            className={`p-2 rounded-full transition-colors ${
              pathname === '/search' ? 'text-white bg-white/10' : 'text-zinc-500 hover:text-zinc-300'
            }`}
            aria-label="Search"
          >
            <Search className="w-5 h-5" />
          </Link>
          <Link
            to="/create"
            className="w-9 h-9 -my-1 rounded-full bg-white text-black flex items-center justify-center shadow-[0_0_15px_rgba(255,255,255,0.25)] active:scale-95 transition-transform"
            aria-label="Create Listing"
          >
            <Plus className="w-5 h-5 stroke-[2.5]" />
          </Link>
          <Link
            to="/notes"
            className={`p-2 rounded-full transition-colors ${
              pathname === '/notes' ? 'text-white bg-white/10' : 'text-zinc-500 hover:text-zinc-300'
            }`}
            aria-label="Notes"
          >
            <FileText className="w-5 h-5" />
          </Link>
          <Link
            to={user ? "/profile" : "/login"}
            className={`p-2 rounded-full transition-colors ${
              pathname === '/profile' ? 'text-white bg-white/10' : 'text-zinc-500 hover:text-zinc-300'
            }`}
            aria-label="Profile"
          >
            <User className="w-5 h-5" />
          </Link>
        </nav>
      </div>

      {/* Vercel / Apple Minimalist Luxury Footer */}
      <footer className="w-full mt-auto border-t border-white/[0.08] bg-[#000000] text-zinc-500 text-xs py-10 px-6 sm:px-12">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <span className="w-2 h-2 rounded-full bg-emerald-400 relative">
              <span className="absolute -inset-0.5 rounded-full bg-emerald-400/40 animate-ping" />
            </span>
            <span className="font-mono text-zinc-300 text-[11px] tracking-tight">Campus Grid: Operational</span>
            <span className="text-zinc-700">·</span>
            <span className="font-mono text-zinc-500 text-[11px] tracking-tight">Verified .edu Network</span>
          </div>
          <div className="flex items-center gap-6 font-medium text-zinc-400">
            <Link to="/search" className="hover:text-white transition-colors">Catalog</Link>
            <Link to="/notes" className="hover:text-white transition-colors">Academic Notes</Link>
            <Link to="/saved" className="hover:text-white transition-colors">Wishlist</Link>
            <span className="font-mono text-zinc-600 text-[11px]">© {new Date().getFullYear()} UniMart Studio</span>
          </div>
        </div>
      </footer>
    </div>
  );
};
