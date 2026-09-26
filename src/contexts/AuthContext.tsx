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
  sendSignInLinkToEmail,
  isSignInWithEmailLink,
  signInWithEmailLink,
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
  sendOneTimePasswordLink: (email: string, name?: string) => Promise<void>;
  completeOneTimePasswordSignIn: (email?: string) => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  sendPasswordReset: (email: string) => Promise<void>;
  collegeDomain: string;
  isFirebaseReady: boolean;
  isIncomingEmailLink: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [session, setSession] = useState<AppSession | null>(null);
  const [user, setUser] = useState<AppUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [isIncomingEmailLink, setIsIncomingEmailLink] = useState(false);

  const collegeDomain = import.meta.env.VITE_COLLEGE_EMAIL_DOMAIN || 'ch.students.amrita.edu';

  useEffect(() => {
    if (!isFirebaseConfigured) {
      console.warn('Firebase configuration missing. Please supply VITE_FIREBASE_* variables in .env');
      setLoading(false);
      return;
    }

    if (isSignInWithEmailLink(auth, window.location.href)) {
      setIsIncomingEmailLink(true);
    }

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

        // Synchronize with database profiles table
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

  const sendOneTimePasswordLink = async (email: string, name?: string) => {
    const trimmedEmail = email.trim().toLowerCase();
    const expectedDomain = collegeDomain.toLowerCase();

    if (expectedDomain && !trimmedEmail.endsWith(`@${expectedDomain}`)) {
      throw new Error(`Only institutional accounts (@${collegeDomain}) can request one-time access.`);
    }

    const actionCodeSettings = {
      url: `${window.location.origin}/login?emailLink=true`,
      handleCodeInApp: true,
    };

    await sendSignInLinkToEmail(auth, trimmedEmail, actionCodeSettings);
    window.localStorage.setItem('emailForSignIn', trimmedEmail);
    if (name?.trim()) {
      window.localStorage.setItem('nameForSignIn', name.trim());
    }
  };

  const completeOneTimePasswordSignIn = async (emailFromInput?: string) => {
    if (!isSignInWithEmailLink(auth, window.location.href)) {
      throw new Error('Invalid or expired authentication link.');
    }

    const email = emailFromInput?.trim().toLowerCase() || window.localStorage.getItem('emailForSignIn')?.toLowerCase();

    if (!email) {
      throw new Error('EMAIL_REQUIRED');
    }

    const expectedDomain = collegeDomain.toLowerCase();
    if (expectedDomain && !email.endsWith(`@${expectedDomain}`)) {
      throw new Error(`Only institutional accounts (@${collegeDomain}) are authorized.`);
    }

    const cred = await signInWithEmailLink(auth, email, window.location.href);
    window.localStorage.removeItem('emailForSignIn');

    const storedName = window.localStorage.getItem('nameForSignIn');
    if (storedName && cred.user) {
      await updateProfile(cred.user, { displayName: storedName });
      window.localStorage.removeItem('nameForSignIn');
    }

    window.history.replaceState({}, document.title, window.location.pathname);
    setIsIncomingEmailLink(false);
  };

  const signUpWithEmail = async (email: string, password: string, name: string) => {
    const trimmedEmail = email.trim().toLowerCase();
    const expectedDomain = collegeDomain.toLowerCase();

    if (expectedDomain && !trimmedEmail.endsWith(`@${expectedDomain}`)) {
      throw new Error(`Only institutional accounts (@${collegeDomain}) can create an account.`);
    }

    if (password.length < 6) {
      throw new Error('Password must be at least 6 characters.');
    }

    const cred = await createUserWithEmailAndPassword(auth, trimmedEmail, password);
    
    if (name.trim()) {
      await updateProfile(cred.user, { displayName: name.trim() });
    }

    try {
      await sendEmailVerification(cred.user);
    } catch (verifErr) {
      console.warn('Verification dispatch:', verifErr);
    }
  };

  const signInWithEmail = async (email: string, password: string) => {
    const trimmedEmail = email.trim().toLowerCase();
    const expectedDomain = collegeDomain.toLowerCase();

    if (expectedDomain && !trimmedEmail.endsWith(`@${expectedDomain}`)) {
      throw new Error(`Only institutional accounts (@${collegeDomain}) are authorized.`);
    }

    await signInWithEmailAndPassword(auth, trimmedEmail, password);
  };

  const signInWithGoogle = async () => {
    const cred = await signInWithPopup(auth, googleProvider);
    const userEmail = (cred.user.email || '').toLowerCase().trim();
    const expectedDomain = collegeDomain.toLowerCase();

    if (expectedDomain && !userEmail.endsWith(`@${expectedDomain}`)) {
      await firebaseSignOut(auth);
      throw new Error(`Access restricted to your institutional Google account (@${collegeDomain}).`);
    }
  };

  const sendPasswordReset = async (email: string) => {
    const trimmedEmail = email.trim().toLowerCase();
    const expectedDomain = collegeDomain.toLowerCase();

    if (expectedDomain && !trimmedEmail.endsWith(`@${expectedDomain}`)) {
      throw new Error(`Please enter your institutional email (@${collegeDomain}).`);
    }

    await sendPasswordResetEmail(auth, trimmedEmail);
  };

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
        signOut, 
        signInWithEmail, 
        signUpWithEmail, 
        sendOneTimePasswordLink,
        completeOneTimePasswordSignIn,
        signInWithGoogle, 
        sendPasswordReset, 
        collegeDomain, 
        loading,
        isFirebaseReady: isFirebaseConfigured,
        isIncomingEmailLink
      }}
    >
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
