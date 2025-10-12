import { useQueryClient } from '@tanstack/react-query';
import { Check } from 'lucide-react';

import { useToggleHabitLogMutation } from '@/lib/api/mutations/habit-logs-mutation';
import { getFormattedToday } from '@/lib/utils';
import { HabitDto, HabitLogDto } from '@/types';

interface HabitToggleProps {
  habit: HabitDto;
  log?: HabitLogDto;
}

export default function HabitToggle({ habit, log }: HabitToggleProps) {
  const queryClient = useQueryClient();
  const isChecked = Boolean(log?.value);

  const { mutate } = useToggleHabitLogMutation();

  function handleToggle() {
    void mutate(
      {
        habitId: habit.id,
        date: getFormattedToday(),
      },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({
            queryKey: ['habit-logs'],
          });
        },
      }
    );
  }

  return (
    <button
      onClick={() => {
        handleToggle();
      }}
      className={`relative h-24 w-full rounded-2xl transition-all duration-300 ease-in-out ${
        isChecked
          ? 'bg-gradient-to-r from-violet-500 to-blue-500 shadow-lg'
          : 'bg-white shadow-md hover:shadow-lg'
      } `}
    >
      <div className="flex h-full items-center gap-4 px-6">
        <div className="text-4xl">{habit.icon}</div>
        <div className="flex-1 text-left">
          <div
            className={`line-clamp-1 text-lg font-semibold ${isChecked ? 'text-white' : 'text-gray-800'}`}
          >
            {habit.name}
          </div>
          <div className={`line-clamp-2 text-sm ${isChecked ? 'text-white/80' : 'text-gray-500'}`}>
            {habit.description}
          </div>
        </div>

        <div
          className={`flex size-10 flex-shrink-0 items-center justify-center rounded-full transition-all duration-300 ${
            isChecked ? 'scale-110 bg-white' : 'border bg-gray-100'
          } `}
        >
          <Check
            className={`size-6 transition-all duration-300 ${
              isChecked ? 'text-primary scale-100 opacity-100' : 'scale-0 text-gray-400 opacity-0'
            } `}
          />
        </div>
      </div>
    </button>
  );
}
