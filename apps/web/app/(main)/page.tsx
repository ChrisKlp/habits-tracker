import { HeatMapCalendar } from '@/components/heat-map-calendar';
import { getHabitLogs } from './actions';

export default async function HomePage() {
  const habitLogs = await getHabitLogs();
  return (
    <main className="flex flex-col p-4">
      <HeatMapCalendar habits={habitLogs ?? []} selectedDate={new Date().toISOString()} />
    </main>
  );
}
