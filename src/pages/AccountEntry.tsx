import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Logo } from '../components/layout/Logo';
import { SignUpForm } from '../components/auth/SignUpForm';
import { SignInForm } from '../components/auth/SignInForm';
import { OTPVerifyScreen } from '../components/auth/OTPVerifyScreen';
import { getAvailableMethods } from '../api/auth';
import type { OTPPurpose } from '../types';

type Tab = 'signup' | 'signin';

type Stage =
  | { type: 'form' }
  | {
      type: 'otp';
      purpose: OTPPurpose;
      identifier: string;   // always the email OTP was sent to
      expiresIn: number;
      devOtp?: string;
      signupData?: { name: string; email: string; mobile: string };
    };

export function AccountEntryPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const from = (location.state as { from?: string } | null)?.from ?? '/';

  const [tab,            setTab]           = useState<Tab>('signin');
  const [stage,          setStage]         = useState<Stage>({ type: 'form' });
  const [methodsLoading, setMethodsLoading] = useState(true);

  // Just check connectivity — we don't need method selection anymore
  useEffect(() => {
    getAvailableMethods().finally(() => setMethodsLoading(false));
  }, []);

  if (methodsLoading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-gray-200 border-t-gold-500 rounded-full animate-spin" aria-label="Loading" />
      </div>
    );
  }

  // ── Handlers ────────────────────────────────────────────────────────────────

  const handleSignupOTPSent = (data: {
    name: string; email: string; mobile: string;
    identifier: string; expiresIn: number; devOtp?: string;
  }) => {
    setStage({
      type: 'otp', purpose: 'signup',
      identifier: data.identifier,
      expiresIn:  data.expiresIn,
      devOtp:     data.devOtp,
      signupData: { name: data.name, email: data.email, mobile: data.mobile },
    });
  };

  const handleSigninOTPSent = (data: {
    identifier: string; expiresIn: number; devOtp?: string;
  }) => {
    setStage({
      type: 'otp', purpose: 'signin',
      identifier: data.identifier,
      expiresIn:  data.expiresIn,
      devOtp:     data.devOtp,
    });
  };

  const handleSuccess = () => {
    const state = location.state as { 
      from?: string; 
      productId?: number;
      action?: 'cart' | 'wishlist';
    } | null;
    
    const destination = (state?.from && state.from !== '/login') ? state.from : '/';
    
    // Pass along the action to execute
    if (state?.action && state?.productId) {
      navigate(destination, { 
        replace: true, 
        state: { executeAction: state.action, productId: state.productId }
      });
    } else {
      navigate(destination, { replace: true });
    }
  };

  // ── Render ───────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-white flex flex-col lg:flex-row">

      {/* ── Left brand panel (desktop) ── */}
      <div className="hidden lg:flex lg:w-1/2 bg-brown-800 relative overflow-hidden flex-col items-center justify-center p-12">
        <div className="absolute inset-0 pointer-events-none overflow-hidden" aria-hidden>
          <div className="absolute -top-32 -left-32 w-96 h-96 rounded-full border border-gold-600/20" />
          <div className="absolute -bottom-20 -right-20 w-72 h-72 rounded-full border border-gold-600/15" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full border border-gold-600/10" />
        </div>
        <div className="relative text-center space-y-6 max-w-sm">
          <div className="flex flex-col items-center gap-3">
            <img src="/logo.svg" alt="Gayathri Jewellers" className="w-20 h-20 rounded-full" />
            <div>
              <span className="block font-serif text-4xl font-bold text-white leading-tight">Gayathri</span>
              <span className="block font-sans text-xs tracking-[0.3em] uppercase text-gold-400 mt-1">Jewellers</span>
            </div>
          </div>
          <div className="w-12 h-px bg-gold-500 mx-auto" />
          <p className="font-serif text-lg text-white/80 leading-relaxed italic">
            "Every piece of jewellery carries the spirit of the hands that made it."
          </p>
          <p className="text-sm text-white/40 font-sans">
            Premium Gold · Silver · One Gram Gold · Stones
          </p>
        </div>
      </div>

      {/* ── Right form panel ── */}
      <div className="flex-1 flex flex-col items-center justify-center min-h-screen lg:min-h-0 px-4 py-10 bg-white">

        {/* Mobile logo */}
        <div className="lg:hidden mb-8">
          <Logo size="lg" variant="dark" />
        </div>

        <div className="w-full max-w-md">
          <div className="bg-white rounded-2xl shadow-card border border-gray-100 p-7 sm:p-9">

            {stage.type === 'otp' ? (
              /* ── OTP Verify ── */
              <OTPVerifyScreen
                purpose={stage.purpose}
                identifier={stage.identifier}
                deliveryMethod="email"
                expiresIn={stage.expiresIn}
                devOtp={stage.devOtp}
                signupData={stage.signupData}
                onBack={() => setStage({ type: 'form' })}
                onSuccess={handleSuccess}
              />
            ) : (
              /* ── Sign Up / Sign In ── */
              <>
                {/* Tabs */}
                <div className="flex rounded-xl bg-gray-100 p-1 mb-7" role="tablist" aria-label="Account options">
                  {(['signin', 'signup'] as Tab[]).map(t => (
                    <button
                      key={t}
                      role="tab"
                      aria-selected={tab === t}
                      onClick={() => setTab(t)}
                      className={`flex-1 py-2.5 rounded-lg text-sm font-sans font-semibold transition-all duration-150 ${
                        tab === t
                          ? 'bg-white text-brown-800 shadow-sm'
                          : 'text-gray-400 hover:text-brown-800'
                      }`}
                    >
                      {t === 'signin' ? 'Sign In' : 'Create Account'}
                    </button>
                  ))}
                </div>

                {/* Heading */}
                <div className="mb-6">
                  <h1 className="font-serif text-2xl text-brown-800 font-bold">
                    {tab === 'signup' ? 'Create your account' : 'Welcome back'}
                  </h1>
                  <p className="text-sm text-gray-500 font-sans mt-1">
                    {tab === 'signup'
                      ? 'Sign up to shop, track orders, and save your wishlist.'
                      : 'Sign in to continue shopping with Gayathri Jewellers.'}
                  </p>
                </div>

                {/* Form */}
                {tab === 'signup'
                  ? <SignUpForm onOTPSent={handleSignupOTPSent} />
                  : <SignInForm onOTPSent={handleSigninOTPSent} />
                }

                {/* Switch */}
                <p className="mt-6 text-center text-sm text-gray-400 font-sans">
                  {tab === 'signup' ? (
                    <>Already have an account?{' '}
                      <button onClick={() => setTab('signin')} className="text-gold-600 hover:text-gold-700 font-semibold underline underline-offset-2 transition-colors">
                        Sign in
                      </button>
                    </>
                  ) : (
                    <>New to Gayathri Jewellers?{' '}
                      <button onClick={() => setTab('signup')} className="text-gold-600 hover:text-gold-700 font-semibold underline underline-offset-2 transition-colors">
                        Create account
                      </button>
                    </>
                  )}
                </p>
              </>
            )}
          </div>

          <p className="text-center text-xs text-gray-400 font-sans mt-5 px-4">
            By continuing you agree that Gayathri Jewellers may contact you about your orders using the details you provide.
          </p>
        </div>
      </div>
    </div>
  );
}
