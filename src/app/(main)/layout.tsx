import { ReactNode } from 'react';
import Sidebar from './_components/Sidebar';

export default function MainLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-white">
      {/* Sidebar - includes mobile header and bottom nav */}
      <Sidebar />
      
      {/* Main Content */}
      <main className="relative min-h-screen w-full z-0 lg:pl-72">
        {/* Mobile: Add padding for fixed header and safe areas */}
        <div className="relative min-h-screen pt-24 sm:pt-28 lg:pt-8 pb-safe lg:pb-0 py-4 sm:py-6 lg:py-8 px-4 sm:px-6 lg:px-8 xl:px-10">
          <div className="max-w-6xl mx-auto animate-page-enter">
            {children}
          </div>
        </div>
      </main>
    </div>
  );
}
