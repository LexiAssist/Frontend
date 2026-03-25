'use client';

import { useState } from 'react';
import {
  Upload,
  X,
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Settings,
  Moon,
  Bookmark,
  HelpCircle,
  Download,
  Circle,
  ChevronLeft,
  ChevronRight,
  Search,
} from 'lucide-react';
import ReadingALetterRafiki from "../../imports/ReadingALetterRafiki";

type Stage = 'welcome' | 'uploaded' | 'reading';

interface UploadedFile {
  name: string;
  type: string;
}

export default function TextToSpeech() {
  const [stage, setStage] = useState<Stage>('welcome');
  const [uploadedFile, setUploadedFile] = useState<UploadedFile | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [speed, setSpeed] = useState(1.0);
  const [bgColor, setBgColor] = useState('#ffffff');
  const [highlightColor, setHighlightColor] = useState('#a8d5ff');
  const [dimSurrounding, setDimSurrounding] = useState(false);
  const [readingMode, setReadingMode] = useState<'word' | 'line'>('word');
  const [isToolsOpen, setIsToolsOpen] = useState(true);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setUploadedFile({
        name: file.name,
        type: file.type.includes('pdf') ? 'PDF' : file.type.includes('doc') ? 'DOC' : 'TXT',
      });
      setStage('uploaded');
    }
  };

  const handleSubmit = () => {
    setStage('reading');
  };

  const handleRemoveFile = () => {
    setUploadedFile(null);
    setStage('welcome');
  };

  const speedOptions = [0.75, 1.0, 1.25, 1.5, 3.0];
  const bgColors = [
    '#fffacd', '#ffd4d4', '#d4f4dd', '#e8e8e8',
    '#ffeaa7', '#dfe6e9', '#74b9ff', '#a29bfe',
    '#fd79a8', '#fdcb6e', '#00b894', '#fab1a0',
    '#e17055', '#b2bec3', '#636e72', '#55efc4', '#ffffff',
  ];

  /* ───── Header bar (shared across stages) ───── */
  const HeaderBar = ({ title }: { title: string }) => (
    <div className="flex items-center justify-between mb-8">
      <div>
        <h1 className="text-[#1A1A1A] mb-1" style={{ fontSize: '26px', fontWeight: 700 }}>{title}</h1>
        {stage === 'welcome' && (
          <p className="text-[#5F5F5F]" style={{ fontSize: '15px' }}>Pick a tool to get started with</p>
        )}
      </div>
      <div className="flex items-center gap-3">
        <button className="w-10 h-10 flex items-center justify-center bg-[#F8F9FA] hover:bg-[#E9EBEF] rounded-full transition-colors">
          <Search size={18} className="text-[#3D6E4E]" />
        </button>
        <button className="w-10 h-10 flex items-center justify-center bg-[#F8F9FA] hover:bg-[#E9EBEF] rounded-full transition-colors">
          <Settings size={18} className="text-[#5F5F5F]" />
        </button>
        <button className="w-10 h-10 flex items-center justify-center bg-[#F8F9FA] hover:bg-[#E9EBEF] rounded-full transition-colors">
          <Moon size={18} className="text-[#5F5F5F]" />
        </button>
      </div>
    </div>
  );

  /* ───── Hexagon pattern SVG (decorative) ───── */
  const HexPattern = () => (
    <svg className="absolute right-0 top-0 h-full opacity-[0.08]" viewBox="0 0 200 200" fill="none">
      {[0, 1, 2, 3, 4, 5].map((row) =>
        [0, 1, 2].map((col) => (
          <polygon
            key={`${row}-${col}`}
            points="30,0 60,17 60,52 30,69 0,52 0,17"
            transform={`translate(${col * 65 + (row % 2 === 0 ? 0 : 32)}, ${row * 55})`}
            stroke="#4A7C59"
            strokeWidth="1.5"
            fill="none"
          />
        ))
      )}
    </svg>
  );

  /* ═══════════════════════════════════════════════════
     STAGE 1 – Welcome / Upload
     ═══════════════════════════════════════════════════ */
  if (stage === 'welcome') {
    return (
      <div className="flex-1 flex flex-col h-screen overflow-hidden bg-[#FEFEFE]">
        <div className="flex-1 overflow-y-auto" style={{ padding: '32px 40px' }}>
          <div className="max-w-5xl mx-auto">
            <HeaderBar title="Hello, Victoria!" />

            {/* Hero Card */}
            <div
              className="relative overflow-hidden bg-[#E3EEFF] mb-10"
              style={{ borderRadius: '16px', padding: '32px', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}
            >
              <HexPattern />
              <div className="flex items-center gap-8 relative z-10">
                <div className="w-40 h-40 flex-shrink-0 overflow-hidden">
                  <ReadingALetterRafiki />
                </div>
                <div className="flex-1">
                  <h2 className="text-[#1A1A1A] mb-2" style={{ fontSize: '22px', fontWeight: 700 }}>
                    Text to Speech Learning Hub
                  </h2>
                  <p className="text-[#5F5F5F]" style={{ fontSize: '15px', lineHeight: 1.6 }}>
                    Turn text into sound. Sit back, listen &amp; watch the words light up as you learn.
                  </p>
                </div>
              </div>
            </div>

            {/* Upload Area (still visible) */}
            <div
              className="border-2 border-dashed hover:bg-[#EAF3EC] transition-colors cursor-pointer"
              style={{
                borderColor: '#7BAF8A',
                borderRadius: '16px',
                padding: '56px 24px',
                backgroundColor: '#E1F0E3',
              }}
            >
              <label className="flex flex-col items-center justify-center cursor-pointer">
                <div
                  className="w-16 h-16 bg-[#4A7C59] rounded-full flex items-center justify-center mb-4"
                  style={{ boxShadow: '0 2px 8px rgba(74,124,89,0.25)' }}
                >
                  <Upload size={28} className="text-white" />
                </div>
                <p className="text-[#3D6E4E] mb-1" style={{ fontSize: '17px', fontWeight: 600 }}>
                  Click to upload or drag and drop
                </p>
                <p className="text-[#5F5F5F]" style={{ fontSize: '14px' }}>
                  PDF, DOC, TXT, image (Size maximum)
                </p>
                <input
                  type="file"
                  className="hidden"
                  accept=".pdf,.doc,.docx,.txt,image/*"
                  onChange={handleFileUpload}
                />
              </label>
            </div>
          </div>
        </div>
      </div>
    );
  }

  /* ═══════════════════════════════════════════════════
     STAGE 2 – Document Uploaded
     ═══════════════════════════════════════════════════ */
  if (stage === 'uploaded') {
    return (
      <div className="flex-1 flex flex-col h-screen overflow-hidden bg-[#FEFEFE]">
        <div className="flex-1 overflow-y-auto" style={{ padding: '32px 40px' }}>
          <div className="max-w-5xl mx-auto">
            <HeaderBar title="Text to Speech Learning Hub" />

            {/* Hero Card */}
            <div
              className="relative overflow-hidden bg-[#E3EEFF] mb-10"
              style={{ borderRadius: '16px', padding: '32px', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}
            >
              <HexPattern />
              <div className="flex items-center gap-8 relative z-10">
                <div className="w-40 h-40 bg-[#C5D8F8] rounded-2xl flex items-center justify-center flex-shrink-0 overflow-hidden">
                  <svg width="80" height="80" viewBox="0 0 80 80" fill="none">
                    <rect x="15" y="10" width="50" height="60" rx="6" fill="#4A7C59" opacity="0.15" />
                    <rect x="22" y="20" width="36" height="4" rx="2" fill="#3D6E4E" opacity="0.5" />
                    <rect x="22" y="28" width="28" height="4" rx="2" fill="#3D6E4E" opacity="0.35" />
                    <rect x="22" y="36" width="32" height="4" rx="2" fill="#3D6E4E" opacity="0.35" />
                    <circle cx="56" cy="56" r="14" fill="#4A7C59" opacity="0.2" />
                    <path d="M52 56 L56 52 L60 56" stroke="#3D6E4E" strokeWidth="2" strokeLinecap="round" />
                    <path d="M56 52 L56 62" stroke="#3D6E4E" strokeWidth="2" strokeLinecap="round" />
                  </svg>
                </div>
                <div className="flex-1">
                  <h2 className="text-[#1A1A1A] mb-2" style={{ fontSize: '22px', fontWeight: 700 }}>
                    Text to Speech Learning Hub
                  </h2>
                  <p className="text-[#5F5F5F]" style={{ fontSize: '15px', lineHeight: 1.6 }}>
                    Turn text into sound. Sit back, listen &amp; watch the words light up as you learn.
                  </p>
                </div>
              </div>
            </div>

            {/* Upload Area (still visible) */}
            <div
              className="border-2 border-dashed mb-10"
              style={{
                borderColor: '#7BAF8A',
                borderRadius: '16px',
                padding: '48px 24px',
                backgroundColor: '#E1F0E3',
              }}
            >
              <div className="flex flex-col items-center justify-center">
                <div className="w-16 h-16 bg-[#4A7C59] rounded-full flex items-center justify-center mb-4">
                  <Upload size={28} className="text-white" />
                </div>
                <p className="text-[#3D6E4E] mb-1" style={{ fontSize: '17px', fontWeight: 600 }}>
                  Click to upload or drag and drop
                </p>
                <p className="text-[#5F5F5F]" style={{ fontSize: '14px' }}>
                  PDF, DOC, TXT, image (Size maximum)
                </p>
              </div>
            </div>

            {/* Document Uploaded Card */}
            <div className="mb-10">
              <h3 className="text-[#1A1A1A] mb-4" style={{ fontSize: '18px', fontWeight: 600 }}>Document uploaded</h3>
              <div
                className="bg-[#F8F9FA] flex items-center justify-between max-w-sm"
                style={{ borderRadius: '16px', padding: '16px 20px', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}
              >
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-[#4A7C59] flex items-center justify-center" style={{ borderRadius: '12px' }}>
                    <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-[#1A1A1A]" style={{ fontSize: '15px', fontWeight: 500 }}>{uploadedFile?.name}</p>
                    <p className="text-[#5F5F5F]" style={{ fontSize: '13px' }}>{uploadedFile?.type}</p>
                  </div>
                </div>
                <button
                  onClick={handleRemoveFile}
                  className="p-2 hover:bg-[#E9EBEF] transition-colors"
                  style={{ borderRadius: '8px' }}
                >
                  <X size={20} className="text-[#5F5F5F]" />
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <button
              onClick={handleSubmit}
              className="bg-[#3D6E4E] hover:bg-[#345F43] text-white transition-colors"
              style={{
                fontSize: '16px',
                fontWeight: 500,
                padding: '12px 32px',
                borderRadius: '28px',
                boxShadow: '0 2px 8px rgba(61,110,78,0.25)',
              }}
            >
              Submit
            </button>
          </div>
        </div>
      </div>
    );
  }

  /* ═══════════════════════════════════════════════════
     STAGE 3 – Reading View
     ═══════════════════════════════════════════════════ */
  return (
    <div className="flex-1 flex h-screen overflow-hidden bg-[#FEFEFE]">
      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#E9EBEF]" style={{ padding: '16px 32px' }}>
          <h1 className="text-[#1A1A1A]" style={{ fontSize: '22px', fontWeight: 700 }}>
            Text to Speech Learning Hub
          </h1>
          <div className="flex items-center gap-3">
            <button className="w-10 h-10 flex items-center justify-center bg-[#F8F9FA] hover:bg-[#E9EBEF] rounded-full transition-colors">
              <Search size={18} className="text-[#3D6E4E]" />
            </button>
            <button className="w-10 h-10 flex items-center justify-center bg-[#F8F9FA] hover:bg-[#E9EBEF] rounded-full transition-colors">
              <Settings size={18} className="text-[#5F5F5F]" />
            </button>
            <button className="w-10 h-10 flex items-center justify-center bg-[#F8F9FA] hover:bg-[#E9EBEF] rounded-full transition-colors">
              <Moon size={18} className="text-[#5F5F5F]" />
            </button>
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto" style={{ padding: '24px 32px' }}>
          <div className="max-w-4xl mx-auto">
            {/* Document Player Card */}
            <div
              className="flex items-center justify-between mb-6"
              style={{
                backgroundColor: bgColor,
                borderRadius: '16px',
                padding: '16px 24px',
                border: '1px solid #E9EBEF',
                boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
              }}
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-[#4A7C59] flex items-center justify-center" style={{ borderRadius: '12px' }}>
                  <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" />
                  </svg>
                </div>
                <span className="text-[#1A1A1A]" style={{ fontSize: '15px', fontWeight: 500 }}>{uploadedFile?.name}</span>
              </div>

              <div className="flex items-center gap-2">
                <button className="w-9 h-9 flex items-center justify-center hover:bg-[#F8F9FA] rounded-full transition-colors">
                  <SkipBack size={18} className="text-[#5F5F5F]" />
                </button>
                <button
                  onClick={() => setIsPlaying(!isPlaying)}
                  className="w-10 h-10 flex items-center justify-center bg-[#4A7C59] hover:bg-[#3D6E4E] rounded-full transition-colors"
                >
                  {isPlaying ? (
                    <Pause size={18} className="text-white" />
                  ) : (
                    <Play size={18} className="text-white" />
                  )}
                </button>
                <button className="w-9 h-9 flex items-center justify-center hover:bg-[#F8F9FA] rounded-full transition-colors">
                  <SkipForward size={18} className="text-[#5F5F5F]" />
                </button>
              </div>

              <button
                onClick={() => setStage('welcome')}
                className="w-9 h-9 flex items-center justify-center hover:bg-[#F8F9FA] rounded-full transition-colors"
              >
                <X size={18} className="text-[#5F5F5F]" />
              </button>
            </div>

            {/* Text Content Card */}
            <div
              style={{
                backgroundColor: bgColor,
                borderRadius: '16px',
                padding: '32px',
                border: '1px solid #E9EBEF',
                boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
                minHeight: '460px',
                opacity: dimSurrounding ? 0.6 : 1,
                transition: 'all 0.3s ease',
              }}
            >
              <h2 className="text-[#1A1A1A] mb-5" style={{ fontSize: '20px', fontWeight: 700 }}>
                Early Life and Artistic Failure
              </h2>
              <div className="space-y-5 text-[#1A1A1A]" style={{ fontSize: '15px', lineHeight: 1.6 }}>
                <p>
                  Adolf Hitler's life remains one of the most studied and scrutinized periods
                  in modern history, marking the transition from a failed artist to the
                  architect of a global catastrophe.
                </p>
                <p style={{ fontWeight: 600 }}>Early Life and Artistic Failure</p>
                <p>
                  Adolf Hitler was born on{' '}
                  <span style={{ backgroundColor: highlightColor, borderRadius: '4px', padding: '1px 4px' }}>
                    April 20, 1889
                  </span>
                  , in the small Austrian town of Braunau am Inn. His early years were shaped by a
                  difficult relationship with his strict father and a deep devotion to his mother.
                  In 1907, he moved to Vienna with dreams of becoming an artist. However, he was
                  twice rejected by the Academy of Fine Arts. During his years of poverty in Vienna,
                  he began to adopt the extreme nationalist and antisemetic ideologies that would
                  later define his regime.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Toggle Button */}
      <button
        onClick={() => setIsToolsOpen(!isToolsOpen)}
        className="absolute top-1/2 -translate-y-1/2 z-10 bg-white border border-[#E9EBEF] p-2 hover:bg-[#F8F9FA] transition-all duration-300"
        style={{
          right: isToolsOpen ? '288px' : '0px',
          borderRadius: '8px 0 0 8px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
        }}
      >
        {isToolsOpen ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
      </button>

      {/* Tools Sidebar – Right Side */}
      <div
        className={`${isToolsOpen ? 'w-72' : 'w-0'} transition-all duration-300 border-l border-[#E9EBEF] bg-[#F8F9FA] overflow-hidden flex flex-col`}
      >
        <div className="flex-1 overflow-y-auto space-y-5" style={{ padding: '20px 16px' }}>
          {/* Tools Header */}
          <div className="flex items-center justify-between">
            <h3 className="text-[#1A1A1A]" style={{ fontSize: '18px', fontWeight: 700 }}>Tools</h3>
            <div className="flex items-center gap-2">
              <button className="w-8 h-8 flex items-center justify-center hover:bg-[#E9EBEF] rounded-full transition-colors">
                <Bookmark size={16} className="text-[#5F5F5F]" />
              </button>
              <button className="w-8 h-8 flex items-center justify-center bg-[#4A7C59] rounded-full">
                <HelpCircle size={16} className="text-white" />
              </button>
            </div>
          </div>

          {/* Voice Selector */}
          <div className="space-y-2">
            <label className="text-[#5F5F5F]" style={{ fontSize: '13px', fontWeight: 500 }}>Voice Option</label>
            <select
              className="w-full bg-white border border-[#E9EBEF] text-[#1A1A1A]"
              style={{ padding: '10px 12px', borderRadius: '8px', fontSize: '14px' }}
            >
              <option>Alex</option>
              <option>Nadia</option>
              <option>Jake</option>
            </select>
          </div>

          {/* Speed Selector */}
          <div className="space-y-2">
            <label className="text-[#5F5F5F]" style={{ fontSize: '13px', fontWeight: 500 }}>Speed</label>
            <select
              className="w-full bg-white border border-[#E9EBEF] text-[#1A1A1A]"
              style={{ padding: '10px 12px', borderRadius: '8px', fontSize: '14px' }}
              value={speed}
              onChange={(e) => setSpeed(parseFloat(e.target.value))}
            >
              {speedOptions.map((s) => (
                <option key={s} value={s}>{s}x</option>
              ))}
            </select>
          </div>

          {/* Speed Badges */}
          <div className="flex flex-wrap gap-2">
            {speedOptions.map((s) => (
              <button
                key={s}
                onClick={() => setSpeed(s)}
                className="transition-colors"
                style={{
                  padding: '6px 14px',
                  borderRadius: '20px',
                  fontSize: '13px',
                  fontWeight: 500,
                  backgroundColor: speed === s ? '#4A7C59' : '#E9EBEF',
                  color: speed === s ? '#FFFFFF' : '#5F5F5F',
                }}
              >
                {s}x
              </button>
            ))}
          </div>

          {/* Reading Options */}
          <div className="space-y-2">
            <label className="text-[#5F5F5F]" style={{ fontSize: '13px', fontWeight: 500 }}>Reading Options</label>
            <select
              className="w-full bg-white border border-[#E9EBEF] text-[#1A1A1A]"
              style={{ padding: '10px 12px', borderRadius: '8px', fontSize: '14px' }}
            >
              <option>Standard</option>
              <option>Simplified</option>
            </select>
          </div>

          {/* Dim Surrounding Text */}
          <div className="flex items-center justify-between">
            <span className="text-[#5F5F5F]" style={{ fontSize: '13px', fontWeight: 500 }}>Dim Surrounding Text</span>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                className="sr-only peer"
                checked={dimSurrounding}
                onChange={(e) => setDimSurrounding(e.target.checked)}
              />
              <div className="w-10 h-[22px] bg-[#cbced4] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-[18px] peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-[18px] after:w-[18px] after:transition-all peer-checked:bg-[#4A7C59]" />
            </label>
          </div>

          {/* Tinted Background Colour */}
          <div className="space-y-2">
            <label className="text-[#5F5F5F]" style={{ fontSize: '13px', fontWeight: 500 }}>Tinted Background Colour</label>
            <div className="grid grid-cols-8 gap-2">
              {bgColors.map((color, idx) => (
                <button
                  key={idx}
                  onClick={() => setBgColor(color)}
                  className="w-7 h-7 rounded-full transition-all"
                  style={{
                    backgroundColor: color,
                    border: bgColor === color ? '2.5px solid #1A1A1A' : '2px solid #E9EBEF',
                    transform: bgColor === color ? 'scale(1.15)' : 'scale(1)',
                  }}
                >
                  {bgColor === color && (
                    <Circle size={8} className="mx-auto text-[#1A1A1A]" fill="currentColor" />
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Highlight Colour */}
          <div className="space-y-2">
            <label className="text-[#5F5F5F]" style={{ fontSize: '13px', fontWeight: 500 }}>Highlight Colour</label>
            <div className="grid grid-cols-8 gap-2">
              {bgColors.slice(0, 12).map((color, idx) => (
                <button
                  key={idx}
                  onClick={() => setHighlightColor(color)}
                  className="w-7 h-7 rounded-full transition-all"
                  style={{
                    backgroundColor: color,
                    border: highlightColor === color ? '2.5px solid #1A1A1A' : '2px solid #E9EBEF',
                    transform: highlightColor === color ? 'scale(1.15)' : 'scale(1)',
                  }}
                />
              ))}
            </div>
          </div>

          {/* Reading Mode */}
          <div className="space-y-2">
            <button
              onClick={() => setReadingMode('word')}
              className="w-full transition-colors"
              style={{
                padding: '10px 16px',
                borderRadius: '24px',
                fontSize: '13px',
                fontWeight: 500,
                backgroundColor: readingMode === 'word' ? '#4A7C59' : '#E9EBEF',
                color: readingMode === 'word' ? '#FFFFFF' : '#5F5F5F',
              }}
            >
              Word by Word
            </button>
            <button
              onClick={() => setReadingMode('line')}
              className="w-full transition-colors"
              style={{
                padding: '10px 16px',
                borderRadius: '24px',
                fontSize: '13px',
                fontWeight: 500,
                backgroundColor: readingMode === 'line' ? '#4A7C59' : '#E9EBEF',
                color: readingMode === 'line' ? '#FFFFFF' : '#5F5F5F',
              }}
            >
              Line by Line
            </button>
          </div>

          {/* Export Button */}
          <button
            className="w-full bg-[#3D6E4E] hover:bg-[#345F43] text-white flex items-center justify-center gap-2 transition-colors"
            style={{
              padding: '12px 16px',
              borderRadius: '24px',
              fontSize: '14px',
              fontWeight: 500,
              boxShadow: '0 2px 8px rgba(61,110,78,0.25)',
            }}
          >
            <Download size={18} />
            Export Audio (MP3)
          </button>
        </div>
      </div>
    </div>
  );
}