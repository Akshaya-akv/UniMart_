import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { RootLayout } from './layouts/RootLayout';
import { Toaster } from '@/components/ui/sonner';

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

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { session, loading } = useAuth();

  if (loading) return <div className="flex min-h-screen items-center justify-center">Loading...</div>;
  if (!session) return <Navigate to="/login" replace />;

  return children;
};

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />

          <Route path="/" element={<RootLayout />}>
            {/* Some routes can be public, but for now we protect most for campus users */}
            <Route index element={<Home />} />
            <Route path="search" element={<Search />} />
            <Route path="listing/:id" element={<ListingDetails />} />

            <Route path="create" element={
              <ProtectedRoute>
                <CreateListing />
              </ProtectedRoute>
            } />
            <Route path="notes" element={
              <ProtectedRoute>
                <Notes />
              </ProtectedRoute>
            } />
            <Route path="saved" element={
              <ProtectedRoute>
                <Saved />
              </ProtectedRoute>
            } />
            <Route path="chats" element={
              <ProtectedRoute>
                <Chats />
              </ProtectedRoute>
            } />
            <Route path="profile" element={
              <ProtectedRoute>
                <Profile />
              </ProtectedRoute>
            } />
          </Route>
        </Routes>
      </BrowserRouter>
      <Toaster />
    </AuthProvider>
  );
}

export default App;