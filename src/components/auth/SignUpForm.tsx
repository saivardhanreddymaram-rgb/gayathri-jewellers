import { useState } from 'react';
import { User, Phone, Mail } from 'lucide-react';
import { Input } from '../ui/Input';
import { Button } from '../ui/Button';
import { requestSignupOTP } from '../../api/auth';
import { extractErrorMessage } from '../../api/client';

interface SignUpFormProps {
  onOTPSent: (data: {
    name: string;
    email: string;
    mobile: string;
    identifier: string;
    expiresIn: number;
    devOtp?: string;
  }) => void;
}

interface FormErrors {
  name?: string;
  email?: string;
  mobile?: string;
}

function validate(name: string, email: string, mobile: string): FormErrors {
  const errors: FormErrors = {};
  if (!name.trim() || name.trim().length < 2)
    errors.name = 'Enter your full name (at least 2 characters)';
  if (!email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
    errors.email = 'Enter a valid email address';
  if (!mobile.trim() || !/^[6-9]\d{9}$/.test(mobile.replace(/\s/g, '')))
    errors.mobile = 'Enter a valid 10-digit Indian mobile number';
  return errors;
}

export function SignUpForm({ onOTPSent }: SignUpFormProps) {
  const [name,        setName]        = useState('');
  const [email,       setEmail]       = useState('');
  const [mobile,      setMobile]      = useState('');
  const [errors,      setErrors]      = useState<FormErrors>({});
  const [serverError, setServerError] = useState('');
  const [loading,     setLoading]     = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setServerError('');
    const errs = validate(name, email, mobile);
    setErrors(errs);
    if (Object.keys(errs).length > 0) return;

    setLoading(true);
    try {
      const result = await requestSignupOTP({
        name:           name.trim(),
        email:          email.trim().toLowerCase(),
        mobile:         mobile.replace(/\s/g, ''),
        deliveryMethod: 'email',   // always email
      });
      onOTPSent({
        name:       name.trim(),
        email:      email.trim().toLowerCase(),
        mobile:     mobile.replace(/\s/g, ''),
        identifier: email.trim().toLowerCase(),
        expiresIn:  result.expiresIn ?? 600,
        devOtp:     result.devOtp,
      });
    } catch (err) {
      setServerError(extractErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-4 sm:space-y-5">
      <Input
        label="Full Name"
        type="text"
        placeholder="e.g. Priya Sharma"
        value={name}
        onChange={e => setName(e.target.value)}
        error={errors.name}
        required
        autoComplete="name"
        leftIcon={<User size={16} />}
      />

      <Input
        label="Mobile Number"
        type="tel"
        placeholder="10-digit mobile number"
        value={mobile}
        onChange={e => setMobile(e.target.value.replace(/\D/g, '').slice(0, 10))}
        error={errors.mobile}
        required
        inputMode="numeric"
        autoComplete="tel"
        leftIcon={<Phone size={16} />}
        hint="Required — we contact you about your order or delivery"
      />

      <Input
        label="Email Address"
        type="email"
        placeholder="your@email.com"
        value={email}
        onChange={e => setEmail(e.target.value)}
        error={errors.email}
        required
        autoComplete="email"
        leftIcon={<Mail size={16} />}
        hint="Your OTP verification code will be sent here"
      />

      {serverError && (
        <p role="alert" className="text-xs sm:text-sm text-red-600 font-sans bg-red-50 border border-red-200 rounded-lg px-3 sm:px-4 py-2.5 sm:py-3">
          {serverError}
        </p>
      )}

      <Button type="submit" variant="primary" fullWidth size="lg" loading={loading}>
        Send Verification Code
      </Button>
    </form>
  );
}
