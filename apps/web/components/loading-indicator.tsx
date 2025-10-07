import { Spinner } from './ui/spinner';

export function LoadingIndicator() {
  return (
    <div className="fixed inset-0 flex items-center justify-center">
      <Spinner className="size-8" />
    </div>
  );
}
