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
  shortName?: string;
}

// Desktop sidebar nav items (all items)
const mainNavItems: NavItem[] = [
  { name: 'Dashboard', href: '/dashboard', icon: 'dashboard', shortName: 'Home' },
];

const toolsNavItems: NavItem[] = [
  { name: 'Text to Speech', href: '/text-to-speech', icon: 'volume', shortName: 'TTS' },
  { name: 'Reading Assistant', href: '/reading-assistant', icon: 'book', shortName: 'Reading' },
  { name: 'Writing Assistant', href: '/writing-assistant', icon: 'pen', shortName: 'Writing' },
];

const studyNavItems: NavItem[] = [
  { name: 'Chat Assistant', href: '/chat-assistant', icon: 'chat', shortName: 'Chat' },
  { name: 'Flashcards', href: '/flashcards', icon: 'document', shortName: 'Cards' },
  { name: 'Quizzes', href: '/quizzes', icon: 'question', shortName: 'Quiz' },
];

// Mobile bottom nav items (primary 4-5 items)
const bottomNavItems: NavItem[] = [
  { name: 'Dashboard', href: '/dashboard', icon: 'dashboard', shortName: 'Home' },
  { name: 'Text to Speech', href: '/text-to-speech', icon: 'volume', shortName: 'TTS' },
  { name: 'Reading Assistant', href: '/reading-assistant', icon: 'book', shortName: 'Read' },
  { name: 'Writing Assistant', href: '/writing-assistant', icon: 'pen', shortName: 'Write' },
  { name: 'More', href: '#', icon: 'menu', shortName: 'More' },
];

