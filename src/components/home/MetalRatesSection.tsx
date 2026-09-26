import { useEffect, useState } from 'react';
import { TrendingUp, Calendar } from 'lucide-react';
import { getMetalRates } from '../../api/metalRates';
import { extractErrorMessage } from '../../api/client';
import type { MetalRates } from '../../api/metalRates';

export function MetalRatesSection() {
  const [rates, setRates] = useState<MetalRates | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    getMetalRates()
      .then(({ rates }) => setRates(rates))
      .catch(err => setError(extractErrorMessage(err)))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <section className="py-8 px-4 sm:px-6 max-w-7xl mx-auto">
        <div className="bg-gradient-to-br from-brown-800 to-brown-900 rounded-3xl p-8 animate-pulse">
          <div className="h-6 bg-white/10 rounded w-48 mx-auto mb-6" />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-2xl mx-auto">
            <div className="h-20 bg-white/10 rounded-2xl" />
            <div className="h-20 bg-white/10 rounded-2xl" />
          </div>
        </div>
      </section>
    );
  }

  if (error || !rates) {
    return null; // Silently fail — don't block the page
  }

  const lastUpdatedDate = new Date(rates.lastUpdated);
  const isToday = lastUpdatedDate.toDateString() === new Date().toDateString();
  const dateDisplay = isToday 
    ? 'Today' 
    : lastUpdatedDate.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });

  return (
    <section className="py-8 sm:py-12 px-4 sm:px-6 max-w-7xl mx-auto" aria-label="Current metal rates">
      <div className="bg-gradient-to-br from-brown-800 via-brown-900 to-brown-800 rounded-3xl shadow-2xl overflow-hidden relative">
        {/* Decorative elements */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden" aria-hidden>
          <div className="absolute -top-20 -right-20 w-64 h-64 bg-gold-500/10 rounded-full blur-3xl" />
          <div className="absolute -bottom-20 -left-20 w-64 h-64 bg-gold-500/5 rounded-full blur-3xl" />
        </div>

        <div className="relative px-6 sm:px-10 py-8 sm:py-10">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-gold-500/20 rounded-full mb-4">
              <TrendingUp size={16} className="text-gold-400" />
              <span className="text-xs font-sans font-bold text-gold-300 uppercase tracking-widest">Live Rates</span>
            </div>
            <h2 className="font-serif text-2xl sm:text-3xl font-bold text-white mb-2">
              Today's Jewellery Rates
            </h2>
            <div className="flex items-center justify-center gap-2 text-xs text-white/50 font-sans">
              <Calendar size={13} />
              <span>Updated {dateDisplay}</span>
            </div>
          </div>

          {/* Rates Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 max-w-2xl mx-auto">
            {/* Gold Rate */}
            <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-6 hover:bg-white/15 transition-all duration-200 group">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-yellow-400 to-yellow-600 flex items-center justify-center shadow-lg">
                  <span className="text-xl">🟡</span>
                </div>
                <span className="font-sans text-sm font-semibold text-white/70 uppercase tracking-wider">Gold</span>
              </div>
              <div className="flex items-baseline gap-2">
                <span className="font-serif text-3xl sm:text-4xl font-bold text-white">
                  ₹{rates.gold.toLocaleString('en-IN')}
                </span>
                <span className="text-sm text-white/50 font-sans">/ gram</span>
              </div>
            </div>

            {/* Silver Rate */}
            <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-6 hover:bg-white/15 transition-all duration-200 group">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-gray-300 to-gray-500 flex items-center justify-center shadow-lg">
                  <span className="text-xl">⚪</span>
                </div>
                <span className="font-sans text-sm font-semibold text-white/70 uppercase tracking-wider">Silver</span>
              </div>
              <div className="flex items-baseline gap-2">
                <span className="font-serif text-3xl sm:text-4xl font-bold text-white">
                  ₹{rates.silver.toLocaleString('en-IN')}
                </span>
                <span className="text-sm text-white/50 font-sans">/ gram</span>
              </div>
            </div>
          </div>

          {/* Disclaimer */}
          <p className="text-center text-xs text-white/40 font-sans mt-6 max-w-lg mx-auto leading-relaxed">
            Rates are indicative and subject to change. Final prices depend on purity and making charges.
          </p>
        </div>
      </div>
    </section>
  );
}
