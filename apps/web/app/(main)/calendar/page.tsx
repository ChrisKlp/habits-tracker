'use client';

import { useMemo, useState } from 'react';

import { HabitList } from '@/components/habit-list';
import { HeatMapCalendar } from '@/components/heat-map-calendar';
import { useHabitListQuery } from '@/lib/api/queries/habit-list-query';
import { useHabitLogsQuery } from '@/lib/api/queries/habit-logs-query';

export default function CalendarPage() {
  const { data: habitLogs } = useHabitLogsQuery();
  const { data: habitList } = useHabitListQuery();
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString());

  const filteredHabits = useMemo(() => {
    if (!habitList) return [];

    return habitLogs.filter(habit => habit.date === selectedDate);
  }, [habitList, habitLogs, selectedDate]);

  return (
    <main className="flex flex-col gap-4 p-4">
      <HeatMapCalendar
        habits={habitLogs}
        selectedDate={selectedDate}
        onDateSelect={date => {
          console.log('Selected date', date);
          setSelectedDate(date);
        }}
      />
      <HabitList habits={filteredHabits} />
    </main>
  );
}
