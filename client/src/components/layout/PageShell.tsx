import type { ReactNode } from 'react';
import Navbar from './Navbar';
import MobileNav from './MobileNav';

export default function PageShell({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-amber-50">
      <Navbar />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6 pb-24 md:pb-6">
        {children}
      </main>
      <MobileNav />
    </div>
  );
}
