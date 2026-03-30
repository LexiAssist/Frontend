'use client';

import { useState, useRef, useEffect } from 'react';
import { Icon } from '@/components/Icon';

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
    <div className="min-h-[calc(100vh-80px)] relative">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-[28px] font-bold text-[#1a1a1a] tracking-tight">Writing Assistant</h1>
        <div className="flex items-center gap-3">
          <button className="w-10 h-10 flex items-center justify-center rounded-xl bg-white text-[#5f5f5f] shadow-sm hover:shadow-md transition-all border border-[#e5e7eb]">
            <Icon name="settings" size={20} />
          </button>
          <button className="w-10 h-10 flex items-center justify-center rounded-xl bg-white text-[#5f5f5f] shadow-sm hover:shadow-md transition-all border border-[#e5e7eb]">
            <Icon name="moon" size={20} />
          </button>
        </div>
      </div>

      {/* Main Content Area with Editor Card */}
      <div className={`transition-all duration-300 ${toolsOpen ? 'pr-72' : 'pr-0'}`}>
        {/* Editor Card */}
        <div 
          className="rounded-2xl p-6 relative"
          style={{ backgroundColor: getBackgroundColor() }}
        >
          {/* Top Row */}
          <div className="flex items-center justify-between mb-6">
            {/* Left: Low confidence indicator */}
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-orange-400"></span>
              <span className="text-orange-400 text-sm font-medium">Low confidence</span>
            </div>

            {/* Center: Audio icons */}
            <div className="flex items-center gap-3 text-[#3D6E4E]">
              <MicrophoneIcon className="w-5 h-5" />
              <WaveformIcon className="w-5 h-5" />
            </div>

            {/* Right: Clean and Structure button */}
            <button className="bg-[#3D6E4E] text-white px-5 py-2.5 rounded-full text-sm font-medium hover:bg-[#2d5239] transition-colors shadow-sm">
              Clean and Structure
            </button>
          </div>

          {/* Text Content Area */}
          <div className="relative pr-4">
            {/* Custom Scrollbar Track */}
            <div className="absolute right-0 top-0 bottom-0 w-2 bg-gray-300/50 rounded-full">
              <div className="w-full h-20 bg-gray-400 rounded-full mt-8"></div>
            </div>

            {/* Text Content */}
            <div 
              className="pr-6 max-h-[400px] overflow-y-auto"
              style={{ 
                fontFamily: getFontFamily(),
                letterSpacing: `${letterSpacing}px`,
                wordSpacing: `${wordSpacing}px`,
                lineHeight: lineHeight
              }}
            >
              <h2 className="text-xl font-bold text-[#1a1a1a] mb-4">Early Life and Artistic Failure</h2>
              <p className="text-[#1a1a1a] text-[15px] leading-relaxed whitespace-pre-line">
                {renderText()}
              </p>
            </div>
          </div>

          {/* Misheard Tooltip - positioned near highlighted text */}
          <div className="absolute left-[280px] top-[200px] bg-white rounded-xl shadow-lg border border-[#e5e7eb] p-4 w-64 z-20">
            <div className="flex flex-col items-center text-center">
              <InfoIcon className="w-6 h-6 text-gray-900 mb-2" />
              <p className="text-sm text-gray-600">
                We may have misheard you. Please confirm if the highlighted words are correct
              </p>
            </div>
            {/* Arrow pointer */}
            <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-4 h-4 bg-white border-r border-b border-[#e5e7eb] rotate-45"></div>
          </div>

          {/* Bottom: Copy to Clipboard Button */}
          <div className="flex justify-end mt-6">
            <button
              onClick={handleCopy}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-medium transition-all shadow-sm ${
                copied 
                  ? 'bg-[#3D6E4E] text-white' 
                  : 'bg-[#3D6E4E] text-white hover:bg-[#2d5239]'
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
        className={`fixed right-0 top-1/2 -translate-y-1/2 w-10 h-10 bg-[#3D6E4E] rounded-l-full flex items-center justify-center text-white shadow-lg hover:bg-[#2d5239] transition-all z-30 ${toolsOpen ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}
      >
        <ChevronLeftIcon className="w-5 h-5" />
      </button>

      {/* Tools Slide-over Drawer */}
      <div className={`fixed inset-y-0 right-0 w-72 bg-white shadow-2xl transform transition-transform duration-300 z-40 ${toolsOpen ? 'translate-x-0' : 'translate-x-full'}`}>
        <div className="h-full flex flex-col p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-semibold text-[#3D6E4E]">Tools</h2>
            <div className="flex items-center gap-3">
              <BookmarkIcon className="w-5 h-5 text-gray-400" />
              <button 
                onClick={() => setToolsOpen(false)}
                className="w-8 h-8 bg-[#3D6E4E] rounded-full flex items-center justify-center text-white hover:bg-[#2d5239] transition-colors"
              >
                <ChevronRightIcon className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Menu Items */}
          <div className="flex-1 space-y-6">
            {/* Font Choice */}
            <div className="relative" ref={fontDropdownRef}>
              <button
                onClick={() => {
                  setShowFontDropdown(!showFontDropdown);
                  setShowSpacingDropdown(false);
                  setShowTintPicker(false);
                }}
                className="flex items-center justify-between w-full text-gray-700 hover:text-[#3D6E4E] transition-colors"
              >
                <span className="text-base">Font Choice</span>
                <ChevronDownIcon className={`w-4 h-4 transition-transform ${showFontDropdown ? 'rotate-180' : ''}`} />
              </button>

              {/* Font Choice Dropdown */}
              {showFontDropdown && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl shadow-lg border border-[#e5e7eb] py-2 z-50">
                  {(['default', 'opendyslexic', 'roboto'] as FontChoice[]).map((font) => (
                    <button
                      key={font}
                      onClick={() => { setFontChoice(font); setShowFontDropdown(false); }}
                      className={`w-full text-left px-4 py-2.5 text-sm transition-colors ${
                        fontChoice === font 
                          ? 'bg-[#3D6E4E] text-white mx-2 rounded-full w-[calc(100%-16px)]' 
                          : 'text-gray-700 hover:bg-gray-50'
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
                className="flex items-center justify-between w-full text-gray-700 hover:text-[#3D6E4E] transition-colors"
              >
                <span className="text-base">Spacing</span>
                <ChevronDownIcon className={`w-4 h-4 transition-transform ${showSpacingDropdown ? 'rotate-180' : ''}`} />
              </button>

              {/* Spacing Dropdown */}
              {showSpacingDropdown && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl shadow-lg border border-[#e5e7eb] py-2 z-50">
                  {(['letter', 'word', 'line'] as SpacingOption[]).map((option) => (
                    <button
                      key={option}
                      onClick={() => { 
                        setShowSpacingDropdown(false);
                        setShowSpacingPanel(true);
                      }}
                      className="w-full flex items-center justify-between px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                    >
                      <span className="capitalize">{option}</span>
                      <SmallChevronRight className="w-3 h-3 text-gray-400" />
                    </button>
                  ))}
                </div>
              )}

              {/* Spacing Panel (when option selected) */}
              {showSpacingPanel && (
                <div className="mt-3 space-y-4 p-4 bg-gray-50 rounded-xl">
                  <div>
                    <div className="flex justify-between mb-1">
                      <label className="text-xs text-gray-600">Letter spacing</label>
                      <span className="text-xs text-gray-500">{letterSpacing}px</span>
                    </div>
                    <input 
                      type="range" 
                      min="0" 
                      max="5" 
                      step="0.5" 
                      value={letterSpacing}
                      onChange={(e) => setLetterSpacing(parseFloat(e.target.value))}
                      className="w-full h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-[#3D6E4E]"
                    />
                  </div>
                  <div>
                    <div className="flex justify-between mb-1">
                      <label className="text-xs text-gray-600">Word spacing</label>
                      <span className="text-xs text-gray-500">{wordSpacing}px</span>
                    </div>
                    <input 
                      type="range" 
                      min="0" 
                      max="10" 
                      step="1" 
                      value={wordSpacing}
                      onChange={(e) => setWordSpacing(parseFloat(e.target.value))}
                      className="w-full h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-[#3D6E4E]"
                    />
                  </div>
                  <div>
                    <div className="flex justify-between mb-1">
                      <label className="text-xs text-gray-600">Line height</label>
                      <span className="text-xs text-gray-500">{lineHeight.toFixed(1)}</span>
                    </div>
                    <input 
                      type="range" 
                      min="1" 
                      max="3" 
                      step="0.1" 
                      value={lineHeight}
                      onChange={(e) => setLineHeight(parseFloat(e.target.value))}
                      className="w-full h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-[#3D6E4E]"
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
                className="flex items-center justify-between w-full text-gray-700 hover:text-[#3D6E4E] transition-colors"
              >
                <span className="text-base">Tinted Background Colour</span>
                <NullIcon className="w-5 h-5 text-gray-900" />
              </button>

              {/* Color Grid Popover */}
              {showTintPicker && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl shadow-lg border border-[#e5e7eb] p-4 z-50">
                  <div className="grid grid-cols-5 gap-2">
                    {TINT_COLORS.map((tint) => (
                      <button
                        key={tint.id}
                        onClick={() => setBackgroundTint(tint.id)}
                        className={`w-8 h-8 rounded-full transition-transform hover:scale-110 ${
                          backgroundTint === tint.id ? 'ring-2 ring-[#3D6E4E] ring-offset-2' : ''
                        }`}
                        style={{ backgroundColor: tint.color }}
                        title={tint.id}
                      />
                    ))}
                  </div>
                  {/* No color option */}
                  <button
                    onClick={() => setBackgroundTint('none')}
                    className={`mt-3 w-8 h-8 rounded-full border-2 border-gray-300 flex items-center justify-center transition-transform hover:scale-110 ${
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
          <div className="relative" ref={exportMenuRef}>
            <button
              onClick={() => setShowExportMenu(!showExportMenu)}
              className="w-full bg-[#3D6E4E] text-white py-3 rounded-full flex items-center justify-center gap-2 font-medium hover:bg-[#2d5239] transition-colors shadow-md"
            >
              <ExportIcon className="w-5 h-5" />
              <span>Export</span>
            </button>

            {/* Export Menu */}
            {showExportMenu && (
              <div className="absolute bottom-full left-0 right-0 mb-2 bg-white rounded-xl shadow-lg border border-[#e5e7eb] py-2 z-50">
                <button className="w-full flex items-center gap-3 px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 transition-colors">
                  <GoogleDriveIcon className="w-5 h-5" />
                  <span>Export to Google docx</span>
                </button>
                <button className="w-full flex items-center gap-3 px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 transition-colors">
                  <WordIcon className="w-5 h-5" />
                  <span>Download as docx</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Backdrop when tools open */}
      {toolsOpen && (
        <div 
          className="fixed inset-0 bg-black/20 z-30"
          onClick={() => setToolsOpen(false)}
        />
      )}
    </div>
  );
}
