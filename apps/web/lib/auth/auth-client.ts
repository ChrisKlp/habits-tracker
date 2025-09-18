'use client';

import { apiClient } from '@/lib/api/api-client';
import { ApiError } from '../api/api-error';

export const authService = {
  async login(email: string, password: string) {
    const { error } = await apiClient.POST('/auth/login', {
      body: { email, password },
    });

    if (error) {
      throw new ApiError(error);
    }
  },

  async logout() {
    await apiClient.POST('/auth/logout', {});
    window.location.href = '/login';
  },

  async refreshToken() {
    const { data, error } = await apiClient.POST('/auth/refresh', {});

    if (error) {
      return null;
    }

    return data;
  },

  async getCurrentUser() {
    const { data, error } = await apiClient.GET('/auth/me');

    if (error) {
      return null;
    }

    return data;
  },
};
