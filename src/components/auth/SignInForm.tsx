import { useState } from 'react';
import { Mail, Phone } from 'lucide-react';
import { Input } from '../ui/Input';
import { Button } from '../ui/Button';
import { requestSigninOTP } from '../../api/auth';
import { extractErrorMessage } from '../../api/client';

interface SignInFormProps {
  onOTPSent: (data: {
    identifier: string;
    expiresIn: number;
    devOtp?: string;
  }) => void;
}

export function SignInForm({ onOTPSent }: SignInFormProps) {
  const [identifier, setIdentifier] = useState('');
  const [error,      setError]      = useState('');
  const [loading,    setLoading]    = useState(false);

  const isEmail = identifier.includes('@');

  const validate = (): string => {
    if (!identifier.trim()) return 'Enter your email address or mobile number';
    if (isEmail) {
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(identifier))
        return 'Enter a valid email address';
    } else {
      if (!/^[6-9]\d{9}$/.test(identifier.replace(/\s/g, '')))
        return 'Enter a valid 10-digit mobile number or email address';
    }
    return '';
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    const err = validate();
    if (err) { setError(err); return; }

    setLoading(true);
    try {
      const result = await requestSigninOTP({
        identifier:     identifier.trim(),
        deliveryMethod: 'email',   // always email
      });
      onOTPSent({
        identifier: identifier.trim(),
        expiresIn:  result.expiresIn ?? 600,
        devOtp:     result.devOtp,
      });
    } catch (err) {
      setError(extractErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-5">
      <Input
        label="Email Address or Mobile Number"
        type="text"
        placeholder="your@email.com or 9876543210"
        value={identifier}
        onChange={e => setIdentifier(e.target.value)}
        error={error}
        required
        autoComplete="username"
        inputMode={isEmail ? 'email' : 'tel'}
        leftIcon={isEmail ? <Mail size={16} /> : <Phone size={16} />}
        hint="OTP will be sent to your registered email address"
      />

      <Button type="submit" variant="primary" fullWidth size="lg" loading={loading}>
        Send Verification Code
      </Button>
    </form>
  );
}
