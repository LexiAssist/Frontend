import { ReactNode } from 'react';
import Sidebar from './_components/Sidebar';

export default function MainLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-[#F8FAF9]">
      {/* Sidebar */}
      <Sidebar />
      
      {/* Main Content - with left padding for sidebar on desktop, centered */}
      <main className="min-h-screen w-full lg:pl-[280px] xl:pl-[320px]">
        <div className="pt-16 lg:pt-6 pb-6 px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto">
            {children}
          </div>
        </div>
      </main>
    </div>
  );
}
