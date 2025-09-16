import { PropsWithChildren } from 'react';

import { Header } from '@/components/header';

export default function MainLayout({ children }: PropsWithChildren) {
  return (
    <>
      <Header />
      {children}
    </>
  );
}
