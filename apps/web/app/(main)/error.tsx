'use client';

import {
  NextErrorBoundary,
  NextErrorBoundaryProps,
} from '@/components/boundaries/next-error-boundary';

export default function Error({ error, reset }: NextErrorBoundaryProps) {
  return <NextErrorBoundary error={error} reset={reset} />;
}
