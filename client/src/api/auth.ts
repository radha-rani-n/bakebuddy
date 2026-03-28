import apiClient from './client';
import type { AuthResponse, User } from '../types/user';

export async function signUp(email: string, password: string, name?: string): Promise<AuthResponse> {
  const { data } = await apiClient.post('/auth/signup', { email, password, name });
  return data;
}

export async function signIn(email: string, password: string): Promise<AuthResponse> {
  const { data } = await apiClient.post('/auth/signin', { email, password });
  return data;
}

export async function signOut(): Promise<void> {
  await apiClient.post('/auth/signout');
}

export async function getMe(): Promise<{ user: User }> {
  const { data } = await apiClient.get('/auth/me');
  return data;
}
