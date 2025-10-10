'use client';

import { useSuspenseQuery } from '@tanstack/react-query';

import { apiClient } from '../api-client';
import { ApiError } from '../api-error';

export function useHabitLogsQuery(searchParams: { date?: string; habitId?: string }) {
  return useSuspenseQuery({
    queryKey: ['habit-logs', ...Object.values(searchParams)],
    queryFn: async () => {
      const { data, error } = await apiClient.GET('/habit-logs', {
        params: {
          query: {
            date: searchParams.date,
            habit_id: searchParams.habitId,
          },
        },
      });

      if (error) {
        throw new ApiError(error);
      }

      return data;
    },
  });
}
