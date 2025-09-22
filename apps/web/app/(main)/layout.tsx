import { PropsWithChildren } from 'react';

import { Header } from '@/components/header';
import { QueryClientProvider } from '@/components/query-client-provider';
import { AuthProvider } from '@/lib/auth/auth-context';
import { getProfile } from './actions';

export default async function MainLayout({ children }: PropsWithChildren) {
  const profile = await getProfile();
  return (
    <QueryClientProvider>
      <AuthProvider>
        <Header profile={profile} />
        {children}
      </AuthProvider>
    </QueryClientProvider>
  );
}
