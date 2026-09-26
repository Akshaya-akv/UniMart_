import { useState, useEffect, useRef } from 'react';
import { toast } from 'sonner';
import { useAuth } from '../contexts/AuthContext';
import { 
  ShieldCheck, 
  ArrowRight, 
  Loader2, 
  KeyRound, 
  Mail, 
  User, 
  AlertCircle, 
  Send, 
  CheckCircle2, 
  Sparkles,
  RefreshCw,
  Hash
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';

export default function Login() {
  const navigate = useNavigate();
  const { 
    signInWithEmail, 
    signUpWithEmail, 
    sendDigitOtp,
    verifyDigitOtp,
    signInWithGoogle, 
    sendPasswordReset, 
    collegeDomain, 
    isFirebaseReady,
    user
  } = useAuth();

  // If already authenticated, redirect to home
  useEffect(() => {
    if (user) {
      navigate('/');
    }
  }, [user, navigate]);

  const [authMethod, setAuthMethod] = useState<'otp' | 'password'>('otp');
  const [passwordMode, setPasswordMode] = useState<'signin' | 'signup' | 'forgot'>('signin');
  
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  
  // 6-Digit OTP State
  const [otpDigits, setOtpDigits] = useState<string[]>(['', '', '', '', '', '']);
  const [otpSent, setOtpSent] = useState(false);
  const [cooldown, setCooldown] = useState(0);
  const [loading, setLoading] = useState(false);

  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  const isEmailValidDomain = !email || email.toLowerCase().trim().endsWith(`@${collegeDomain.toLowerCase()}`);

  // Resend cooldown timer
  useEffect(() => {
    if (cooldown > 0) {
      const timer = setTimeout(() => setCooldown(cooldown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [cooldown]);

  // Focus first OTP input when screen changes to OTP verification
  useEffect(() => {
    if (otpSent && inputRefs.current[0]) {
      inputRefs.current[0].focus();
    }
  }, [otpSent]);

  // Handle digit input change
  const handleDigitChange = (index: number, value: string) => {
    // Only accept numeric digits
    const cleaned = value.replace(/[^0-9]/g, '');
    if (!cleaned && value !== '') return;

    const newDigits = [...otpDigits];
    newDigits[index] = cleaned.slice(-1); // Take last character entered
    setOtpDigits(newDigits);

    // Auto-advance focus to next input
    if (cleaned && index < 5 && inputRefs.current[index + 1]) {
      inputRefs.current[index + 1]?.focus();
    }

    // Auto-submit if all 6 digits entered
    const combined = newDigits.join('');
    if (combined.length === 6 && !newDigits.includes('')) {
      handleVerifyOtp(combined);
    }
  };

  // Handle Backspace and Arrow keys
  const handleDigitKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace') {
      if (!otpDigits[index] && index > 0 && inputRefs.current[index - 1]) {
        // Move to previous and clear it
        const newDigits = [...otpDigits];
        newDigits[index - 1] = '';
        setOtpDigits(newDigits);
        inputRefs.current[index - 1]?.focus();
      } else {
        const newDigits = [...otpDigits];
        newDigits[index] = '';
        setOtpDigits(newDigits);
      }
    } else if (e.key === 'ArrowLeft' && index > 0) {
      inputRefs.current[index - 1]?.focus();
    } else if (e.key === 'ArrowRight' && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  // Handle paste of 6-digit code
  const handleDigitPaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').trim().replace(/[^0-9]/g, '');
    if (pasted.length === 6) {
      const chars = pasted.split('');
      setOtpDigits(chars);
      inputRefs.current[5]?.focus();
      handleVerifyOtp(pasted);
    }
  };

  // Dispatch 6-Digit OTP to college email
  const handleSendOtp = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const cleanEmail = email.trim().toLowerCase();

    if (!cleanEmail.endsWith(`@${collegeDomain.toLowerCase()}`)) {
      toast.error(`Institutional access only. Email must end with @${collegeDomain}`);
      return;
    }

    setLoading(true);
    try {
      await sendDigitOtp(cleanEmail);
      setOtpSent(true);
      setCooldown(30);
      setOtpDigits(['', '', '', '', '', '']);
      toast.success('6-digit code dispatched to your college inbox!');
    } catch (error: any) {
      console.error('OTP send error:', error);
      toast.error(error.message || 'Failed to dispatch verification code.');
    } finally {
      setLoading(false);
    }
  };

  // Verify 6-digit code
  const handleVerifyOtp = async (codeToVerify?: string) => {
    const code = codeToVerify || otpDigits.join('');
    if (code.length !== 6) {
      toast.error('Please enter all 6 digits of the confirmation code.');
      return;
    }

    setLoading(true);
    try {
      await verifyDigitOtp(email.trim().toLowerCase(), code, name);
      toast.success('Verification successful! Welcome to UniMart.');
      navigate('/');
    } catch (error: any) {
      console.error('OTP verification error:', error);
      toast.error(error.message || 'Invalid or expired confirmation code.');
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanEmail = email.trim().toLowerCase();

    if (!cleanEmail.endsWith(`@${collegeDomain.toLowerCase()}`)) {
      toast.error(`Institutional access only. Email must end with @${collegeDomain}`);
      return;
    }

    setLoading(true);
    try {
      if (passwordMode === 'signup') {
        if (!name.trim()) {
          toast.error('Please enter your full name.');
          setLoading(false);
          return;
        }
        await signUpWithEmail(cleanEmail, password, name);
        toast.success('Single student account registered! Welcome to UniMart.');
        navigate('/');
      } else if (passwordMode === 'signin') {
        await signInWithEmail(cleanEmail, password);
        toast.success('Welcome back to UniMart!');
        navigate('/');
      } else if (passwordMode === 'forgot') {
        await sendPasswordReset(cleanEmail);
        toast.success('Password reset link sent to your college inbox!');
        setPasswordMode('signin');
      }
    } catch (error: any) {
      console.error('Auth error:', error);
      const code = error.code;
      if (code === 'auth/email-already-in-use') {
        toast.error('An account already exists for this email. Please sign in.');
        setPasswordMode('signin');
      } else if (code === 'auth/invalid-credential' || code === 'auth/wrong-password') {
        toast.error('Invalid credentials. Check your password or reset it.');
      } else if (code === 'auth/user-not-found') {
        toast.error('No account found for this institutional email. Register below.');
        setPasswordMode('signup');
      } else if (code === 'auth/weak-password') {
        toast.error('Password must be at least 6 characters.');
      } else {
        toast.error(error.message || 'Authentication error.');
      }
    } finally {
      setLoading(false);
    }
  };

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

        {/* Configuration Notice if Firebase Keys Missing */}
        {!isFirebaseReady && (
          <div className="rounded-2xl border border-amber-500/30 bg-amber-950/20 p-4 text-left flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
            <div className="text-xs text-amber-200 space-y-1">
              <p className="font-semibold text-white">Firebase Setup Notice</p>
              <p className="text-amber-300/80 leading-relaxed">
                Connect your Firebase project credentials in <code className="bg-black/50 px-1 py-0.5 rounded text-white">.env</code> to activate cloud user sessions.
              </p>
            </div>
          </div>
        )}
        
        {/* Luxury Authentication Chassis */}
        <div className="luxury-surface rounded-3xl p-7 sm:p-8 text-left space-y-6">
          
          {/* Header & Primary Authentication Method Switcher */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold text-white tracking-tight">
                  {authMethod === 'otp' && (otpSent ? 'Confirm 6-Digit Code' : '6-Digit One-Time Password')}
                  {authMethod === 'password' && (passwordMode === 'signin' ? 'Password Sign In' : passwordMode === 'signup' ? 'Register Account' : 'Reset Password')}
                </h2>
                <p className="text-xs text-zinc-400 tracking-tight">
                  {authMethod === 'otp' 
                    ? (otpSent ? 'Enter the digits sent to your college mail.' : '6-digit confirmation code sent to your institutional email.')
                    : 'Institutional credentials with single student account policy.'}
                </p>
              </div>

              {/* Method Switcher Pills */}
              <div className="flex rounded-xl p-1 bg-black/40 border border-white/[0.08]">
                <button
                  type="button"
                  onClick={() => { setAuthMethod('otp'); setOtpSent(false); }}
                  className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                    authMethod === 'otp' 
                      ? 'bg-white text-black shadow-sm' 
                      : 'text-zinc-400 hover:text-white'
                  }`}
                >
                  6-Digit OTP
                </button>
                <button
                  type="button"
                  onClick={() => setAuthMethod('password')}
                  className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                    authMethod === 'password' 
                      ? 'bg-white text-black shadow-sm' 
                      : 'text-zinc-400 hover:text-white'
                  }`}
                >
                  Password
                </button>
              </div>
            </div>

            {/* Strict Domain Indicator */}
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-white/[0.04] border border-white/[0.08] text-[11px] font-mono text-zinc-400">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
              <span>Institutional Domain:</span>
              <span className="text-zinc-200 font-semibold">@{collegeDomain}</span>
            </div>
          </div>

          {/* 1-Click Institutional Google Workspace Auth */}
          {!otpSent && (
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
                  <span className="bg-[#09090b] px-3">or institutional 6-digit verification</span>
                </div>
              </div>
            </div>
          )}

          {/* METHOD 1: 6-DIGIT NUMERIC OTP FLOW */}
          {authMethod === 'otp' && (
            <div>
              {!otpSent ? (
                /* Step 1: Enter Email & Request 6 Digits */
                <form onSubmit={handleSendOtp} className="space-y-4">
                  <div>
                    <label className="text-[11px] font-semibold text-zinc-300 uppercase tracking-wider block mb-1.5 font-mono">
                      Student Name
                    </label>
                    <div className="relative flex items-center">
                      <User className="w-4 h-4 text-zinc-500 absolute left-3.5" />
                      <input 
                        type="text" 
                        placeholder="e.g. Rahul Sharma" 
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="w-full luxury-inset-sm rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:border-white/[0.3] tracking-tight"
                      />
                    </div>
                  </div>

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

                  <button 
                    type="submit" 
                    className="w-full luxury-btn-white py-3.5 rounded-2xl text-xs font-semibold flex items-center justify-center gap-2 disabled:opacity-50 mt-2" 
                    disabled={loading || !isEmailValidDomain || !email}
                  >
                    {loading ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin text-black" />
                        <span>Dispatching 6-Digit Code...</span>
                      </>
                    ) : (
                      <>
                        <Hash className="w-3.5 h-3.5" />
                        <span>Send 6-Digit Code</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </>
                    )}
                  </button>
                </form>
              ) : (
                /* Step 2: 6-Box Digit Input Screen */
                <div className="space-y-6 text-center">
                  <div className="w-12 h-12 rounded-2xl bg-white/[0.04] border border-white/[0.1] flex items-center justify-center mx-auto text-emerald-400">
                    <Hash className="w-6 h-6" />
                  </div>

                  <div className="space-y-1">
                    <p className="text-xs text-zinc-400">
                      Enter the 6-digit confirmation code sent to:
                      <br />
                      <span className="font-mono text-zinc-200 font-semibold">{email}</span>
                    </p>
                  </div>

                  {/* 6 Digit Input Boxes */}
                  <div className="flex justify-center gap-2 sm:gap-2.5" onPaste={handleDigitPaste}>
                    {otpDigits.map((digit, idx) => (
                      <input
                        key={idx}
                        ref={(el) => (inputRefs.current[idx] = el)}
                        type="text"
                        inputMode="numeric"
                        pattern="[0-9]*"
                        maxLength={1}
                        value={digit}
                        onChange={(e) => handleDigitChange(idx, e.target.value)}
                        onKeyDown={(e) => handleDigitKeyDown(idx, e)}
                        className={`w-11 h-14 sm:w-12 sm:h-14 rounded-2xl bg-[#09090b] border text-center font-mono text-xl font-bold text-white transition-all focus:outline-none ${
                          digit 
                            ? 'border-white text-white shadow-[0_0_12px_rgba(255,255,255,0.15)] ring-1 ring-white/30' 
                            : 'border-white/[0.12] hover:border-white/[0.24] focus:border-white focus:ring-2 focus:ring-white/20'
                        }`}
                      />
                    ))}
                  </div>

                  <button
                    type="button"
                    onClick={() => handleVerifyOtp()}
                    disabled={loading || otpDigits.includes('')}
                    className="w-full luxury-btn-white py-3.5 rounded-2xl text-xs font-semibold flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin text-black" />
                        <span>Verifying Digits...</span>
                      </>
                    ) : (
                      <>
                        <CheckCircle2 className="w-4 h-4" />
                        <span>Verify & Sign In</span>
                      </>
                    )}
                  </button>

                  <div className="flex items-center justify-between pt-2">
                    <button
                      type="button"
                      onClick={() => setOtpSent(false)}
                      className="text-xs text-zinc-500 hover:text-white transition-colors"
                    >
                      ← Change email
                    </button>

                    <button
                      type="button"
                      onClick={() => handleSendOtp()}
                      disabled={cooldown > 0 || loading}
                      className="text-xs text-zinc-400 hover:text-white transition-colors inline-flex items-center gap-1.5 disabled:opacity-40"
                    >
                      <RefreshCw className={`w-3 h-3 ${loading ? 'animate-spin' : ''}`} />
                      <span>{cooldown > 0 ? `Resend digits (${cooldown}s)` : 'Resend code'}</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* METHOD 2: PASSWORD AUTHENTICATION FLOW */}
          {authMethod === 'password' && (
            <div>
              {passwordMode !== 'forgot' && (
                <div className="flex items-center justify-center gap-3 mb-4 text-xs">
                  <button
                    type="button"
                    onClick={() => setPasswordMode('signin')}
                    className={`font-semibold pb-1 border-b-2 transition-all ${
                      passwordMode === 'signin' 
                        ? 'border-white text-white' 
                        : 'border-transparent text-zinc-500 hover:text-zinc-300'
                    }`}
                  >
                    Sign In
                  </button>
                  <span className="text-zinc-700">·</span>
                  <button
                    type="button"
                    onClick={() => setPasswordMode('signup')}
                    className={`font-semibold pb-1 border-b-2 transition-all ${
                      passwordMode === 'signup' 
                        ? 'border-white text-white' 
                        : 'border-transparent text-zinc-500 hover:text-zinc-300'
                    }`}
                  >
                    Register Single Account
                  </button>
                </div>
              )}

              <form onSubmit={handlePasswordSubmit} className="space-y-4">
                {passwordMode === 'signup' && (
                  <div>
                    <label className="text-[11px] font-semibold text-zinc-300 uppercase tracking-wider block mb-1.5 font-mono">
                      Full Name
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
                )}

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

                {passwordMode !== 'forgot' && (
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="text-[11px] font-semibold text-zinc-300 uppercase tracking-wider font-mono">
                        Password
                      </label>
                      {passwordMode === 'signin' && (
                        <button
                          type="button"
                          onClick={() => setPasswordMode('forgot')}
                          className="text-[10px] text-zinc-400 hover:text-white transition-colors"
                        >
                          Forgot password?
                        </button>
                      )}
                    </div>
                    <div className="relative flex items-center">
                      <KeyRound className="w-4 h-4 text-zinc-500 absolute left-3.5" />
                      <input 
                        type="password" 
                        placeholder="••••••••" 
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        minLength={6}
                        className="w-full luxury-inset-sm rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:border-white/[0.3] tracking-tight"
                      />
                    </div>
                  </div>
                )}

                <button 
                  type="submit" 
                  className="w-full luxury-btn-white py-3.5 rounded-2xl text-xs font-semibold flex items-center justify-center gap-2 disabled:opacity-50 mt-2" 
                  disabled={loading || !isEmailValidDomain}
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin text-black" />
                      <span>Authorizing...</span>
                    </>
                  ) : (
                    <>
                      <span>
                        {passwordMode === 'signin' && 'Sign In to Campus Exchange'}
                        {passwordMode === 'signup' && 'Register Single Student Account'}
                        {passwordMode === 'forgot' && 'Send Password Reset Link'}
                      </span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </>
                  )}
                </button>
              </form>

              {passwordMode === 'forgot' && (
                <div className="text-center pt-2">
                  <button
                    type="button"
                    onClick={() => setPasswordMode('signin')}
                    className="text-xs text-zinc-400 hover:text-white transition-colors"
                  >
                    ← Back to Sign In
                  </button>
                </div>
              )}
            </div>
          )}

          <div className="pt-4 border-t border-white/[0.08] flex items-center gap-2 text-[11px] text-zinc-400 justify-center">
            <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
            <span className="tracking-tight">
              One account per @{collegeDomain} student
            </span>
          </div>
        </div>

        <p className="text-[11px] text-zinc-600 font-mono tracking-tight">
          Protected Institutional Gateway · Verified University Network
        </p>

      </div>
    </div>
  );
}
