import { useMutation, useQueryClient } from '@tanstack/react-query';

import { CreateHabitLogDto } from '@/types';
import { apiClient } from '../api-client';
import { ApiError } from '../api-error';

export function useHabitLogsMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: CreateHabitLogDto) => {
      const { data, error } = await apiClient.POST('/habit-logs', {
        body: payload,
      });

      if (error) {
        throw new ApiError(error);
      }

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['habit-logs'] });
    },
  });
}
