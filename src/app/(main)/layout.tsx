import { ReactNode } from 'react';
import Sidebar from './_components/Sidebar';

export default function MainLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex h-screen overflow-hidden bg-white">
      {/* Sidebar - includes mobile header and bottom nav */}
      <Sidebar />
      
      {/* Main Content */}
      <main className="flex flex-col flex-1 overflow-hidden lg:pl-[300px]">
        {/* Scrollable content area */}
        <div className="flex-1 overflow-y-auto pt-24 sm:pt-28 lg:pt-8 pb-safe lg:pb-0 px-4 sm:px-6 lg:px-8 xl:px-10">
          <div className="max-w-6xl mx-auto animate-page-enter">
            {children}
          </div>
        </div>
      </main>
    </div>
  );
}
