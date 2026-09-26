import { useState, useEffect } from 'react';
import { TrendingUp, Save, Calendar } from 'lucide-react';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { Skeleton } from '../../components/ui/Skeleton';
import { getMetalRates, updateMetalRates } from '../../api/metalRates';
import { extractErrorMessage } from '../../api/client';
import toast from 'react-hot-toast';
import type { MetalRates } from '../../api/metalRates';

export function AdminMetalRates() {
  const [currentRates, setCurrentRates] = useState<MetalRates | null>(null);
  const [goldRate, setGoldRate] = useState('');
  const [silverRate, setSilverRate] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchRates();
  }, []);

  const fetchRates = async () => {
    setLoading(true);
    try {
      const { rates } = await getMetalRates();
      setCurrentRates(rates);
      setGoldRate(String(rates.gold));
      setSilverRate(String(rates.silver));
    } catch (err) {
      setError(extractErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    const gold = Number(goldRate);
    const silver = Number(silverRate);

    if (isNaN(gold) || gold <= 0) {
      toast.error('Gold rate must be a positive number');
      return;
    }
    if (isNaN(silver) || silver <= 0) {
      toast.error('Silver rate must be a positive number');
      return;
    }

    setSaving(true);
    try {
      const { message, rates } = await updateMetalRates({ gold, silver });
      setCurrentRates(rates);
      setGoldRate(String(rates.gold));
      setSilverRate(String(rates.silver));
      toast.success(message);
    } catch (err) {
      toast.error(extractErrorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  const lastUpdatedDate = currentRates ? new Date(currentRates.lastUpdated) : null;
  const isToday = lastUpdatedDate ? lastUpdatedDate.toDateString() === new Date().toDateString() : false;
  const dateDisplay = lastUpdatedDate
    ? isToday
      ? `Today at ${lastUpdatedDate.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}`
      : lastUpdatedDate.toLocaleString('en-IN', { 
          day: 'numeric', 
          month: 'short', 
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        })
    : '';

  return (
    <div className="max-w-4xl">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-xl bg-gold-100 flex items-center justify-center">
          <TrendingUp size={20} className="text-gold-600" />
        </div>
        <div>
          <h1 className="font-serif text-2xl text-brown-800 font-bold">Metal Rates</h1>
          <p className="text-sm text-gray-400 font-sans">Update daily gold and silver rates</p>
        </div>
      </div>

      {loading && (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-card p-8 space-y-6">
          <Skeleton className="h-6 w-48" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Skeleton className="h-24" />
            <Skeleton className="h-24" />
          </div>
          <Skeleton className="h-12 w-32" />
        </div>
      )}

      {error && !loading && (
        <div className="bg-white rounded-2xl border border-red-200 p-6">
          <p className="text-red-600 font-sans text-sm">{error}</p>
          <Button variant="outline" size="sm" className="mt-4" onClick={fetchRates}>
            Retry
          </Button>
        </div>
      )}

      {!loading && !error && currentRates && (
        <div className="space-y-6">
          {/* Current Rates Display */}
          <div className="bg-gradient-to-br from-brown-800 to-brown-900 rounded-2xl p-6 sm:p-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-serif text-xl text-white font-bold">Current Rates</h2>
              {lastUpdatedDate && (
                <div className="flex items-center gap-2 text-xs text-white/50 font-sans">
                  <Calendar size={12} />
                  <span>{dateDisplay}</span>
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl p-5">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-2xl">🟡</span>
                  <span className="font-sans text-sm font-semibold text-white/70 uppercase">Gold</span>
                </div>
                <div className="flex items-baseline gap-2">
                  <span className="font-serif text-3xl font-bold text-white">
                    ₹{currentRates.gold.toLocaleString('en-IN')}
                  </span>
                  <span className="text-sm text-white/50 font-sans">/ gram</span>
                </div>
              </div>

              <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl p-5">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-2xl">⚪</span>
                  <span className="font-sans text-sm font-semibold text-white/70 uppercase">Silver</span>
                </div>
                <div className="flex items-baseline gap-2">
                  <span className="font-serif text-3xl font-bold text-white">
                    ₹{currentRates.silver.toLocaleString('en-IN')}
                  </span>
                  <span className="text-sm text-white/50 font-sans">/ gram</span>
                </div>
              </div>
            </div>
          </div>

          {/* Update Form */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-card p-6 sm:p-8">
            <h2 className="font-serif text-xl text-brown-800 font-bold mb-6">Update Rates</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <Input
                label="Gold Rate (₹ per gram)"
                type="number"
                step="0.01"
                min="0"
                placeholder="e.g. 6850"
                value={goldRate}
                onChange={e => setGoldRate(e.target.value)}
                required
                leftIcon={<span className="text-lg">🟡</span>}
              />

              <Input
                label="Silver Rate (₹ per gram)"
                type="number"
                step="0.01"
                min="0"
                placeholder="e.g. 95"
                value={silverRate}
                onChange={e => setSilverRate(e.target.value)}
                required
                leftIcon={<span className="text-lg">⚪</span>}
              />
            </div>

            <div className="flex items-center gap-3">
              <Button
                variant="primary"
                size="lg"
                leftIcon={<Save size={18} />}
                onClick={handleSave}
                loading={saving}
              >
                Save Rates
              </Button>

              <Button
                variant="ghost"
                size="lg"
                onClick={() => {
                  setGoldRate(String(currentRates.gold));
                  setSilverRate(String(currentRates.silver));
                }}
                disabled={saving}
              >
                Reset
              </Button>
            </div>

            <p className="text-xs text-gray-400 font-sans mt-4 leading-relaxed">
              💡 These rates will be displayed on the home page. They are for customer reference only and don't affect product pricing.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
