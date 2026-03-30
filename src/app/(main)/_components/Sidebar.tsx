'use client';

import Image from 'next/image';
import Link from 'next/link';
import type { ComponentType } from 'react';
import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  BookOpen,
  ChevronDown,
  ChevronRight,
  DoorOpen,
  FileText,
  Home,
  Menu,
  MessageSquare,
  Mic,
  Moon,
  PenSquare,
  Settings,
  Sparkles,
  X,
} from 'lucide-react';

type NavLink = {
  label: string;
  href: string;
  icon: ComponentType<{ className?: string }>;
};

const primaryGreen = 'var(--primary-500)';
const sidebarGreen = 'var(--primary-500)';
const studyBuddyLinks: NavLink[] = [
  { label: 'Chat Assistant', href: '/chat-assistant', icon: MessageSquare },
  { label: 'Flashcards', href: '/flashcards', icon: BookOpen },
  { label: 'Quizzes', href: '/quizzes', icon: FileText },
];

const mainLinks: NavLink[] = [
  { label: 'Text to Speech', href: '/text-to-speech', icon: Mic },
  { label: 'Reading Assistant', href: '/reading-assistant', icon: BookOpen },
  { label: 'Writing Assistant', href: '/writing-assistant', icon: PenSquare },
];

function LexiAssistMark({ className = '' }: { className?: string }) {
  return (
    <div className={`flex items-center ${className}`}>
      <Image
        src="/images/lexiassit_logo.jpg"
        alt="LexiAssist"
        width={266}
        height={70}
        className="h-auto w-[170px] object-contain mix-blend-screen"
        unoptimized
        priority
      />
    </div>
  );
}

