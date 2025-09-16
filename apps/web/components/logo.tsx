import Link from 'next/link';

import { Grid2x2Check } from 'lucide-react';

import { cn } from '@/lib/utils';

export function Logo({ dark = false }: { dark?: boolean }) {
  return (
    <Link href="/" className={cn('flex items-center gap-3', dark && 'text-white')}>
      <div className="flex size-7 items-center justify-center rounded-md bg-amber-300">
        <Grid2x2Check className="size-5 text-indigo-950" />
      </div>
      HabitFlow
    </Link>
  );
}
