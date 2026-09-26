import { useCallback, useEffect, useState } from 'react';
import { Search, Users, Phone, Mail, Calendar } from 'lucide-react';
import { Skeleton } from '../../components/ui/Skeleton';
import { EmptyState, ErrorState } from '../../components/ui/EmptyState';
import { Badge } from '../../components/ui/Badge';
import { Pagination } from '../../components/ui/Pagination';
import { getCustomers } from '../../api/admin';
import { extractErrorMessage } from '../../api/client';
import type { CustomerRecord } from '../../types';

export function AdminCustomers() {
  const [customers, setCustomers] = useState<CustomerRecord[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCustomers = useCallback(async () => {
    setLoading(true); setError(null);
    try {
      const result = await getCustomers({ page, search });
      setCustomers(result.customers);
      setTotal(result.total);
    } catch (err) {
      setError(extractErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, [page, search]);

  useEffect(() => { fetchCustomers(); }, [fetchCustomers]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-serif text-3xl text-espresso font-medium">Customers</h1>
        <p className="text-sm text-espresso-400 font-sans mt-1">{total} registered customers</p>
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-espresso-400 pointer-events-none" aria-hidden />
        <input
          type="search"
          value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(1); }}
          placeholder="Search by name, email, or mobile…"
          aria-label="Search customers"
          className="w-full pl-9 pr-4 py-2.5 bg-white border border-espresso-100 rounded-xl text-sm font-sans text-espresso focus:outline-none focus:border-gold-500 focus:ring-2 focus:ring-gold-200 transition-colors"
        />
      </div>

      {loading && (
        <div className="space-y-3">
          {Array.from({length:5}).map((_,i) => <Skeleton key={i} className="h-20 w-full" />)}
        </div>
      )}
      {!loading && error && <ErrorState message={error} onRetry={fetchCustomers} />}
      {!loading && !error && customers.length === 0 && (
        <EmptyState icon={Users} title="No customers found" description={search ? 'No customers match your search.' : 'No registered customers yet.'} />
      )}

      {!loading && !error && customers.length > 0 && (
        <>
          {/* Desktop table */}
          <div className="hidden md:block card overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm font-sans" aria-label="Customers table">
                <thead>
                  <tr className="border-b border-ivory-200 bg-ivory-50">
                    <th className="px-4 py-3 text-left text-xs font-semibold text-espresso-400 uppercase tracking-wider">Name</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-espresso-400 uppercase tracking-wider">Contact</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-espresso-400 uppercase tracking-wider">Role</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-espresso-400 uppercase tracking-wider">Orders</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-espresso-400 uppercase tracking-wider">Joined</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-ivory-200">
                  {customers.map((c) => (
                    <tr key={c.id} className="hover:bg-ivory-50 transition-colors">
                      <td className="px-4 py-3 font-medium text-espresso">{c.name}</td>
                      <td className="px-4 py-3">
                        <div className="space-y-0.5">
                          <p className="flex items-center gap-1.5 text-espresso-400"><Phone size={12} />{c.mobile}</p>
                          <p className="flex items-center gap-1.5 text-espresso-400"><Mail size={12} />{c.email}</p>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <Badge variant={c.role === 'admin' ? 'gold' : 'default'}>{c.role}</Badge>
                      </td>
                      <td className="px-4 py-3 text-espresso font-medium">{c.orderCount}</td>
                      <td className="px-4 py-3 text-espresso-400 text-xs">
                        {new Date(c.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Mobile cards */}
          <div className="md:hidden space-y-3">
            {customers.map((c) => (
              <div key={c.id} className="card p-4 space-y-2">
                <div className="flex items-start justify-between">
                  <p className="font-sans font-medium text-espresso">{c.name}</p>
                  <Badge variant={c.role === 'admin' ? 'gold' : 'default'}>{c.role}</Badge>
                </div>
                <p className="flex items-center gap-1.5 text-xs text-espresso-400 font-sans"><Phone size={12} />{c.mobile}</p>
                <p className="flex items-center gap-1.5 text-xs text-espresso-400 font-sans"><Mail size={12} />{c.email}</p>
                <div className="flex gap-3 text-xs text-espresso-400 font-sans">
                  <span>{c.orderCount} order{c.orderCount !== 1 ? 's' : ''}</span>
                  <span className="flex items-center gap-1"><Calendar size={11} />{new Date(c.createdAt).toLocaleDateString('en-IN', { month: 'short', year: 'numeric' })}</span>
                </div>
              </div>
            ))}
          </div>

          <Pagination page={page} total={total} pageSize={20} onChange={setPage} />
        </>
      )}
    </div>
  );
}
