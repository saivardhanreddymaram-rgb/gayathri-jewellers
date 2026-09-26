import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Package, ShoppingCart, Users, Clock, ArrowRight, TrendingUp } from 'lucide-react';
import { getAdminStats } from '../../api/admin';
import { Skeleton } from '../../components/ui/Skeleton';
import { ErrorState } from '../../components/ui/EmptyState';
import { extractErrorMessage } from '../../api/client';
import type { AdminStats } from '../../types';

interface StatCardProps {
  label: string;
  value: number | string;
  icon: React.ReactNode;
  linkTo: string;
  loading?: boolean;
}

function StatCard({ label, value, icon, linkTo, loading }: StatCardProps) {
  return (
    <Link to={linkTo} className="card p-5 sm:p-6 flex items-start gap-4 hover:shadow-card-hover transition-shadow duration-200 group">
      <div className="w-12 h-12 rounded-xl bg-gold-100 flex items-center justify-center shrink-0 group-hover:bg-gold-200 transition-colors">
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-xs font-sans font-semibold text-espresso-400 uppercase tracking-wider">{label}</p>
        {loading ? (
          <Skeleton className="h-8 w-16 mt-1" />
        ) : (
          <p className="font-serif text-3xl text-espresso font-medium mt-0.5">{value}</p>
        )}
      </div>
      <ArrowRight size={16} className="text-espresso-400 mt-1 group-hover:text-gold-600 transition-colors shrink-0" />
    </Link>
  );
}

export function AdminOverview() {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStats = useCallback(async () => {
    setLoading(true); setError(null);
    try {
      const { stats } = await getAdminStats();
      setStats(stats);
    } catch (err) {
      setError(extractErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchStats(); }, [fetchStats]);

  return (
    <div className="space-y-8">
      {/* Heading */}
      <div>
        <h1 className="font-serif text-3xl text-espresso font-medium">Overview</h1>
        <p className="text-sm text-espresso-400 font-sans mt-1">Welcome to the Gayathri Jewellers admin portal.</p>
      </div>

      {error && <ErrorState message={error} onRetry={fetchStats} />}

      {/* Stats grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <StatCard label="Total Products" value={stats?.totalProducts ?? 0} icon={<Package size={22} className="text-gold-600" />} linkTo="/admin/products" loading={loading} />
        <StatCard label="Total Orders" value={stats?.totalOrders ?? 0} icon={<ShoppingCart size={22} className="text-gold-600" />} linkTo="/admin/orders" loading={loading} />
        <StatCard label="Customers" value={stats?.totalCustomers ?? 0} icon={<Users size={22} className="text-gold-600" />} linkTo="/admin/customers" loading={loading} />
        <StatCard label="Pending Orders" value={stats?.pendingOrders ?? 0} icon={<Clock size={22} className="text-gold-600" />} linkTo="/admin/orders" loading={loading} />
      </div>

      {/* Quick links */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {[
          { title: 'Add New Jewellery', desc: 'Upload a new product to the store catalogue.', to: '/admin/products', cta: 'Add Product' },
          { title: 'Manage Orders', desc: 'View, update status, and track customer orders.', to: '/admin/orders', cta: 'View Orders' },
          { title: 'Browse Customers', desc: 'View registered customer accounts.', to: '/admin/customers', cta: 'View Customers' },
        ].map((item) => (
          <div key={item.title} className="card p-5">
            <TrendingUp size={18} className="text-gold-600 mb-3" />
            <h3 className="font-serif text-lg text-espresso font-medium mb-1">{item.title}</h3>
            <p className="text-sm text-espresso-400 font-sans mb-4">{item.desc}</p>
            <Link to={item.to} className="inline-flex items-center gap-1.5 text-sm font-sans font-medium text-gold-600 hover:text-gold-700 transition-colors">
              {item.cta} <ArrowRight size={14} />
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
}