export default function Sidebar() {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [moreMenuOpen, setMoreMenuOpen] = useState(false);
  const { user, logout } = useAuthStore();

  useEffect(() => {
    setMobileMenuOpen(false);
    setMoreMenuOpen(false);
  }, [pathname]);

  useEffect(() => {
    document.body.style.overflow = (mobileMenuOpen || moreMenuOpen) ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [mobileMenuOpen, moreMenuOpen]);

  const handleLogout = () => {
    logout();
    window.location.href = '/login';
  };

  const isActive = (href: string) => pathname === href || pathname.startsWith(`${href}/`);

  // Desktop sidebar nav link
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

  // Mobile bottom nav link
  const BottomNavLink = ({ item, isMore = false }: { item: NavItem; isMore?: boolean }) => {
    const active = isActive(item.href) && !isMore;
    
    if (isMore) {
      return (
        <button
          onClick={() => setMoreMenuOpen(true)}
          className="flex flex-col items-center justify-center gap-1 py-2 px-3 min-w-[64px]"
        >
          <div className={`w-12 h-12 rounded-full flex items-center justify-center transition-colors ${
            moreMenuOpen ? 'bg-white/20' : 'hover:bg-white/10'
          }`}>
            <Icon name="menu" size={22} className="text-white/90" />
          </div>
          <span className="text-[10px] font-medium text-white/90">More</span>
        </button>
      );
    }

    return (
      <Link
        href={item.href}
        className="flex flex-col items-center justify-center gap-1 py-2 px-3 min-w-[64px]"
      >
        <div className={`w-12 h-12 rounded-full flex items-center justify-center transition-colors ${
          active ? 'bg-white text-[#3D6E4E]' : 'text-white/70 hover:bg-white/10'
        }`}>
          <Icon name={item.icon} size={22} className={active ? 'text-[#3D6E4E]' : 'text-white/90'} />
        </div>
        <span className={`text-[10px] font-medium ${active ? 'text-white' : 'text-white/70'}`}>
          {item.shortName}
        </span>
      </Link>
    );
  };

  return (
    <>
      {/* Desktop & Tablet: Left Sidebar */}
      <aside
        className={`fixed top-0 left-0 h-screen w-[240px] bg-[#3D6E4E] z-[50] shadow-xl shadow-black/10 transform transition-transform duration-300 ease-out rounded-r-3xl hidden lg:block
          ${mobileMenuOpen ? 'translate-x-0' : 'translate-x-0'}
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

      {/* Mobile: Fixed Header */}
      <header className="fixed top-0 left-0 right-0 h-16 bg-white z-[45] border-b border-gray-100 shadow-sm lg:hidden">
        <div className="flex items-center justify-between h-full px-4">
          {/* Left: Menu or Back */}
          <button
            onClick={() => setMobileMenuOpen(true)}
            className="w-11 h-11 rounded-xl bg-[#3D6E4E] text-white flex items-center justify-center active:scale-95 transition-all"
            aria-label="Open menu"
          >
            <Icon name="menu" size={20} className="text-white" />
          </button>

          {/* Center: Logo/Title */}
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-[#3D6E4E]/10 flex items-center justify-center">
              <Icon name="book" size={16} className="text-[#3D6E4E]" />
            </div>
            <span className="text-[#1a1a1a] font-bold text-lg">LexiAssist</span>
          </div>

          {/* Right: Profile */}
          <Link href="/dashboard" className="w-10 h-10 rounded-full overflow-hidden border-2 border-[#3D6E4E]/20">
            <Avatar className="h-full w-full">
              <AvatarImage src={user?.avatar} alt={user?.name || 'User'} />
              <AvatarFallback className="bg-[#3D6E4E] text-white text-xs font-semibold">
                {user?.name?.charAt(0) || 'U'}
              </AvatarFallback>
            </Avatar>
          </Link>
        </div>
      </header>

      {/* Mobile: Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 h-[72px] bg-[#3D6E4E] z-[45] lg:hidden pb-[env(safe-area-inset-bottom)]">
        <div className="flex items-center justify-around h-full px-2">
          {bottomNavItems.map((item, index) => (
            <BottomNavLink key={item.name} item={item} isMore={index === bottomNavItems.length - 1} />
          ))}
        </div>
      </nav>

      {/* Mobile: Slide-in Menu Overlay */}
      <div
        className={`fixed inset-0 bg-black/40 backdrop-blur-sm z-[46] lg:hidden transition-opacity duration-300 ${
          mobileMenuOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        onClick={() => setMobileMenuOpen(false)}
      />

      {/* Mobile: Slide-in Menu Drawer */}
      <aside
        className={`fixed top-0 left-0 h-screen w-[280px] bg-[#3D6E4E] z-[47] shadow-2xl transform transition-transform duration-300 ease-out lg:hidden
          ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}
        `}
      >
        <div className="flex flex-col h-full py-6">
          {/* Close Button */}
          <div className="flex items-center justify-between px-5 mb-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
                <Icon name="book" size={20} className="text-white" />
              </div>
              <span className="text-white font-bold text-lg">LexiAssist</span>
            </div>
            <button
              onClick={() => setMobileMenuOpen(false)}
              className="w-10 h-10 rounded-xl bg-white/10 text-white flex items-center justify-center"
            >
              <Icon name="close" size={20} />
            </button>
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
            <div className="flex items-center gap-3 p-3 rounded-xl">
              <Avatar className="h-10 w-10 border-2 border-white/30 flex-shrink-0">
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
            </div>
            <button
              onClick={handleLogout}
              className="w-full mt-3 flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-white/10 text-white font-medium hover:bg-white/20 transition-colors"
            >
              <Icon name="logout" size={18} />
              <span>Logout</span>
            </button>
          </div>
        </div>
      </aside>

      {/* Mobile: More Menu Overlay */}
      <div
        className={`fixed inset-0 bg-black/40 backdrop-blur-sm z-[46] lg:hidden transition-opacity duration-300 ${
          moreMenuOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        onClick={() => setMoreMenuOpen(false)}
      />

      {/* Mobile: More Menu Drawer (from bottom) */}
      <div
        className={`fixed bottom-[72px] left-0 right-0 bg-white rounded-t-3xl z-[47] lg:hidden transform transition-transform duration-300 ease-out shadow-2xl ${
          moreMenuOpen ? 'translate-y-0' : 'translate-y-full'
        }`}
      >
        <div className="p-6">
          {/* Handle bar */}
          <div className="w-12 h-1 bg-gray-300 rounded-full mx-auto mb-6" />
          
          <h3 className="text-lg font-bold text-[#1a1a1a] mb-4">More Tools</h3>
          
          <div className="space-y-2">
            {studyNavItems.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                onClick={() => setMoreMenuOpen(false)}
                className="flex items-center gap-4 p-4 rounded-xl hover:bg-gray-50 transition-colors"
              >
                <div className="w-12 h-12 rounded-xl bg-[#3D6E4E]/10 flex items-center justify-center">
                  <Icon name={item.icon} size={22} className="text-[#3D6E4E]" />
                </div>
                <div>
                  <p className="font-semibold text-[#1a1a1a]">{item.name}</p>
                  <p className="text-sm text-gray-500">Access {item.name.toLowerCase()}</p>
                </div>
                <Icon name="arrow-right" size={18} className="ml-auto text-gray-400" />
              </Link>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
