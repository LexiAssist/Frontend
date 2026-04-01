"use client";

import { useAuthStore } from "@/store/authStore";
import { Clock, FileText, TrendingUp, Target, Award, BookOpen } from "lucide-react";
import { motion } from "framer-motion";
import dynamic from "next/dynamic";
import Link from "next/link";
import { FeatureHeader } from "@/components/FeatureHeader";
import { useStudyStats, useStudyStreak } from "@/hooks/useAnalytics";
import { useFlashcardDecks } from "@/hooks/useFlashcards";
import { useQuizzes } from "@/hooks/useQuizzes";
import { LoadingState } from "@/components/LoadingState";

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

// Stats Card Component
interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: React.ReactNode;
  trend?: 'up' | 'down' | 'neutral';
}

function StatCard({ title, value, subtitle, icon, trend }: StatCardProps) {
  return (
    <motion.div
      whileHover={{ y: -2 }}
      className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm"
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-slate-500">{title}</p>
          <p className="text-2xl font-bold text-slate-900 mt-1">{value}</p>
          {subtitle && (
            <p className="text-xs text-slate-400 mt-1">{subtitle}</p>
          )}
        </div>
        <div className="p-2 bg-[var(--primary-50)] rounded-lg text-[var(--primary-500)]">
          {icon}
        </div>
      </div>
      {trend && (
        <div className={`flex items-center gap-1 mt-3 text-xs ${
          trend === 'up' ? 'text-green-600' : trend === 'down' ? 'text-red-600' : 'text-slate-500'
        }`}>
          <TrendingUp className="w-3 h-3" />
          <span>{trend === 'up' ? 'Improving' : trend === 'down' ? 'Declining' : 'Stable'}</span>
        </div>
      )}
    </motion.div>
  );
}

// Quick Action Button
interface QuickActionProps {
  title: string;
  description: string;
  icon: React.ReactNode;
  href: string;
  color: string;
}

function QuickAction({ title, description, icon, href, color }: QuickActionProps) {
  return (
    <Link href={href}>
      <motion.div
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        className="flex items-center gap-4 p-4 rounded-xl border border-slate-200 hover:border-[var(--primary-500)] hover:shadow-md transition-all bg-white"
      >
        <div 
          className="w-12 h-12 rounded-xl flex items-center justify-center"
          style={{ backgroundColor: color }}
        >
          {icon}
        </div>
        <div className="flex-1">
          <h4 className="font-semibold text-slate-900">{title}</h4>
          <p className="text-sm text-slate-500">{description}</p>
        </div>
      </motion.div>
    </Link>
  );
}

