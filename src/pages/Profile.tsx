import { useState } from 'react';
import { User, Phone, Mail, Shield, LogOut } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { PageLayout } from '../components/layout/PageLayout';
import { Breadcrumb } from '../components/layout/Breadcrumb';
import { Button } from '../components/ui/Button';
import { useAuth } from '../contexts/AuthContext';

export function ProfilePage() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [signingOut, setSigningOut] = useState(false);

  const handleSignOut = async () => {
    setSigningOut(true);
    await signOut();
    navigate('/login', { replace: true });
  };

  if (!user) return null;

  return (
    <PageLayout>
      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-8">
        <Breadcrumb items={[{ label: 'Home', to: '/' }, { label: 'My Profile' }]} />

        <div className="mt-6 mb-8">
          <h1 className="font-serif text-3xl text-espresso font-medium">My Account</h1>
        </div>

        {/* Profile card */}
        <div className="card p-6 sm:p-8 space-y-6">
          {/* Avatar */}
          <div className="flex items-center gap-5">
            <div className="w-16 h-16 rounded-full bg-gold-100 flex items-center justify-center shrink-0">
              <User size={28} className="text-gold-600" />
            </div>
            <div>
              <h2 className="font-serif text-2xl text-espresso font-medium">{user.name}</h2>
              {user.role === 'admin' && (
                <span className="inline-flex items-center gap-1 text-xs font-sans font-medium text-gold-700 bg-gold-100 px-2.5 py-0.5 rounded-full mt-1">
                  <Shield size={11} /> Administrator
                </span>
              )}
            </div>
          </div>

          {/* Details */}
          <div className="space-y-4 pt-4 border-t border-ivory-200">
            <div className="flex items-start gap-4 p-4 bg-ivory-100 rounded-xl">
              <Phone size={18} className="text-gold-600 mt-0.5 shrink-0" />
              <div>
                <p className="text-xs text-espresso-400 font-sans uppercase tracking-wider">Mobile Number</p>
                <p className="font-sans font-medium text-espresso mt-0.5">{user.mobile}</p>
                <p className="text-xs text-espresso-400 font-sans mt-0.5">Used for order and delivery notifications</p>
              </div>
            </div>

            <div className="flex items-start gap-4 p-4 bg-ivory-100 rounded-xl">
              <Mail size={18} className="text-gold-600 mt-0.5 shrink-0" />
              <div>
                <p className="text-xs text-espresso-400 font-sans uppercase tracking-wider">Email Address</p>
                <p className="font-sans font-medium text-espresso mt-0.5">{user.email}</p>
              </div>
            </div>

            <div className="flex items-start gap-4 p-4 bg-ivory-100 rounded-xl">
              <Shield size={18} className="text-gold-600 mt-0.5 shrink-0" />
              <div>
                <p className="text-xs text-espresso-400 font-sans uppercase tracking-wider">Account Type</p>
                <p className="font-sans font-medium text-espresso capitalize mt-0.5">{user.role}</p>
                <p className="text-xs text-espresso-400 font-sans mt-0.5">
                  Member since {new Date(user.createdAt).toLocaleDateString('en-IN', { month: 'long', year: 'numeric' })}
                </p>
              </div>
            </div>
          </div>

          {/* OTP note */}
          <div className="bg-gold-50 border border-gold-200 rounded-xl p-4">
            <p className="text-sm font-sans text-espresso-400 leading-relaxed">
              <span className="font-medium text-espresso">Account security:</span> Gayathri Jewellers uses one-time codes (OTP) for secure sign-in. No passwords are stored.
              To update your mobile number or email, please contact the store directly.
            </p>
          </div>

          {/* Quick links */}
          <div className="grid grid-cols-2 gap-3 pt-2">
            <Button variant="outline" onClick={() => navigate('/orders')}>
              My Orders
            </Button>
            <Button variant="outline" onClick={() => navigate('/wishlist')}>
              My Wishlist
            </Button>
          </div>

          {/* Sign out */}
          <div className="pt-2 border-t border-ivory-200">
            <Button
              variant="ghost"
              leftIcon={<LogOut size={16} />}
              loading={signingOut}
              onClick={handleSignOut}
              className="text-red-600 hover:bg-red-50"
            >
              Sign out
            </Button>
          </div>
        </div>
      </div>
    </PageLayout>
  );
}
