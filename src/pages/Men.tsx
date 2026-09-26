import { useState } from 'react';
import { PageLayout } from '../components/layout/PageLayout';
import { Breadcrumb } from '../components/layout/Breadcrumb';
import { ProductCard } from '../components/product/ProductCard';
import { FilterPanel, FilterTrigger } from '../components/product/FilterPanel';
import { Drawer } from '../components/ui/Modal';
import { ProductGridSkeleton } from '../components/ui/Skeleton';
import { EmptyState, ErrorState } from '../components/ui/EmptyState';
import { Pagination } from '../components/ui/Pagination';
import { Button } from '../components/ui/Button';
import { useProductFilters } from '../hooks/useProductFilters';
import { ALLOWED_COLLECTIONS, getSubcategories } from '../constants/catalogue';
import { ShoppingBag } from 'lucide-react';
import type { JewelleryCollection } from '../types';

// Men NEVER get One Gram Gold — enforced in ALLOWED_COLLECTIONS constant
const MEN_COLLECTIONS = ALLOWED_COLLECTIONS['Men'];

export function MenPage() {
  const [drawerOpen, setDrawerOpen] = useState(false);

  const { filters, setFilters, clearFilters, products, total, loading, error, retry, activeFilterCount } =
    useProductFilters({ audience: 'Men', pageSize: 20 });

  const selectedCollection = filters.collection as JewelleryCollection | '';

  return (
    <PageLayout>
      {/* Hero */}
      <section className="bg-espresso-800 py-14 relative overflow-hidden" aria-label="Men's Jewellery">
        <div className="absolute inset-0 pointer-events-none" aria-hidden>
          <div className="absolute bottom-0 left-0 w-96 h-96 rounded-full border border-gold-600/10 -translate-x-1/3 translate-y-1/3" />
        </div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 text-center">
          <p className="font-sans text-gold-400 text-xs tracking-[0.3em] uppercase mb-3">For Him</p>
          <h1 className="font-serif text-4xl sm:text-5xl text-ivory font-medium mb-4">Men's Jewellery</h1>
          <p className="text-ivory/60 font-sans text-sm max-w-md mx-auto">
            Bold Gold, refined Silver, and stone-set pieces designed for the modern man.
          </p>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        <Breadcrumb items={[{ label: 'Home', to: '/' }, { label: "Men's Jewellery" }]} />

        {/* Collection tabs */}
        <div className="mt-6 mb-8">
          <p className="text-xs font-sans font-semibold text-espresso-400 uppercase tracking-wider mb-3">Browse Collection</p>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setFilters({ ...filters, collection: '', subcategory: '', page: 1 })}
              className={`px-4 py-2 rounded-full text-sm font-sans font-medium border transition-all duration-150 ${
                !selectedCollection ? 'bg-espresso text-ivory border-espresso' : 'bg-white text-espresso border-espresso-100 hover:border-espresso'
              }`}
            >All Collections</button>
            {MEN_COLLECTIONS.map((col) => (
              <button
                key={col}
                onClick={() => setFilters({ ...filters, collection: selectedCollection === col ? '' : col, subcategory: '', page: 1 })}
                className={`px-4 py-2 rounded-full text-sm font-sans font-medium border transition-all duration-150 ${
                  selectedCollection === col ? 'bg-espresso text-ivory border-espresso' : 'bg-white text-espresso border-espresso-100 hover:border-espresso'
                }`}
              >{col}</button>
            ))}
          </div>
        </div>

        {/* Subcategories */}
        {selectedCollection && (
          <div className="mb-6">
            <p className="text-xs font-sans font-semibold text-espresso-400 uppercase tracking-wider mb-3">Category</p>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setFilters({ ...filters, subcategory: '', page: 1 })}
                className={`px-3.5 py-1.5 rounded-full text-xs font-sans font-medium border transition-all ${
                  !filters.subcategory ? 'bg-espresso text-ivory border-espresso' : 'bg-white text-espresso border-espresso-100 hover:border-espresso'
                }`}
              >All</button>
              {getSubcategories('Men', selectedCollection).map((sub) => (
                <button
                  key={sub}
                  onClick={() => setFilters({ ...filters, subcategory: filters.subcategory === sub ? '' : sub, page: 1 })}
                  className={`px-3.5 py-1.5 rounded-full text-xs font-sans font-medium border transition-all ${
                    filters.subcategory === sub ? 'bg-espresso text-ivory border-espresso' : 'bg-white text-espresso border-espresso-100 hover:border-espresso'
                  }`}
                >{sub}</button>
              ))}
            </div>
          </div>
        )}

        {/* Toolbar */}
        <div className="flex items-center justify-between gap-3 mb-6">
          <p className="text-sm text-espresso-400 font-sans">
            {loading ? 'Loading…' : `${total} product${total !== 1 ? 's' : ''}`}
          </p>
          <div className="flex items-center gap-2">
            {activeFilterCount > 0 && (
              <button onClick={clearFilters} className="text-xs text-gold-600 hover:text-gold-700 font-sans font-medium underline underline-offset-2">
                Clear filters
              </button>
            )}
            <FilterTrigger activeCount={activeFilterCount} onClick={() => setDrawerOpen(true)} />
          </div>
        </div>

        {loading && <ProductGridSkeleton count={8} />}
        {!loading && error && <ErrorState message={error} onRetry={retry} />}
        {!loading && !error && products.length === 0 && (
          <EmptyState icon={ShoppingBag} title="No products found" description="Try adjusting your filters or check back later." action={{ label: 'Clear filters', onClick: clearFilters }} />
        )}
        {!loading && !error && products.length > 0 && (
          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-5">
            {products.map((p) => <ProductCard key={p.id} product={p} />)}
          </div>
        )}

        <Pagination page={filters.page ?? 1} total={total} pageSize={filters.pageSize ?? 20} onChange={(p) => setFilters({ ...filters, page: p })} />
      </div>

      <Drawer open={drawerOpen} onClose={() => setDrawerOpen(false)} title="Filter Products" side="bottom">
        <FilterPanel filters={filters} onChange={(f) => { setFilters(f); setDrawerOpen(false); }} onClear={() => { clearFilters(); setDrawerOpen(false); }} audienceLock="Men" />
        <div className="mt-6 pt-4 border-t border-ivory-200">
          <Button variant="primary" fullWidth onClick={() => setDrawerOpen(false)}>Apply Filters</Button>
        </div>
      </Drawer>
    </PageLayout>
  );
}
