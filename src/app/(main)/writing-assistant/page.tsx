'use client';

import { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Icon } from '@/components/Icon';
import { FeatureHeader } from '@/components/FeatureHeader';

// Types
type FontChoice = 'default' | 'opendyslexic' | 'roboto';
type SpacingOption = 'letter' | 'word' | 'line';
type BackgroundTint = 'none' | 'yellow' | 'cream' | 'beige' | 'tan' | 'peach' | 'sky' | 'mint' | 'lavender' | 'blue' | 'green' | 'sage' | 'pink' | 'rose' | 'warm' | 'cool';

// Background tint colors
const TINT_COLORS: { id: BackgroundTint; color: string }[] = [
  { id: 'yellow', color: '#FFF9C4' },
  { id: 'cream', color: '#FFF8E1' },
  { id: 'beige', color: '#F5F5DC' },
  { id: 'tan', color: '#D2B48C' },
  { id: 'peach', color: '#FFDAB9' },
  { id: 'sky', color: '#E0F7FA' },
  { id: 'mint', color: '#F0FFF0' },
  { id: 'lavender', color: '#E6E6FA' },
  { id: 'blue', color: '#E3F2FD' },
  { id: 'green', color: '#E8F5E9' },
  { id: 'sage', color: '#E8F3E8' },
  { id: 'pink', color: '#FCE4EC' },
  { id: 'rose', color: '#FFF0F3' },
  { id: 'warm', color: '#FFF8E7' },
  { id: 'cool', color: '#F0F8FF' },
];

// Sample text content
const SAMPLE_TEXT = `Adolf Hitler's life remains one of the most studied and scrutinized periods in modern history, marking the transition from a failed artist to the architect of a global catastrophe.

Early Life and Artistic Failure

Adolf Hitler was born on April 20, 1889, in the small Austrian town of Braunau am Inn. His early years were shaped by a difficult relationship with his strict father and a deep devotion to his mother. In 1907, he moved to Vienna with dreams of becoming an artist. However, he was twice rejected by the Academy of Fine Arts. During his years of poverty in Vienna, he began to adopt the extreme nationalist and antisemitic ideologies that would later define his regime.`;

// Icons
const MicrophoneIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 2a3 3 0 0 1 3 3v7a3 3 0 0 1-6 0V5a3 3 0 0 1 3-3Z"/>
    <path d="M19 10v2a7 7 0 0 1-14 0v-2"/>
    <line x1="12" x2="12" y1="19" y2="22"/>
  </svg>
);

const WaveformIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M2 10v4"/>
    <path d="M6 6v12"/>
    <path d="M10 3v18"/>
    <path d="M14 8v8"/>
    <path d="M18 5v14"/>
    <path d="M22 10v4"/>
  </svg>
);

const BookmarkIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="m19 21-7-4-7 4V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16z"/>
  </svg>
);

const ChevronLeftIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="m15 18-6-6 6-6"/>
  </svg>
);

const ChevronRightIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="m9 18 6-6-6-6"/>
  </svg>
);

const ChevronDownIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="m6 9 6 6 6-6"/>
  </svg>
);

const InfoIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10"/>
    <path d="M12 16v-4"/>
    <path d="M12 8h.01"/>
  </svg>
);

const ClipboardIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect width="8" height="4" x="8" y="2" rx="1" ry="1"/>
    <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/>
  </svg>
);

const CheckIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12"/>
  </svg>
);

const ExportIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
    <polyline points="7 10 12 15 17 10"/>
    <line x1="12" x2="12" y1="15" y2="3"/>
  </svg>
);

const NullIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10"/>
    <line x1="4.93" x2="19.07" y1="4.93" y2="19.07"/>
  </svg>
);

const GoogleDriveIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none">
    <path d="M7.71 3.5L1.15 15l3.43 5.95L11.14 9.45 7.71 3.5z" fill="#0066DA"/>
    <path d="M16.29 3.5L9.73 15l3.43 5.95 6.56-11.5L16.29 3.5z" fill="#00AC47"/>
    <path d="M12 15l-3.43 5.95h13.72L22.85 15H12z" fill="#EA4335"/>
    <path d="M4.58 20.95h13.72L12 15H1.15l3.43 5.95z" fill="#00832D"/>
    <path d="M7.71 3.5l3.43 5.95h6.57L12 3.5H7.71z" fill="#2684FC"/>
    <path d="M12 15h10.85l-3.43-5.95H8.57L12 15z" fill="#FFBA00"/>
  </svg>
);

const WordIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none">
    <rect x="2" y="3" width="20" height="18" rx="2" fill="#2B579A"/>
    <path d="M7 7l3 10 3-10" stroke="white" strokeWidth="1.5" fill="none"/>
    <text x="14" y="15" fill="white" fontSize="8" fontWeight="bold">W</text>
  </svg>
);

const SmallChevronRight = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="m9 18 6-6-6-6"/>
  </svg>
);

export default function WritingAssistantPage() {
  // State
  const [toolsOpen, setToolsOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [fontChoice, setFontChoice] = useState<FontChoice>('roboto');
  const [showFontDropdown, setShowFontDropdown] = useState(false);
  const [showSpacingDropdown, setShowSpacingDropdown] = useState(false);
  const [showTintPicker, setShowTintPicker] = useState(false);
  const [showExportMenu, setShowExportMenu] = useState(false);
  const [backgroundTint, setBackgroundTint] = useState<BackgroundTint>('none');
  const [letterSpacing, setLetterSpacing] = useState(0);
  const [wordSpacing, setWordSpacing] = useState(0);
  const [lineHeight, setLineHeight] = useState(1.6);
  const [showSpacingPanel, setShowSpacingPanel] = useState(false);

  // Refs for click outside handling
  const fontDropdownRef = useRef<HTMLDivElement>(null);
  const spacingDropdownRef = useRef<HTMLDivElement>(null);
  const tintPickerRef = useRef<HTMLDivElement>(null);
  const exportMenuRef = useRef<HTMLDivElement>(null);

  // Click outside handler
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (fontDropdownRef.current && !fontDropdownRef.current.contains(e.target as Node)) {
        setShowFontDropdown(false);
      }
      if (spacingDropdownRef.current && !spacingDropdownRef.current.contains(e.target as Node)) {
        setShowSpacingDropdown(false);
      }
      if (tintPickerRef.current && !tintPickerRef.current.contains(e.target as Node)) {
        setShowTintPicker(false);
      }
      if (exportMenuRef.current && !exportMenuRef.current.contains(e.target as Node)) {
        setShowExportMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Copy to clipboard handler
  const handleCopy = () => {
    navigator.clipboard.writeText(SAMPLE_TEXT);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Get font family
  const getFontFamily = () => {
    switch (fontChoice) {
      case 'opendyslexic': return 'OpenDyslexic, sans-serif';
      case 'roboto': return 'Roboto, sans-serif';
      default: return 'inherit';
    }
  };

  // Get background color
  const getBackgroundColor = () => {
    if (backgroundTint === 'none') return '#f3f4f6';
    return TINT_COLORS.find(t => t.id === backgroundTint)?.color || '#f3f4f6';
  };

  // Render text with highlight
  const renderText = () => {
    const parts = SAMPLE_TEXT.split('with his');
    return (
      <>
        {parts[0]}
        <span className="bg-yellow-400 px-0.5 rounded-sm">with his</span>
        {parts[1]}
      </>
    );
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="min-h-[calc(100vh-80px)] relative antialiased"
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-10 pt-8">
        <h1 className="text-[28px] font-bold text-[#1a1a1a] tracking-tight">Writing Assistant</h1>
        <FeatureHeader />
      </div>

      {/* Main Content Area with Editor Card */}
      <div className={`transition-all duration-500 ease-out ${toolsOpen ? 'lg:pr-80' : 'pr-0'}`}>
        {/* Editor Card */}
        <div 
          className="rounded-2xl sm:rounded-3xl p-4 sm:p-6 lg:p-8 relative shadow-sm border border-gray-200/30"
          style={{ backgroundColor: getBackgroundColor() }}
        >
          {/* Top Row */}
          <div className="flex items-center justify-between mb-8 px-1">
            {/* Left: Low confidence indicator */}
            <div className="flex items-center gap-3">
              <span className="w-2.5 h-2.5 rounded-full bg-orange-400 shadow-sm"></span>
              <span className="text-orange-400 text-sm font-medium tracking-wide">Low confidence</span>
            </div>

            {/* Center: Audio icons */}
            <div className="flex items-center gap-4 text-[#3D6E4E]">
              <MicrophoneIcon className="w-5 h-5" />
              <WaveformIcon className="w-5 h-5" />
            </div>

            {/* Right: Clean and Structure button */}
            <button className="bg-[#3D6E4E] text-white px-6 py-3 rounded-full text-sm font-medium hover:bg-[#2d5239]/90 active:scale-[0.96] transition-all duration-300 ease-out shadow-md hover:shadow-lg">
              Clean and Structure
            </button>
          </div>

          {/* Text Content Area */}
          <div className="relative pr-5">
            {/* Custom Scrollbar Track */}
            <div className="absolute right-0 top-0 bottom-0 w-2.5 bg-gray-300/40 rounded-full">
              <div className="w-full h-20 bg-gray-400/70 rounded-full mt-10"></div>
            </div>

            {/* Text Content */}
            <div 
              className="pr-8 max-h-[400px] overflow-y-auto"
              style={{ 
                fontFamily: getFontFamily(),
                letterSpacing: `${letterSpacing}px`,
                wordSpacing: `${wordSpacing}px`,
                lineHeight: lineHeight
              }}
            >
              <h2 className="text-xl font-bold text-[#1a1a1a] mb-5">Early Life and Artistic Failure</h2>
              <p className="text-[#1a1a1a] text-[15px] leading-relaxed whitespace-pre-line">
                {renderText()}
              </p>
            </div>
          </div>

          {/* Misheard Tooltip - positioned near highlighted text */}
          <div className="absolute left-[280px] top-[200px] bg-white/95 backdrop-blur-md rounded-2xl shadow-xl border border-gray-100/50 p-5 w-64 z-20">
            <div className="flex flex-col items-center text-center">
              <InfoIcon className="w-6 h-6 text-gray-900 mb-3" />
              <p className="text-sm text-gray-600 leading-relaxed">
                We may have misheard you. Please confirm if the highlighted words are correct
              </p>
            </div>
            {/* Arrow pointer */}
            <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-4 h-4 bg-white/95 border-r border-b border-gray-100/50 rotate-45"></div>
          </div>

          {/* Bottom: Copy to Clipboard Button */}
          <div className="flex justify-end mt-8">
            <button
              onClick={handleCopy}
              className={`flex items-center gap-3 px-6 py-3 rounded-full text-sm font-medium transition-all duration-300 ease-out shadow-md hover:shadow-lg active:scale-[0.96] ${
                copied 
                  ? 'bg-[#3D6E4E] text-white' 
                  : 'bg-[#3D6E4E] text-white hover:bg-[#2d5239]/90'
              }`}
            >
              {copied ? (
                <>
                  <CheckIcon className="w-4 h-4" />
                  <span>Copied</span>
                </>
              ) : (
                <>
                  <ClipboardIcon className="w-4 h-4" />
                  <span>Copy to Clipboard</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Tools Drawer Toggle Button */}
      <button
        onClick={() => setToolsOpen(true)}
        className={`fixed right-0 top-1/2 -translate-y-1/2 w-12 h-12 bg-[#3D6E4E] rounded-l-2xl flex items-center justify-center text-white shadow-lg hover:bg-[#2d5239] active:scale-[0.96] transition-all duration-300 ease-out z-30 ${toolsOpen ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}
      >
        <ChevronLeftIcon className="w-5 h-5" />
      </button>

      {/* Tools Slide-over Drawer */}
      <div className={`fixed inset-y-0 right-0 w-72 bg-white/95 backdrop-blur-xl shadow-2xl border-l border-gray-100/50 transform transition-transform duration-500 ease-out z-40 ${toolsOpen ? 'translate-x-0' : 'translate-x-full'}`}>
        <div className="h-full flex flex-col p-8">
          {/* Header */}
          <div className="flex items-center justify-between mb-10">
            <h2 className="text-2xl font-semibold text-[#3D6E4E]">Tools</h2>
            <div className="flex items-center gap-4">
              <BookmarkIcon className="w-5 h-5 text-gray-400" />
              <button 
                onClick={() => setToolsOpen(false)}
                className="w-9 h-9 bg-[#3D6E4E] rounded-full flex items-center justify-center text-white hover:bg-[#2d5239] active:scale-[0.96] transition-all duration-300 ease-out shadow-md"
              >
                <ChevronRightIcon className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Menu Items */}
          <div className="flex-1 space-y-8">
            {/* Font Choice */}
            <div className="relative" ref={fontDropdownRef}>
              <button
                onClick={() => {
                  setShowFontDropdown(!showFontDropdown);
                  setShowSpacingDropdown(false);
                  setShowTintPicker(false);
                }}
                className="flex items-center justify-between w-full text-gray-700 hover:text-[#3D6E4E] active:scale-[0.98] transition-all duration-300 ease-out py-1"
              >
                <span className="text-base font-medium">Font Choice</span>
                <ChevronDownIcon className={`w-4 h-4 transition-transform duration-300 ease-out ${showFontDropdown ? 'rotate-180' : ''}`} />
              </button>

              {/* Font Choice Dropdown */}
              {showFontDropdown && (
                <div className="absolute top-full left-0 right-0 mt-3 bg-white/95 backdrop-blur-md rounded-2xl shadow-xl border border-gray-100/50 py-3 z-50">
                  {(['default', 'opendyslexic', 'roboto'] as FontChoice[]).map((font) => (
                    <button
                      key={font}
                      onClick={() => { setFontChoice(font); setShowFontDropdown(false); }}
                      className={`w-full text-left px-5 py-3 text-sm transition-all duration-300 ease-out active:scale-[0.98] ${
                        fontChoice === font 
                          ? 'bg-[#3D6E4E] text-white mx-2 rounded-full w-[calc(100%-16px)] shadow-md' 
                          : 'text-gray-700 hover:bg-gray-50/80 rounded-xl mx-2 w-[calc(100%-16px)]'
                      }`}
                    >
                      {font === 'opendyslexic' ? 'OpenDyslexic' : font === 'roboto' ? 'Roboto' : 'Default'}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Spacing */}
            <div className="relative" ref={spacingDropdownRef}>
              <button
                onClick={() => {
                  setShowSpacingDropdown(!showSpacingDropdown);
                  setShowFontDropdown(false);
                  setShowTintPicker(false);
                }}
                className="flex items-center justify-between w-full text-gray-700 hover:text-[#3D6E4E] active:scale-[0.98] transition-all duration-300 ease-out py-1"
              >
                <span className="text-base font-medium">Spacing</span>
                <ChevronDownIcon className={`w-4 h-4 transition-transform duration-300 ease-out ${showSpacingDropdown ? 'rotate-180' : ''}`} />
              </button>

              {/* Spacing Dropdown */}
              {showSpacingDropdown && (
                <div className="absolute top-full left-0 right-0 mt-3 bg-white/95 backdrop-blur-md rounded-2xl shadow-xl border border-gray-100/50 py-3 z-50">
                  {(['letter', 'word', 'line'] as SpacingOption[]).map((option) => (
                    <button
                      key={option}
                      onClick={() => { 
                        setShowSpacingDropdown(false);
                        setShowSpacingPanel(true);
                      }}
                      className="w-full flex items-center justify-between px-5 py-3 text-sm text-gray-700 hover:bg-gray-50/80 active:scale-[0.98] transition-all duration-300 ease-out rounded-xl mx-2 w-[calc(100%-16px)]"
                    >
                      <span className="capitalize font-medium">{option}</span>
                      <SmallChevronRight className="w-3 h-3 text-gray-400" />
                    </button>
                  ))}
                </div>
              )}

              {/* Spacing Panel (when option selected) */}
              {showSpacingPanel && (
                <div className="mt-4 space-y-5 p-5 bg-gray-50/80 backdrop-blur-sm rounded-2xl border border-gray-100/50">
                  <div>
                    <div className="flex justify-between mb-2">
                      <label className="text-xs text-gray-600 font-medium">Letter spacing</label>
                      <span className="text-xs text-gray-500">{letterSpacing}px</span>
                    </div>
                    <input 
                      type="range" 
                      min="0" 
                      max="5" 
                      step="0.5" 
                      value={letterSpacing}
                      onChange={(e) => setLetterSpacing(parseFloat(e.target.value))}
                      className="w-full h-2 bg-gray-200 rounded-full appearance-none cursor-pointer accent-[#3D6E4E]"
                    />
                  </div>
                  <div>
                    <div className="flex justify-between mb-2">
                      <label className="text-xs text-gray-600 font-medium">Word spacing</label>
                      <span className="text-xs text-gray-500">{wordSpacing}px</span>
                    </div>
                    <input 
                      type="range" 
                      min="0" 
                      max="10" 
                      step="1" 
                      value={wordSpacing}
                      onChange={(e) => setWordSpacing(parseFloat(e.target.value))}
                      className="w-full h-2 bg-gray-200 rounded-full appearance-none cursor-pointer accent-[#3D6E4E]"
                    />
                  </div>
                  <div>
                    <div className="flex justify-between mb-2">
                      <label className="text-xs text-gray-600 font-medium">Line height</label>
                      <span className="text-xs text-gray-500">{lineHeight.toFixed(1)}</span>
                    </div>
                    <input 
                      type="range" 
                      min="1" 
                      max="3" 
                      step="0.1" 
                      value={lineHeight}
                      onChange={(e) => setLineHeight(parseFloat(e.target.value))}
                      className="w-full h-2 bg-gray-200 rounded-full appearance-none cursor-pointer accent-[#3D6E4E]"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Tinted Background Colour */}
            <div className="relative" ref={tintPickerRef}>
              <button
                onClick={() => {
                  setShowTintPicker(!showTintPicker);
                  setShowFontDropdown(false);
                  setShowSpacingDropdown(false);
                }}
                className="flex items-center justify-between w-full text-gray-700 hover:text-[#3D6E4E] active:scale-[0.98] transition-all duration-300 ease-out py-1"
              >
                <span className="text-base font-medium">Tinted Background Colour</span>
                <NullIcon className="w-5 h-5 text-gray-900" />
              </button>

              {/* Color Grid Popover */}
              {showTintPicker && (
                <div className="absolute top-full left-0 right-0 mt-3 bg-white/95 backdrop-blur-md rounded-2xl shadow-xl border border-gray-100/50 p-5 z-50">
                  <div className="grid grid-cols-5 gap-3">
                    {TINT_COLORS.map((tint) => (
                      <button
                        key={tint.id}
                        onClick={() => setBackgroundTint(tint.id)}
                        className={`w-9 h-9 rounded-full transition-all duration-300 ease-out hover:scale-110 active:scale-95 shadow-sm ${
                          backgroundTint === tint.id ? 'ring-2 ring-[#3D6E4E] ring-offset-2 scale-110' : ''
                        }`}
                        style={{ backgroundColor: tint.color }}
                        title={tint.id}
                      />
                    ))}
                  </div>
                  {/* No color option */}
                  <button
                    onClick={() => setBackgroundTint('none')}
                    className={`mt-4 w-9 h-9 rounded-full border-2 border-gray-300 flex items-center justify-center transition-all duration-300 ease-out hover:scale-110 active:scale-95 shadow-sm ${
                      backgroundTint === 'none' ? 'ring-2 ring-[#3D6E4E] ring-offset-2' : ''
                    }`}
                  >
                    <NullIcon className="w-4 h-4 text-gray-500" />
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Export Button */}
          <div className="relative mt-8" ref={exportMenuRef}>
            <button
              onClick={() => setShowExportMenu(!showExportMenu)}
              className="w-full bg-[#3D6E4E] text-white py-4 rounded-full flex items-center justify-center gap-3 font-medium hover:bg-[#2d5239]/90 active:scale-[0.96] transition-all duration-300 ease-out shadow-lg hover:shadow-xl"
            >
              <ExportIcon className="w-5 h-5" />
              <span>Export</span>
            </button>

            {/* Export Menu */}
            {showExportMenu && (
              <div className="absolute bottom-full left-0 right-0 mb-3 bg-white/95 backdrop-blur-md rounded-2xl shadow-xl border border-gray-100/50 py-3 z-50">
                <button className="w-full flex items-center gap-4 px-5 py-3.5 text-sm text-gray-700 hover:bg-gray-50/80 active:scale-[0.98] transition-all duration-300 ease-out rounded-xl mx-2 w-[calc(100%-16px)]">
                  <GoogleDriveIcon className="w-5 h-5" />
                  <span className="font-medium">Export to Google docx</span>
                </button>
                <button className="w-full flex items-center gap-4 px-5 py-3.5 text-sm text-gray-700 hover:bg-gray-50/80 active:scale-[0.98] transition-all duration-300 ease-out rounded-xl mx-2 w-[calc(100%-16px)]">
                  <WordIcon className="w-5 h-5" />
                  <span className="font-medium">Download as docx</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Backdrop when tools open */}
      {toolsOpen && (
        <div 
          className="fixed inset-0 bg-black/20 backdrop-blur-sm z-30 transition-opacity duration-300"
          onClick={() => setToolsOpen(false)}
        />
      )}
    </motion.div>
  );
}
