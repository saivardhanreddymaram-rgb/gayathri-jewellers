import { useCallback, useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { getProducts } from '../api/products';
import { extractErrorMessage } from '../api/client';
import type { Product, ProductFilters } from '../types';

/**
 * Manages product filter state in the URL query string and fetches products
 * whenever filters change.
 */
export function useProductFilters(defaults: Partial<ProductFilters> = {}) {
  const [searchParams, setSearchParams] = useSearchParams();

  // ─── Parse filters from URL ─────────────────────────────────────────────────
  const filtersFromURL = (): ProductFilters => ({
    search: searchParams.get('search') ?? '',
    audience: (searchParams.get('audience') as ProductFilters['audience']) ?? defaults.audience ?? '',
    collection: (searchParams.get('collection') as ProductFilters['collection']) ?? defaults.collection ?? '',
    subcategory: searchParams.get('subcategory') ?? '',
    available: searchParams.get('available') === 'true' ? true : '',
    minPrice: searchParams.get('minPrice') ? Number(searchParams.get('minPrice')) : '',
    maxPrice: searchParams.get('maxPrice') ? Number(searchParams.get('maxPrice')) : '',
    page: searchParams.get('page') ? Number(searchParams.get('page')) : 1,
    pageSize: defaults.pageSize ?? 20,
  });

  const [filters, setFiltersState] = useState<ProductFilters>(filtersFromURL);
  const [products, setProducts] = useState<Product[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // ─── Sync filters → URL ─────────────────────────────────────────────────────
  const setFilters = useCallback((f: ProductFilters) => {
    setFiltersState(f);
    const params: Record<string, string> = {};
    if (f.search) params.search = f.search;
    if (f.audience) params.audience = f.audience;
    if (f.collection) params.collection = f.collection;
    if (f.subcategory) params.subcategory = f.subcategory;
    if (f.available === true) params.available = 'true';
    if (f.minPrice) params.minPrice = String(f.minPrice);
    if (f.maxPrice) params.maxPrice = String(f.maxPrice);
    if (f.page && f.page > 1) params.page = String(f.page);
    setSearchParams(params, { replace: true });
  }, [setSearchParams]);

  const clearFilters = useCallback(() => {
    const cleared: ProductFilters = {
      search: '',
      audience: defaults.audience ?? '',
      collection: defaults.collection ?? '',
      subcategory: '',
      available: '',
      minPrice: '',
      maxPrice: '',
      page: 1,
      pageSize: defaults.pageSize ?? 20,
    };
    setFilters(cleared);
  }, [defaults, setFilters]);

  // ─── Fetch products ─────────────────────────────────────────────────────────
  const fetchProducts = useCallback(async (f: ProductFilters) => {
    setLoading(true);
    setError(null);
    try {
      const result = await getProducts(f);
      setProducts(result.data);
      setTotal(result.total);
    } catch (err) {
      setError(extractErrorMessage(err));
      setProducts([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProducts(filters);
  }, [filters, fetchProducts]);

  const activeFilterCount = [
    filters.audience && !defaults.audience,
    filters.collection && !defaults.collection,
    filters.subcategory,
    filters.available === true,
    filters.minPrice,
    filters.maxPrice,
  ].filter(Boolean).length;

  return {
    filters,
    setFilters,
    clearFilters,
    products,
    total,
    loading,
    error,
    retry: () => fetchProducts(filters),
    activeFilterCount,
  };
}
