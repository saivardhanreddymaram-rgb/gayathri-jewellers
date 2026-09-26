import { useState } from 'react';
import { Phone, Mail, MapPin, Clock, Send } from 'lucide-react';
import { PageLayout } from '../components/layout/PageLayout';
import { Input, Textarea } from '../components/ui/Input';
import { Button } from '../components/ui/Button';
import { Breadcrumb } from '../components/layout/Breadcrumb';

const CONTACT_INFO = [
  {
    icon: <MapPin size={18} className="text-gold-500" />,
    label: 'Store Location',
    content: (
      <a
        href="https://maps.app.goo.gl/nqpbGuvtZkEHYJuBA"
        target="_blank"
        rel="noopener noreferrer"
        className="text-sm font-sans text-brown-800 hover:text-gold-600 transition-colors underline underline-offset-2"
      >
        View on Google Maps ↗
      </a>
    ),
  },
  {
    icon: <Phone size={18} className="text-gold-500" />,
    label: 'Phone',
    content: (
      <a href="tel:+916304478352" className="text-sm font-sans text-brown-800 hover:text-gold-600 transition-colors">
        +91 63044 78352
      </a>
    ),
  },
  {
    icon: <Mail size={18} className="text-gold-500" />,
    label: 'Email',
    content: (
      <a href="mailto:gayathrijewellers.in@gmail.com" className="text-sm font-sans text-brown-800 hover:text-gold-600 transition-colors break-all">
        gayathrijewellers.in@gmail.com
      </a>
    ),
  },
  {
    icon: <Clock size={18} className="text-gold-500" />,
    label: 'Store Hours',
    content: <p className="text-sm font-sans text-brown-800">Monday – Saturday, 10am – 7pm</p>,
  },
];

export function ContactPage() {
  const [form,       setForm]       = useState({ name: '', email: '', mobile: '', message: '' });
  const [errors,     setErrors]     = useState<Record<string, string>>({});
  const [submitted,  setSubmitted]  = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const set = (field: string) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
      setForm(f => ({ ...f, [field]: e.target.value }));

  const validate = () => {
    const e: Record<string, string> = {};
    if (!form.name.trim())    e.name    = 'Name is required';
    if (!form.email.trim())   e.email   = 'Email is required';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = 'Enter a valid email';
    if (!form.message.trim()) e.message = 'Message is required';
    return e;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const errs = validate();
    setErrors(errs);
    if (Object.keys(errs).length > 0) return;
    setSubmitting(true);
    await new Promise(r => setTimeout(r, 800));
    setSubmitting(false);
    setSubmitted(true);
  };

  return (
    <PageLayout>
      {/* Hero */}
      <section className="bg-brown-800 py-12 sm:py-16" aria-label="Contact">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 text-center">
          <p className="font-sans text-gold-400 text-xs tracking-[0.3em] uppercase mb-3 font-semibold">Reach Out</p>
          <h1 className="font-serif text-3xl sm:text-4xl text-white font-bold mb-4">Contact Us</h1>
          <p className="text-white/60 font-sans text-sm max-w-md mx-auto leading-relaxed">
            We'd love to hear from you. Reach out with any questions about our jewellery, orders, or to arrange a visit.
          </p>
        </div>
      </section>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
        <Breadcrumb items={[{ label: 'Home', to: '/' }, { label: 'Contact' }]} />

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-6">

          {/* ── Contact Info ── */}
          <div className="space-y-6">
            <div>
              <h2 className="font-serif text-2xl text-brown-800 font-bold mb-3">Get in Touch</h2>
              <p className="text-sm font-sans text-gray-500 leading-relaxed">
                Visit our store for a personalised jewellery consultation, or reach us by phone or email. We are happy to assist you.
              </p>
            </div>

            <div className="space-y-3">
              {CONTACT_INFO.map(item => (
                <div key={item.label} className="flex items-start gap-4 p-4 bg-gray-50 rounded-2xl border border-gray-100">
                  <div className="w-10 h-10 rounded-full bg-gold-100 flex items-center justify-center shrink-0">
                    {item.icon}
                  </div>
                  <div>
                    <p className="text-xs font-sans font-bold text-gray-400 uppercase tracking-wider mb-0.5">{item.label}</p>
                    {item.content}
                  </div>
                </div>
              ))}
            </div>

            {/* ── Google Maps Embed ── */}
            <div className="rounded-2xl overflow-hidden border border-gray-100 shadow-card">
              <iframe
                title="Gayathri Jewellers Location"
                src="https://www.google.com/maps?q=Gayathri+Jewellers&output=embed"
                width="100%"
                height="220"
                style={{ border: 0, display: 'block' }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              />
              <div className="p-3 bg-white flex items-center justify-between">
                <p className="text-xs text-gray-400 font-sans">Gayathri Jewellers</p>
                <a
                  href="https://maps.app.goo.gl/nqpbGuvtZkEHYJuBA"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs font-sans font-semibold text-gold-600 hover:text-gold-700 transition-colors"
                >
                  Open in Maps ↗
                </a>
              </div>
            </div>
          </div>

          {/* ── Contact Form ── */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-card p-5 sm:p-8">
            {submitted ? (
              <div className="text-center py-8 space-y-4">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                  <Send size={24} className="text-green-600" />
                </div>
                <h3 className="font-serif text-xl text-brown-800 font-bold">Message Sent!</h3>
                <p className="text-sm text-gray-500 font-sans">
                  Thank you for reaching out. We'll get back to you shortly at{' '}
                  <strong className="text-brown-800">{form.email}</strong>.
                </p>
                <Button
                  variant="outline"
                  onClick={() => { setSubmitted(false); setForm({ name:'', email:'', mobile:'', message:'' }); }}
                >
                  Send another message
                </Button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} noValidate className="space-y-4">
                <h2 className="font-serif text-xl text-brown-800 font-bold mb-2">Send a Message</h2>
                <Input
                  label="Your Name" value={form.name}
                  onChange={set('name')} error={errors.name}
                  required autoComplete="name"
                />
                <Input
                  label="Email Address" type="email" value={form.email}
                  onChange={set('email')} error={errors.email}
                  required autoComplete="email"
                />
                <Input
                  label="Mobile Number (optional)" type="tel" inputMode="numeric"
                  value={form.mobile}
                  onChange={e => setForm(f => ({ ...f, mobile: e.target.value.replace(/\D/g,'').slice(0,10) }))}
                  autoComplete="tel"
                />
                <Textarea
                  label="Your Message" rows={5}
                  value={form.message}
                  onChange={set('message') as React.ChangeEventHandler<HTMLTextAreaElement>}
                  error={errors.message} required
                  placeholder="Tell us how we can help…"
                />
                <Button
                  type="submit" variant="primary" fullWidth size="lg"
                  loading={submitting} leftIcon={<Send size={16} />}
                >
                  Send Message
                </Button>
              </form>
            )}
          </div>
        </div>
      </div>
    </PageLayout>
  );
}
