import { Link } from 'react-router-dom';
import { ArrowRight, Gem, Heart, Shield } from 'lucide-react';
import { PageLayout } from '../components/layout/PageLayout';
import { Button } from '../components/ui/Button';

export function AboutPage() {
  return (
    <PageLayout>
      {/* Hero */}
      <section className="bg-espresso py-16 sm:py-24 relative overflow-hidden" aria-label="Our Story">
        <div className="absolute inset-0 pointer-events-none" aria-hidden>
          <div className="absolute top-0 right-0 w-[500px] h-[500px] rounded-full border border-gold-600/10 translate-x-1/3 -translate-y-1/3" />
        </div>
        <div className="relative max-w-3xl mx-auto px-4 sm:px-6 text-center">
          <p className="font-sans text-gold-400 text-xs tracking-[0.3em] uppercase mb-4">Our Story</p>
          <h1 className="font-serif text-4xl sm:text-5xl text-ivory font-medium mb-6 leading-tight">
            Crafted with Tradition,<br />Worn with Pride
          </h1>
          <p className="text-ivory/70 font-sans text-base leading-relaxed max-w-xl mx-auto">
            Gayathri Jewellers was founded on a single belief — every piece of jewellery carries
            the spirit of the hands that made it and the heart that wears it.
          </p>
        </div>
      </section>

      {/* Story */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-start">
          <div className="space-y-5">
            <h2 className="font-serif text-3xl text-espresso font-medium">Who We Are</h2>
            <p className="font-sans text-sm text-espresso-400 leading-relaxed">
              Gayathri Jewellers is a premium Indian jewellery store dedicated to offering
              exquisite Gold, Silver, One Gram Gold, and Stones jewellery. We serve customers
              who value quality, authenticity, and the timeless beauty of handcrafted jewellery.
            </p>
            <p className="font-sans text-sm text-espresso-400 leading-relaxed">
              Every piece in our collection is carefully curated, ensuring that what you wear
              reflects the finest craftsmanship and endures the test of time.
            </p>
          </div>
          <div className="space-y-5">
            <h2 className="font-serif text-3xl text-espresso font-medium">Our Promise</h2>
            <p className="font-sans text-sm text-espresso-400 leading-relaxed">
              We believe jewellery is more than an accessory — it is a memory, a celebration,
              and a legacy. That is why we bring you only the finest pieces, backed by honest
              craftsmanship and transparent service.
            </p>
            <p className="font-sans text-sm text-espresso-400 leading-relaxed">
              We are committed to providing a premium shopping experience — from the first browse
              to the moment your jewellery arrives at your door.
            </p>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="bg-ivory border-y border-ivory-200 py-14">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-10">
            <p className="section-subtitle mb-2">What We Stand For</p>
            <h2 className="section-title">Our Values</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {[
              { icon: <Gem size={24} className="text-gold-600" />, title: 'Quality First', desc: 'Every piece is selected for its quality, finish, and authenticity. We never compromise on craftsmanship.' },
              { icon: <Heart size={24} className="text-gold-600" />, title: 'Made with Care', desc: 'Jewellery created with passion and attention to detail, reflecting the artistry of skilled craftspeople.' },
              { icon: <Shield size={24} className="text-gold-600" />, title: 'Trusted Service', desc: 'From secure ordering to reliable delivery, we ensure every interaction with Gayathri Jewellers is trustworthy.' },
            ].map((v) => (
              <div key={v.title} className="flex flex-col items-center text-center gap-4 p-6 card">
                <div className="w-12 h-12 rounded-full bg-gold-100 flex items-center justify-center">{v.icon}</div>
                <h3 className="font-serif text-lg text-espresso font-medium">{v.title}</h3>
                <p className="text-sm font-sans text-espresso-400 leading-relaxed">{v.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Collections overview */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 py-14">
        <div className="text-center mb-8">
          <p className="section-subtitle mb-2">What We Offer</p>
          <h2 className="section-title">Our Collections</h2>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
          {['Gold', 'Silver', 'One Gram Gold', 'Stones'].map((col) => (
            <div key={col} className="card p-4 text-center">
              <p className="font-serif text-lg text-espresso font-medium">{col}</p>
              <p className="text-xs text-espresso-400 font-sans mt-1">For Women &amp; Men</p>
            </div>
          ))}
        </div>
        <div className="text-center">
          <Link to="/products" className="inline-flex items-center gap-2 text-sm font-sans font-medium text-gold-600 hover:text-gold-700 transition-colors">
            Browse all jewellery <ArrowRight size={15} />
          </Link>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-brown-800 py-14 text-center">
        <div className="max-w-xl mx-auto px-4 sm:px-6">
          <h2 className="font-serif text-3xl text-white font-bold mb-4">Visit Us Today</h2>
          <p className="text-white/60 font-sans text-sm leading-relaxed mb-6">
            Experience our full collection in person or explore online. We look forward to being part of your celebrations.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center items-center">
            <a
              href="tel:+916304478352"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-white/10 text-white text-sm font-sans font-semibold hover:bg-white/20 transition-colors"
            >
              Call +91 63044 78352
            </a>
            <Link to="/contact">
              <Button variant="primary" size="lg" rightIcon={<ArrowRight size={16} />}>
                Contact Us
              </Button>
            </Link>
          </div>
          <div className="mt-5">
            <a
              href="https://maps.app.goo.gl/nqpbGuvtZkEHYJuBA"
              target="_blank"
              rel="noopener noreferrer"
              className="text-gold-400 hover:text-gold-300 text-sm font-sans transition-colors underline underline-offset-2"
            >
              📍 Find us on Google Maps ↗
            </a>
          </div>
        </div>
      </section>
    </PageLayout>
  );
}
