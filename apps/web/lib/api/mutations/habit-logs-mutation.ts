import { useMutation } from '@tanstack/react-query';

import { CreateHabitLogDto } from '@/types';
import { apiClient } from '../api-client';

export function useToggleHabitLogMutation() {
  return useMutation({
    mutationFn: async (payload: CreateHabitLogDto) =>
      await apiClient.POST('/habit-logs/toggle', {
        body: payload,
      }),
  });
}