export default function Sidebar() {
  const pathname = usePathname();
  const { user, logout } = useAuthStore();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [studyBuddyOpen, setStudyBuddyOpen] = useState(true);

  useEffect(() => {
    document.body.style.overflow = mobileMenuOpen ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [mobileMenuOpen]);

  const isActive = (href: string) => pathname === href || pathname.startsWith(`${href}/`);

  const handleLogout = () => {
    logout();
    window.location.href = '/login';
  };

  const avatarName = user?.name || 'Alison Eyo';
  const avatarEmail = user?.email || 'alis@lexiassist';

  const NavItem = ({
    link,
    active,
    nested = false,
    mobile = false,
  }: {
    link: NavLink;
    active: boolean;
    nested?: boolean;
    mobile?: boolean;
  }) => {
    const Icon = link.icon;

    return (
      <Link
        href={link.href}
        onClick={() => setMobileMenuOpen(false)}
        className={[
          'flex items-center gap-3 rounded-full transition-all',
          nested ? 'mx-4 px-4 py-2 text-[13px]' : 'mx-0 px-4 py-3 text-sm',
          active
            ? 'bg-white text-[var(--primary-500)]'
            : mobile
              ? 'text-slate-800 hover:bg-slate-100'
              : 'text-white hover:bg-white/12',
        ].join(' ')}
      >
        <Icon className={nested ? 'h-4 w-4' : 'h-[17px] w-[17px]'} />
        <span className={active ? 'font-semibold' : 'font-medium'}>{link.label}</span>
      </Link>
    );
  };

  const profileBlock = (
    <div className="w-full rounded-2xl px-4 py-3 text-white">
      <div className="flex items-center justify-between gap-3">
        <div className="flex min-w-0 items-center gap-3">
          <Avatar className="h-10 w-10 border border-white/25">
            <AvatarImage src={user?.avatar} alt={avatarName} />
            <AvatarFallback className="bg-[#f3dcc2] text-[var(--primary-700)] font-semibold">
              {avatarName
                .split(' ')
                .map((part) => part[0])
                .join('')
                .slice(0, 2)}
            </AvatarFallback>
          </Avatar>
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold leading-none">{avatarName}</p>
            <p className="truncate pt-1 text-xs text-white/75">{avatarEmail}</p>
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="rounded-full p-2 text-white/80 transition hover:bg-white/10 hover:text-white"
          aria-label="Log out"
        >
          <DoorOpen className="h-4 w-4" />
        </button>
      </div>
    </div>
  );

  const desktopSidebar = (
    <aside
      className="hidden lg:flex fixed inset-y-0 left-0 z-40 w-72 flex-col px-4 py-6 text-white"
      style={{ backgroundColor: sidebarGreen }}
    >
      <div className="px-2 pb-6">
        <div className="text-white">
          <LexiAssistMark />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-2">
        <nav className="space-y-4">
          <div className="space-y-3">
            <Link
              href="/dashboard"
              onClick={() => setMobileMenuOpen(false)}
              className={[
                'flex items-center gap-3 rounded-full px-4 py-3 text-sm font-medium transition-all',
                isActive('/dashboard') ? 'bg-white text-[var(--primary-500)]' : 'text-white hover:bg-white/12',
              ].join(' ')}
            >
              <Home className="h-[17px] w-[17px]" />
              <span>Dashboard</span>
            </Link>
            <div className="mx-2 h-px bg-white/20" />
          </div>

          <div className="space-y-2">
            <p className="px-4 text-[11px] font-medium text-white/55">Section Title</p>
            {mainLinks.map((link) => (
              <NavItem key={link.href} link={link} active={isActive(link.href)} />
            ))}
          </div>

          <div className="space-y-2">
            <button
              type="button"
              onClick={() => setStudyBuddyOpen((open) => !open)}
              className="flex w-full items-center gap-3 rounded-full px-4 py-3 text-sm font-medium text-white transition hover:bg-white/12"
            >
              <Sparkles className="h-[17px] w-[17px]" />
              <span className="flex-1 text-left">StudyBuddy</span>
              <ChevronDown className={`h-4 w-4 transition-transform ${studyBuddyOpen ? 'rotate-180' : ''}`} />
            </button>
            {studyBuddyOpen ? (
              <div className="space-y-1 pl-2">
                {studyBuddyLinks.map((link) => (
                  <NavItem
                    key={link.href}
                    link={link}
                    active={isActive(link.href)}
                    nested
                  />
                ))}
              </div>
            ) : null}
          </div>
        </nav>
      </div>

      <div className="mt-auto px-2 pt-6">
        {profileBlock}
      </div>
    </aside>
  );

  const mobileDrawer = (
    <>
      <header className="fixed left-0 right-0 top-0 z-40 border-b border-slate-200 bg-white/95 backdrop-blur lg:hidden">
        <div className="flex h-16 items-center justify-between px-4">
          <button
            type="button"
            onClick={() => setMobileMenuOpen(true)}
            className="flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 text-slate-700"
            aria-label="Open navigation"
          >
            <Menu className="h-5 w-5" />
          </button>
          <div className="text-[var(--primary-500)]">
            <LexiAssistMark />
          </div>
          <div className="flex items-center gap-2">
            <button type="button" className="rounded-full p-2 text-slate-700">
              <Moon className="h-4 w-4" />
            </button>
            <button type="button" className="rounded-full p-2 text-slate-700">
              <Settings className="h-4 w-4" />
            </button>
          </div>
        </div>
      </header>

      <div
        className={`fixed inset-0 z-40 bg-black/35 transition ${mobileMenuOpen ? 'opacity-100' : 'pointer-events-none opacity-0'}`}
        onClick={() => setMobileMenuOpen(false)}
      />

      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-[280px] flex-col bg-white shadow-xl transition-transform lg:hidden ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}`}
      >
        <div className="flex items-center justify-between border-b border-slate-200 px-4 py-4">
          <div className="text-[var(--primary-500)]">
            <LexiAssistMark />
          </div>
          <button
            type="button"
            onClick={() => setMobileMenuOpen(false)}
            className="flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 text-slate-700"
            aria-label="Close navigation"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-4 py-5">
          <nav className="space-y-5">
            <div className="space-y-3">
              <Link
                href="/dashboard"
                onClick={() => setMobileMenuOpen(false)}
                className={[
                  'flex items-center gap-3 rounded-full px-3 py-2.5 text-sm font-medium transition-all',
                  isActive('/dashboard') ? 'bg-[var(--primary-500)] text-white' : 'text-slate-800 hover:bg-slate-100',
                ].join(' ')}
              >
                <Home className="h-[17px] w-[17px]" />
                <span>Dashboard</span>
              </Link>
              <div className="h-px bg-slate-200" />
            </div>

            <div className="space-y-2">
              <p className="px-3 text-[11px] font-medium uppercase tracking-[0.08em] text-slate-400">Section Title</p>
              {mainLinks.map((link) => (
                <NavItem key={link.href} link={link} active={isActive(link.href)} mobile />
              ))}
            </div>

            <div className="space-y-2">
              <button
                type="button"
                onClick={() => setStudyBuddyOpen((open) => !open)}
                className="flex w-full items-center gap-3 rounded-full px-3 py-2.5 text-sm font-medium text-slate-800 transition hover:bg-slate-100"
              >
                <Sparkles className="h-[17px] w-[17px]" />
                <span className="flex-1 text-left">StudyBuddy</span>
                {studyBuddyOpen ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
              </button>
              {studyBuddyOpen ? (
                <div className="space-y-1 pl-2">
                  {studyBuddyLinks.map((link) => (
                    <NavItem
                      key={link.href}
                      link={link}
                      active={isActive(link.href)}
                      nested
                      mobile
                    />
                  ))}
                </div>
              ) : null}
            </div>
          </nav>
        </div>

        <div
          className="mx-4 mb-4 rounded-3xl px-1 py-2 text-white"
          style={{ backgroundColor: primaryGreen }}
        >
          {profileBlock}
        </div>
      </aside>
    </>
  );

  return (
    <>
      {desktopSidebar}
      {mobileDrawer}
    </>
  );
}
