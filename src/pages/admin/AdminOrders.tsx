import { useCallback, useEffect, useState } from 'react';
import { Search, ChevronDown, ChevronUp, Phone, MapPin, Pencil, Package } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Input, Select } from '../../components/ui/Input';
import { Modal } from '../../components/ui/Modal';
import { StatusBadge } from '../../components/ui/Badge';
import { OrderCardSkeleton } from '../../components/ui/Skeleton';
import { EmptyState, ErrorState } from '../../components/ui/EmptyState';
import { adminGetOrders, adminUpdateOrder } from '../../api/orders';
import { extractErrorMessage } from '../../api/client';
import { DELIVERY_STATUS_ORDER } from '../../constants/catalogue';
import type { Order, DeliveryStatus } from '../../types';
import toast from 'react-hot-toast';

// ─── Edit Order Modal ──────────────────────────────────────────────────────────

interface EditOrderModalProps {
  open: boolean;
  onClose: () => void;
  order: Order | null;
  onSaved: () => void;
}

function EditOrderModal({ open, onClose, order, onSaved }: EditOrderModalProps) {
  const [status, setStatus] = useState<DeliveryStatus>('Order Placed');
  const [trackingNumber, setTrackingNumber] = useState('');
  const [estimatedDate, setEstimatedDate] = useState('');
  const [confirmedDate, setConfirmedDate] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (order) {
      setStatus(order.status);
      setTrackingNumber(order.trackingNumber ?? '');
      setEstimatedDate(order.estimatedDeliveryDate ?? '');
      setConfirmedDate(order.confirmedDeliveryDate ?? '');
    }
  }, [order]);

  const statusOptions = [
    ...DELIVERY_STATUS_ORDER.map((s) => ({ value: s, label: s })),
    { value: 'Cancelled', label: 'Cancelled' },
  ];

  const handleSave = async () => {
    if (!order) return;
    setSaving(true);
    try {
      await adminUpdateOrder(order.id, {
        status,
        trackingNumber: trackingNumber || undefined,
        estimatedDeliveryDate: estimatedDate || undefined,
        confirmedDeliveryDate: confirmedDate || undefined,
      });
      toast.success('Order updated');
      onSaved();
      onClose();
    } catch (err) {
      toast.error(extractErrorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  if (!order) return null;

  return (
    <Modal open={open} onClose={onClose} title={`Update Order #${order.id}`} size="md">
      <div className="space-y-5">
        <Select
          label="Delivery Status"
          value={status}
          onChange={(e) => setStatus(e.target.value as DeliveryStatus)}
          options={statusOptions}
          required
        />
        <Input
          label="Tracking / Reference Number (optional)"
          value={trackingNumber}
          onChange={(e) => setTrackingNumber(e.target.value)}
          placeholder="e.g. SP123456789IN"
        />
        <Input
          label="Estimated Delivery Date (optional)"
          type="date"
          value={estimatedDate}
          onChange={(e) => setEstimatedDate(e.target.value)}
        />
        <Input
          label="Confirmed Delivery Date (optional)"
          type="date"
          value={confirmedDate}
          onChange={(e) => setConfirmedDate(e.target.value)}
          hint="Customer sees this as the confirmed delivery date"
        />
        <div className="bg-gold-50 border border-gold-200 rounded-xl p-4">
          <p className="text-sm text-espresso-400 font-sans">
            <span className="font-medium text-espresso">Customer contact:</span> {order.customerMobile}
          </p>
        </div>
        <div className="flex justify-end gap-3 pt-2 border-t border-ivory-200">
          <Button variant="ghost" onClick={onClose}>Cancel</Button>
          <Button variant="primary" loading={saving} onClick={handleSave}>Save Changes</Button>
        </div>
      </div>
    </Modal>
  );
}

// ─── Order Row ─────────────────────────────────────────────────────────────────

function AdminOrderCard({ order, onEdit }: { order: Order; onEdit: (o: Order) => void }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="card overflow-hidden">
      <div className="p-4 sm:p-5">
        {/* Top row */}
        <div className="flex items-start justify-between gap-3 flex-wrap">
          <div>
            <p className="font-sans font-bold text-espresso">#{order.id}</p>
            <p className="text-xs text-espresso-400 font-sans mt-0.5">
              {new Date(order.placedAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <StatusBadge status={order.status} />
            <Button variant="outline" size="sm" leftIcon={<Pencil size={13} />} onClick={() => onEdit(order)}>
              Update
            </Button>
          </div>
        </div>

        {/* Customer info */}
        <div className="mt-3 flex flex-wrap gap-x-5 gap-y-1.5 text-xs text-espresso-400 font-sans">
          <span className="flex items-center gap-1.5 font-medium text-espresso">
            <Package size={13} className="text-gold-600" /> {order.shippingAddress.name}
          </span>
          <span className="flex items-center gap-1.5">
            <Phone size={13} className="text-gold-600" /> {order.customerMobile}
          </span>
          <span className="flex items-center gap-1.5">
            <MapPin size={13} className="text-gold-600" />
            {order.shippingAddress.city}, {order.shippingAddress.state}
          </span>
        </div>

        {/* Delivery + total */}
        <div className="mt-3 flex items-center justify-between gap-3 flex-wrap">
          <div className="flex gap-3 text-xs text-espresso-400 font-sans flex-wrap">
            <span>Delivery: <strong className="text-espresso">{order.deliveryOption}</strong></span>
            {order.trackingNumber && <span>Ref: <strong className="text-espresso">{order.trackingNumber}</strong></span>}
            {(order.confirmedDeliveryDate || order.estimatedDeliveryDate) && (
              <span>{order.confirmedDeliveryDate ? 'Confirmed' : 'Est.'}: <strong className="text-espresso">{order.confirmedDeliveryDate ?? order.estimatedDeliveryDate}</strong></span>
            )}
          </div>
          <p className="font-sans font-bold text-espresso">₹{order.total.toLocaleString('en-IN')}</p>
        </div>

        {/* Expand */}
        <button
          onClick={() => setExpanded(!expanded)}
          className="mt-3 flex items-center gap-1.5 text-xs font-sans text-gold-600 hover:text-gold-700 transition-colors"
          aria-expanded={expanded}
        >
          {expanded ? <><ChevronUp size={13} /> Hide items</> : <><ChevronDown size={13} /> Show items ({order.items.length})</>}
        </button>

        {expanded && (
          <div className="mt-3 pt-3 border-t border-ivory-200 space-y-2 animate-slide-up">
            {order.items.map((item, i) => (
              <div key={i} className="flex gap-2 text-sm font-sans">
                {item.image && (
                  <div className="w-10 h-10 rounded-lg bg-ivory-100 border border-ivory-200 overflow-hidden shrink-0">
                    <img src={item.image} alt={item.productName} className="w-full h-full object-cover" />
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <p className="text-espresso font-medium line-clamp-1">{item.productName}</p>
                  <p className="text-xs text-espresso-400">{item.collection} · {item.subcategory} · Qty {item.quantity}</p>
                </div>
                <p className="font-bold text-espresso shrink-0">₹{((item.price ?? 0) * item.quantity).toLocaleString('en-IN')}</p>
              </div>
            ))}

            {/* Delivery address */}
            <div className="pt-2 text-xs text-espresso-400 font-sans">
              <span className="font-medium text-espresso">Ship to: </span>
              {order.shippingAddress.address}, {order.shippingAddress.locality && `${order.shippingAddress.locality}, `}
              {order.shippingAddress.city}, {order.shippingAddress.state} – {order.shippingAddress.postalCode}
            </div>
            {order.shippingAddress.note && (
              <p className="text-xs text-espresso-400 font-sans italic">Note: {order.shippingAddress.note}</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Main page ─────────────────────────────────────────────────────────────────

const STATUS_OPTIONS = [
  { value: '', label: 'All Statuses' },
  { value: 'Order Placed', label: 'Order Placed' },
  { value: 'Confirmed', label: 'Confirmed' },
  { value: 'Preparing', label: 'Preparing' },
  { value: 'Shipped', label: 'Shipped' },
  { value: 'Out for Delivery', label: 'Out for Delivery' },
  { value: 'Delivered', label: 'Delivered' },
  { value: 'Cancelled', label: 'Cancelled' },
];

export function AdminOrders() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState('');
  const [search, setSearch] = useState('');
  const [editOrder, setEditOrder] = useState<Order | null>(null);

  const fetchOrders = useCallback(async () => {
    setLoading(true); setError(null);
    try {
      const result = await adminGetOrders({ status: statusFilter || undefined });
      setOrders(result.orders);
      setTotal(result.total);
    } catch (err) {
      setError(extractErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, [statusFilter]);

  useEffect(() => { fetchOrders(); }, [fetchOrders]);

  const filtered = search.trim()
    ? orders.filter((o) =>
        o.id.toLowerCase().includes(search.toLowerCase()) ||
        o.shippingAddress.name.toLowerCase().includes(search.toLowerCase()) ||
        o.customerMobile.includes(search)
      )
    : orders;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-serif text-3xl text-espresso font-medium">Orders</h1>
        <p className="text-sm text-espresso-400 font-sans mt-1">{total} total orders</p>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1 max-w-xs">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-espresso-400 pointer-events-none" aria-hidden />
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by order ID, name, mobile…"
            aria-label="Search orders"
            className="w-full pl-9 pr-4 py-2.5 bg-white border border-espresso-100 rounded-xl text-sm font-sans text-espresso focus:outline-none focus:border-gold-500 focus:ring-2 focus:ring-gold-200 transition-colors"
          />
        </div>
        <Select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          options={STATUS_OPTIONS}
          wrapperClassName="max-w-xs"
          aria-label="Filter by status"
        />
      </div>

      {loading && <div className="space-y-3">{Array.from({length:4}).map((_,i)=><OrderCardSkeleton key={i} />)}</div>}
      {!loading && error && <ErrorState message={error} onRetry={fetchOrders} />}
      {!loading && !error && filtered.length === 0 && (
        <EmptyState icon={Package} title="No orders found" description={search ? 'No orders match your search.' : 'No orders placed yet.'} />
      )}
      {!loading && !error && filtered.length > 0 && (
        <div className="space-y-4">
          {filtered.map((order) => (
            <AdminOrderCard key={order.id} order={order} onEdit={setEditOrder} />
          ))}
        </div>
      )}

      <EditOrderModal
        open={!!editOrder}
        onClose={() => setEditOrder(null)}
        order={editOrder}
        onSaved={fetchOrders}
      />
    </div>
  );
}
