'use client';

import { useState } from 'react';

import { useSuspenseQuery } from '@tanstack/react-query';
import {
  addMonths,
  eachDayOfInterval,
  endOfMonth,
  format,
  getDay,
  startOfMonth,
  subMonths,
} from 'date-fns';
import { ChevronLeft, ChevronRight } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import type { HabitLogDto } from '@/types';

interface HeatMapCalendarProps {
  habits?: HabitLogDto[];
  selectedDate: string;
  //   onDateSelect: (date: string) => void;
}

const heatMapColors = [
  'bg-muted hover:bg-secondary text-foreground', // level 0
  'bg-chart-4 hover:bg-chart-3 text-foreground', // level 1
  'bg-chart-3 hover:bg-chart-2 text-primary-foreground', // level 2
  'bg-chart-2 hover:bg-chart-1 text-primary-foreground', // level 3
  'bg-chart-1 hover:bg-primary text-primary-foreground', // level 4
];

export function HeatMapCalendar({ selectedDate }: HeatMapCalendarProps) {
  const { data: habits } = useSuspenseQuery<HabitLogDto[]>({
    queryKey: ['habit-logs'],
  });

  const [currentMonth, setCurrentMonth] = useState(new Date());

  const formatDate = (date: Date) => {
    return format(date, 'yyyy-MM-dd');
  };

  const getDaysInMonth = (date: Date) => {
    const firstDay = startOfMonth(date);
    const startingDayOfWeek = (getDay(firstDay) + 6) % 7;
    const daysInMonth = eachDayOfInterval({
      start: firstDay,
      end: endOfMonth(date),
    });

    const days = [];

    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }

    days.push(...daysInMonth);

    return days;
  };

  const getCompletionLevel = (date: Date) => {
    const dateString = formatDate(date);
    const completedHabits = habits.filter(habit => habit.date === dateString).length;

    return Math.min(completedHabits, 4);
  };

  const getHeatMapColor = (level: number) => {
    return heatMapColors[level] || heatMapColors[0];
  };

  const days = getDaysInMonth(currentMonth);
  const monthName = format(currentMonth, 'MMMM yyyy');

  const navigateMonth = (direction: 'prev' | 'next') => {
    if (direction === 'prev') {
      setCurrentMonth(subMonths(currentMonth, 1));
    } else {
      setCurrentMonth(addMonths(currentMonth, 1));
    }
  };

  return (
    <div className="bg-card border-border rounded-lg border p-6">
      <div className="mb-6 flex items-center justify-between">
        <h3 className="text-card-foreground text-lg font-semibold">{monthName}</h3>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => navigateMonth('prev')}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="sm" onClick={() => navigateMonth('next')}>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="mb-2 grid grid-cols-7 gap-1">
        {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(day => (
          <div key={day} className="text-muted-foreground p-2 text-center text-xs font-medium">
            {day}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-1">
        {days.map((day, index) => {
          if (!day) {
            return <div key={index} className="aspect-square" />;
          }

          const dateString = formatDate(day);
          const completionLevel = getCompletionLevel(day);
          const isSelected = dateString === selectedDate;
          const isToday = dateString === formatDate(new Date());

          return (
            <button
              key={dateString}
              onClick={() => {
                console.log('Clicked on date', dateString);
              }}
              className={cn(
                'aspect-square rounded-md text-xs font-medium transition-all duration-200 hover:scale-110',
                getHeatMapColor(completionLevel),
                isSelected && 'ring-primary ring-offset-background ring-2 ring-offset-2',
                isToday && 'ring-foreground ring-1',
                'flex items-center justify-center'
              )}
            >
              {day.getDate()}
            </button>
          );
        })}
      </div>

      <div className="text-muted-foreground mt-4 flex items-center justify-between text-xs">
        <span>Less</span>
        <div className="flex gap-1">
          {[0, 1, 2, 3, 4].map(level => (
            <div key={level} className={cn('h-3 w-3 rounded-sm', getHeatMapColor(level))} />
          ))}
        </div>
        <span>More</span>
      </div>
    </div>
  );
}
