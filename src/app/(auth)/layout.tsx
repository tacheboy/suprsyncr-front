// src/app/(auth)/layout.tsx
import { Header } from '@/components/landing/Header';
import { Footer } from '@/components/landing/Footer';

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex flex-col" style={{ background: 'var(--bg-page)' }}>
      <Header />
      <main className="flex-1 flex flex-col">
        {children}
      </main>
      <Footer />
    </div>
  );
}
