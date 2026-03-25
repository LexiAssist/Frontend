'use client';

import { useAuthStore } from '@/store/authStore';
import { Settings, Moon, Sun, Clock, FileText } from 'lucide-react';
import { useState } from 'react';
import Link from 'next/link';
import ReadingALetterRafiki from '@/components/illustrations/ReadingALetterRafiki';
import BookLoverCuate from '@/components/illustrations/BookLoverCuate';

// Puzzle piece pattern for card background
function PuzzlePattern({ className = '' }: { className?: string }) {
  return (
    <svg
      className={`absolute inset-0 w-full h-full opacity-40 ${className}`}
      viewBox="0 0 400 200"
      preserveAspectRatio="xMidYMid slice"
      fill="none"
    >
      {/* Puzzle piece pattern */}
      <g opacity="0.3">
        {/* Row 1 */}
        <path
          d="M20 20 h50 a5 5 0 0 1 5 5 v20 a5 5 0 0 0 10 0 v-20 a5 5 0 0 1 5 -5 h50 a5 5 0 0 1 5 5 v50 a5 5 0 0 1 -5 5 h-20 a5 5 0 0 0 0 10 h20 a5 5 0 0 1 5 5 v50 a5 5 0 0 1 -5 5 h-50 a5 5 0 0 1 -5 -5 v-20 a5 5 0 0 0 -10 0 v20 a5 5 0 0 1 -5 5 h-50 a5 5 0 0 1 -5 -5 v-115 a5 5 0 0 1 5 -5 z"
          fill="white"
        />
        <path
          d="M150 20 h50 a5 5 0 0 1 5 5 v20 a5 5 0 0 0 10 0 v-20 a5 5 0 0 1 5 -5 h50 a5 5 0 0 1 5 5 v50 a5 5 0 0 1 -5 5 h-20 a5 5 0 0 0 0 10 h20 a5 5 0 0 1 5 5 v50 a5 5 0 0 1 -5 5 h-50 a5 5 0 0 1 -5 -5 v-20 a5 5 0 0 0 -10 0 v20 a5 5 0 0 1 -5 5 h-50 a5 5 0 0 1 -5 -5 v-115 a5 5 0 0 1 5 -5 z"
          fill="white"
        />
        <path
          d="M280 20 h50 a5 5 0 0 1 5 5 v20 a5 5 0 0 0 10 0 v-20 a5 5 0 0 1 5 -5 h50 a5 5 0 0 1 5 5 v115 a5 5 0 0 1 -5 5 h-50 a5 5 0 0 1 -5 -5 v-20 a5 5 0 0 0 -10 0 v20 a5 5 0 0 1 -5 5 h-50 a5 5 0 0 1 -5 -5 v-50 a5 5 0 0 1 5 -5 h20 a5 5 0 0 0 0 -10 h-20 a5 5 0 0 1 -5 -5 v-50 a5 5 0 0 1 5 -5 z"
          fill="white"
        />
      </g>
    </svg>
  );
}

// Tool Card Component - Rebuilt Design Style
interface ToolCardProps {
  title: string;
  description: string;
  bgColor: string;
  illustration: React.ReactNode;
  href: string;
}

function ToolCard({ title, description, bgColor, illustration, href }: ToolCardProps) {
  return (
    <Link href={href} className="block">
      <div
        className="relative overflow-hidden rounded-2xl cursor-pointer transition-all duration-200 hover:-translate-y-1 hover:shadow-xl h-[180px] sm:h-[200px] lg:h-[220px]"
        style={{ backgroundColor: bgColor }}
      >
        {/* Puzzle pattern background */}
        <PuzzlePattern />
        
        <div className="relative z-10 h-full flex items-center justify-between px-6 sm:px-8 py-6">
          {/* Text Content - Left aligned */}
          <div className="flex flex-col gap-3 max-w-[55%]">
            <h3 className="text-[#272a28] text-lg sm:text-xl lg:text-2xl tracking-tight leading-snug font-bold whitespace-pre-line">
              {title}
            </h3>
            <p className="text-[#555c56] text-xs sm:text-sm leading-relaxed">
              {description}
            </p>
          </div>
          
          {/* Illustration - Right side */}
          <div className="w-[130px] h-[130px] sm:w-[150px] sm:h-[150px] lg:w-[170px] lg:h-[160px] flex-shrink-0 flex items-center justify-center">
            {illustration}
          </div>
        </div>
      </div>
    </Link>
  );
}

// Quiz icon
function QuizIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <path d="M2 3H14V13H2V3Z" stroke="currentColor" strokeWidth="1.2" />
      <path d="M2 6H14" stroke="currentColor" strokeLinejoin="round" strokeWidth="1.2" />
      <path d="M4.5 7H6.5" stroke="currentColor" strokeLinecap="round" strokeWidth="1.2" />
      <path d="M4.5 10H6.5" stroke="currentColor" strokeLinecap="round" strokeWidth="1.2" />
    </svg>
  );
}

// Flashcard icon
function FlashcardIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 20 20" fill="none">
      <path d="M2 4C2 2.89543 2.89543 2 4 2H16C17.1046 2 18 2.89543 18 4V16C18 17.1046 17.1046 18 16 18H4C2.89543 18 2 17.1046 2 16V4Z" fill="currentColor" />
    </svg>
  );
}

// History Item Component
interface HistoryItemProps {
  fileName: string;
  type: string;
  typeIcon: React.ReactNode;
  time: string;
}

