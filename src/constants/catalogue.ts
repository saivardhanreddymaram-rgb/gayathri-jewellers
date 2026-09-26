import type { Audience, JewelleryCollection } from '../types';

// ─── Allowed Collections per Audience ────────────────────────────────────────
export const ALLOWED_COLLECTIONS: Record<Audience, JewelleryCollection[]> = {
  Women: ['Gold', 'Silver', 'One Gram Gold', 'Stones'],
  Men: ['Gold', 'Silver', 'Stones'],
};

// ─── Subcategories per Audience + Collection ─────────────────────────────────
export const SUBCATEGORIES: Record<Audience, Partial<Record<JewelleryCollection, string[]>>> = {
  Women: {
    Gold: [
      'Chains', 'Rings', 'Earrings', 'Bracelets',
      'Short Necklaces', 'Long Necklaces', 'Harams',
      'Bangles', 'Mangalsutra', 'Lockets', 'Others',
    ],
    Silver: ['Chains', 'Rings', 'Bracelets', 'Anklets', 'Others'],
    'One Gram Gold': [
      'Chains', 'Rings', 'Earrings', 'Bracelets',
      'Short Necklaces', 'Long Necklaces', 'Bangles',
      'Mangalsutra', 'Lockets', 'Others',
    ],
    Stones: [
      'Chains', 'Rings', 'Bracelets', 'Earpieces', 'Lockets', 'Others',
    ],
  },
  Men: {
    Gold: ['Chains', 'Rings', 'Bracelets', 'Earpieces', 'Lockets', 'Others'],
    Silver: ['Chains', 'Rings', 'Bracelets', 'Kadas', 'Others'],
    Stones: ['Chains', 'Rings', 'Bracelets', 'Earpieces', 'Lockets', 'Others'],
  },
};

// ─── Strict Validation ────────────────────────────────────────────────────────
export function isValidCombination(audience: Audience, collection: JewelleryCollection): boolean {
  return ALLOWED_COLLECTIONS[audience].includes(collection);
}

export function getSubcategories(audience: Audience, collection: JewelleryCollection): string[] {
  if (!isValidCombination(audience, collection)) return [];
  return SUBCATEGORIES[audience][collection] ?? [];
}

// ─── Forbidden collections (always blocked) ───────────────────────────────────
export const FORBIDDEN_COLLECTIONS = ['Diamond', 'Platinum'] as const;

// ─── All permitted collections (for display) ─────────────────────────────────
export const ALL_COLLECTIONS: JewelleryCollection[] = ['Gold', 'Silver', 'One Gram Gold', 'Stones'];

// ─── Collection metadata ──────────────────────────────────────────────────────
export const COLLECTION_META: Record<JewelleryCollection, { description: string; color: string }> = {
  Gold: {
    description: 'Timeless gold jewellery crafted with precision and elegance',
    color: '#C9960F',
  },
  Silver: {
    description: 'Pure silver pieces with delicate artisan craftsmanship',
    color: '#9CA3AF',
  },
  'One Gram Gold': {
    description: 'Artificial gold jewellery — elegant, affordable, and long-lasting',
    color: '#D4AF37',
  },
  Stones: {
    description: 'Vibrant stone-set jewellery for every occasion',
    color: '#7C3AED',
  },
};

// ─── Delivery statuses in order ───────────────────────────────────────────────
export const DELIVERY_STATUS_ORDER = [
  'Order Placed',
  'Confirmed',
  'Preparing',
  'Shipped',
  'Out for Delivery',
  'Delivered',
] as const;
