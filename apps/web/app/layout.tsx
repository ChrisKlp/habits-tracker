import type { Metadata } from 'next';
import localFont from 'next/font/local';

import './globals.css';

import { Toaster } from 'sonner';

const geistSans = localFont({
  src: '../assets/fonts/GeistVF.woff',
  variable: '--font-geist-sans',
});
const geistMono = localFont({
  src: '../assets/fonts/GeistMonoVF.woff',
  variable: '--font-geist-mono',
});

export const metadata: Metadata = {
  title: 'HabitFlow',
  description: 'App to track your habits',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable}`}>
        {children}
        <Toaster richColors />
      </body>
    </html>
  );
}
