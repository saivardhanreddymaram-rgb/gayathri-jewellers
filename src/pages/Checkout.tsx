import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, MapPin, Phone, Mail, Truck } from 'lucide-react';
import { PageLayout } from '../components/layout/PageLayout';
import { Input, Textarea, Select } from '../components/ui/Input';
import { Button } from '../components/ui/Button';
import { Skeleton } from '../components/ui/Skeleton';
import { useCart } from '../contexts/CartContext';
import { useAuth } from '../contexts/AuthContext';
import { getDeliveryOptions, placeOrder } from '../api/orders';
import { extractErrorMessage } from '../api/client';
import type { DeliveryOption, ShippingAddress } from '../types';

interface FormErrors {
  name?: string; mobile?: string; email?: string;
  address?: string; city?: string; state?: string; postalCode?: string;
}

const INDIAN_STATES = [
  'Andhra Pradesh','Arunachal Pradesh','Assam','Bihar','Chhattisgarh','Goa','Gujarat',
  'Haryana','Himachal Pradesh','Jharkhand','Karnataka','Kerala','Madhya Pradesh',
  'Maharashtra','Manipur','Meghalaya','Mizoram','Nagaland','Odisha','Punjab',
  'Rajasthan','Sikkim','Tamil Nadu','Telangana','Tripura','Uttar Pradesh',
  'Uttarakhand','West Bengal','Delhi','Jammu & Kashmir','Ladakh','Puducherry',
];

function validateForm(form: ShippingAddress): FormErrors {
  const e: FormErrors = {};
  if (!form.name.trim())                                  e.name = 'Full name is required';
  if (!form.mobile.trim())                                e.mobile = 'Mobile number is required';
  else if (!/^[6-9]\d{9}$/.test(form.mobile))            e.mobile = 'Enter a valid 10-digit mobile number';
  if (!form.email.trim())                                 e.email = 'Email is required';
  else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = 'Enter a valid email';
  if (!form.address.trim())                               e.address = 'Delivery address is required';
  if (!form.city.trim())                                  e.city = 'City is required';
  if (!form.state)                                        e.state = 'Please select a state';
  if (!form.postalCode.trim())                            e.postalCode = 'Postal code is required';
  else if (!/^\d{6}$/.test(form.postalCode))              e.postalCode = 'Enter a valid 6-digit postal code';
  return e;
}

