import { apiClient } from './client';

export interface MetalRates {
  gold: number;
  silver: number;
  lastUpdated: string;
}

export async function getMetalRates(): Promise<{ rates: MetalRates }> {
  const { data } = await apiClient.get('/metal-rates');
  return data as { rates: MetalRates };
}

export async function updateMetalRates(rates: { gold?: number; silver?: number }): Promise<{ message: string; rates: MetalRates }> {
  const { data } = await apiClient.patch('/admin/metal-rates', rates);
  return data as { message: string; rates: MetalRates };
}
