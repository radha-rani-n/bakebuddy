import apiClient from './client';
import type { Pan, PanFormData } from '../types/pan';

export async function listPans(): Promise<{ pans: Pan[] }> {
  const { data } = await apiClient.get('/pans');
  return data;
}

export async function createPan(pan: PanFormData): Promise<{ pan: Pan }> {
  const { data } = await apiClient.post('/pans', pan);
  return data;
}

export async function updatePan(id: string, pan: PanFormData): Promise<{ pan: Pan }> {
  const { data } = await apiClient.put(`/pans/${id}`, pan);
  return data;
}

export async function deletePan(id: string): Promise<void> {
  await apiClient.delete(`/pans/${id}`);
}
