import { Check } from 'lucide-react';

import { useHabitLogsMutation } from '@/lib/api/mutations/habit-logs-mutation';
import { getFormattedToday } from '@/lib/utils';
import { HabitDto, HabitLogDto } from '@/types';

interface HabitToggleProps {
  habit: HabitDto;
  log?: HabitLogDto;
}

export default function HabitToggle({ habit, log }: HabitToggleProps) {
  const isChecked = Boolean(log?.value);
  const { mutate } = useHabitLogsMutation();

  function handleToggle() {
    void mutate({
      habitId: habit.id,
      date: getFormattedToday(),
      value: isChecked ? 0 : 1,
    });
  }

  return (
    <button
      onClick={() => {
        handleToggle();
      }}
      className={`relative h-28 w-full max-w-md rounded-3xl transition-all duration-300 ease-in-out ${
        isChecked
          ? 'bg-gradient-to-r from-violet-500 to-blue-500 shadow-lg'
          : 'bg-white shadow-md hover:shadow-lg'
      } `}
    >
      <div className="flex h-full items-center gap-4 px-6">
        <div className="text-4xl">{habit.icon}</div>
        <div className="flex-1 text-left">
          <div className={`text-lg font-semibold ${isChecked ? 'text-white' : 'text-gray-800'}`}>
            {habit.name}
          </div>
          <div className={`text-sm ${isChecked ? 'text-white/80' : 'text-gray-500'}`}>
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
