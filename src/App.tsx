import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { RootLayout } from './layouts/RootLayout';
import { Toaster } from '@/components/ui/sonner';
import { Loader2 } from 'lucide-react';

// Pages
import Home from './pages/Home';
import Search from './pages/Search';
import CreateListing from './pages/CreateListing';
import Chats from './pages/Chats';
import Profile from './pages/Profile';
import Login from './pages/Login';
import ListingDetails from './pages/ListingDetails';
import Saved from './pages/Saved';
import Notes from './pages/Notes';

// Gated Protected Route: Forces unauthenticated visitors directly to the Login page
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { session, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex min-h-screen bg-[#000000] items-center justify-center flex-col gap-3">
        <div className="w-10 h-10 rounded-xl bg-white text-black flex items-center justify-center shadow-[0_0_20px_rgba(255,255,255,0.2)]">
          <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
            <path d="M12 2L1 21h22L12 2zm0 4.5l7.5 13H4.5L12 6.5z"/>
          </svg>
        </div>
        <div className="flex items-center gap-2 text-xs font-mono text-zinc-400">
          <Loader2 className="w-3.5 h-3.5 animate-spin text-white" />
          <span>Verifying campus session...</span>
        </div>
      </div>
    );
  }

  if (!session) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public Authentication Portal - Shown First to All Visitors */}
          <Route path="/login" element={<Login />} />

          {/* Gated Application - Entire Platform Accessible Only After Login */}
          <Route path="/" element={
            <ProtectedRoute>
              <RootLayout />
            </ProtectedRoute>
          }>
            <Route index element={<Home />} />
            <Route path="search" element={<Search />} />
            <Route path="listing/:id" element={<ListingDetails />} />
            <Route path="create" element={<CreateListing />} />
            <Route path="notes" element={<Notes />} />
            <Route path="saved" element={<Saved />} />
            <Route path="chats" element={<Chats />} />
            <Route path="profile" element={<Profile />} />
          </Route>

          {/* Catch-all redirect back to root (which prompts login if unauthenticated) */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
      <Toaster />
    </AuthProvider>
  );
}

export default App;