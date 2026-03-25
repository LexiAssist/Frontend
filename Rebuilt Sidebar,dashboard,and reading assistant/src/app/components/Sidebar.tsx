'use client';

import { useState } from 'react';
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
} from 'lucide-react';

interface SidebarProps {
  activeItem: string;
  onNavigate: (item: string) => void;
}

export default function Sidebar({ activeItem, onNavigate }: SidebarProps) {
  const [isStudyBuddyOpen, setIsStudyBuddyOpen] = useState(false);

  return (
    <div className="w-[210px] h-screen bg-[#3D6E4E] text-white flex flex-col flex-shrink-0" style={{ borderRadius: '0 22px 22px 0' }}>
      {/* Logo Section */}
      <div className="px-5 py-6">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 bg-white rounded-xl flex items-center justify-center shadow-sm">
            <BookOpen className="w-5 h-5 text-[#3D6E4E]" />
          </div>
          <span className="text-[17px]" style={{ fontWeight: 600 }}>LexiAssist</span>
        </div>
      </div>

      {/* Main Navigation */}
      <div className="flex-1 px-3 pt-1 space-y-5 overflow-y-auto">
        {/* Dashboard */}
        <div className="space-y-2">
          <MenuItem
            icon={<Home size={18} />}
            label="Dashboard"
            active={activeItem === 'dashboard'}
            onClick={() => onNavigate('dashboard')}
          />
          <div className="h-px bg-white/20 mx-2" />
        </div>

        {/* Tools Section */}
        <div className="space-y-1.5">
          <div className="px-3 text-white/60 text-[11px] tracking-wider" style={{ fontWeight: 500, textTransform: 'uppercase' }}>Tools</div>

          <MenuItem
            icon={<Mic size={18} />}
            label="Text to Speech"
            active={activeItem === 'text-to-speech'}
            onClick={() => onNavigate('text-to-speech')}
          />
          <MenuItem
            icon={<BookOpen size={18} />}
            label="Reading Assistant"
            active={activeItem === 'reading-assistant'}
            onClick={() => onNavigate('reading-assistant')}
          />
          <MenuItem
            icon={<PenSquare size={18} />}
            label="Writing Assistant"
            active={activeItem === 'writing-assistant'}
            onClick={() => onNavigate('writing-assistant')}
          />

          {/* StudyBuddy with Submenu */}
          <div className="space-y-0.5">
            <button
              onClick={() => setIsStudyBuddyOpen(!isStudyBuddyOpen)}
              className="w-full flex items-center gap-2.5 px-3 py-2 rounded-full hover:bg-white/10 transition-colors"
            >
              <Layers size={18} />
              <span className="flex-1 text-left text-sm" style={{ opacity: 0.9 }}>StudyBuddy</span>
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
                  active={activeItem === 'chat-assistant'}
                  onClick={() => onNavigate('chat-assistant')}
                  compact
                />
                <MenuItem
                  icon={<Layers size={16} />}
                  label="Flashcards"
                  active={activeItem === 'flashcards'}
                  onClick={() => onNavigate('flashcards')}
                  compact
                />
                <MenuItem
                  icon={<HelpCircle size={16} />}
                  label="Quizzes"
                  active={activeItem === 'quizzes'}
                  onClick={() => onNavigate('quizzes')}
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
            <div className="w-10 h-10 rounded-full bg-[#ffe7cc] flex items-center justify-center overflow-hidden">
              <span className="text-[#3D6E4E] text-sm" style={{ fontWeight: 600 }}>AE</span>
            </div>
            <div className="absolute bottom-0 right-0 w-3 h-3 bg-[#04802e] rounded-full border-2 border-[#3D6E4E]" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-xs truncate" style={{ fontWeight: 600 }}>Alison Eyo</div>
            <div className="text-[10px] text-white/60 truncate">alis@lexiassist</div>
          </div>
          <button
            className="p-1.5 hover:bg-white/10 rounded-lg transition-colors flex-shrink-0"
            aria-label="Sign out"
          >
            <LogOut size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}

function MenuItem({
  icon,
  label,
  active = false,
  onClick,
  compact = false,
}: {
  icon: React.ReactNode;
  label: string;
  active?: boolean;
  onClick?: () => void;
  compact?: boolean;
}) {
  return (
    <div
      onClick={onClick}
      className={`flex items-center gap-2.5 px-3 rounded-full transition-all duration-150 cursor-pointer ${
        compact ? 'py-1.5' : 'py-2'
      } ${
        active
          ? 'bg-white text-[#3D6E4E] shadow-sm'
          : 'hover:bg-white/10 text-white/80'
      }`}
      style={active ? { fontWeight: 500 } : {}}
    >
      {icon}
      <span className={compact ? 'text-[13px]' : 'text-sm'}>{label}</span>
    </div>
  );
}
