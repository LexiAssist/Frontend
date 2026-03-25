import { useState } from 'react';
import { Settings, Moon, Sun, Clock } from 'lucide-react';
import imgFrame20 from "figma:asset/249e9d98a5abcf88fcd712722ce3906ca8dc0464.png";
import imgFrame21 from "figma:asset/a2e869a0185ffbee2044f1f3a5f1bfd26bbeae29.png";
import imgFrame22 from "figma:asset/378528d2f052d6b62408ef943cf2c2ae284f0713.png";
import imgFrame23 from "figma:asset/d980f328c5df0f297c1107ad61da288fddaa2128.png";
import svgPaths from "../../imports/svg-ipuzmyymat";
import ReadingALetterRafiki from "../../imports/ReadingALetterRafiki";
import BookLoverCuate from "../../imports/BookLoverCuate";
import FriendlyHandshakeRafiki from "../../imports/FriendlyHandshakeRafiki";
import SpeechToTextPana from "../../imports/SpeechToTextPana";

// ─── File Icon with gradient ─────────────────────────────────────────────────
function FileIcon({ id = "fileGrad" }: { id?: string }) {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
      <path d={svgPaths.p20ebc00} fill={`url(#${id})`} />
      <defs>
        <linearGradient id={id} x1="12" y1="2.25" x2="12" y2="21.75" gradientUnits="userSpaceOnUse">
          <stop stopColor="#89CFF0" />
          <stop offset="1" stopColor="#3C8350" />
        </linearGradient>
      </defs>
    </svg>
  );
}

// ─── Quiz icon ───────────────────────────────────────────────────────────────
function QuizIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <path d={svgPaths.p3e32f200} stroke="currentColor" strokeWidth="1.2" />
      <path d={svgPaths.p33cd9300} stroke="currentColor" strokeLinejoin="round" strokeWidth="1.2" />
      <path d="M4.5 7H6.5" stroke="currentColor" strokeLinecap="round" strokeWidth="1.2" />
      <path d="M4.5 10H6.5" stroke="currentColor" strokeLinecap="round" strokeWidth="1.2" />
    </svg>
  );
}

// ─── Flashcard icon ──────────────────────────────────────────────────────────
function FlashcardIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 20 20" fill="none">
      <path d={svgPaths.p3576d000} fill="currentColor" />
    </svg>
  );
}

// ─── Tool Card ───────────────────────────────────────────────────────────────
interface ToolCardProps {
  title: string;
  description: string;
  bgColor: string;
  patternImage: string;
  patternSize: string;
  patternOpacity: string;
  illustration: React.ReactNode;
  onClick?: () => void;
}

