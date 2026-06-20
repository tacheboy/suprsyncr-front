// src/app/layout.tsx

import type { Metadata } from 'next';
import { Plus_Jakarta_Sans, Inter } from 'next/font/google';
import './globals.css';
import { Providers } from '@/components/layout/Providers';

const plusJakarta = Plus_Jakarta_Sans({
  subsets: ['latin'],
  weight: ['400', '600', '700', '800'],
  variable: '--font-display',
  display: 'swap',
});

const inter = Inter({
  subsets: ['latin'],
  weight: ['400', '500', '600'],
  variable: '--font-body',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Suprsyncr — Unlock Growth with AI that sells for you',
  description:
    'SUPRSYNCR autonomously reallocates budgets to high-yielding campaigns, surfacing creative gaps and executing bid adjustments. High-performance D2C growth, automated.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${plusJakarta.variable} ${inter.variable} font-sans bg-slate-50 text-slate-900 antialiased`}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
