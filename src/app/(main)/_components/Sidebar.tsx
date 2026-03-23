'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Icon } from '@/components/Icon';
import { useState, useEffect } from 'react';
import { useAuthStore } from '@/store/authStore';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import Logo from '@/components/Logo';

interface SubNavItem {
  name: string;
  href: string;
}

const studyBuddySubmenu: SubNavItem[] = [
  { name: 'Chat Assistant', href: '/chat-assistant' },
  { name: 'Flashcards', href: '/flashcards' },
  { name: 'Quizzes', href: '/quizzes' },
];

export default function Sidebar() {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [studyBuddyOpen, setStudyBuddyOpen] = useState(true);
  const { user, logout } = useAuthStore();

  // Close mobile menu on route change
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [pathname]);

  // Prevent body scroll when mobile menu is open
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [mobileMenuOpen]);

  const handleLogout = () => {
    logout();
    window.location.href = '/login';
  };

  const isActive = (href: string) => {
    return pathname === href || pathname.startsWith(`${href}/`);
  };

  const isStudyBuddyActive = studyBuddySubmenu.some(
    (item) => pathname === item.href || pathname.startsWith(`${item.href}/`)
  );

  return (
    <>
      {/* Mobile Menu Button - Fixed top left */}
      <div className="fixed top-4 left-4 z-[60] lg:hidden">
        <button
          type="button"
          className="p-3 rounded-xl bg-[#3c8350] shadow-lg text-white hover:bg-[#377749] active:scale-95 transition-all duration-200"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          aria-label={mobileMenuOpen ? 'Close menu' : 'Open menu'}
        >
          {mobileMenuOpen ? <Icon name="close" size={22} className="text-white" /> : <Icon name="menu" size={22} className="text-white" />}
        </button>
      </div>

      {/* Mobile Overlay Backdrop */}
      <div
        className={`fixed inset-0 bg-black/60 backdrop-blur-sm z-[45] lg:hidden transition-opacity duration-300 ${mobileMenuOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
          }`}
        onClick={() => setMobileMenuOpen(false)}
      />

      {/* Sidebar Container */}
      <aside
        className={`fixed top-0 left-0 h-screen w-[280px] xl:w-[320px] bg-[#3c8350] z-[50] shadow-2xl transform transition-transform duration-300 ease-out
          lg:translate-x-0
          ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}
        `}
      >
        <div className="flex flex-col h-full">
          {/* Logo Section */}
          <div className="flex items-center gap-3 px-5 lg:px-6 py-5 lg:py-6 border-b border-white/10 flex-shrink-0">
            <div className="flex-shrink-0 scale-90 -ml-2">
              <Logo href="/dashboard" size="md" />
            </div>
          </div>

          {/* Navigation - Scrollable */}
          <nav className="flex-1 px-3 lg:px-4 py-4 space-y-1 overflow-y-auto min-h-0">
            {/* Dashboard */}
            <Link
              href="/dashboard"
              onClick={() => setMobileMenuOpen(false)}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${isActive('/dashboard')
                  ? 'bg-white text-[#3c8350] shadow-sm'
                  : 'text-white/90 hover:bg-white/10'
                }`}
            >
              <Icon name="dashboard" size={20} />
              <span className="truncate">Dashboard</span>
            </Link>

            {/* Divider */}
            <div className="my-4 border-t border-white/20" />

            {/* Section Title */}
            <div className="px-4 py-2 text-xs font-medium text-white/60 uppercase tracking-wider">
              Learning Tools
            </div>

            {/* Text to Speech */}
            <Link
              href="/text-to-speech"
              onClick={() => setMobileMenuOpen(false)}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${isActive('/text-to-speech')
                  ? 'bg-white text-[#3c8350] shadow-sm'
                  : 'text-white/90 hover:bg-white/10'
                }`}
            >
              <Icon name="volume" size={20} />
              <span className="truncate">Text to Speech</span>
            </Link>

            {/* Reading Assistant */}
            <Link
              href="/reading-assistant"
              onClick={() => setMobileMenuOpen(false)}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${isActive('/reading-assistant')
                  ? 'bg-white text-[#3c8350] shadow-sm'
                  : 'text-white/90 hover:bg-white/10'
                }`}
            >
              <Icon name="book" size={20} />
              <span className="truncate">Reading Assistant</span>
            </Link>

            {/* Writing Assistant */}
            <Link
              href="/writing-assistant"
              onClick={() => setMobileMenuOpen(false)}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${isActive('/writing-assistant')
                  ? 'bg-white text-[#3c8350] shadow-sm'
                  : 'text-white/90 hover:bg-white/10'
                }`}
            >
              <Icon name="pen" size={20} />
              <span className="truncate">Writing Assistant</span>
            </Link>

            {/* StudyBuddy Dropdown */}
            <div className="mt-2">
              <button
                onClick={() => setStudyBuddyOpen(!studyBuddyOpen)}
                className={`flex items-center justify-between w-full gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${isStudyBuddyActive
                    ? 'bg-white text-[#3c8350] shadow-sm'
                    : 'text-white/90 hover:bg-white/10'
                  }`}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <Icon name="chat" size={20} />
                  <span className="truncate">StudyBuddy</span>
                </div>
                <span
                  className={`flex-shrink-0 transition-transform duration-200 ${studyBuddyOpen ? 'rotate-180' : ''}`}
                >
                  <Icon name="chevron-down" size={16} />
                </span>
              </button>

              {/* Submenu */}
              <div
                className={`overflow-hidden transition-all duration-200 ${studyBuddyOpen ? 'max-h-48 opacity-100 mt-1' : 'max-h-0 opacity-0'
                  }`}
              >
                <div className="space-y-1 ml-2">
                  {studyBuddySubmenu.map((subItem) => (
                    <Link
                      key={subItem.name}
                      href={subItem.href}
                      onClick={() => setMobileMenuOpen(false)}
                      className={`flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ml-4 lg:ml-6 ${isActive(subItem.href)
                          ? 'bg-white text-[#3c8350] shadow-sm'
                          : 'text-white/80 hover:bg-white/10'
                        }`}
                    >
                      <span className="truncate">{subItem.name}</span>
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          </nav>

          {/* Bottom section - User Profile */}
          <div className="px-3 lg:px-4 py-4 border-t border-white/10 flex-shrink-0">
            <div className="flex items-center gap-3 p-2 rounded-xl hover:bg-white/5 transition-colors">
              <Avatar className="h-10 w-10 border-2 border-white/30 flex-shrink-0">
                <AvatarImage
                  src={user?.avatar}
                  alt={user?.name || 'User'}
                />
                <AvatarFallback className="bg-white/20 text-white">
                  {user?.name?.charAt(0) || 'U'}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <span className="block text-sm font-medium text-white truncate">
                  {user?.name || 'Alison Eyo'}
                </span>
                <span className="block text-xs text-white/70 truncate">
                  {user?.email || 'ails@lexiassist'}
                </span>
              </div>
              <button
                onClick={handleLogout}
                className="p-2 rounded-lg text-white/80 hover:bg-white/10 transition-colors flex-shrink-0"
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
