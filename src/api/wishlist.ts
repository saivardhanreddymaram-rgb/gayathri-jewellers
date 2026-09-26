import { apiClient } from './client';
import type { WishlistItem } from '../types';

export async function getWishlist() {
  const { data } = await apiClient.get('/wishlist');
  return data as { items: WishlistItem[] };
}

export async function addToWishlist(productId: number) {
  const { data } = await apiClient.post('/wishlist/items', { productId });
  return data as { items: WishlistItem[] };
}

export async function removeFromWishlist(productId: number) {
  const { data } = await apiClient.delete(`/wishlist/items/${productId}`);
  return data as { items: WishlistItem[] };
}
