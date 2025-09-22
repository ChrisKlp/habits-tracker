import { Suspense } from 'react';

import { HeatMapCalendar } from '@/components/heat-map-calendar';

export default function HomePage() {
  return (
    <main className="flex flex-col p-4">
      <Suspense fallback={<div>Loading...</div>}>
        <HeatMapCalendar selectedDate={new Date().toISOString()} />
      </Suspense>
    </main>
  );
}
