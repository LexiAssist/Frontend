'use client';

import { Card } from '@/components/ui/Card';
import Link from 'next/link';
import { useAuthStore } from '@/store/authStore';
import { Icon } from "@/components/Icon";

// Tool card data
const tools = [
  {
    id: 'text-to-speech',
    title: 'Text to speech\nLearning Hub',
    description: 'Turn text into sound. Sit back, listen & watch the words light up as you learn.',
    href: '/text-to-speech',
    bgColor: 'bg-[#cfddf8]',
    patternClass: 'tool-pattern-blue',
    illustration: 'text-to-speech',
  },
  {
    id: 'reading-assistant',
    title: 'Reading Assistant',
    description: 'Study with confidence as words are simplified into bits',
    href: '/reading-assistant',
    bgColor: 'bg-[#c5dff5]',
    patternClass: 'tool-pattern-sky',
    illustration: 'reading',
  },
  {
    id: 'studybuddy',
    title: 'StudyBuddy',
    description: 'A smart assistant that helps you understand your notes better. Just upload!',
    href: '/chat-assistant',
    bgColor: 'bg-[#dbd2f5]',
    patternClass: 'tool-pattern-purple',
    illustration: 'studybuddy',
  },
  {
    id: 'writing-assistant',
    title: 'Speech to Text\n(Writing Assistant)',
    description: 'Writing made easier! Just speak and we will do the writing',
    href: '/writing-assistant',
    bgColor: 'bg-[#f5d6d0]',
    patternClass: 'tool-pattern-rose',
    illustration: 'writing',
  },
];

// Recent items data
const recentItems = [
  {
    id: '1',
    filename: 'History of Hitler.pdf',
    type: 'Quiz',
    date: 'Yesterday by 6:00pm',
    typeIcon: 'quiz',
  },
  {
    id: '2',
    filename: 'History of Hitler.pdf',
    type: 'Flashcards',
    date: 'Saturday by 5:00pm',
    typeIcon: 'flashcards',
  },
];