export default function DashboardPage() {
  const { user, isAuthenticated } = useAuthStore();
  
  // Fetch real data from backend
  const { data: studyStats, isLoading: statsLoading } = useStudyStats();
  const { data: studyStreak, isLoading: streakLoading } = useStudyStreak();
  const { data: flashcardDecks, isLoading: decksLoading } = useFlashcardDecks(5, 0);
  const { data: quizzes, isLoading: quizzesLoading } = useQuizzes(5, 0);

  const tools = [
    {
      title: "Text to speech\nLearning Hub",
      description:
        "Turn text into sound. Sit back, listen & watch the words light up as you learn.",
      bgColor: "rgba(60, 131, 80, 0.25)",
      illustration: <ReadingALetterRafiki />,
      href: "/text-to-speech",
    },
    {
      title: "Reading Assistant",
      description: "Study with confidence as words are simplified into bits",
      bgColor: "rgba(137, 207, 240, 0.35)",
      illustration: <BookLoverCuate />,
      href: "/reading-assistant",
    },
    {
      title: "StudyBuddy",
      description:
        "A smart assistant that helps you understand your notes better. Just upload!",
      bgColor: "rgba(126, 87, 194, 0.25)",
      illustration: <StudyBuddy />,
      href: "/chat-assistant",
    },
    {
      title: "Speech to Text\n(Writing Assistant)",
      description: "Writing made easier! Just speak and we will do the writing",
      bgColor: "rgba(197, 63, 63, 0.25)",
      illustration: <WritingAssistant />,
      href: "/writing-assistant",
    },
  ];

  const quickActions = [
    {
      title: "Create Flashcards",
      description: "Generate from your notes",
      icon: <BookOpen className="w-6 h-6 text-white" />,
      href: "/flashcards",
      color: "#3C8350",
    },
    {
      title: "Take a Quiz",
      description: "Test your knowledge",
      icon: <Target className="w-6 h-6 text-white" />,
      href: "/quizzes",
      color: "#df7361",
    },
  ];

  const isLoading = statsLoading || streakLoading || decksLoading || quizzesLoading;

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between mb-8 sm:mb-10 pt-8">
        <div className="flex flex-col gap-2">
          <h1 className="text-[#272a28] text-2xl sm:text-3xl tracking-tight font-bold">
            Hello, {user?.name?.split(" ")[0] || "Student"}!
          </h1>
          <p className="text-[#555c56] text-sm sm:text-base">
            Ready to continue your learning journey?
          </p>
        </div>
        <FeatureHeader />
      </div>

      {/* Stats Overview */}
      {isLoading ? (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-28 bg-slate-100 animate-pulse rounded-xl" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <StatCard
            title="Study Streak"
            value={studyStreak?.current_streak || 0}
            subtitle="days in a row"
            icon={<Award className="w-5 h-5" />}
            trend="up"
          />
          <StatCard
            title="Study Time"
            value={`${Math.round((studyStats?.total_study_minutes || 0) / 60)}h`}
            subtitle="total hours studied"
            icon={<Clock className="w-5 h-5" />}
          />
          <StatCard
            title="Quizzes"
            value={studyStats?.total_quizzes_completed || 0}
            subtitle="completed"
            icon={<Target className="w-5 h-5" />}
          />
          <StatCard
            title="Materials"
            value={studyStats?.total_materials_reviewed || 0}
            subtitle="reviewed"
            icon={<FileText className="w-5 h-5" />}
          />
        </div>
      )}

      {/* Main Content Grid */}
      <div className="grid lg:grid-cols-3 gap-8">
        {/* Left Column - Tools */}
        <div className="lg:col-span-2">
          <h2 className="text-lg font-semibold text-[#272a28] mb-4">Learning Tools</h2>
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
            className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5"
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
        </div>

        {/* Right Column - Quick Actions & Recent Activity */}
        <div className="space-y-6">
          {/* Quick Actions */}
          <div>
            <h2 className="text-lg font-semibold text-[#272a28] mb-4">Quick Actions</h2>
            <div className="space-y-3">
              {quickActions.map((action) => (
                <QuickAction key={action.title} {...action} />
              ))}
            </div>
          </div>

          {/* Recent Flashcards */}
          <div>
            <h2 className="text-lg font-semibold text-[#272a28] mb-4">Recent Flashcards</h2>
            <div className="bg-white rounded-xl border border-slate-200 p-4">
              {decksLoading ? (
                <div className="space-y-3">
                  {[...Array(3)].map((_, i) => (
                    <div key={i} className="h-12 bg-slate-100 animate-pulse rounded-lg" />
                  ))}
                </div>
              ) : flashcardDecks && flashcardDecks.length > 0 ? (
                <div className="space-y-2">
                  {flashcardDecks.slice(0, 3).map((deck: any) => (
                    <Link 
                      key={deck.id} 
                      href={`/flashcards?deck=${deck.id}`}
                      className="flex items-center gap-3 p-3 rounded-lg hover:bg-slate-50 transition-colors"
                    >
                      <div className="w-10 h-10 rounded-lg bg-[var(--primary-100)] flex items-center justify-center">
                        <BookOpen className="w-5 h-5 text-[var(--primary-500)]" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-slate-900 truncate">{deck.title}</p>
                        <p className="text-xs text-slate-500">
                          {deck.cards?.length || 0} cards
                        </p>
                      </div>
                    </Link>
                  ))}
                </div>
              ) : (
                <div className="text-center py-6 text-slate-400">
                  <BookOpen className="w-8 h-8 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">No flashcards yet</p>
                  <Link 
                    href="/flashcards" 
                    className="text-[var(--primary-500)] text-sm hover:underline mt-1 inline-block"
                  >
                    Create your first deck
                  </Link>
                </div>
              )}
            </div>
          </div>

          {/* Recent Quizzes */}
          <div>
            <h2 className="text-lg font-semibold text-[#272a28] mb-4">Recent Quizzes</h2>
            <div className="bg-white rounded-xl border border-slate-200 p-4">
              {quizzesLoading ? (
                <div className="space-y-3">
                  {[...Array(3)].map((_, i) => (
                    <div key={i} className="h-12 bg-slate-100 animate-pulse rounded-lg" />
                  ))}
                </div>
              ) : quizzes && quizzes.length > 0 ? (
                <div className="space-y-2">
                  {quizzes.slice(0, 3).map((quiz: any) => (
                    <Link 
                      key={quiz.id} 
                      href={`/quizzes?quiz=${quiz.id}`}
                      className="flex items-center gap-3 p-3 rounded-lg hover:bg-slate-50 transition-colors"
                    >
                      <div className="w-10 h-10 rounded-lg bg-[#df7361]/10 flex items-center justify-center">
                        <Target className="w-5 h-5 text-[#df7361]" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-slate-900 truncate">{quiz.title}</p>
                        <p className="text-xs text-slate-500">
                          {quiz.questions?.length || 0} questions
                        </p>
                      </div>
                    </Link>
                  ))}
                </div>
              ) : (
                <div className="text-center py-6 text-slate-400">
                  <Target className="w-8 h-8 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">No quizzes yet</p>
                  <Link 
                    href="/quizzes" 
                    className="text-[var(--primary-500)] text-sm hover:underline mt-1 inline-block"
                  >
                    Create your first quiz
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
