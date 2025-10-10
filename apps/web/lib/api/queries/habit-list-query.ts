import { useSuspenseQuery } from '@tanstack/react-query';

import { apiClient } from '../api-client';
import { ApiError } from '../api-error';

export function useHabitListQuery() {
  return useSuspenseQuery({
    queryKey: ['habit-list'],
    queryFn: async () => {
      const { data, error } = await apiClient.GET('/habits');

      if (error) {
        throw new ApiError(error);
      }

      return data;
    },
  });
}
