import { apiClient } from './client';
import type { Product, ProductFilters, PaginatedResponse } from '../types';

export async function getProducts(filters: ProductFilters = {}) {
  const params: Record<string, string | number | boolean> = {};
  if (filters.search) params.search = filters.search;
  if (filters.audience) params.audience = filters.audience;
  if (filters.collection) params.collection = filters.collection;
  if (filters.subcategory) params.subcategory = filters.subcategory;
  if (filters.available !== '' && filters.available !== undefined) params.available = filters.available;
  if (filters.minPrice !== '' && filters.minPrice !== undefined) params.minPrice = filters.minPrice;
  if (filters.maxPrice !== '' && filters.maxPrice !== undefined) params.maxPrice = filters.maxPrice;
  if (filters.page) params.page = filters.page;
  if (filters.pageSize) params.pageSize = filters.pageSize;

  try {
    const { data } = await apiClient.get('/products', { params });
    const result = data as PaginatedResponse<Product>;
    return {
      ...result,
      data: Array.isArray(result?.data) ? result.data : []
    };
  } catch (error) {
    return { data: [], total: 0, page: 1, pageSize: 20 } as PaginatedResponse<Product>;
  }
}

export async function getProductBySlug(slug: string) {
  const { data } = await apiClient.get(`/products/${slug}`);
  return data as { product: Product };
}

export async function getFeaturedProducts() {
  try {
    const { data } = await apiClient.get('/products/featured');
    const result = data as { products: Product[] };
    return { products: Array.isArray(result?.products) ? result.products : [] };
  } catch (error) {
    return { products: [] };
  }
}

export async function getBestsellerProducts() {
  try {
    const { data } = await apiClient.get('/products/bestsellers');
    const result = data as { products: Product[] };
    return { products: Array.isArray(result?.products) ? result.products : [] };
  } catch (error) {
    return { products: [] };
  }
}

export async function getTopValuableProducts() {
  try {
    const { data } = await apiClient.get('/products/top-valuable');
    const result = data as { products: Product[] };
    return { products: Array.isArray(result?.products) ? result.products : [] };
  } catch (error) {
    return { products: [] };
  }
}

export async function getRelatedProducts(slug: string) {
  try {
    const { data } = await apiClient.get(`/products/${slug}/related`);
    const result = data as { products: Product[] };
    return { products: Array.isArray(result?.products) ? result.products : [] };
  } catch (error) {
    return { products: [] };
  }
}

// ─── Admin product endpoints ──────────────────────────────────────────────────

export async function createProduct(payload: Omit<Product, 'id' | 'slug'>) {
  const { data } = await apiClient.post('/admin/products', payload);
  return data as { product: Product };
}

export async function updateProduct(id: number, payload: Partial<Product>) {
  const { data } = await apiClient.patch(`/admin/products/${id}`, payload);
  return data as { product: Product };
}

export async function deleteProduct(id: number) {
  await apiClient.delete(`/admin/products/${id}`);
}

export async function uploadProductImage(file: File): Promise<string> {
  const form = new FormData();
  form.append('image', file);
  const { data } = await apiClient.post('/admin/upload', form, {
    headers: { 'Content-Type': 'multipart/form-data' },
    timeout: 30000,   // 30s for larger images
  });
  return (data as { url: string }).url;
}

export async function reorderProducts(ids: number[]) {
  await apiClient.post('/admin/products/reorder', { ids });
}
