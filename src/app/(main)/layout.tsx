import { ReactNode } from 'react';
import Sidebar from './_components/Sidebar';

export default function MainLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-white">
      {/* Sidebar */}
      <Sidebar />
      
      {/* Main Content */}
      <main className="min-h-screen w-full lg:pl-[240px]">
        <div className="min-h-screen py-8 px-6 sm:px-8 lg:px-10">
          <div className="max-w-5xl mx-auto">
            {children}
          </div>
        </div>
      </main>
    </div>
  );
}
