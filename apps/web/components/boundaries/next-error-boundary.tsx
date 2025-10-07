import { useEffect } from 'react';

import { useQueryErrorResetBoundary } from '@tanstack/react-query';

import { logger } from '@/lib/logger';
import { ErrorAlert } from './error-alert';

export interface NextErrorBoundaryProps {
  error: NextError;
  reset: () => void;
}

interface NextError extends Error {
  digest?: string;
}

export function NextErrorBoundary(props: NextErrorBoundaryProps) {
  const { reset } = useQueryErrorResetBoundary();

  useEffect(() => {
    logger.error(`Error: ${props.error.message}`);
  }, [props.error]);

  function handleReset() {
    props.reset();
    reset();
  }

  return (
    <div className="flex justify-center p-6">
      <div className="w-full max-w-lg">
        <ErrorAlert
          title="Page Error"
          message={props.error.message || 'Something went wrong while loading this page'}
          onRetry={handleReset}
          retryLabel="Reload page"
          variant="critical"
          onDismiss={() => window.history.back()}
        />
      </div>
    </div>
  );
}
