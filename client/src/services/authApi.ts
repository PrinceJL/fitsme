import { apiClient } from './apiClient';
import type { AuthResponse } from '../types/auth';

export const AuthApi = {
  async register(email: string, password: string, fullName?: string): Promise<AuthResponse> {
    const { data } = await apiClient.post<AuthResponse>('/auth/register', {
      email,
      password,
      fullName,
    });
    return data;
  },

  async login(email: string, password: string): Promise<AuthResponse> {
    const { data } = await apiClient.post<AuthResponse>('/auth/login', { email, password });
    return data;
  },
};