export function CheckoutPage() {
  const navigate = useNavigate();
  const { user }  = useAuth();
  const { cart, emptyCart } = useCart();
  const items = cart?.items ?? [];

  const [form, setForm] = useState<ShippingAddress>({
    name: user?.name ?? '', mobile: user?.mobile ?? '', email: user?.email ?? '',
    address: '', locality: '', city: '', state: '', postalCode: '', note: '',
  });
  const [errors,          setErrors]          = useState<FormErrors>({});
  const [deliveryOptions, setDeliveryOptions] = useState<DeliveryOption[]>([]);
  const [selectedDelivery,setSelectedDelivery]= useState('');
  const [deliveryLoading, setDeliveryLoading] = useState(true);
  const [submitting,      setSubmitting]      = useState(false);
  const [serverError,     setServerError]     = useState('');

  useEffect(() => {
    getDeliveryOptions().then(({ options }) => {
      const enabled = options.filter(o => o.enabled);
      setDeliveryOptions(enabled);
      if (enabled.length > 0) setSelectedDelivery(enabled[0].id);
    }).finally(() => setDeliveryLoading(false));
  }, []);

  if (items.length === 0) { navigate('/cart', { replace: true }); return null; }

  const set = (field: keyof ShippingAddress) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
      setForm(f => ({ ...f, [field]: e.target.value }));

  const selectedOption  = deliveryOptions.find(o => o.id === selectedDelivery);
  const subtotal        = cart?.subtotal ?? 0;
  const deliveryCharge  = selectedOption?.price ?? null;
  const total           = deliveryCharge !== null ? subtotal + deliveryCharge : subtotal;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setServerError('');
    const errs = validateForm(form);
    setErrors(errs);
    if (Object.keys(errs).length > 0) return;
    if (!selectedDelivery) { setServerError('Please select a delivery option.'); return; }
    setSubmitting(true);
    try {
      const { order } = await placeOrder({ shippingAddress: form, deliveryOptionId: selectedDelivery, note: form.note });
      await emptyCart();
      navigate(`/orders/confirmation/${order.id}`, { replace: true });
    } catch (err) {
      setServerError(extractErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <PageLayout>
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <Link to="/cart" className="p-2.5 rounded-xl hover:bg-gray-100 transition-colors min-w-[44px] min-h-[44px] flex items-center justify-center" aria-label="Back to cart">
            <ArrowLeft size={20} />
          </Link>
          <h1 className="font-serif text-2xl sm:text-3xl text-brown-800 font-bold">Checkout</h1>
        </div>

        <form onSubmit={handleSubmit} noValidate>
          {/* Mobile: form then summary stacked. Desktop: side by side */}
          <div className="flex flex-col lg:flex-row gap-6">

            {/* ── LEFT — form ── */}
            <div className="flex-1 space-y-5">

              {/* Delivery details */}
              <div className="bg-white rounded-2xl border border-gray-100 shadow-card p-4 sm:p-6">
                <h2 className="font-serif text-lg sm:text-xl text-brown-800 font-bold mb-4 flex items-center gap-2">
                  <MapPin size={18} className="text-gold-500" /> Delivery Details
                </h2>
                <div className="space-y-4">
                  <Input label="Full Name" value={form.name} onChange={set('name')} error={errors.name} required autoComplete="name" />
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <Input label="Mobile Number" type="tel" inputMode="numeric"
                      value={form.mobile} onChange={e => setForm(f => ({ ...f, mobile: e.target.value.replace(/\D/g,'').slice(0,10) }))}
                      error={errors.mobile} required autoComplete="tel"
                      leftIcon={<Phone size={15} />} hint="For delivery contact" />
                    <Input label="Email Address" type="email"
                      value={form.email} onChange={set('email')} error={errors.email} required autoComplete="email"
                      leftIcon={<Mail size={15} />} />
                  </div>
                  <Textarea label="Delivery Address" rows={3}
                    value={form.address} onChange={set('address') as React.ChangeEventHandler<HTMLTextAreaElement>}
                    error={errors.address} required placeholder="House/flat number, street, landmark…" />
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <Input label="Locality / Area" value={form.locality} onChange={set('locality')} placeholder="e.g. Anna Nagar" />
                    <Input label="City" value={form.city} onChange={set('city')} error={errors.city} required />
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <Select label="State" value={form.state}
                      onChange={set('state') as React.ChangeEventHandler<HTMLSelectElement>}
                      error={errors.state} required placeholder="Select state"
                      options={INDIAN_STATES.map(s => ({ value:s, label:s }))} />
                    <Input label="Postal Code" type="text" inputMode="numeric" maxLength={6}
                      value={form.postalCode}
                      onChange={e => setForm(f => ({ ...f, postalCode: e.target.value.replace(/\D/g,'').slice(0,6) }))}
                      error={errors.postalCode} required />
                  </div>
                  <Textarea label="Order Note (optional)" rows={2}
                    value={form.note ?? ''} onChange={set('note') as React.ChangeEventHandler<HTMLTextAreaElement>}
                    placeholder="Special instructions for your order…" />
                </div>
              </div>

              {/* Delivery option */}
              <div className="bg-white rounded-2xl border border-gray-100 shadow-card p-4 sm:p-6">
                <h2 className="font-serif text-lg sm:text-xl text-brown-800 font-bold mb-4 flex items-center gap-2">
                  <Truck size={18} className="text-gold-500" /> Delivery Option
                </h2>
                {deliveryLoading && <div className="space-y-3">{[1,2].map(i => <Skeleton key={i} className="h-16 w-full" />)}</div>}
                {!deliveryLoading && deliveryOptions.length === 0 && (
                  <p className="text-sm text-gray-400 font-sans">No delivery options available. Please contact the store.</p>
                )}
                {!deliveryLoading && deliveryOptions.length > 0 && (
                  <fieldset className="space-y-3">
                    <legend className="sr-only">Choose delivery option</legend>
                    {deliveryOptions.map(opt => (
                      <label key={opt.id} className={`flex items-center justify-between p-4 border-2 rounded-xl cursor-pointer transition-all ${selectedDelivery === opt.id ? 'border-brown-800 bg-gray-50' : 'border-gray-200 hover:border-gray-300'}`}>
                        <div className="flex items-center gap-3">
                          <input type="radio" name="delivery" value={opt.id} checked={selectedDelivery === opt.id} onChange={() => setSelectedDelivery(opt.id)} className="w-4 h-4 accent-gold-500" />
                          <div>
                            <p className="font-sans font-semibold text-sm text-brown-800">{opt.name}</p>
                            {opt.estimatedRange && <p className="text-xs text-gray-400 font-sans mt-0.5">{opt.estimatedRange}</p>}
                          </div>
                        </div>
                        <span className="font-sans font-semibold text-sm text-brown-800 shrink-0">
                          {opt.price === null ? 'Contact store' : opt.price === 0 ? 'Free' : `₹${opt.price.toLocaleString('en-IN')}`}
                        </span>
                      </label>
                    ))}
                  </fieldset>
                )}
              </div>
            </div>

            {/* ── RIGHT — order summary ── */}
            <div className="lg:w-80 shrink-0">
              <div className="bg-white rounded-2xl border border-gray-100 shadow-card p-5 lg:sticky lg:top-24 space-y-4">
                <h2 className="font-serif text-xl text-brown-800 font-bold">Order Summary</h2>

                {/* Items */}
                <div className="space-y-3 max-h-48 overflow-y-auto">
                  {items.map(item => (
                    <div key={item.id} className="flex gap-3">
                      <div className="w-11 h-11 rounded-lg bg-gray-50 border border-gray-100 overflow-hidden shrink-0">
                        {item.product.images?.[0]
                          ? <img src={item.product.images[0]} alt="" className="w-full h-full object-cover" />
                          : <div className="w-full h-full flex items-center justify-center text-gray-200" aria-hidden>◈</div>}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-sans text-brown-800 font-semibold line-clamp-1">{item.product.name}</p>
                        <p className="text-xs text-gray-400">Qty: {item.quantity}</p>
                      </div>
                      <p className="text-xs font-bold text-brown-800 shrink-0">₹{((item.product.price ?? 0) * item.quantity).toLocaleString('en-IN')}</p>
                    </div>
                  ))}
                </div>

                {/* Totals */}
                <div className="border-t border-gray-100 pt-3 space-y-2 text-sm font-sans">
                  <div className="flex justify-between text-gray-500">
                    <span>Subtotal</span>
                    <span className="font-semibold text-brown-800">₹{subtotal.toLocaleString('en-IN')}</span>
                  </div>
                  <div className="flex justify-between text-gray-500">
                    <span>Delivery</span>
                    <span className="text-brown-800 font-semibold">
                      {deliveryCharge === null ? <em className="not-italic text-xs text-gray-400">Contact store</em>
                        : deliveryCharge === 0 ? 'Free'
                        : `₹${deliveryCharge.toLocaleString('en-IN')}`}
                    </span>
                  </div>
                  <div className="flex justify-between font-bold text-brown-800 text-base pt-2 border-t border-gray-100">
                    <span>Total</span>
                    <span>₹{total.toLocaleString('en-IN')}</span>
                  </div>
                </div>

                {serverError && (
                  <p role="alert" className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-xl px-4 py-3 font-sans">{serverError}</p>
                )}

                <Button type="submit" variant="primary" fullWidth size="lg" loading={submitting}>
                  Place Order
                </Button>
              </div>
            </div>
          </div>
        </form>
      </div>
    </PageLayout>
  );
}
