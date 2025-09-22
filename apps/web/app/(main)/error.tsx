'use client';

// Error boundaries must be Client Components
import { useEffect } from 'react';

import { Button } from '@/components/ui/button';
import { logger } from '@/lib/logger';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    logger.error(error.message);
  }, [error]);

  return (
    <div className="flex justify-center p-4">
      <div className="bg-card border-border flex w-full max-w-md flex-col gap-2 rounded-lg border p-6">
        <h2>Something went wrong!</h2>
        <Button onClick={() => reset()}>Try again</Button>
      </div>
    </div>
  );
}
