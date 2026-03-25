'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState, useEffect } from 'react';
import { useAuthStore } from '@/store/authStore';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  Home,
  Mic,
  BookOpen,
  PenSquare,
  MessageSquare,
  Layers,
  HelpCircle,
  ChevronDown,
  LogOut,
  Menu,
  X,
  Settings,
  Moon,
} from 'lucide-react';

interface NavItem {
  name: string;
  href: string;
  icon: React.ReactNode;
  shortName?: string;
}

export default function Sidebar() {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [moreMenuOpen, setMoreMenuOpen] = useState(false);
  const [isStudyBuddyOpen, setIsStudyBuddyOpen] = useState(false);
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
  const MenuItem = ({ 
    icon, 
    label, 
    href, 
    active = false, 
    compact = false,
    onClick 
  }: { 
    icon: React.ReactNode; 
    label: string; 
    href?: string;
    active?: boolean; 
    compact?: boolean;
    onClick?: () => void;
  }) => {
    const content = (
      <div
        onClick={onClick}
        className={`flex items-center gap-2.5 px-3 rounded-full transition-all duration-150 cursor-pointer ${
          compact ? 'py-1.5' : 'py-2'
        } ${
          active
            ? 'bg-white text-[#3D6E4E] shadow-sm'
            : 'hover:bg-white/10 text-white/90'
        }`}
        style={active ? { fontWeight: 500 } : {}}
      >
        {icon}
        <span className={compact ? 'text-[13px]' : 'text-sm'}>{label}</span>
      </div>
    );

    if (href && !onClick) {
      return (
        <Link href={href} onClick={() => setMobileMenuOpen(false)}>
          {content}
        </Link>
      );
    }
    return content;
  };

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
            <Menu size={22} className="text-white/90" />
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
          {item.icon}
        </div>
        <span className={`text-[10px] font-medium ${active ? 'text-white' : 'text-white/70'}`}>
          {item.shortName}
        </span>
      </Link>
    );
  };

  // Desktop sidebar content
  const SidebarContent = () => (
    <>
      {/* Logo Section */}
      <div className="px-5 py-6">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 bg-white rounded-xl flex items-center justify-center shadow-sm">
            <BookOpen className="w-5 h-5 text-[#3D6E4E]" />
          </div>
          <span className="text-[17px] font-semibold text-white">LexiAssist</span>
        </div>
      </div>

      {/* Main Navigation */}
      <div className="flex-1 px-3 pt-1 space-y-5 overflow-y-auto">
        {/* Dashboard */}
        <div className="space-y-2">
          <MenuItem
            icon={<Home size={18} />}
            label="Dashboard"
            href="/dashboard"
            active={isActive('/dashboard')}
          />
          <div className="h-px bg-white/20 mx-2" />
        </div>

        {/* Tools Section */}
        <div className="space-y-1.5">
          <div className="px-3 text-white/60 text-[11px] tracking-wider font-medium uppercase">Tools</div>

          <MenuItem
            icon={<Mic size={18} />}
            label="Text to Speech"
            href="/text-to-speech"
            active={isActive('/text-to-speech')}
          />
          <MenuItem
            icon={<BookOpen size={18} />}
            label="Reading Assistant"
            href="/reading-assistant"
            active={isActive('/reading-assistant')}
          />
          <MenuItem
            icon={<PenSquare size={18} />}
            label="Writing Assistant"
            href="/writing-assistant"
            active={isActive('/writing-assistant')}
          />

          {/* StudyBuddy with Submenu */}
          <div className="space-y-0.5">
            <button
              onClick={() => setIsStudyBuddyOpen(!isStudyBuddyOpen)}
              className="w-full flex items-center gap-2.5 px-3 py-2 rounded-full hover:bg-white/10 transition-colors text-white/90"
            >
              <Layers size={18} />
              <span className="flex-1 text-left text-sm">StudyBuddy</span>
              <ChevronDown
                size={16}
                className={`transition-transform duration-200 ${isStudyBuddyOpen ? 'rotate-180' : ''}`}
                style={{ opacity: 0.7 }}
              />
            </button>

            {isStudyBuddyOpen && (
              <div className="pl-4 space-y-0.5">
                <MenuItem
                  icon={<MessageSquare size={16} />}
                  label="Chat Assistant"
                  href="/chat-assistant"
                  active={isActive('/chat-assistant')}
                  compact
                />
                <MenuItem
                  icon={<Layers size={16} />}
                  label="Flashcards"
                  href="/flashcards"
                  active={isActive('/flashcards')}
                  compact
                />
                <MenuItem
                  icon={<HelpCircle size={16} />}
                  label="Quizzes"
                  href="/quizzes"
                  active={isActive('/quizzes')}
                  compact
                />
              </div>
            )}
          </div>
        </div>
      </div>

      {/* User Profile Section */}
      <div className="p-3 border-t border-white/15">
        <div className="flex items-center gap-2.5 px-3 py-2 rounded-xl hover:bg-white/10 transition-colors">
          <div className="relative flex-shrink-0">
            <Avatar className="h-10 w-10 border-2 border-white/30">
              <AvatarImage src={user?.avatar} alt={user?.name || 'User'} />
              <AvatarFallback className="bg-[#ffe7cc] text-[#3D6E4E] text-sm font-semibold">
                {user?.name?.charAt(0) || 'U'}
              </AvatarFallback>
            </Avatar>
            <div className="absolute bottom-0 right-0 w-3 h-3 bg-[#04802e] rounded-full border-2 border-[#3D6E4E]" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-xs font-semibold text-white truncate">{user?.name || 'Alison Eyo'}</div>
            <div className="text-[10px] text-white/60 truncate">{user?.email || 'alis@lexiassist'}</div>
          </div>
          <button
            onClick={handleLogout}
            className="p-1.5 hover:bg-white/10 rounded-lg transition-colors flex-shrink-0 text-white/70"
            aria-label="Sign out"
          >
            <LogOut size={16} />
          </button>
        </div>
      </div>
    </>
  );

  // Bottom nav items for mobile
  const bottomNavItems: NavItem[] = [
    { name: 'Dashboard', href: '/dashboard', icon: <Home size={22} />, shortName: 'Home' },
    { name: 'Text to Speech', href: '/text-to-speech', icon: <Mic size={22} />, shortName: 'TTS' },
    { name: 'Reading Assistant', href: '/reading-assistant', icon: <BookOpen size={22} />, shortName: 'Read' },
    { name: 'Writing Assistant', href: '/writing-assistant', icon: <PenSquare size={22} />, shortName: 'Write' },
    { name: 'More', href: '#', icon: <Menu size={22} />, shortName: 'More' },
  ];

  return (
    <>
      {/* Desktop Sidebar - Rebuilt Design */}
      <aside className="hidden lg:flex fixed top-0 left-0 h-screen w-[210px] bg-[#3D6E4E] text-white flex-col flex-shrink-0 z-[50] shadow-xl" style={{ borderRadius: '0 22px 22px 0' }}>
        <SidebarContent />
      </aside>

      {/* Mobile: Fixed Header */}
      <header className="fixed top-0 left-0 right-0 h-16 bg-[#3D6E4E] z-[45] lg:hidden shadow-md">
        <div className="flex items-center justify-between h-full px-4">
          {/* Left: Menu button */}
          <button
            onClick={() => setMobileMenuOpen(true)}
            className="w-10 h-10 rounded-xl bg-white/10 text-white flex items-center justify-center active:scale-95 transition-all"
            aria-label="Open menu"
          >
            <Menu size={20} />
          </button>

          {/* Center: Logo */}
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center">
              <BookOpen size={16} className="text-[#3D6E4E]" />
            </div>
            <span className="text-white font-bold text-lg">LexiAssist</span>
          </div>

          {/* Right: Settings & Profile */}
          <div className="flex items-center gap-2">
            <button className="w-9 h-9 rounded-xl bg-white/10 text-white flex items-center justify-center">
              <Settings size={18} />
            </button>
            <Link href="/dashboard" className="w-9 h-9 rounded-full overflow-hidden border-2 border-white/30">
              <Avatar className="h-full w-full">
                <AvatarImage src={user?.avatar} alt={user?.name || 'User'} />
                <AvatarFallback className="bg-[#ffe7cc] text-[#3D6E4E] text-xs font-semibold">
                  {user?.name?.charAt(0) || 'U'}
                </AvatarFallback>
              </Avatar>
            </Link>
          </div>
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
        className={`fixed top-0 left-0 h-screen w-[280px] bg-[#3D6E4E] z-[47] shadow-2xl transform transition-transform duration-300 ease-out lg:hidden flex flex-col
          ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}
        `}
      >
        {/* Close Button */}
        <div className="flex items-center justify-between px-5 py-4">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 bg-white rounded-xl flex items-center justify-center">
              <BookOpen className="w-5 h-5 text-[#3D6E4E]" />
            </div>
            <span className="text-white font-bold text-lg">LexiAssist</span>
          </div>
          <button
            onClick={() => setMobileMenuOpen(false)}
            className="w-10 h-10 rounded-xl bg-white/10 text-white flex items-center justify-center"
          >
            <X size={20} />
          </button>
        </div>

        {/* Navigation Content */}
        <div className="flex-1 px-3 pt-1 space-y-5 overflow-y-auto">
          {/* Dashboard */}
          <div className="space-y-2">
            <MenuItem
              icon={<Home size={18} />}
              label="Dashboard"
              href="/dashboard"
              active={isActive('/dashboard')}
            />
            <div className="h-px bg-white/20 mx-2" />
          </div>

          {/* Tools Section */}
          <div className="space-y-1.5">
            <div className="px-3 text-white/60 text-[11px] tracking-wider font-medium uppercase">Tools</div>

            <MenuItem
              icon={<Mic size={18} />}
              label="Text to Speech"
              href="/text-to-speech"
              active={isActive('/text-to-speech')}
            />
            <MenuItem
              icon={<BookOpen size={18} />}
              label="Reading Assistant"
              href="/reading-assistant"
              active={isActive('/reading-assistant')}
            />
            <MenuItem
              icon={<PenSquare size={18} />}
              label="Writing Assistant"
              href="/writing-assistant"
              active={isActive('/writing-assistant')}
            />

            {/* StudyBuddy with Submenu */}
            <div className="space-y-0.5">
              <button
                onClick={() => setIsStudyBuddyOpen(!isStudyBuddyOpen)}
                className="w-full flex items-center gap-2.5 px-3 py-2 rounded-full hover:bg-white/10 transition-colors text-white/90"
              >
                <Layers size={18} />
                <span className="flex-1 text-left text-sm">StudyBuddy</span>
                <ChevronDown
                  size={16}
                  className={`transition-transform duration-200 ${isStudyBuddyOpen ? 'rotate-180' : ''}`}
                />
              </button>

              {isStudyBuddyOpen && (
                <div className="pl-4 space-y-0.5">
                  <MenuItem
                    icon={<MessageSquare size={16} />}
                    label="Chat Assistant"
                    href="/chat-assistant"
                    active={isActive('/chat-assistant')}
                    compact
                  />
                  <MenuItem
                    icon={<Layers size={16} />}
                    label="Flashcards"
                    href="/flashcards"
                    active={isActive('/flashcards')}
                    compact
                  />
                  <MenuItem
                    icon={<HelpCircle size={16} />}
                    label="Quizzes"
                    href="/quizzes"
                    active={isActive('/quizzes')}
                    compact
                  />
                </div>
              )}
            </div>
          </div>
        </div>

        {/* User Profile */}
        <div className="p-3 border-t border-white/15">
          <div className="flex items-center gap-2.5 px-3 py-2">
            <Avatar className="h-10 w-10 border-2 border-white/30">
              <AvatarImage src={user?.avatar} alt={user?.name || 'User'} />
              <AvatarFallback className="bg-[#ffe7cc] text-[#3D6E4E] text-sm font-semibold">
                {user?.name?.charAt(0) || 'U'}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <div className="text-xs font-semibold text-white truncate">{user?.name || 'Alison Eyo'}</div>
              <div className="text-[10px] text-white/60 truncate">{user?.email || 'alis@lexiassist'}</div>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="w-full mt-2 flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-white/10 text-white font-medium hover:bg-white/20 transition-colors"
          >
            <LogOut size={18} />
            <span>Logout</span>
          </button>
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
        className={`fixed bottom-[72px] left-0 right-0 bg-white rounded-t-3xl z-[47] lg:hidden transform transition-transform duration-300 ease-out shadow-[0_-4px_20px_rgba(0,0,0,0.15)] ${
          moreMenuOpen ? 'translate-y-0' : 'translate-y-full'
        }`}
      >
        <div className="p-6">
          {/* Handle bar */}
          <div className="w-12 h-1 bg-gray-300 rounded-full mx-auto mb-6" />
          
          <h3 className="text-lg font-bold text-[#1a1a1a] mb-4">More Tools</h3>
          
          <div className="space-y-2">
            {[
              { name: 'Chat Assistant', href: '/chat-assistant', icon: <MessageSquare size={22} className="text-[#3D6E4E]" /> },
              { name: 'Flashcards', href: '/flashcards', icon: <Layers size={22} className="text-[#3D6E4E]" /> },
              { name: 'Quizzes', href: '/quizzes', icon: <HelpCircle size={22} className="text-[#3D6E4E]" /> },
            ].map((item) => (
              <Link
                key={item.name}
                href={item.href}
                onClick={() => setMoreMenuOpen(false)}
                className="flex items-center gap-4 p-4 rounded-xl hover:bg-gray-50 transition-colors"
              >
                <div className="w-12 h-12 rounded-xl bg-[#3D6E4E]/10 flex items-center justify-center">
                  {item.icon}
                </div>
                <div>
                  <p className="font-semibold text-[#1a1a1a]">{item.name}</p>
                  <p className="text-sm text-gray-500">Access {item.name.toLowerCase()}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
