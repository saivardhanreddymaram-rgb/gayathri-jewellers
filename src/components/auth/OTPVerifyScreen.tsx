import { useState, useCallback } from 'react';
import { ArrowLeft, ShieldCheck, Clock, Terminal, Mail } from 'lucide-react';
import { OTPInput, ResendTimer } from '../ui/OTPInput';
import { Button } from '../ui/Button';
import { verifyOTP, requestSignupOTP, requestSigninOTP } from '../../api/auth';
import { extractErrorMessage } from '../../api/client';
import { useAuth } from '../../contexts/AuthContext';
import type { OTPPurpose } from '../../types';

interface OTPVerifyScreenProps {
  purpose:      OTPPurpose;
  identifier:   string;           // email the OTP was sent to
  deliveryMethod: 'email';        // always email now
  expiresIn:    number;
  devOtp?:      string;           // shown in yellow banner in dev mode
  signupData?:  { name: string; email: string; mobile: string };
  onBack:       () => void;
  onSuccess:    () => void;
}

export function OTPVerifyScreen({
  purpose,
  identifier,
  expiresIn,
  devOtp,
  signupData,
  onBack,
  onSuccess,
}: OTPVerifyScreenProps) {
  const { signIn } = useAuth();
  const [code,          setCode]          = useState('');
  const [error,         setError]         = useState('');
  const [loading,       setLoading]       = useState(false);
  const [resendKey,     setResendKey]     = useState(0);
  const [currentDevOtp, setCurrentDevOtp] = useState(devOtp);

  // Mask email for display: ab****@gmail.com
  const maskedEmail = identifier.replace(
    /^(.{2})(.*)(@.*)$/,
    (_, a, b, c) => a + '*'.repeat(Math.min(b.length, 4)) + c
  );

  const handleVerify = useCallback(async () => {
    if (code.length < 6) { setError('Please enter the complete 6-digit code'); return; }
    setError('');
    setLoading(true);
    try {
      const { user } = await verifyOTP({ identifier, code, purpose });
      signIn(user);
      onSuccess();
    } catch (err) {
      setError(extractErrorMessage(err));
      setCode('');
    } finally {
      setLoading(false);
    }
  }, [code, identifier, purpose, signIn, onSuccess]);

  const handleCodeChange = (val: string) => {
    setError('');
    setCode(val);
  };

  const handleResend = useCallback(async () => {
    setError('');
    setCode('');
    setCurrentDevOtp(undefined);
    try {
      let result;
      if (purpose === 'signup' && signupData) {
        result = await requestSignupOTP({
          name: signupData.name, email: signupData.email,
          mobile: signupData.mobile, deliveryMethod: 'email',
        });
      } else {
        result = await requestSigninOTP({ identifier, deliveryMethod: 'email' });
      }
      if (result.devOtp) setCurrentDevOtp(result.devOtp);
      setResendKey(k => k + 1);
    } catch (err) {
      setError(extractErrorMessage(err));
    }
  }, [purpose, signupData, identifier]);

  return (
    <div className="space-y-6">

      {/* Back */}
      <button
        type="button"
        onClick={onBack}
        className="flex items-center gap-2 text-sm text-gray-400 hover:text-brown-800 transition-colors font-sans"
      >
        <ArrowLeft size={15} /> Back
      </button>

      {/* Icon + heading */}
      <div className="text-center space-y-3">
        <div className="w-16 h-16 bg-gold-100 rounded-full flex items-center justify-center mx-auto">
          <ShieldCheck size={28} className="text-gold-600" />
        </div>
        <h2 className="font-serif text-2xl text-brown-800 font-bold">Check your email</h2>
        <p className="text-sm text-gray-500 font-sans leading-relaxed">
          We sent a 6-digit verification code to
        </p>
        <div className="inline-flex items-center gap-2 bg-gold-50 border border-gold-200 rounded-full px-4 py-1.5">
          <Mail size={14} className="text-gold-600" />
          <span className="text-sm font-sans font-semibold text-brown-800">{maskedEmail}</span>
        </div>
      </div>

      {/* Expiry */}
      <div className="flex items-center justify-center gap-1.5 text-xs text-gray-400 font-sans">
        <Clock size={13} />
        Code expires in {Math.floor(expiresIn / 60)} minutes
      </div>

      {/* ── Dev mode yellow banner ── */}
      {currentDevOtp && (
        <div className="rounded-xl border-2 border-dashed border-amber-400 bg-amber-50 p-4">
          <div className="flex items-center gap-2 mb-2">
            <Terminal size={14} className="text-amber-600" />
            <p className="text-xs font-sans font-bold text-amber-700 uppercase tracking-wider">
              Dev Mode — OTP Code
            </p>
          </div>
          <div className="flex items-center justify-between gap-3">
            <p className="font-mono text-3xl font-bold tracking-[0.3em] text-amber-800">
              {currentDevOtp}
            </p>
            <button
              type="button"
              onClick={() => setCode(currentDevOtp)}
              className="px-3 py-1.5 bg-amber-500 text-white text-xs font-sans font-bold rounded-lg hover:bg-amber-600 transition-colors"
            >
              Use this code
            </button>
          </div>
          <p className="text-xs text-amber-600 font-sans mt-2">
            In production this code is only sent by email — never shown here.
          </p>
        </div>
      )}

      {/* OTP input */}
      <div className="space-y-4">
        <OTPInput
          value={code}
          onChange={handleCodeChange}
          disabled={loading}
          error={!!error}
          autoFocus
        />
        {error && (
          <p role="alert" className="text-sm text-red-600 font-sans text-center bg-red-50 border border-red-200 rounded-lg py-2.5 px-4">
            {error}
          </p>
        )}
      </div>

      {/* Submit */}
      <Button
        type="button"
        variant="primary"
        fullWidth
        size="lg"
        loading={loading}
        onClick={handleVerify}
        disabled={code.length < 6}
      >
        Verify &amp; Continue
      </Button>

      {/* Resend */}
      <div className="text-center">
        <ResendTimer key={resendKey} seconds={60} onResend={handleResend} disabled={loading} />
      </div>

      {/* Help */}
      <p className="text-center text-xs text-gray-400 font-sans">
        Didn't receive the email? Check your spam folder.
      </p>
    </div>
  );
}
