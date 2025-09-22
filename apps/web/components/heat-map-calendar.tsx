'use client';

import { useState } from 'react';

import { useSuspenseQuery } from '@tanstack/react-query';
import { ChevronLeft, ChevronRight } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { ApiError } from '@/lib/api/api-error';
import { cn } from '@/lib/utils';
import type { HabitLogDto } from '@/types';

interface HeatMapCalendarProps {
  habits?: HabitLogDto[];
  selectedDate: string;
  //   onDateSelect: (date: string) => void;
}

export function HeatMapCalendar({ selectedDate }: HeatMapCalendarProps) {
  const { data: habits } = useSuspenseQuery<HabitLogDto[]>({
    queryKey: ['habit-logs'],
    queryFn: () =>
      new Promise((resolve, reject) => {
        setTimeout(() => {
          reject(
            new ApiError({
              error: 'Server error',
              statusCode: 500,
              message: 'Failed to fetch habit logs',
            })
          );
        }, 1000);
      }),
  });

  const [currentMonth, setCurrentMonth] = useState(new Date());

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const days = [];

    // Add empty cells for days before the first day of the month
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }

    // Add all days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(new Date(year, month, day));
    }

    return days;
  };

  const getCompletionLevel = (date: Date) => {
    const dateString = date.toISOString().split('T')[0];
    const completedHabits = habits.filter(habit => habit.date === dateString).length;

    if (completedHabits === 0) return 0;
    if (completedHabits === 1) return 1;
    if (completedHabits === 2) return 2;
    if (completedHabits === 3) return 3;
    return 4;
  };

  const getHeatMapColor = (level: number) => {
    switch (level) {
      case 0:
        return 'bg-muted hover:bg-secondary text-foreground';
      case 1:
        return 'bg-chart-4 hover:bg-chart-3 text-foreground';
      case 2:
        return 'bg-chart-3 hover:bg-chart-2 text-primary-foreground';
      case 3:
        return 'bg-chart-2 hover:bg-chart-1 text-primary-foreground';
      case 4:
        return 'bg-chart-1 hover:bg-primary text-primary-foreground';
      default:
        return 'bg-muted text-foreground';
    }
  };

  const days = getDaysInMonth(currentMonth);
  const monthName = currentMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

  const navigateMonth = (direction: 'prev' | 'next') => {
    setCurrentMonth(prev => {
      const newDate = new Date(prev);
      if (direction === 'prev') {
        newDate.setMonth(prev.getMonth() - 1);
      } else {
        newDate.setMonth(prev.getMonth() + 1);
      }
      return newDate;
    });
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
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
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

          const dateString = day.toISOString().split('T')[0];
          const completionLevel = getCompletionLevel(day);
          const isSelected = dateString === selectedDate;
          const isToday = dateString === new Date().toISOString().split('T')[0];

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
