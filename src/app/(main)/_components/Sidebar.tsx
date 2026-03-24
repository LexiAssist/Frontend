'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Icon } from '@/components/Icon';
import { useState, useEffect } from 'react';
import { useAuthStore } from '@/store/authStore';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

interface NavItem {
  name: string;
  href: string;
  icon: string;
}

const mainNavItems: NavItem[] = [
  { name: 'Dashboard', href: '/dashboard', icon: 'dashboard' },
];

const toolsNavItems: NavItem[] = [
  { name: 'Text to Speech', href: '/text-to-speech', icon: 'volume' },
  { name: 'Reading Assistant', href: '/reading-assistant', icon: 'book' },
  { name: 'Writing Assistant', href: '/writing-assistant', icon: 'pen' },
];

const studyNavItems: NavItem[] = [
  { name: 'Chat Assistant', href: '/chat-assistant', icon: 'chat' },
  { name: 'Flashcards', href: '/flashcards', icon: 'document' },
  { name: 'Quizzes', href: '/quizzes', icon: 'question' },
];

export default function Sidebar() {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { user, logout } = useAuthStore();

  useEffect(() => {
    setMobileMenuOpen(false);
  }, [pathname]);

  useEffect(() => {
    document.body.style.overflow = mobileMenuOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [mobileMenuOpen]);

  const handleLogout = () => {
    logout();
    window.location.href = '/login';
  };

  const isActive = (href: string) => pathname === href || pathname.startsWith(`${href}/`);

  const NavLink = ({ item }: { item: NavItem }) => (
    <Link
      href={item.href}
      onClick={() => setMobileMenuOpen(false)}
      className={`flex items-center gap-3 px-4 py-3 rounded-xl text-[14px] font-medium transition-all duration-200 ${
        isActive(item.href)
          ? 'bg-white text-[#3D6E4E] shadow-sm'
          : 'text-white/85 hover:bg-white/10 hover:text-white'
      }`}
    >
      <Icon name={item.icon} size={18} className={isActive(item.href) ? 'text-[#3D6E4E]' : 'text-white/70'} />
      <span className="truncate">{item.name}</span>
    </Link>
  );

  return (
    <>
      {/* Mobile Menu Button */}
      <div className="fixed top-4 left-4 z-[60] lg:hidden">
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="w-11 h-11 rounded-xl bg-[#3D6E4E] shadow-lg shadow-[#3D6E4E]/30 text-white hover:bg-[#356154] active:scale-95 transition-all flex items-center justify-center"
          aria-label={mobileMenuOpen ? 'Close menu' : 'Open menu'}
        >
          <Icon name={mobileMenuOpen ? 'close' : 'menu'} size={20} className="text-white" />
        </button>
      </div>

      {/* Mobile Overlay */}
      <div
        className={`fixed inset-0 bg-black/40 backdrop-blur-sm z-[45] lg:hidden transition-opacity duration-300 ${
          mobileMenuOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        onClick={() => setMobileMenuOpen(false)}
      />

      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 h-screen w-[240px] bg-[#3D6E4E] z-[50] shadow-xl shadow-black/10 transform transition-transform duration-300 ease-out rounded-r-3xl
          lg:translate-x-0
          ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}
        `}
      >
        <div className="flex flex-col h-full py-6">
          {/* Logo */}
          <div className="flex items-center gap-3 px-6 mb-8">
            <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center backdrop-blur-sm">
              <Icon name="book" size={20} className="text-white" />
            </div>
            <span className="text-white font-bold text-lg tracking-tight">LexiAssist</span>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 overflow-y-auto">
            {/* Main */}
            <div className="space-y-1 mb-6">
              {mainNavItems.map((item) => (
                <NavLink key={item.name} item={item} />
              ))}
            </div>

            {/* Tools Section */}
            <div className="mb-6">
              <div className="px-4 py-2 text-[11px] font-bold text-white/50 uppercase tracking-wider">
                Tools
              </div>
              <div className="space-y-1">
                {toolsNavItems.map((item) => (
                  <NavLink key={item.name} item={item} />
                ))}
              </div>
            </div>

            {/* Study Section */}
            <div>
              <div className="px-4 py-2 text-[11px] font-bold text-white/50 uppercase tracking-wider">
                Study
              </div>
              <div className="space-y-1">
                {studyNavItems.map((item) => (
                  <NavLink key={item.name} item={item} />
                ))}
              </div>
            </div>
          </nav>

          {/* User Profile */}
          <div className="px-4 pt-4 mt-4 border-t border-white/10">
            <div className="flex items-center gap-3 p-3 rounded-xl hover:bg-white/5 transition-colors cursor-pointer">
              <Avatar className="h-9 w-9 border-2 border-white/30 flex-shrink-0">
                <AvatarImage src={user?.avatar} alt={user?.name || 'User'} />
                <AvatarFallback className="bg-white/20 text-white text-sm font-semibold">
                  {user?.name?.charAt(0) || 'U'}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <span className="block text-sm font-semibold text-white truncate">
                  {user?.name || 'Alison Eyo'}
                </span>
                <span className="block text-xs text-white/50 truncate">
                  {user?.email || 'ails@lexiassist'}
                </span>
              </div>
              <button
                onClick={handleLogout}
                className="p-2 rounded-lg text-white/60 hover:bg-white/10 hover:text-white transition-colors flex-shrink-0"
                title="Logout"
              >
                <Icon name="logout" size={18} />
              </button>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
