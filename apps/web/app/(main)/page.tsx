import { HeatMapCalendar } from '@/components/heat-map-calendar';

export default function HomePage() {
  return (
    <main className="flex flex-col p-4">
      <HeatMapCalendar selectedDate={new Date().toISOString()} />
    </main>
  );
}
