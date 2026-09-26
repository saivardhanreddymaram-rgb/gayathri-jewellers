import { apiClient } from './client';
import type { AdminStats, CustomerRecord, SubcategoryEntry } from '../types';

export async function getAdminStats() {
  const { data } = await apiClient.get('/admin/stats');
  return data as { stats: AdminStats };
}

export async function getCustomers(params?: { page?: number; search?: string }) {
  const { data } = await apiClient.get('/admin/customers', { params });
  return data as { customers: CustomerRecord[]; total: number };
}

export async function getAdministrators() {
  const { data } = await apiClient.get('/admin/administrators');
  return data as { administrators: CustomerRecord[] };
}

export async function promoteToAdmin(userId: string) {
  const { data } = await apiClient.post(`/admin/administrators/${userId}/promote`);
  return data as { message: string };
}

export async function demoteFromAdmin(userId: string) {
  const { data } = await apiClient.post(`/admin/administrators/${userId}/demote`);
  return data as { message: string };
}

// ─── Category management ───────────────────────────────────────────────────────

export async function getCustomSubcategories() {
  const { data } = await apiClient.get('/admin/categories');
  return data as { categories: SubcategoryEntry[] };
}

export async function addCustomSubcategory(entry: SubcategoryEntry) {
  const { data } = await apiClient.post('/admin/categories', entry);
  return data as { categories: SubcategoryEntry[] };
}

export async function deleteCustomSubcategory(id: string) {
  const { data } = await apiClient.delete(`/admin/categories/${id}`);
  return data as { categories: SubcategoryEntry[] };
}

// ─── Delivery options ─────────────────────────────────────────────────────────

export async function adminGetDeliveryOptions() {
  const { data } = await apiClient.get('/admin/delivery-options');
  return data as { options: import('../types').DeliveryOption[] };
}

export async function adminUpdateDeliveryOption(
  id: string,
  payload: Partial<import('../types').DeliveryOption>
) {
  const { data } = await apiClient.patch(`/admin/delivery-options/${id}`, payload);
  return data as { option: import('../types').DeliveryOption };
}
