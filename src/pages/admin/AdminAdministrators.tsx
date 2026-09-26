import { useCallback, useEffect, useState } from 'react';
import { Shield, UserPlus, UserMinus, Phone, Mail } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Skeleton } from '../../components/ui/Skeleton';
import { ErrorState } from '../../components/ui/EmptyState';
import { getAdministrators, promoteToAdmin, demoteFromAdmin } from '../../api/admin';
import { extractErrorMessage } from '../../api/client';
import { useAuth } from '../../contexts/AuthContext';
import type { CustomerRecord } from '../../types';
import toast from 'react-hot-toast';

const MAX_ADMINS = 2;

export function AdminAdministrators() {
  const { user: currentUser } = useAuth();
  const [admins, setAdmins] = useState<CustomerRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionUserId, setActionUserId] = useState<string | null>(null);

  const fetchAdmins = useCallback(async () => {
    setLoading(true); setError(null);
    try {
      const { administrators } = await getAdministrators();
      setAdmins(administrators);
    } catch (err) {
      setError(extractErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchAdmins(); }, [fetchAdmins]);

  const handleDemote = async (userId: string, name: string) => {
    if (userId === currentUser?.id) { toast.error("You cannot remove your own admin role."); return; }
    if (!window.confirm(`Remove admin role from "${name}"?`)) return;
    setActionUserId(userId);
    try {
      await demoteFromAdmin(userId);
      toast.success(`${name} removed from administrators`);
      fetchAdmins();
    } catch (err) {
      toast.error(extractErrorMessage(err));
    } finally {
      setActionUserId(null);
    }
  };

  const slotsUsed = admins.length;
  const slotsAvailable = MAX_ADMINS - slotsUsed;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-serif text-3xl text-espresso font-medium">Administrators</h1>
        <p className="text-sm text-espresso-400 font-sans mt-1">
          Only <strong>{MAX_ADMINS}</strong> accounts may have the admin role at any time.
        </p>
      </div>

      {/* Capacity indicator */}
      <div className="card p-5">
        <div className="flex items-center justify-between mb-3">
          <p className="font-sans text-sm font-semibold text-espresso">Admin Slots</p>
          <span className={`font-sans text-sm font-medium ${slotsAvailable === 0 ? 'text-red-600' : 'text-green-700'}`}>
            {slotsUsed} / {MAX_ADMINS} used
          </span>
        </div>
        <div className="flex gap-3">
          {Array.from({ length: MAX_ADMINS }).map((_, i) => (
            <div
              key={i}
              className={`flex-1 h-3 rounded-full transition-colors ${i < slotsUsed ? 'bg-espresso' : 'bg-espresso-100'}`}
              aria-label={`Slot ${i + 1}: ${i < slotsUsed ? 'occupied' : 'available'}`}
            />
          ))}
        </div>
        {slotsAvailable === 0 && (
          <p className="text-xs text-espresso-400 font-sans mt-2">
            Both admin slots are filled. Remove an administrator before promoting another user.
          </p>
        )}
        {slotsAvailable > 0 && (
          <p className="text-xs text-espresso-400 font-sans mt-2">
            {slotsAvailable} slot{slotsAvailable !== 1 ? 's' : ''} available. Use the backend or a dedicated promotion flow to add a new admin.
          </p>
        )}
      </div>

      {/* Current admins */}
      <div className="card p-6">
        <h2 className="font-serif text-xl text-espresso font-medium mb-5 flex items-center gap-2">
          <Shield size={18} className="text-gold-600" /> Current Administrators
        </h2>

        {loading && <div className="space-y-3">{Array.from({length:2}).map((_,i)=><Skeleton key={i} className="h-20 w-full" />)}</div>}
        {!loading && error && <ErrorState message={error} onRetry={fetchAdmins} />}

        {!loading && !error && admins.length === 0 && (
          <p className="text-sm text-espresso-400 font-sans">No administrators found. This is unexpected — please check your backend configuration.</p>
        )}

        {!loading && !error && admins.length > 0 && (
          <div className="space-y-4">
            {admins.map((admin) => {
              const isMe = admin.id === currentUser?.id;
              return (
                <div key={admin.id} className={`flex items-start justify-between gap-4 p-4 rounded-xl border ${isMe ? 'bg-gold-50 border-gold-200' : 'bg-ivory-50 border-ivory-200'}`}>
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-full bg-gold-100 flex items-center justify-center shrink-0">
                      <Shield size={18} className="text-gold-600" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="font-sans font-medium text-espresso">{admin.name}</p>
                        {isMe && <span className="text-xs text-gold-600 font-sans font-medium bg-gold-100 px-2 py-0.5 rounded-full">You</span>}
                      </div>
                      <p className="flex items-center gap-1.5 text-xs text-espresso-400 font-sans mt-1"><Phone size={11} />{admin.mobile}</p>
                      <p className="flex items-center gap-1.5 text-xs text-espresso-400 font-sans"><Mail size={11} />{admin.email}</p>
                    </div>
                  </div>
                  {!isMe && (
                    <Button
                      variant="ghost"
                      size="sm"
                      leftIcon={<UserMinus size={14} />}
                      loading={actionUserId === admin.id}
                      onClick={() => handleDemote(admin.id, admin.name)}
                      className="text-red-600 hover:bg-red-50 shrink-0"
                    >
                      Remove
                    </Button>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Info note */}
      <div className="bg-ivory-100 border border-ivory-200 rounded-xl p-5">
        <div className="flex items-start gap-3">
          <UserPlus size={18} className="text-gold-600 mt-0.5 shrink-0" />
          <div>
            <p className="font-sans font-medium text-espresso text-sm mb-1">Promoting a user to admin</p>
            <p className="text-sm text-espresso-400 font-sans leading-relaxed">
              To promote a registered user to administrator, use the backend admin API or contact the system maintainer. 
              Promotion is only possible when fewer than {MAX_ADMINS} admin slots are occupied. 
              The frontend enforces this limit and will not show a promotion option when both slots are filled.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
