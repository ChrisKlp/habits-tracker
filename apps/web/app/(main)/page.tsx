'use client';

import HabitToggle from '@/components/habit-toggle';
import { useHabitListQuery } from '@/lib/api/queries/habit-list-query';
import { useHabitLogsQuery } from '@/lib/api/queries/habit-logs-query';
import { getFormattedToday } from '@/lib/utils';

export default function HomePage() {
  const { data: habitList } = useHabitListQuery();
  const { data: habitLogs } = useHabitLogsQuery({ date: getFormattedToday() });

  const habitListWithLogs = habitList.map(habit => ({
    habit: habit,
    log: habitLogs.find(log => log.habitId === habit.id),
  }));

  return (
    <main className="flex flex-col gap-4 p-4">
      {habitListWithLogs.map(({ habit, log }) => (
        <HabitToggle key={habit.id} habit={habit} log={log} />
      ))}
    </main>
  );
}
