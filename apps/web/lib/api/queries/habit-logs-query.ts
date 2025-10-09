'use client';

import { useSuspenseQuery } from '@tanstack/react-query';

import { apiClient } from '../api-client';
import { ApiError } from '../api-error';

export function useHabitLogsQuery() {
  return useSuspenseQuery({
    queryKey: ['habit-logs'],
    queryFn: async () => {
      const { data, error } = await apiClient.GET('/habit-logs');

      if (error) {
        throw new ApiError(error);
      }

      return data;
    },
  });
}
