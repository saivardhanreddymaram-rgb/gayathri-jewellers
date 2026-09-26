import { X, SlidersHorizontal } from 'lucide-react';
import { clsx } from 'clsx';
import { Button } from '../ui/Button';
import { ALLOWED_COLLECTIONS, getSubcategories } from '../../constants/catalogue';
import type { Audience, JewelleryCollection, ProductFilters } from '../../types';

interface FilterPanelProps {
  filters: ProductFilters;
  onChange: (f: ProductFilters) => void;
  onClear: () => void;
  audienceLock?: Audience; // locks audience when on /women or /men
  className?: string;
}

function FilterChip({
  label,
  active,
  onClick,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={clsx(
        'px-3.5 py-1.5 rounded-full text-sm font-sans font-medium transition-all duration-150 border',
        'focus-visible:outline focus-visible:outline-2 focus-visible:outline-gold-500',
        active
          ? 'bg-espresso text-ivory border-espresso'
          : 'bg-white text-espresso border-espresso-100 hover:border-espresso-400'
      )}
    >
      {label}
    </button>
  );
}

export function FilterPanel({ filters, onChange, onClear, audienceLock, className }: FilterPanelProps) {
  const audience = audienceLock ?? (filters.audience as Audience | undefined);
  const availableCollections = audience ? ALLOWED_COLLECTIONS[audience] : ['Gold', 'Silver', 'One Gram Gold', 'Stones'] as JewelleryCollection[];
  const collection = filters.collection as JewelleryCollection | undefined;
  const subcategories = audience && collection ? getSubcategories(audience, collection) : [];

  const activeCount = [
    filters.audience,
    filters.collection,
    filters.subcategory,
    filters.available !== '' && filters.available !== undefined,
  ].filter(Boolean).length;

  const set = (patch: Partial<ProductFilters>) => onChange({ ...filters, ...patch, page: 1 });

  return (
    <div className={clsx('space-y-5', className)}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="font-sans text-sm font-semibold text-espresso flex items-center gap-2">
          <SlidersHorizontal size={15} />
          Filters {activeCount > 0 && <span className="w-5 h-5 rounded-full bg-espresso text-ivory text-[11px] flex items-center justify-center">{activeCount}</span>}
        </h2>
        {activeCount > 0 && (
          <button
            type="button"
            onClick={onClear}
            className="text-xs font-sans text-gold-600 hover:text-gold-700 font-medium flex items-center gap-1 transition-colors"
          >
            <X size={13} /> Clear all
          </button>
        )}
      </div>

      {/* Audience (only when not locked) */}
      {!audienceLock && (
        <div className="space-y-2">
          <p className="text-xs font-sans font-semibold text-espresso-400 uppercase tracking-wider">For</p>
          <div className="flex flex-wrap gap-2">
            {(['Women', 'Men'] as Audience[]).map((a) => (
              <FilterChip
                key={a}
                label={a}
                active={filters.audience === a}
                onClick={() => set({ audience: filters.audience === a ? '' : a, collection: '', subcategory: '' })}
              />
            ))}
          </div>
        </div>
      )}

      {/* Collection */}
      <div className="space-y-2">
        <p className="text-xs font-sans font-semibold text-espresso-400 uppercase tracking-wider">Collection</p>
        <div className="flex flex-wrap gap-2">
          {availableCollections.map((c) => (
            <FilterChip
              key={c}
              label={c}
              active={filters.collection === c}
              onClick={() => set({ collection: filters.collection === c ? '' : c, subcategory: '' })}
            />
          ))}
        </div>
      </div>

      {/* Subcategory */}
      {subcategories.length > 0 && (
        <div className="space-y-2">
          <p className="text-xs font-sans font-semibold text-espresso-400 uppercase tracking-wider">Category</p>
          <div className="flex flex-wrap gap-2">
            {subcategories.map((s) => (
              <FilterChip
                key={s}
                label={s}
                active={filters.subcategory === s}
                onClick={() => set({ subcategory: filters.subcategory === s ? '' : s })}
              />
            ))}
          </div>
        </div>
      )}

      {/* Availability */}
      <div className="space-y-2">
        <p className="text-xs font-sans font-semibold text-espresso-400 uppercase tracking-wider">Availability</p>
        <div className="flex flex-wrap gap-2">
          <FilterChip
            label="In Stock"
            active={filters.available === true}
            onClick={() => set({ available: filters.available === true ? '' : true })}
          />
        </div>
      </div>

      {/* Price range */}
      <div className="space-y-2">
        <p className="text-xs font-sans font-semibold text-espresso-400 uppercase tracking-wider">Price (₹)</p>
        <div className="flex items-center gap-2">
          <input
            type="number"
            placeholder="Min"
            value={filters.minPrice ?? ''}
            min={0}
            onChange={(e) => set({ minPrice: e.target.value ? Number(e.target.value) : '' })}
            aria-label="Minimum price"
            className="w-full px-3 py-2 border border-espresso-100 rounded-lg text-sm font-sans text-espresso bg-white focus:outline-none focus:border-gold-500 focus:ring-2 focus:ring-gold-200"
          />
          <span className="text-espresso-400 text-sm shrink-0">–</span>
          <input
            type="number"
            placeholder="Max"
            value={filters.maxPrice ?? ''}
            min={0}
            onChange={(e) => set({ maxPrice: e.target.value ? Number(e.target.value) : '' })}
            aria-label="Maximum price"
            className="w-full px-3 py-2 border border-espresso-100 rounded-lg text-sm font-sans text-espresso bg-white focus:outline-none focus:border-gold-500 focus:ring-2 focus:ring-gold-200"
          />
        </div>
      </div>
    </div>
  );
}

// ─── Mobile filter drawer trigger button ──────────────────────────────────────

interface FilterTriggerProps {
  activeCount: number;
  onClick: () => void;
}

export function FilterTrigger({ activeCount, onClick }: FilterTriggerProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex items-center gap-2 px-4 py-2.5 border border-espresso-100 rounded-xl text-sm font-sans font-medium text-espresso hover:border-espresso-400 transition-colors bg-white"
    >
      <SlidersHorizontal size={15} />
      Filters
      {activeCount > 0 && (
        <span className="w-5 h-5 rounded-full bg-espresso text-ivory text-[11px] flex items-center justify-center">
          {activeCount}
        </span>
      )}
    </button>
  );
}
