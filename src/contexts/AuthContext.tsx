import React, { createContext, useContext, useEffect, useState } from 'react';
import { 
  auth, 
  googleProvider,
  signInWithPopup, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  firebaseSignOut, 
  onAuthStateChanged,
  updateProfile,
  sendEmailVerification,
  sendPasswordResetEmail,
  isFirebaseConfigured
} from '../lib/firebase';
import { supabase } from '../lib/supabase';

export interface AppUser {
  id: string;
  uid: string;
  email: string | null;
  displayName: string | null;
  emailVerified: boolean;
  college_verified: boolean;
  user_metadata?: {
    name?: string;
  };
}

export interface AppSession {
  user: AppUser;
}

interface AuthContextType {
  session: AppSession | null;
  user: AppUser | null;
  loading: boolean;
  signOut: () => Promise<void>;
  signInWithEmail: (email: string, password: string) => Promise<void>;
  signUpWithEmail: (email: string, password: string, name: string) => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  sendPasswordReset: (email: string) => Promise<void>;
  collegeDomain: string;
  isFirebaseReady: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [session, setSession] = useState<AppSession | null>(null);
  const [user, setUser] = useState<AppUser | null>(null);
  const [loading, setLoading] = useState(true);

  const collegeDomain = import.meta.env.VITE_COLLEGE_EMAIL_DOMAIN || 'ch.students.amrita.edu';

  useEffect(() => {
    if (!isFirebaseConfigured) {
      console.warn('Firebase configuration missing. Please supply VITE_FIREBASE_* variables in .env');
      setLoading(false);
      return;
    }

    // Pure Firebase Auth state listener
    const unsubscribe = onAuthStateChanged(auth, async (fbUser) => {
      if (fbUser) {
        const userEmail = (fbUser.email || '').toLowerCase().trim();
        const expectedDomain = collegeDomain.toLowerCase();

        // Enforce strict college email domain access
        if (expectedDomain && !userEmail.endsWith(`@${expectedDomain}`)) {
          await firebaseSignOut(auth);
          setUser(null);
          setSession(null);
          setLoading(false);
          return;
        }

        const appUser: AppUser = {
          id: fbUser.uid,
          uid: fbUser.uid,
          email: fbUser.email,
          displayName: fbUser.displayName || fbUser.email?.split('@')[0] || 'Campus Student',
          emailVerified: fbUser.emailVerified,
          college_verified: true,
          user_metadata: {
            name: fbUser.displayName || fbUser.email?.split('@')[0] || 'Campus Student'
          }
        };

        setUser(appUser);
        setSession({ user: appUser });

        // Synchronize with database profiles table (Supabase used strictly for database storage)
        try {
          await supabase.from('profiles').upsert({
            id: fbUser.uid,
            name: appUser.displayName,
            email: fbUser.email,
            college_verified: true
          }, { onConflict: 'id' });
        } catch (syncErr) {
          console.warn('Profiles table sync:', syncErr);
        }
      } else {
        setUser(null);
        setSession(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [collegeDomain]);

  // Pure Firebase Email & Mandatory Password Registration
  const signUpWithEmail = async (email: string, password: string, name: string) => {
    const trimmedEmail = email.trim().toLowerCase();
    const expectedDomain = collegeDomain.toLowerCase();

    if (expectedDomain && !trimmedEmail.endsWith(`@${expectedDomain}`)) {
      throw new Error(`Only institutional accounts (@${collegeDomain}) can create an account.`);
    }

    if (!password || password.length < 6) {
      throw new Error('Password is mandatory and must be at least 6 characters.');
    }

    // 1. Create account directly via Firebase Authentication
    const cred = await createUserWithEmailAndPassword(auth, trimmedEmail, password);
    const displayName = name.trim() || trimmedEmail.split('@')[0];
    
    // 2. Update Firebase user profile
    if (name.trim()) {
      try {
        await updateProfile(cred.user, { displayName });
      } catch (profErr) {
        console.warn('updateProfile error:', profErr);
      }
    }

    // 3. Synchronize user profile into PostgreSQL database
    try {
      await supabase.from('profiles').upsert({
        id: cred.user.uid,
        name: displayName,
        email: trimmedEmail,
        college_verified: true,
      }, { onConflict: 'id' });
    } catch (profileErr) {
      console.warn('Profile sync:', profileErr);
    }

    // 4. Update local user state immediately
    const appUser: AppUser = {
      id: cred.user.uid,
      uid: cred.user.uid,
      email: trimmedEmail,
      displayName: displayName,
      emailVerified: cred.user.emailVerified,
      college_verified: true,
      user_metadata: {
        name: displayName
      }
    };
    setUser(appUser);
    setSession({ user: appUser });

    // 5. Send Firebase verification email (non-blocking)
    try {
      await sendEmailVerification(cred.user);
    } catch (verifErr) {
      console.warn('Verification dispatch:', verifErr);
    }
  };

  // Pure Firebase Email & Password Sign In
  const signInWithEmail = async (email: string, password: string) => {
    const trimmedEmail = email.trim().toLowerCase();
    const expectedDomain = collegeDomain.toLowerCase();

    if (expectedDomain && !trimmedEmail.endsWith(`@${expectedDomain}`)) {
      throw new Error(`Only institutional accounts (@${collegeDomain}) are authorized.`);
    }

    await signInWithEmailAndPassword(auth, trimmedEmail, password);
  };

  // Pure Firebase Google SSO with institutional domain check
  const signInWithGoogle = async () => {
    const cred = await signInWithPopup(auth, googleProvider);
    const userEmail = (cred.user.email || '').toLowerCase().trim();
    const expectedDomain = collegeDomain.toLowerCase();

    if (expectedDomain && !userEmail.endsWith(`@${expectedDomain}`)) {
      await firebaseSignOut(auth);
      throw new Error(`Access restricted to your institutional Google account (@${collegeDomain}).`);
    }
  };

  // Pure Firebase Password Reset
  const sendPasswordReset = async (email: string) => {
    const trimmedEmail = email.trim().toLowerCase();
    const expectedDomain = collegeDomain.toLowerCase();

    if (expectedDomain && !trimmedEmail.endsWith(`@${expectedDomain}`)) {
      throw new Error(`Please enter your institutional email (@${collegeDomain}).`);
    }

    await sendPasswordResetEmail(auth, trimmedEmail);
  };

  // Pure Firebase Sign Out
  const signOut = async () => {
    await firebaseSignOut(auth);
    setUser(null);
    setSession(null);
  };

  return (
    <AuthContext.Provider 
      value={{ 
        session, 
        user, 
        loading,
        signOut, 
        signInWithEmail, 
        signUpWithEmail, 
        signInWithGoogle, 
        sendPasswordReset, 
        collegeDomain,
        isFirebaseReady: isFirebaseConfigured
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
