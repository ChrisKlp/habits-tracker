import { dehydrate, HydrationBoundary } from '@tanstack/react-query';

import { HeatMapCalendar } from '@/components/heat-map-calendar';
import { getQueryClient } from '@/lib/api/get-query-client';
import { getHabitLogs } from './actions';

export default async function HomePage() {
  const queryClient = getQueryClient();

  await queryClient.prefetchQuery({
    queryKey: ['habit-logs'],
    queryFn: () => getHabitLogs(),
  });

  return (
    <main className="flex flex-col p-4">
      <HydrationBoundary state={dehydrate(queryClient)}>
        <HeatMapCalendar selectedDate={new Date().toISOString()} />
      </HydrationBoundary>
    </main>
  );
}
