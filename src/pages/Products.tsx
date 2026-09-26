import { useState } from 'react';
import { Search, X } from 'lucide-react';
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
import { ShoppingBag } from 'lucide-react';

export function ProductsPage() {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [searchInput, setSearchInput] = useState('');

  const { filters, setFilters, clearFilters, products, total, loading, error, retry, activeFilterCount } =
    useProductFilters({ pageSize: 20 });

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setFilters({ ...filters, search: searchInput.trim(), page: 1 });
  };

  const clearSearch = () => {
    setSearchInput('');
    setFilters({ ...filters, search: '', page: 1 });
  };

  return (
    <PageLayout>
      {/* Header */}
      <section className="bg-ivory border-b border-ivory-200 py-10" aria-label="All Jewellery">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <p className="section-subtitle mb-2">Catalogue</p>
          <h1 className="section-title mb-4">All Jewellery</h1>
          {/* Search */}
          <form onSubmit={handleSearch} role="search" className="max-w-lg">
            <div className="relative">
              <Search size={17} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-espresso-400 pointer-events-none" aria-hidden />
              <input
                type="search"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                placeholder="Search by name, collection, subcategory…"
                aria-label="Search products"
                className="w-full pl-10 pr-10 py-3 bg-white border border-espresso-100 rounded-xl text-sm font-sans text-espresso placeholder-espresso-400 focus:outline-none focus:border-gold-500 focus:ring-2 focus:ring-gold-200 transition-colors"
              />
              {(searchInput || filters.search) && (
                <button type="button" onClick={clearSearch} aria-label="Clear search" className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded text-espresso-400 hover:text-espresso">
                  <X size={15} />
                </button>
              )}
            </div>
          </form>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        <Breadcrumb items={[{ label: 'Home', to: '/' }, { label: 'All Jewellery' }]} />

        <div className="mt-6 flex gap-8">
          {/* Sidebar filter — desktop */}
          <aside className="hidden lg:block w-60 shrink-0" aria-label="Product filters">
            <div className="sticky top-24 card p-5">
              <FilterPanel filters={filters} onChange={setFilters} onClear={clearFilters} />
            </div>
          </aside>

          {/* Product grid */}
          <div className="flex-1 min-w-0">
            {/* Toolbar */}
            <div className="flex items-center justify-between gap-3 mb-6">
              <p className="text-sm text-espresso-400 font-sans">
                {loading ? 'Loading…' : `${total} product${total !== 1 ? 's' : ''}`}
                {filters.search && <span className="ml-1 font-medium text-espresso">for "{filters.search}"</span>}
              </p>
              <div className="flex items-center gap-2">
                {activeFilterCount > 0 && (
                  <button onClick={clearFilters} className="text-xs text-gold-600 hover:text-gold-700 font-sans font-medium underline underline-offset-2">
                    Clear all
                  </button>
                )}
                <div className="lg:hidden">
                  <FilterTrigger activeCount={activeFilterCount} onClick={() => setDrawerOpen(true)} />
                </div>
              </div>
            </div>

            {/* Active filter chips */}
            {activeFilterCount > 0 && (
              <div className="flex flex-wrap gap-2 mb-5">
                {filters.audience && (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-espresso-100 text-espresso text-xs font-sans rounded-full">
                    {filters.audience}
                    <button onClick={() => setFilters({ ...filters, audience: '', page: 1 })} aria-label={`Remove ${filters.audience} filter`}><X size={12} /></button>
                  </span>
                )}
                {filters.collection && (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-espresso-100 text-espresso text-xs font-sans rounded-full">
                    {filters.collection}
                    <button onClick={() => setFilters({ ...filters, collection: '', subcategory: '', page: 1 })} aria-label={`Remove ${filters.collection} filter`}><X size={12} /></button>
                  </span>
                )}
                {filters.subcategory && (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-espresso-100 text-espresso text-xs font-sans rounded-full">
                    {filters.subcategory}
                    <button onClick={() => setFilters({ ...filters, subcategory: '', page: 1 })} aria-label={`Remove ${filters.subcategory} filter`}><X size={12} /></button>
                  </span>
                )}
                {filters.available === true && (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-espresso-100 text-espresso text-xs font-sans rounded-full">
                    In Stock
                    <button onClick={() => setFilters({ ...filters, available: '', page: 1 })} aria-label="Remove In Stock filter"><X size={12} /></button>
                  </span>
                )}
              </div>
            )}

            {loading && <ProductGridSkeleton count={8} />}
            {!loading && error && <ErrorState message={error} onRetry={retry} />}
            {!loading && !error && products.length === 0 && (
              <EmptyState icon={ShoppingBag} title="No products found" description={filters.search ? `No results for "${filters.search}". Try different keywords or clear filters.` : 'No products match your filters.'} action={{ label: 'Clear filters', onClick: clearFilters }} />
            )}
            {!loading && !error && products.length > 0 && (
              <div className="grid grid-cols-2 sm:grid-cols-2 xl:grid-cols-3 gap-3 sm:gap-5">
                {products.map((p) => <ProductCard key={p.id} product={p} />)}
              </div>
            )}

            <Pagination page={filters.page ?? 1} total={total} pageSize={filters.pageSize ?? 20} onChange={(p) => setFilters({ ...filters, page: p })} />
          </div>
        </div>
      </div>

      {/* Mobile filter drawer */}
      <Drawer open={drawerOpen} onClose={() => setDrawerOpen(false)} title="Filter Products" side="bottom">
        <FilterPanel filters={filters} onChange={(f) => { setFilters(f); setDrawerOpen(false); }} onClear={() => { clearFilters(); setDrawerOpen(false); }} />
        <div className="mt-6 pt-4 border-t border-ivory-200">
          <Button variant="primary" fullWidth onClick={() => setDrawerOpen(false)}>Apply Filters</Button>
        </div>
      </Drawer>
    </PageLayout>
  );
}