function ToolCard({ title, description, bgColor, patternImage, patternSize, patternOpacity, illustration, onClick }: ToolCardProps) {
  return (
    <div
      onClick={onClick}
      className="h-[200px] overflow-hidden relative rounded-[8px] cursor-pointer hover:shadow-lg transition-all duration-200"
    >
      <div className="absolute inset-0 pointer-events-none rounded-[8px]">
        <div className="absolute inset-0 rounded-[8px]" style={{ backgroundColor: bgColor }} />
        <div
          className="absolute inset-0 rounded-[8px]"
          style={{
            backgroundImage: `url('${patternImage}')`,
            backgroundSize: patternSize,
            opacity: parseFloat(patternOpacity),
          }}
        />
      </div>
      <div className="absolute inset-0 flex items-center justify-center px-5">
        <div className="flex gap-4 items-center w-full">
          {/* SVG Illustration */}
          <div className="w-[150px] h-[140px] flex-shrink-0 flex items-center justify-center">
            {illustration}
          </div>
          <div className="flex flex-col gap-3 flex-1 min-w-0">
            <h3
              className="text-[#272a28] text-[20px] tracking-[-0.4px]"
              style={{ lineHeight: 1.2, fontWeight: 600 }}
            >
              {title}
            </h3>
            <p
              className="text-[#555c56] text-[13px]"
              style={{ lineHeight: 1.4 }}
            >
              {description}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── History Item ────────────────────────────────────────────────────────────
interface HistoryItemProps {
  fileName: string;
  type: string;
  typeIcon: React.ReactNode;
  time: string;
  fileIconId: string;
}

function HistoryItem({ fileName, type, typeIcon, time, fileIconId }: HistoryItemProps) {
  return (
    <div className="bg-[#eff0ef] h-[48px] rounded-[8px] w-full flex items-center justify-between px-4">
      <div className="flex items-center gap-[30px]">
        <FileIcon id={fileIconId} />
        <span
          className="text-[13px] text-[rgba(0,0,0,0.6)]"
          style={{ fontWeight: 600 }}
        >
          {fileName}
        </span>
      </div>
      <div className="flex items-center gap-[45px]">
        <div className="flex items-center gap-2 text-[rgba(0,0,0,0.6)]">
          {typeIcon}
          <span className="text-[13px]">{type}</span>
        </div>
        <div className="flex items-center gap-2 text-[rgba(0,0,0,0.6)]">
          <Clock size={14} />
          <span className="text-[13px]">{time}</span>
        </div>
      </div>
    </div>
  );
}

// ─── Dashboard ───────────────────────────────────────────────────────────────
interface DashboardProps {
  onNavigate?: (page: string) => void;
}

export default function Dashboard({ onNavigate }: DashboardProps) {
  const [darkMode, setDarkMode] = useState(false);

  return (
    <div className="flex-1 h-screen overflow-hidden bg-white flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between px-[56px] pt-[24px] pb-[20px] flex-shrink-0">
        <div className="flex flex-col gap-1">
          <h1
            className="text-[#272a28] text-[24px] tracking-[-0.48px]"
            style={{ lineHeight: 1.2, fontWeight: 600 }}
          >
            Hello, Victoria!
          </h1>
          <p
            className="text-[#555c56] text-[16px]"
            style={{ lineHeight: 1.45 }}
          >
            Pick a tool to get started with
          </p>
        </div>
        <div className="flex items-center gap-4">
          <button className="p-1 hover:bg-gray-100 rounded-lg transition-colors">
            <Settings size={28} className="text-black" />
          </button>
          <button
            onClick={() => setDarkMode(!darkMode)}
            className="p-1 hover:bg-gray-100 rounded-lg transition-colors"
          >
            {darkMode ? <Sun size={28} className="text-black" /> : <Moon size={28} className="text-black" />}
          </button>
        </div>
      </div>

      {/* Tool Cards - 2x2 Grid */}
      <div className="px-[56px] flex-1 overflow-y-auto">
        <div className="grid grid-cols-2 gap-[32px]">
          {/* Row 1 - Card 1: Text to Speech */}
          <ToolCard
            title="Text to speech Learning Hub"
            description="Turn text into sound. Sit back, listen & watch the words light up as you learn."
            bgColor="rgba(64,123,255,0.33)"
            patternImage={imgFrame20}
            patternSize="56px 98px"
            patternOpacity="0.08"
            illustration={<ReadingALetterRafiki />}
            onClick={() => onNavigate?.('text-to-speech')}
          />
          {/* Row 1 - Card 2: Reading Assistant */}
          <ToolCard
            title="Reading Assistant"
            description="Study with confidence as words are simplified into bits"
            bgColor="rgba(137,207,240,0.33)"
            patternImage={imgFrame21}
            patternSize="384px 384px"
            patternOpacity="0.08"
            illustration={<BookLoverCuate />}
            onClick={() => onNavigate?.('reading-assistant')}
          />

          {/* Row 2 - Card 3: StudyBuddy */}
          <ToolCard
            title="StudyBuddy"
            description="A smart assistant that helps you understand your notes better. Just upload!"
            bgColor="rgba(126,87,194,0.33)"
            patternImage={imgFrame22}
            patternSize="80px 80px"
            patternOpacity="0.27"
            illustration={<FriendlyHandshakeRafiki />}
            onClick={() => onNavigate?.('chat-assistant')}
          />
          {/* Row 2 - Card 4: Writing Assistant */}
          <ToolCard
            title="Speech to Text (Writing Assistant)"
            description="Writing made easier! Just speak and we will do the writing"
            bgColor="rgba(197,63,63,0.33)"
            patternImage={imgFrame23}
            patternSize="1200px 1200px"
            patternOpacity="0.25"
            illustration={<SpeechToTextPana />}
            onClick={() => onNavigate?.('writing-assistant')}
          />
        </div>

        {/* Continue from where you left off */}
        <div className="mt-[40px] pb-6">
          <h2
            className="text-[20px] text-[rgba(0,0,0,0.6)] tracking-[-0.4px] mb-3"
            style={{ lineHeight: 1.2, fontWeight: 500 }}
          >
            Continue from where you left off
          </h2>
          <div className="flex flex-col gap-[14px]">
            <HistoryItem
              fileName="History of Hitler.pdf"
              type="Quiz"
              typeIcon={<QuizIcon />}
              time="Yesterday by 6:00pm"
              fileIconId="fileGrad1"
            />
            <HistoryItem
              fileName="History of Hitler.pdf"
              type="Flashcards"
              typeIcon={<FlashcardIcon />}
              time="Yesterday by 6:00pm"
              fileIconId="fileGrad2"
            />
          </div>
        </div>
      </div>
    </div>
  );
}