import { apiClient } from './client';
import type { Order, DeliveryOption, ShippingAddress } from '../types';

export interface PlaceOrderPayload {
  shippingAddress: ShippingAddress;
  deliveryOptionId: string;
  note?: string;
}

export async function getDeliveryOptions() {
  const { data } = await apiClient.get('/delivery-options');
  return data as { options: DeliveryOption[] };
}

export async function placeOrder(payload: PlaceOrderPayload) {
  const { data } = await apiClient.post('/orders', payload);
  return data as { order: Order };
}

export async function getOrders() {
  const { data } = await apiClient.get('/orders');
  return data as { orders: Order[] };
}

export async function getOrderById(orderId: string) {
  const { data } = await apiClient.get(`/orders/${orderId}`);
  return data as { order: Order };
}

// ─── Admin order endpoints ─────────────────────────────────────────────────────

export async function adminGetOrders(params?: { status?: string; page?: number }) {
  const { data } = await apiClient.get('/admin/orders', { params });
  return data as { orders: Order[]; total: number };
}

export async function adminUpdateOrder(
  orderId: string,
  payload: {
    status?: string;
    trackingNumber?: string;
    estimatedDeliveryDate?: string;
    confirmedDeliveryDate?: string;
  }
) {
  const { data } = await apiClient.patch(`/admin/orders/${orderId}`, payload);
  return data as { order: Order };
}
