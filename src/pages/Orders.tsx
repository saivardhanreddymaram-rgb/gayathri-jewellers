import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Package, Calendar, Truck, Phone, MapPin, ChevronDown, ChevronUp, Hash } from 'lucide-react';
import { PageLayout } from '../components/layout/PageLayout';
import { Breadcrumb } from '../components/layout/Breadcrumb';
import { StatusBadge } from '../components/ui/Badge';
import { OrderCardSkeleton } from '../components/ui/Skeleton';
import { EmptyState, ErrorState } from '../components/ui/EmptyState';
import { getOrders } from '../api/orders';
import { extractErrorMessage } from '../api/client';
import { DELIVERY_STATUS_ORDER } from '../constants/catalogue';
import type { Order, DeliveryStatus } from '../types';

// ─── Status Timeline ───────────────────────────────────────────────────────────

function StatusTimeline({ status }: { status: DeliveryStatus }) {
  const isCancelled = status === 'Cancelled';
  const currentIdx = isCancelled ? -1 : DELIVERY_STATUS_ORDER.indexOf(status as typeof DELIVERY_STATUS_ORDER[number]);

  return (
    <div className="mt-5" aria-label="Order status timeline">
      {isCancelled ? (
        <div className="flex items-center gap-2 text-red-600 text-sm font-sans">
          <span className="w-3 h-3 rounded-full bg-red-500 shrink-0" />
          Order Cancelled
        </div>
      ) : (
        <ol className="flex items-center overflow-x-auto gap-0 pb-1">
          {DELIVERY_STATUS_ORDER.map((step, idx) => {
            const done = idx <= currentIdx;
            const active = idx === currentIdx;
            return (
              <li key={step} className="flex items-center shrink-0">
                <div className="flex flex-col items-center gap-1">
                  <div
                    className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors ${done ? 'bg-espresso border-espresso' : 'bg-white border-espresso-100'}`}
                    aria-current={active ? 'step' : undefined}
                  >
                    {done && <span className="w-2 h-2 rounded-full bg-ivory" />}
                  </div>
                  <span className={`text-[10px] font-sans text-center max-w-[64px] leading-tight ${active ? 'text-espresso font-semibold' : done ? 'text-espresso-400' : 'text-espresso-100'}`}>
                    {step}
                  </span>
                </div>
                {idx < DELIVERY_STATUS_ORDER.length - 1 && (
                  <div className={`h-0.5 w-8 mx-1 transition-colors ${idx < currentIdx ? 'bg-espresso' : 'bg-espresso-100'}`} aria-hidden />
                )}
              </li>
            );
          })}
        </ol>
      )}
    </div>
  );
}

// ─── Order Card ────────────────────────────────────────────────────────────────

function OrderCard({ order }: { order: Order }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <article className="card p-5 sm:p-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-3 flex-wrap">
        <div>
          <p className="text-xs text-espresso-400 font-sans uppercase tracking-wider">Order</p>
          <p className="font-sans font-bold text-espresso">#{order.id}</p>
          <p className="text-xs text-espresso-400 font-sans mt-0.5">
            Placed {new Date(order.placedAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
          </p>
        </div>
        <StatusBadge status={order.status} />
      </div>

      {/* Timeline */}
      <StatusTimeline status={order.status} />

      {/* Summary row */}
      <div className="mt-4 flex items-center justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-4 text-xs font-sans text-espresso-400 flex-wrap">
          <span className="flex items-center gap-1">
            <Truck size={13} /> {order.deliveryOption}
          </span>
          <span className="flex items-center gap-1">
            <Phone size={13} /> {order.customerMobile}
          </span>
          {(order.confirmedDeliveryDate || order.estimatedDeliveryDate) && (
            <span className="flex items-center gap-1">
              <Calendar size={13} />
              {order.confirmedDeliveryDate ?? `Est. ${order.estimatedDeliveryDate}`}
            </span>
          )}
          {order.trackingNumber && (
            <span className="flex items-center gap-1">
              <Hash size={13} /> {order.trackingNumber}
            </span>
          )}
        </div>
        <p className="font-sans font-bold text-espresso">₹{order.total.toLocaleString('en-IN')}</p>
      </div>

      {/* Expand/collapse details */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="mt-4 flex items-center gap-1.5 text-xs font-sans text-gold-600 hover:text-gold-700 transition-colors"
        aria-expanded={expanded}
      >
        {expanded ? <><ChevronUp size={13} /> Hide details</> : <><ChevronDown size={13} /> Show details</>}
      </button>

      {expanded && (
        <div className="mt-4 pt-4 border-t border-ivory-200 space-y-4 animate-slide-up">
          {/* Items */}
          <div className="space-y-3">
            {order.items.map((item, i) => (
              <div key={i} className="flex gap-3">
                {item.image && (
                  <div className="w-12 h-12 rounded-xl overflow-hidden bg-ivory-100 border border-ivory-200 shrink-0">
                    <img src={item.image} alt={item.productName} className="w-full h-full object-cover" />
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <Link to={`/products/${item.productSlug}`} className="text-sm font-sans text-espresso font-medium hover:text-gold-700 transition-colors line-clamp-1">
                    {item.productName}
                  </Link>
                  <p className="text-xs text-espresso-400 font-sans">{item.collection} · {item.subcategory} · Qty {item.quantity}</p>
                </div>
                <p className="text-sm font-bold text-espresso shrink-0 font-sans">₹{((item.price ?? 0) * item.quantity).toLocaleString('en-IN')}</p>
              </div>
            ))}
          </div>

          {/* Address */}
          <div className="flex items-start gap-2 text-xs text-espresso-400 font-sans">
            <MapPin size={13} className="mt-0.5 shrink-0 text-gold-600" />
            <span>
              {order.shippingAddress.name}, {order.shippingAddress.address},{' '}
              {order.shippingAddress.city}, {order.shippingAddress.state} – {order.shippingAddress.postalCode}
            </span>
          </div>
        </div>
      )}
    </article>
  );
}

// ─── Orders Page ───────────────────────────────────────────────────────────────

export function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchOrders = useCallback(async () => {
    setLoading(true); setError(null);
    try {
      const { orders } = await getOrders();
      setOrders(orders);
    } catch (err) {
      setError(extractErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchOrders(); }, [fetchOrders]);

  return (
    <PageLayout>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
        <Breadcrumb items={[{ label: 'Home', to: '/' }, { label: 'My Orders' }]} />
        <div className="mt-6 mb-8">
          <h1 className="font-serif text-3xl text-espresso font-medium">My Orders</h1>
          <p className="text-sm text-espresso-400 font-sans mt-1">Track your orders and view delivery status.</p>
        </div>

        {loading && (
          <div className="space-y-4">
            {Array.from({ length: 3 }).map((_, i) => <OrderCardSkeleton key={i} />)}
          </div>
        )}

        {!loading && error && <ErrorState message={error} onRetry={fetchOrders} />}

        {!loading && !error && orders.length === 0 && (
          <EmptyState
            icon={Package}
            title="No orders yet"
            description="Your order history will appear here once you place your first order."
            action={{ label: 'Start Shopping', onClick: () => window.location.href = '/products' }}
          />
        )}

        {!loading && !error && orders.length > 0 && (
          <div className="space-y-4">
            {orders.map((order) => <OrderCard key={order.id} order={order} />)}
          </div>
        )}
      </div>
    </PageLayout>
  );
}
