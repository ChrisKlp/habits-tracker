import { PropsWithChildren } from 'react';

import { Header } from '@/components/header';
import { AuthProvider } from '@/lib/auth/auth-context';

export default async function MainLayout({ children }: PropsWithChildren) {
  return (
    <AuthProvider>
      <Header />
      {children}
    </AuthProvider>
  );
}
