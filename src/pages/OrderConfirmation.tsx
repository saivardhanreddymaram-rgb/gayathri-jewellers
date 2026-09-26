import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { CheckCircle, Package, Phone, Truck, Calendar } from 'lucide-react';
import { PageLayout } from '../components/layout/PageLayout';
import { StatusBadge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { Skeleton } from '../components/ui/Skeleton';
import { ErrorState } from '../components/ui/EmptyState';
import { getOrderById } from '../api/orders';
import { extractErrorMessage } from '../api/client';
import type { Order } from '../types';

export function OrderConfirmationPage() {
  const { orderId } = useParams<{ orderId: string }>();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!orderId) return;
    getOrderById(orderId)
      .then(({ order }) => setOrder(order))
      .catch((err) => setError(extractErrorMessage(err)))
      .finally(() => setLoading(false));
  }, [orderId]);

  if (loading) return <PageLayout><div className="max-w-2xl mx-auto px-4 py-16 space-y-4"><Skeleton className="h-8 w-48 mx-auto" /><Skeleton className="h-4 w-72 mx-auto" /><Skeleton className="h-40 w-full" /></div></PageLayout>;
  if (error || !order) return <PageLayout><ErrorState message={error ?? 'Order not found.'} /></PageLayout>;

  return (
    <PageLayout>
      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-12">
        {/* Success header */}
        <div className="text-center mb-10">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-5">
            <CheckCircle size={36} className="text-green-600" />
          </div>
          <h1 className="font-serif text-3xl text-espresso font-medium mb-2">Order Placed!</h1>
          <p className="text-sm font-sans text-espresso-400">
            Thank you for your order. We'll be in touch shortly about your jewellery.
          </p>
        </div>

        {/* Order card */}
        <div className="card p-6 space-y-6">
          {/* Order number + status */}
          <div className="flex items-start justify-between gap-3 flex-wrap">
            <div>
              <p className="text-xs text-espresso-400 font-sans uppercase tracking-wider">Order Number</p>
              <p className="font-sans font-bold text-espresso text-lg mt-0.5">#{order.id}</p>
            </div>
            <StatusBadge status={order.status} />
          </div>

          {/* Items */}
          <div className="border-t border-ivory-200 pt-5 space-y-4">
            <h2 className="font-sans text-sm font-semibold text-espresso">Items Ordered</h2>
            {order.items.map((item, i) => (
              <div key={i} className="flex gap-3">
                {item.image && (
                  <div className="w-14 h-14 rounded-xl overflow-hidden bg-ivory-100 border border-ivory-200 shrink-0">
                    <img src={item.image} alt={item.productName} className="w-full h-full object-cover" />
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-sans text-espresso font-medium">{item.productName}</p>
                  <p className="text-xs text-espresso-400 font-sans">{item.collection} · {item.subcategory} · Qty {item.quantity}</p>
                </div>
                <p className="text-sm font-sans font-bold text-espresso shrink-0">₹{((item.price ?? 0) * item.quantity).toLocaleString('en-IN')}</p>
              </div>
            ))}
          </div>

          {/* Totals */}
          <div className="border-t border-ivory-200 pt-4 space-y-2 text-sm font-sans">
            <div className="flex justify-between text-espresso-400"><span>Subtotal</span><span>₹{order.subtotal.toLocaleString('en-IN')}</span></div>
            <div className="flex justify-between text-espresso-400">
              <span>Delivery ({order.deliveryOption})</span>
              <span>{order.deliveryCharge === null ? 'Contact store' : order.deliveryCharge === 0 ? 'Free' : `₹${order.deliveryCharge.toLocaleString('en-IN')}`}</span>
            </div>
            <div className="flex justify-between font-bold text-espresso text-base border-t border-ivory-200 pt-2">
              <span>Total</span><span>₹{order.total.toLocaleString('en-IN')}</span>
            </div>
          </div>

          {/* Delivery info */}
          <div className="border-t border-ivory-200 pt-5 grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="flex items-start gap-3">
              <Phone size={16} className="text-gold-600 mt-0.5 shrink-0" />
              <div>
                <p className="text-xs text-espresso-400 font-sans">Contact Number</p>
                <p className="text-sm font-sans font-medium text-espresso">{order.customerMobile}</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Truck size={16} className="text-gold-600 mt-0.5 shrink-0" />
              <div>
                <p className="text-xs text-espresso-400 font-sans">Delivery Method</p>
                <p className="text-sm font-sans font-medium text-espresso">{order.deliveryOption}</p>
              </div>
            </div>
            {(order.estimatedDeliveryDate || order.confirmedDeliveryDate) && (
              <div className="flex items-start gap-3 sm:col-span-2">
                <Calendar size={16} className="text-gold-600 mt-0.5 shrink-0" />
                <div>
                  <p className="text-xs text-espresso-400 font-sans">
                    {order.confirmedDeliveryDate ? 'Confirmed Delivery Date' : 'Estimated Delivery'}
                  </p>
                  <p className="text-sm font-sans font-medium text-espresso">
                    {order.confirmedDeliveryDate ?? order.estimatedDeliveryDate}
                  </p>
                </div>
              </div>
            )}
            {order.trackingNumber && (
              <div className="flex items-start gap-3 sm:col-span-2">
                <Package size={16} className="text-gold-600 mt-0.5 shrink-0" />
                <div>
                  <p className="text-xs text-espresso-400 font-sans">Tracking / Reference</p>
                  <p className="text-sm font-sans font-medium text-espresso">{order.trackingNumber}</p>
                </div>
              </div>
            )}
          </div>

          {/* Delivery address */}
          <div className="border-t border-ivory-200 pt-5">
            <p className="text-xs text-espresso-400 font-sans uppercase tracking-wider mb-2">Delivering To</p>
            <p className="text-sm font-sans text-espresso leading-relaxed">
              {order.shippingAddress.name}<br />
              {order.shippingAddress.address}<br />
              {order.shippingAddress.locality && <>{order.shippingAddress.locality}, </>}
              {order.shippingAddress.city}, {order.shippingAddress.state} – {order.shippingAddress.postalCode}
            </p>
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-3 mt-6">
          <Link to="/orders" className="flex-1">
            <Button variant="outline" fullWidth>Track My Order</Button>
          </Link>
          <Link to="/products" className="flex-1">
            <Button variant="primary" fullWidth>Continue Shopping</Button>
          </Link>
        </div>
      </div>
    </PageLayout>
  );
}
