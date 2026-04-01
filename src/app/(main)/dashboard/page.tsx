"use client";

import { useAuthStore } from "@/store/authStore";
import { Clock, FileText } from "lucide-react";
import { motion } from "framer-motion";
import dynamic from "next/dynamic";
import Link from "next/link";
import { FeatureHeader } from "@/components/FeatureHeader";

// Lazy load illustrations for better performance
const ReadingALetterRafiki = dynamic(
  () => import("@/components/illustrations/ReadingALetterRafiki"),
  {
    loading: () => (
      <div className="w-full h-full bg-gray-100 animate-pulse rounded-lg" />
    ),
  },
);
const BookLoverCuate = dynamic(
  () => import("@/components/illustrations/BookLoverCuate"),
  {
    loading: () => (
      <div className="w-full h-full bg-gray-100 animate-pulse rounded-lg" />
    ),
  },
);
const StudyBuddy = dynamic(
  () => import("@/components/illustrations/StudyBuddy"),
  {
    loading: () => (
      <div className="w-full h-full bg-gray-100 animate-pulse rounded-lg" />
    ),
  },
);
const WritingAssistant = dynamic(
  () => import("@/components/illustrations/WritingAssistant"),
  {
    loading: () => (
      <div className="w-full h-full bg-gray-100 animate-pulse rounded-lg" />
    ),
  },
);

// Puzzle piece pattern for card background
function PuzzlePattern({ className = "" }: { className?: string }) {
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

function ToolCard({
  title,
  description,
  bgColor,
  illustration,
  href,
}: ToolCardProps) {
  return (
    <Link href={href} className="block group">
      <motion.div
        whileHover={{ y: -4 }}
        whileTap={{ scale: 0.98 }}
        className="relative overflow-hidden rounded-2xl cursor-pointer transition-shadow duration-200 hover:shadow-xl h-[160px] sm:h-[200px] lg:h-[220px]"
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
      </motion.div>
    </Link>
  );
}

// Quiz icon
function QuizIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <path d="M2 3H14V13H2V3Z" stroke="currentColor" strokeWidth="1.2" />
      <path
        d="M2 6H14"
        stroke="currentColor"
        strokeLinejoin="round"
        strokeWidth="1.2"
      />
      <path
        d="M4.5 7H6.5"
        stroke="currentColor"
        strokeLinecap="round"
        strokeWidth="1.2"
      />
      <path
        d="M4.5 10H6.5"
        stroke="currentColor"
        strokeLinecap="round"
        strokeWidth="1.2"
      />
    </svg>
  );
}

// Flashcard icon
function FlashcardIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 20 20" fill="none">
      <path
        d="M2 4C2 2.89543 2.89543 2 4 2H16C17.1046 2 18 2.89543 18 4V16C18 17.1046 17.1046 18 16 18H4C2.89543 18 2 17.1046 2 16V4Z"
        fill="currentColor"
      />
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

  const tools = [
    {
      title: "Text to speech\nLearning Hub",
      description:
        "Turn text into sound. Sit back, listen & watch the words light up as you learn.",
      bgColor: "rgba(60, 131, 80, 0.25)", // Green tint from sidebar
      illustration: <ReadingALetterRafiki />,
      href: "/text-to-speech",
    },
    {
      title: "Reading Assistant",
      description: "Study with confidence as words are simplified into bits",
      bgColor: "rgba(137, 207, 240, 0.35)", // Light blue
      illustration: <BookLoverCuate />,
      href: "/reading-assistant",
    },
    {
      title: "StudyBuddy",
      description:
        "A smart assistant that helps you understand your notes better. Just upload!",
      bgColor: "rgba(126, 87, 194, 0.25)", // Purple
      illustration: <StudyBuddy />,
      href: "/chat-assistant",
    },
    {
      title: "Speech to Text\n(Writing Assistant)",
      description: "Writing made easier! Just speak and we will do the writing",
      bgColor: "rgba(197, 63, 63, 0.25)", // Red
      illustration: <WritingAssistant />,
      href: "/writing-assistant",
    },
  ];

  return (
    <div className="flex flex-col h-full">
      {/* Header - Matching rebuilt design */}
      <div className="flex items-center justify-between mb-8 sm:mb-10 pt-8">
        <div className="flex flex-col gap-2">
          <h1 className="text-[#272a28] text-2xl sm:text-3xl tracking-tight font-bold">
            Hello, {user?.name?.split(" ")[0] || "Victoria"}!
          </h1>
          <p className="text-[#555c56] text-sm sm:text-base">
            Pick a tool to get started with
          </p>
        </div>
        <FeatureHeader />
      </div>

      {/* Tool Cards - 2x2 Grid */}
      <motion.div
        initial="hidden"
        animate="visible"
        variants={{
          hidden: { opacity: 0 },
          visible: {
            opacity: 1,
            transition: {
              staggerChildren: 0.1,
            },
          },
        }}
        className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5 lg:gap-6"
      >
        {tools.map((tool, index) => (
          <motion.div
            key={index}
            variants={{
              hidden: { opacity: 0, y: 20 },
              visible: {
                opacity: 1,
                y: 0,
                transition: { duration: 0.3, ease: [0.4, 0, 0.2, 1] },
              },
            }}
          >
            <ToolCard
              title={tool.title}
              description={tool.description}
              bgColor={tool.bgColor}
              illustration={tool.illustration}
              href={tool.href}
            />
          </motion.div>
        ))}
      </motion.div>

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