function HistoryItem({ fileName, type, typeIcon, time }: HistoryItemProps) {
  return (
    <div className="bg-[#eff0ef] h-[48px] sm:h-[52px] rounded-xl w-full flex items-center justify-between px-4 sm:px-6">
      <div className="flex items-center gap-3 sm:gap-6">
        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#89CFF0] to-[#3C8350] flex items-center justify-center">
          <FileText size={16} className="text-white" />
        </div>
        <span className="text-sm text-[rgba(0,0,0,0.7)] font-medium truncate max-w-[140px] sm:max-w-[200px]">
          {fileName}
        </span>
      </div>
      <div className="flex items-center gap-4 sm:gap-12">
        <div className="hidden sm:flex items-center gap-2 text-[rgba(0,0,0,0.6)]">
          {typeIcon}
          <span className="text-sm">{type}</span>
        </div>
        <div className="flex items-center gap-2 text-[rgba(0,0,0,0.6)]">
          <Clock size={14} />
          <span className="text-sm">{time}</span>
        </div>
      </div>
    </div>
  );
}

export default function DashboardPage() {
  const { user } = useAuthStore();
  const [darkMode, setDarkMode] = useState(false);

  const tools = [
    {
      title: 'Text to speech\nLearning Hub',
      description: 'Turn text into sound. Sit back, listen & watch the words light up as you learn.',
      bgColor: 'rgba(60, 131, 80, 0.25)', // Green tint from sidebar
      illustration: <ReadingALetterRafiki />,
      href: '/text-to-speech',
    },
    {
      title: 'Reading Assistant',
      description: 'Study with confidence as words are simplified into bits',
      bgColor: 'rgba(137, 207, 240, 0.35)', // Light blue
      illustration: <BookLoverCuate />,
      href: '/reading-assistant',
    },
    {
      title: 'StudyBuddy',
      description: 'A smart assistant that helps you understand your notes better. Just upload!',
      bgColor: 'rgba(126, 87, 194, 0.25)', // Purple
      illustration: (
        <div className="w-full h-full flex items-center justify-center">
          <svg viewBox="0 0 100 100" className="w-full h-full">
            <circle cx="35" cy="32" r="12" fill="#7c5cbf" />
            <ellipse cx="35" cy="75" rx="20" ry="10" fill="#7c5cbf" />
            <circle cx="75" cy="38" r="11" fill="#9b7ed4" />
            <ellipse cx="75" cy="78" rx="20" ry="10" fill="#9b7ed4" />
            <ellipse cx="82" cy="20" rx="14" ry="9" fill="white" opacity="0.85" />
          </svg>
        </div>
      ),
      href: '/chat-assistant',
    },
    {
      title: 'Speech to Text\n(Writing Assistant)',
      description: 'Writing made easier! Just speak and we will do the writing',
      bgColor: 'rgba(197, 63, 63, 0.25)', // Red
      illustration: (
        <div className="w-full h-full flex items-center justify-center">
          <svg viewBox="0 0 100 100" className="w-full h-full">
            <rect x="30" y="10" width="45" height="75" rx="8" fill="#c0392b" />
            <rect x="34" y="16" width="37" height="55" rx="5" fill="#1a1a2e" />
            <circle cx="52" cy="82" r="5" fill="#e8b4b0" />
            <circle cx="52" cy="55" r="10" fill="#e74c3c" />
          </svg>
        </div>
      ),
      href: '/writing-assistant',
    },
  ];

  return (
    <div className="flex flex-col h-full">
      {/* Header - Matching rebuilt design */}
      <div className="flex items-center justify-between mb-8 sm:mb-10">
        <div>
          <h1 className="text-[#272a28] text-2xl sm:text-3xl tracking-tight font-bold">
            Hello, {user?.name?.split(' ')[0] || 'Victoria'}!
          </h1>
          <p className="text-[#555c56] text-sm sm:text-base mt-1">
            Pick a tool to get started with
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button className="p-2.5 hover:bg-gray-100 rounded-xl transition-colors">
            <Settings size={24} className="text-[#272a28]" />
          </button>
          <button
            onClick={() => setDarkMode(!darkMode)}
            className="p-2.5 hover:bg-gray-100 rounded-xl transition-colors"
          >
            {darkMode ? <Sun size={24} className="text-[#272a28]" /> : <Moon size={24} className="text-[#272a28]" />}
          </button>
        </div>
      </div>

      {/* Tool Cards - 2x2 Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 sm:gap-6">
        {tools.map((tool, index) => (
          <ToolCard
            key={index}
            title={tool.title}
            description={tool.description}
            bgColor={tool.bgColor}
            illustration={tool.illustration}
            href={tool.href}
          />
        ))}
      </div>

      {/* Continue from where you left off */}
      <div className="mt-10 sm:mt-12 pb-6">
        <h2 className="text-lg sm:text-xl text-[rgba(0,0,0,0.6)] tracking-tight mb-4 font-medium">
          Continue from where you left off
        </h2>
        <div className="flex flex-col gap-3">
          <HistoryItem
            fileName="History of Hitler.pdf"
            type="Quiz"
            typeIcon={<QuizIcon />}
            time="Yesterday by 6:00pm"
          />
          <HistoryItem
            fileName="History of Hitler.pdf"
            type="Flashcards"
            typeIcon={<FlashcardIcon />}
            time="Saturday by 5:00pm"
          />
        </div>
      </div>
    </div>
  );
}