export default function DashboardPage() {
  const { user } = useAuthStore();

  return (
    <div className="space-y-6">
      {/* Header / Topbar */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-[#2b5d39]" style={{ fontFamily: 'Poppins, sans-serif' }}>
            Hello, {user?.name?.split(' ')[0] || 'Victoria'}!
          </h1>
          <p className="mt-1 text-sm text-[#555f6e]">
            Pick a tool to get started with
          </p>
        </div>
        <div className="flex items-center gap-4 sm:gap-5">
          <button className="p-1 text-[#6b7280] hover:text-[#3c8350] transition-colors">
            <Icon name="settings" size={22} strokeWidth={1.7} />
          </button>
          <button className="p-1 text-[#6b7280] hover:text-[#3c8350] transition-colors">
            <Icon name="moon" size={22} strokeWidth={1.7} />
          </button>
          <div className="flex items-center gap-1.5 cursor-pointer">
            <div className="w-10 h-10 rounded-full bg-[#b2c9b0] flex items-center justify-center overflow-hidden">
              <svg viewBox="0 0 38 38" className="w-full h-full">
                <circle cx="19" cy="19" r="19" fill="#a8c5a0" />
                <circle cx="19" cy="15" r="7" fill="#6b9c62" />
                <ellipse cx="19" cy="32" rx="11" ry="8" fill="#6b9c62" />
              </svg>
            </div>
            <Icon name="chevron-down" size={14} className="text-[#6b7280]" />
          </div>
        </div>
      </div>

      {/* Tool Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5">
        {tools.map((tool) => (
          <Link key={tool.id} href={tool.href}>
            <Card
              className={`relative overflow-hidden cursor-pointer border-0 transition-all duration-200 hover:-translate-y-1 hover:shadow-lg ${tool.bgColor}`}
            >
              <div className={`absolute inset-0 ${tool.patternClass} pointer-events-none`} />
              <div className="relative z-10 flex items-end justify-between p-6 sm:p-7 min-h-[170px]">
                <div className="flex-1">
                  <h2 
                    className="text-base sm:text-lg font-bold text-[#1a2a2a] leading-tight whitespace-pre-line"
                    style={{ fontFamily: 'Poppins, sans-serif' }}
                  >
                    {tool.title}
                  </h2>
                  <p className="mt-2 text-xs sm:text-sm text-[#555f6e] leading-relaxed max-w-[220px]">
                    {tool.description}
                  </p>
                </div>
                <div className="flex-shrink-0 w-24 h-24 sm:w-28 sm:h-28 flex items-end justify-center ml-3">
                  <ToolIllustration type={tool.illustration} />
                </div>
              </div>
            </Card>
          </Link>
        ))}
      </div>

      {/* Recent Section */}
      <div>
        <h3 className="text-sm font-semibold text-[#555f6e] mb-3 sm:mb-4">
          Continue from where you left off
        </h3>
        <div className="space-y-2.5 sm:space-y-3">
          {recentItems.map((item) => (
            <div
              key={item.id}
              className="bg-white rounded-xl p-4 flex items-center gap-4 cursor-pointer transition-shadow hover:shadow-md"
            >
              <div className="w-9 h-11 rounded-md bg-gradient-to-br from-[#5bbfd6] to-[#3a9ab5] flex items-center justify-center flex-shrink-0">
                <svg width="18" height="22" viewBox="0 0 20 24" fill="none" className="opacity-90">
                  <path d="M3 2 H13 L18 7 V22 H3 Z" fill="white" rx="2" />
                  <path d="M13 2 L13 7 L18 7" stroke="white" strokeWidth="1" opacity="0.6" fill="none" />
                </svg>
              </div>
              <span className="flex-1 text-sm font-semibold text-[#1a2a2a] truncate">
                {item.filename}
              </span>
              <div className="flex flex-col items-end gap-1">
                <div className="flex items-center gap-1.5 text-xs text-[#555f6e]">
                  {item.typeIcon === 'quiz' ? (
                    <Icon name="calendar" size={14} className="text-[#8a95a3]" />
                  ) : (
                    <Icon name="file-text" size={14} className="text-[#8a95a3]" />
                  )}
                  <span>{item.type}</span>
                </div>
                <div className="flex items-center gap-1.5 text-xs text-[#555f6e]">
                  <Icon name="clock" size={14} className="text-[#8a95a3]" />
                  <span>{item.date}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <style jsx>{`
        .tool-pattern-blue {
          background-image: url("data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cpath d='M0 0h40v40H0z'/%3E%3Cpath d='M20 5 L35 14 L35 26 L20 35 L5 26 L5 14 Z' stroke='%236b9de8' stroke-width='0.8' opacity='0.25'/%3E%3C/g%3E%3C/svg%3E");
          opacity: 0.4;
        }
        .tool-pattern-sky {
          background-image: url("data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Crect x='4' y='4' width='6' height='6' rx='1' stroke='%235b9dd4' stroke-width='0.7' fill='none' opacity='0.25'/%3E%3Crect x='18' y='4' width='6' height='6' rx='1' stroke='%235b9dd4' stroke-width='0.7' fill='none' opacity='0.25'/%3E%3Crect x='32' y='4' width='6' height='6' rx='1' stroke='%235b9dd4' stroke-width='0.7' fill='none' opacity='0.25'/%3E%3Crect x='4' y='18' width='6' height='6' rx='1' stroke='%235b9dd4' stroke-width='0.7' fill='none' opacity='0.25'/%3E%3Crect x='18' y='18' width='6' height='6' rx='1' stroke='%235b9dd4' stroke-width='0.7' fill='none' opacity='0.25'/%3E%3Crect x='32' y='18' width='6' height='6' rx='1' stroke='%235b9dd4' stroke-width='0.7' fill='none' opacity='0.25'/%3E%3Crect x='4' y='32' width='6' height='6' rx='1' stroke='%235b9dd4' stroke-width='0.7' fill='none' opacity='0.25'/%3E%3Crect x='18' y='32' width='6' height='6' rx='1' stroke='%235b9dd4' stroke-width='0.7' fill='none' opacity='0.25'/%3E%3Crect x='32' y='32' width='6' height='6' rx='1' stroke='%235b9dd4' stroke-width='0.7' fill='none' opacity='0.25'/%3E%3C/svg%3E");
        }
        .tool-pattern-purple {
          background-image: url("data:image/svg+xml,%3Csvg width='28' height='28' viewBox='0 0 28 28' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M6 6 L8 6 M12 6 L14 6 M18 6 L20 6 M24 6 L26 6 M6 12 L8 12 M12 12 L14 12 M18 12 L20 12 M24 12 L26 12 M6 18 L8 18 M12 18 L14 18 M18 18 L20 18 M24 18 L26 18 M6 24 L8 24 M12 24 L14 24 M18 24 L20 24 M24 24 L26 24' stroke='%238b6bc2' stroke-width='1.5' stroke-linecap='round' opacity='0.3'/%3E%3C/svg%3E");
        }
        .tool-pattern-rose {
          background-image: url("data:image/svg+xml,%3Csvg width='60' height='30' viewBox='0 0 60 30' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M0 15 Q15 0 30 15 Q45 30 60 15' stroke='%23c9786a' stroke-width='0.8' fill='none' opacity='0.2'/%3E%3C/svg%3E");
        }
      `}</style>
    </div>
  );
}

function ToolIllustration({ type }: { type: string }) {
  switch (type) {
    case 'text-to-speech':
      return (
        <svg viewBox="0 0 110 110" fill="none" className="w-full h-full">
          <rect x="15" y="38" width="55" height="42" rx="5" fill="#8fb8f0" stroke="#5a8fd4" strokeWidth="1.5" />
          <path d="M15 43 L42 63 L70 43" stroke="#5a8fd4" strokeWidth="1.5" strokeLinejoin="round" fill="none" />
          <rect x="30" y="18" width="38" height="48" rx="4" fill="white" stroke="#c0d4ef" strokeWidth="1" />
          <path d="M37 30 H60 M37 36 H60 M37 42 H55" stroke="#a0b8d8" strokeWidth="1.5" strokeLinecap="round" />
          <circle cx="80" cy="40" r="10" fill="#4a8ccc" />
          <path d="M65 78 C65 68 95 68 95 78" fill="#4a8ccc" />
          <path d="M78 50 L78 62" stroke="#4a8ccc" strokeWidth="6" strokeLinecap="round" />
          <rect x="68" y="20" width="4" height="24" rx="2" fill="#5a8fd4" />
          <path d="M72 20 L82 26 L72 32 Z" fill="#f5c842" />
        </svg>
      );
    case 'reading':
      return (
        <svg viewBox="0 0 110 110" fill="none" className="w-full h-full">
          <rect x="8" y="8" width="42" height="42" rx="4" fill="#9ac7e8" opacity="0.6" />
          <rect x="60" y="8" width="42" height="42" rx="4" fill="#9ac7e8" opacity="0.4" />
          <rect x="8" y="60" width="42" height="42" rx="4" fill="#9ac7e8" opacity="0.4" />
          <rect x="60" y="60" width="42" height="42" rx="4" fill="#9ac7e8" opacity="0.6" />
          <path d="M50 22 Q55 18 60 22 Q55 26 50 22" fill="#7ab8e0" />
          <path d="M22 50 Q18 55 22 60 Q26 55 22 50" fill="#7ab8e0" />
          <path d="M88 50 Q84 55 88 60 Q92 55 88 50" fill="#7ab8e0" />
          <path d="M50 88 Q55 84 60 88 Q55 92 50 88" fill="#7ab8e0" />
          <circle cx="55" cy="52" r="9" fill="#3d7aa8" />
          <path d="M42 82 C42 70 68 70 68 82" fill="#3d7aa8" />
          <rect x="44" y="56" width="22" height="14" rx="3" fill="#fff" opacity="0.7" />
          <path d="M47 61 H63 M47 65 H58" stroke="#3d7aa8" strokeWidth="1.2" strokeLinecap="round" />
        </svg>
      );
    case 'studybuddy':
      return (
        <svg viewBox="0 0 110 110" fill="none" className="w-full h-full">
          <circle cx="35" cy="32" r="12" fill="#7c5cbf" />
          <path d="M15 80 C15 62 55 62 55 80" fill="#7c5cbf" />
          <rect x="20" y="44" width="30" height="20" rx="4" fill="#fff" opacity="0.5" />
          <circle cx="75" cy="38" r="11" fill="#9b7ed4" />
          <path d="M55 82 C55 66 95 66 95 82" fill="#9b7ed4" />
          <ellipse cx="82" cy="20" rx="14" ry="9" fill="white" opacity="0.85" />
          <path d="M72 28 L68 35 L80 28" fill="white" opacity="0.85" />
          <circle cx="76" cy="20" r="2" fill="#9b7ed4" />
          <circle cx="82" cy="20" r="2" fill="#9b7ed4" />
          <circle cx="88" cy="20" r="2" fill="#9b7ed4" />
          <rect x="44" y="88" width="6" height="12" rx="2" fill="#5a8c5a" />
          <ellipse cx="47" cy="82" rx="8" ry="10" fill="#6aad6a" opacity="0.8" />
          <ellipse cx="38" cy="88" rx="6" ry="7" fill="#5a9c5a" opacity="0.7" />
          <ellipse cx="56" cy="88" rx="5" ry="6" fill="#5a9c5a" opacity="0.7" />
        </svg>
      );
    case 'writing':
      return (
        <svg viewBox="0 0 110 110" fill="none" className="w-full h-full">
          <rect x="30" y="8" width="50" height="88" rx="10" fill="#c0392b" />
          <rect x="34" y="14" width="42" height="64" rx="6" fill="#1a1a2e" />
          <circle cx="55" cy="88" r="5" fill="#e8b4b0" />
          <rect x="38" y="20" width="34" height="52" rx="4" fill="#1e2a3a" />
          <rect x="41" y="24" width="28" height="6" rx="2" fill="#2a3a4a" />
          <rect x="41" y="33" width="20" height="4" rx="1.5" fill="#3a4a5a" />
          <rect x="41" y="40" width="24" height="4" rx="1.5" fill="#3a4a5a" />
          <circle cx="55" cy="58" r="10" fill="#e74c3c" />
          <circle cx="55" cy="58" r="6" fill="white" opacity="0.3" />
          <circle cx="90" cy="42" r="9" fill="#c0392b" opacity="0.8" />
          <path d="M78 75 C78 65 102 65 102 75" fill="#c0392b" opacity="0.8" />
          <path d="M18 45 Q12 55 18 65" stroke="#c0392b" strokeWidth="2" strokeLinecap="round" opacity="0.6" />
          <path d="M22 40 Q13 55 22 70" stroke="#c0392b" strokeWidth="1.5" strokeLinecap="round" opacity="0.4" />
          <rect x="96" y="75" width="6" height="22" rx="3" fill="#5a8c5a" />
          <path d="M96 82 L90 82 L90 87" stroke="#5a8c5a" strokeWidth="4" strokeLinecap="round" fill="none" />
          <path d="M102 85 L108 85 L108 90" stroke="#5a8c5a" strokeWidth="4" strokeLinecap="round" fill="none" />
        </svg>
      );
    default:
      return null;
  }
}
