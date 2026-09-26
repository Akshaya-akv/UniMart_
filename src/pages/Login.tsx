import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { useAuth } from '../contexts/AuthContext';
import { 
  ShieldCheck, 
  ArrowRight, 
  Loader2, 
  KeyRound, 
  Mail, 
  User, 
  Lock,
  Eye,
  EyeOff
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';

export default function Login() {
  const navigate = useNavigate();
  const { 
    signInWithEmail, 
    signUpWithEmail,
    signInWithGoogle, 
    sendPasswordReset, 
    collegeDomain, 
    user
  } = useAuth();

  // If already authenticated, redirect to home
  useEffect(() => {
    if (user) {
      navigate('/');
    }
  }, [user, navigate]);

  // Clean 2-Way Slidebar: 'signin' | 'register'
  const [tab, setTab] = useState<'signin' | 'register'>('signin');
  const [isForgot, setIsForgot] = useState(false);

  // Form Fields
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  // Password Visibility Toggles
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [loading, setLoading] = useState(false);

  const isEmailValidDomain = !email || email.toLowerCase().trim().endsWith(`@${collegeDomain.toLowerCase()}`);
  const isPasswordValid = password.length >= 6;
  const doPasswordsMatch = password === confirmPassword;

  // Primary Register Flow with Mandatory Password via Firebase Auth
  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanEmail = email.trim().toLowerCase();

    if (!name.trim()) {
      toast.error('Please enter your full name.');
      return;
    }

    if (!cleanEmail.endsWith(`@${collegeDomain.toLowerCase()}`)) {
      toast.error(`Institutional access only. Email must end with @${collegeDomain}`);
      return;
    }

    if (!password) {
      toast.error('Password is mandatory for creating an account.');
      return;
    }

    if (password.length < 6) {
      toast.error('Password must be at least 6 characters long.');
      return;
    }

    if (password !== confirmPassword) {
      toast.error('Passwords do not match. Please re-enter your confirm password.');
      return;
    }

    setLoading(true);
    try {
      await signUpWithEmail(cleanEmail, password, name.trim());
      toast.success('Account created successfully! Welcome to UniMart.');
      navigate('/');
    } catch (error: any) {
      console.error('Firebase registration error:', error);
      if (error.code === 'auth/email-already-in-use') {
        toast.error('An account already exists for this institutional email. Switched to Sign In.');
        setTab('signin');
      } else if (error.code === 'auth/weak-password') {
        toast.error('Password is too weak. Please use at least 6 characters.');
      } else {
        toast.error(error.message || 'Failed to create student account.');
      }
    } finally {
      setLoading(false);
    }
  };

  // Sign In Flow (Email & Password via Firebase Auth)
  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanEmail = email.trim().toLowerCase();

    if (!cleanEmail.endsWith(`@${collegeDomain.toLowerCase()}`)) {
      toast.error(`Institutional access only. Email must end with @${collegeDomain}`);
      return;
    }

    setLoading(true);
    try {
      if (isForgot) {
        await sendPasswordReset(cleanEmail);
        toast.success('Password reset link sent to your college inbox!');
        setIsForgot(false);
      } else {
        await signInWithEmail(cleanEmail, password);
        toast.success('Welcome back to UniMart!');
        navigate('/');
      }
    } catch (error: any) {
      console.error('Firebase auth error:', error);
      const code = error.code;
      if (code === 'auth/invalid-credential' || code === 'auth/wrong-password') {
        toast.error('Invalid credentials. Check your password or use forgot password.');
      } else if (code === 'auth/user-not-found') {
        toast.error('No account found for this institutional email. Please register.');
        setTab('register');
      } else {
        toast.error(error.message || 'Authentication error.');
      }
    } finally {
      setLoading(false);
    }
  };

  // 1-Click Institutional Google SSO via Firebase Auth
  const handleGoogleSignIn = async () => {
    setLoading(true);
    try {
      await signInWithGoogle();
      toast.success('Successfully authenticated via College Google account!');
      navigate('/');
    } catch (error: any) {
      console.error('Google auth error:', error);
      if (error.code !== 'auth/popup-closed-by-user') {
        toast.error(error.message || 'Google sign-in failed.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#000000] flex items-center justify-center p-4 selection:bg-white selection:text-black">
      <div className="w-full max-w-md space-y-6 text-center">
        
        {/* Brand Emblem */}
        <div className="flex flex-col items-center gap-3">
          <Link 
            to="/" 
            className="w-12 h-12 rounded-xl bg-gradient-to-b from-white via-zinc-200 to-zinc-300 text-black flex items-center justify-center shadow-[0_0_20px_rgba(255,255,255,0.25)] hover:scale-105 active:scale-95 transition-transform"
          >
            <svg className="w-6 h-6 fill-current" viewBox="0 0 24 24">
              <path d="M12 2L1 21h22L12 2zm0 4.5l7.5 13H4.5L12 6.5z"/>
            </svg>
          </Link>
          <div>
            <h1 className="text-3xl font-extrabold tracking-[-0.03em] text-white">UniMart</h1>
            <p className="text-xs text-zinc-500 font-mono mt-0.5 tracking-wider">THE CAMPUS EXCHANGE PLATFORM</p>
          </div>
        </div>

        {/* Luxury Authentication Chassis */}
        <div className="luxury-surface rounded-3xl p-7 sm:p-8 text-left space-y-6">
          
          {/* Top Clean Slidebar Segmented Switcher: Sign In vs Register */}
          <div className="grid grid-cols-2 p-1 rounded-2xl bg-[#09090b] border border-white/[0.08] luxury-inset-sm">
            <button
              type="button"
              onClick={() => { 
                setTab('signin'); 
                setIsForgot(false); 
              }}
              className={`py-2.5 rounded-xl text-xs font-semibold transition-all duration-200 flex items-center justify-center gap-1.5 ${
                tab === 'signin'
                  ? 'bg-white text-black shadow-sm'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              <span>Sign In</span>
            </button>
            <button
              type="button"
              onClick={() => { 
                setTab('register'); 
                setIsForgot(false); 
              }}
              className={`py-2.5 rounded-xl text-xs font-semibold transition-all duration-200 flex items-center justify-center gap-1.5 ${
                tab === 'register'
                  ? 'bg-white text-black shadow-sm'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              <span>Register</span>
              <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-emerald-500/20 text-emerald-300 font-mono border border-emerald-500/30">New</span>
            </button>
          </div>

          {/* Section Header */}
          <div className="space-y-1">
            <h2 className="text-lg font-bold text-white tracking-tight">
              {tab === 'signin' && (isForgot ? 'Reset Password' : 'Sign in to UniMart')}
              {tab === 'register' && 'Create Student Account'}
            </h2>
            <p className="text-xs text-zinc-400 tracking-tight">
              {tab === 'signin' && (isForgot ? 'Enter your institutional email to recover access.' : 'Access your verified student account.')}
              {tab === 'register' && 'One verified account per student. Password is mandatory.'}
            </p>

            {/* Institutional Domain Tag */}
            <div className="pt-1.5">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-lg bg-white/[0.04] border border-white/[0.08] text-[11px] font-mono text-zinc-400">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                <span>Domain:</span>
                <span className="text-zinc-200 font-semibold">@{collegeDomain}</span>
              </span>
            </div>
          </div>

          {/* 1-Click Institutional Google SSO via Firebase */}
          <div>
            <button
              type="button"
              onClick={handleGoogleSignIn}
              disabled={loading}
              className="w-full py-2.5 px-4 rounded-xl border border-white/[0.12] bg-[#0c0c10] hover:bg-[#15151c] hover:border-white/[0.22] text-xs font-medium text-white flex items-center justify-center gap-2.5 transition-all active:scale-[0.99] disabled:opacity-50"
            >
              <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
              </svg>
              <span>Continue with Campus Google (@{collegeDomain})</span>
            </button>

            <div className="relative my-4">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-white/[0.08]" />
              </div>
              <div className="relative flex justify-center text-[10px] uppercase font-mono tracking-widest text-zinc-500">
                <span className="bg-[#09090b] px-3">
                  {tab === 'register' ? 'or register with email & mandatory password' : 'or institutional credentials'}
                </span>
              </div>
            </div>
          </div>

          {/* TAB 1: REGISTER WITH MANDATORY PASSWORD (PURE FIREBASE AUTH) */}
          {tab === 'register' && (
            <form onSubmit={handleRegister} className="space-y-4">
              {/* Student Full Name */}
              <div>
                <label className="text-[11px] font-semibold text-zinc-300 uppercase tracking-wider block mb-1.5 font-mono">
                  Student Full Name <span className="text-rose-400">*</span>
                </label>
                <div className="relative flex items-center">
                  <User className="w-4 h-4 text-zinc-500 absolute left-3.5" />
                  <input 
                    type="text" 
                    placeholder="e.g. Rahul Sharma" 
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    className="w-full luxury-inset-sm rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:border-white/[0.3] tracking-tight"
                  />
                </div>
              </div>

              {/* Institutional Email */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-[11px] font-semibold text-zinc-300 uppercase tracking-wider font-mono">
                    Institutional Email <span className="text-rose-400">*</span>
                  </label>
                  {!isEmailValidDomain && (
                    <span className="text-[10px] font-mono text-amber-400">
                      Must end with @{collegeDomain}
                    </span>
                  )}
                </div>
                <div className="relative flex items-center">
                  <Mail className="w-4 h-4 text-zinc-500 absolute left-3.5" />
                  <input 
                    type="email" 
                    placeholder={`student@${collegeDomain}`} 
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className={`w-full luxury-inset-sm rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder:text-zinc-600 focus:outline-none tracking-tight transition-colors ${
                      !isEmailValidDomain ? 'border-amber-500/50' : 'focus:border-white/[0.3]'
                    }`}
                  />
                </div>
              </div>

              {/* Mandatory Password */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-[11px] font-semibold text-zinc-300 uppercase tracking-wider font-mono">
                    Password (Mandatory) <span className="text-rose-400">*</span>
                  </label>
                  <span className={`text-[10px] font-mono ${password.length >= 6 ? 'text-emerald-400' : 'text-zinc-500'}`}>
                    {password.length > 0 && (password.length >= 6 ? '✓ Valid length' : 'Min 6 chars')}
                  </span>
                </div>
                <div className="relative flex items-center">
                  <Lock className="w-4 h-4 text-zinc-500 absolute left-3.5" />
                  <input 
                    type={showPassword ? 'text' : 'password'} 
                    placeholder="At least 6 characters" 
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    minLength={6}
                    className="w-full luxury-inset-sm rounded-xl pl-10 pr-10 py-2.5 text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:border-white/[0.3] tracking-tight"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 text-zinc-500 hover:text-zinc-300 transition-colors"
                    tabIndex={-1}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Mandatory Confirm Password */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-[11px] font-semibold text-zinc-300 uppercase tracking-wider font-mono">
                    Confirm Password <span className="text-rose-400">*</span>
                  </label>
                  {confirmPassword.length > 0 && (
                    <span className={`text-[10px] font-mono ${doPasswordsMatch ? 'text-emerald-400' : 'text-rose-400'}`}>
                      {doPasswordsMatch ? '✓ Passwords match' : '✕ Passwords do not match'}
                    </span>
                  )}
                </div>
                <div className="relative flex items-center">
                  <KeyRound className="w-4 h-4 text-zinc-500 absolute left-3.5" />
                  <input 
                    type={showConfirmPassword ? 'text' : 'password'} 
                    placeholder="Re-enter your password" 
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    minLength={6}
                    className={`w-full luxury-inset-sm rounded-xl pl-10 pr-10 py-2.5 text-sm text-white placeholder:text-zinc-600 focus:outline-none tracking-tight transition-colors ${
                      confirmPassword.length > 0 && !doPasswordsMatch ? 'border-rose-500/50' : 'focus:border-white/[0.3]'
                    }`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 text-zinc-500 hover:text-zinc-300 transition-colors"
                    tabIndex={-1}
                  >
                    {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Submit Button */}
              <button 
                type="submit" 
                className="w-full luxury-btn-white py-3.5 rounded-2xl text-xs font-semibold flex items-center justify-center gap-2 disabled:opacity-50 mt-2" 
                disabled={loading || !isEmailValidDomain || !email || !name.trim() || !isPasswordValid || !doPasswordsMatch}
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin text-black" />
                    <span>Creating Your Single Student Account...</span>
                  </>
                ) : (
                  <>
                    <ShieldCheck className="w-3.5 h-3.5" />
                    <span>Create Single Student Account</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </>
                )}
              </button>
            </form>
          )}

          {/* TAB 2: SIGN IN (PURE FIREBASE AUTH) */}
          {tab === 'signin' && (
            <div>
              <form onSubmit={handleSignIn} className="space-y-4">
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-[11px] font-semibold text-zinc-300 uppercase tracking-wider font-mono">
                      Institutional Email
                    </label>
                    {!isEmailValidDomain && (
                      <span className="text-[10px] font-mono text-amber-400">
                        Must end with @{collegeDomain}
                      </span>
                    )}
                  </div>
                  <div className="relative flex items-center">
                    <Mail className="w-4 h-4 text-zinc-500 absolute left-3.5" />
                    <input 
                      type="email" 
                      placeholder={`student@${collegeDomain}`} 
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      className={`w-full luxury-inset-sm rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder:text-zinc-600 focus:outline-none tracking-tight transition-colors ${
                        !isEmailValidDomain ? 'border-amber-500/50' : 'focus:border-white/[0.3]'
                      }`}
                    />
                  </div>
                </div>

                {!isForgot && (
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="text-[11px] font-semibold text-zinc-300 uppercase tracking-wider font-mono">
                        Password
                      </label>
                      <button
                        type="button"
                        onClick={() => setIsForgot(true)}
                        className="text-[10px] text-zinc-400 hover:text-white transition-colors"
                      >
                        Forgot password?
                      </button>
                    </div>
                    <div className="relative flex items-center">
                      <Lock className="w-4 h-4 text-zinc-500 absolute left-3.5" />
                      <input 
                        type={showPassword ? 'text' : 'password'} 
                        placeholder="••••••••" 
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        className="w-full luxury-inset-sm rounded-xl pl-10 pr-10 py-2.5 text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:border-white/[0.3] tracking-tight"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 text-zinc-500 hover:text-zinc-300 transition-colors"
                        tabIndex={-1}
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>
                )}

                <button 
                  type="submit" 
                  className="w-full luxury-btn-white py-3.5 rounded-2xl text-xs font-semibold flex items-center justify-center gap-2 disabled:opacity-50 mt-2" 
                  disabled={loading || !isEmailValidDomain || !email}
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin text-black" />
                      <span>Authorizing...</span>
                    </>
                  ) : (
                    <>
                      <span>{isForgot ? 'Send Password Reset Link' : 'Sign In to Campus Exchange'}</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </>
                  )}
                </button>
              </form>

              {isForgot && (
                <div className="text-center pt-2">
                  <button
                    type="button"
                    onClick={() => setIsForgot(false)}
                    className="text-xs text-zinc-400 hover:text-white transition-colors"
                  >
                    ← Back to Sign In
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Institutional Single Account Badge */}
          <div className="pt-4 border-t border-white/[0.08] flex items-center gap-2 text-[11px] text-zinc-400 justify-center">
            <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
            <span className="tracking-tight">
              One verified account per @{collegeDomain} student
            </span>
          </div>
        </div>

        <p className="text-[11px] text-zinc-600 font-mono tracking-tight">
          Protected Institutional Gateway · Pure Firebase Authentication
        </p>

      </div>
    </div>
  );
}
