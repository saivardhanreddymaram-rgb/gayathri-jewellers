import { apiClient } from './client';
import type { Cart } from '../types';

export async function getCart() {
  const { data } = await apiClient.get('/cart');
  return data as { cart: Cart };
}

export async function addToCart(productId: number, quantity = 1) {
  const { data } = await apiClient.post('/cart/items', { productId, quantity });
  return data as { cart: Cart };
}

export async function updateCartItem(itemId: string, quantity: number) {
  const { data } = await apiClient.patch(`/cart/items/${itemId}`, { quantity });
  return data as { cart: Cart };
}

export async function removeCartItem(itemId: string) {
  const { data } = await apiClient.delete(`/cart/items/${itemId}`);
  return data as { cart: Cart };
}

export async function clearCart() {
  await apiClient.delete('/cart');
}
