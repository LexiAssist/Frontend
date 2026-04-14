'use client';

import { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FeatureHeader } from '@/components/FeatureHeader';
import { toast } from 'sonner';
import { useAuthStore } from '@/store/authStore';
import { writingApi } from '@/services/api';
import { 
  Mic, 
  Square, 
  Wand2, 
  Copy, 
  Check, 
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  Type,
  AlignJustify,
  Palette,
  Download,
  Info,
  X,
  FileText
} from 'lucide-react';

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

// Sample text content (educational example)
const SAMPLE_TEXT = `Machine Learning: A Comprehensive Introduction

Machine learning is a subset of artificial intelligence that enables computer systems to automatically learn and improve from experience without being explicitly programmed. The field has seen tremendous growth in recent years, transforming industries from healthcare to finance.

Key Concepts and Applications

At its core, machine learning involves algorithms that can identify patterns in data and make predictions or decisions based on those patterns. Supervised learning uses labeled training data to teach models, while unsupervised learning discovers hidden patterns in unlabeled data. Reinforcement learning, inspired by behavioral psychology, allows agents to learn optimal behaviors through trial and error.

Applications are widespread and growing daily. Recommendation systems power platforms like Netflix and Spotify. Computer vision enables self-driving cars and medical image analysis. Natural language processing drives virtual assistants and translation services. As computational power increases and datasets grow, machine learning continues to push the boundaries of what computers can accomplish.`;

export default function WritingAssistantPage() {
  // State
  const [toolsOpen, setToolsOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [fontChoice, setFontChoice] = useState<FontChoice>('roboto');
  const [showFontDropdown, setShowFontDropdown] = useState(false);
  const [showSpacingDropdown, setShowSpacingDropdown] = useState(false);
  const [showTintPicker, setShowTintPicker] = useState(false);
  const [backgroundTint, setBackgroundTint] = useState<BackgroundTint>('none');
  const [letterSpacing, setLetterSpacing] = useState(0);
  const [wordSpacing, setWordSpacing] = useState(0);
  const [lineHeight, setLineHeight] = useState(1.6);
  const [showSpacingPanel, setShowSpacingPanel] = useState(false);

  // AI Backend Integration State
  const { user } = useAuthStore();
  const [isRecording, setIsRecording] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [sessionId, setSessionId] = useState<string | undefined>(undefined);
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const isRecordingRef = useRef(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Refs for click outside handling
  const fontDropdownRef = useRef<HTMLDivElement>(null);
  const spacingDropdownRef = useRef<HTMLDivElement>(null);
  const tintPickerRef = useRef<HTMLDivElement>(null);

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
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Copy to clipboard handler
  const handleCopy = () => {
    navigator.clipboard.writeText(transcript || SAMPLE_TEXT);
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
    if (backgroundTint === 'none') return '#ffffff';
    return TINT_COLORS.find(t => t.id === backgroundTint)?.color || '#ffffff';
  };

  const sendChunk = async (blob: Blob) => {
    try {
      const res = await writingApi.transcribe(blob, 'en', sessionId);
      const reader = res.body?.getReader();
      if (!reader) return;

      const decoder = new TextDecoder();
      let done = false;
      let newSid = sessionId;
      
      while (!done) {
        const { value, done: doneReading } = await reader.read();
        done = doneReading;
        if (value) {
          const chunkString = decoder.decode(value, { stream: true });
          const messages = chunkString.split('\n\n');
          for (const msg of messages) {
             if (msg.includes('session_id:')) {
                const match = msg.match(/session_id:\s*(.+)/);
                if (match && !newSid) {
                  newSid = match[1].trim();
                  setSessionId(newSid);
                }
             } else if (msg.startsWith('data: ') && !msg.includes('[DONE]')) {
                const text = msg.substring(6);
                if (text.trim()) {
                   setTranscript(prev => prev + text);
                }
             }
          }
        }
      }
    } catch(err) {
      console.error(err);
    }
  };

  const recordNextChunk = () => {
     if (!isRecordingRef.current || !streamRef.current) return;
     
     const mr = new MediaRecorder(streamRef.current, { mimeType: 'audio/webm' });
     mr.ondataavailable = async (e) => {
       if (e.data.size > 0) {
          await sendChunk(e.data);
       }
     };
     mr.start();
     
     timeoutRef.current = setTimeout(() => {
       if (mr.state === 'recording') {
         mr.stop();
       }
       if (isRecordingRef.current) {
         recordNextChunk();
       }
     }, 10000);
  };

  const startRecording = async () => {
    if (!user) {
      toast.error('You must be logged in to use the writing assistant');
      return;
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      isRecordingRef.current = true;
      setIsRecording(true);
      toast.success("Recording started");
      recordNextChunk();
    } catch (err) {
      toast.error('Failed to access microphone');
    }
  };

  const stopRecording = () => {
    isRecordingRef.current = false;
    setIsRecording(false);
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(t => t.stop());
      streamRef.current = null;
    }
  };

  const handleGenerateNotes = async () => {
    if (!transcript || !sessionId || !user) {
      toast.error('No transcription to process');
      return;
    }
    setIsProcessing(true);
    try {
      const response = await writingApi.generateNotes(sessionId, transcript, 'Meeting Notes', user.id);
      setTranscript(response.structured_notes);
      toast.success('Notes processed and structured');
    } catch(err) {
      toast.error('Failed to generate structured notes');
    } finally {
      setIsProcessing(false);
    }
  };

  const renderText = () => {
    if (transcript) {
       return <>{transcript}</>;
    }
    const parts = SAMPLE_TEXT.split('without being explicitly programmed');
    return (
      <>
        {parts[0]}
        <span className="bg-amber-200 px-1 rounded">without being explicitly programmed</span>
        {parts[1]}
      </>
    );
  };

  const activeTintColor = TINT_COLORS.find(t => t.id === backgroundTint)?.color;

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="min-h-full pb-12"
    >
      {/* Header */}
      <div className="flex items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl sm:text-3xl font-semibold text-slate-900 tracking-tight">Writing Assistant</h1>
          <p className="text-slate-500 mt-1 text-sm">Dictate, refine, and structure your thoughts effortlessly.</p>
        </div>
        <FeatureHeader />
      </div>

      {/* Editor + Tools Layout */}
      <div className="flex flex-col lg:flex-row gap-6 lg:gap-8">
        {/* Main Editor */}
        <div className="flex-1 min-w-0">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            {/* Toolbar */}
            <div className="flex flex-wrap items-center justify-between gap-4 px-6 py-4 border-b border-slate-100 bg-white">
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-50 text-amber-700 text-xs font-medium border border-amber-100">
                  <Info className="w-3.5 h-3.5" />
                  Low confidence word detected
                </span>
              </div>

              <div className="flex items-center gap-3">
                {isRecording ? (
                  <button 
                    onClick={stopRecording} 
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-red-50 text-red-600 text-sm font-medium border border-red-100 hover:bg-red-100 transition-colors"
                  >
                    <span className="relative flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
                    </span>
                    Stop Recording
                  </button>
                ) : (
                  <button 
                    onClick={startRecording}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-slate-900 text-white text-sm font-medium hover:bg-slate-800 transition-colors"
                  >
                    <Mic className="w-4 h-4" />
                    Start Recording
                  </button>
                )}

                <button 
                  onClick={handleGenerateNotes}
                  disabled={!transcript || isProcessing}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-[#3D6E4E] text-white text-sm font-medium hover:bg-[#345e43] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <Wand2 className="w-4 h-4" />
                  {isProcessing ? 'Structuring…' : 'Clean & Structure'}
                </button>
              </div>
            </div>

            {/* Document Content */}
            <div 
              className="px-6 sm:px-10 py-8 sm:py-10 min-h-[420px] transition-colors duration-200"
              style={{ backgroundColor: getBackgroundColor() }}
            >
              <div 
                className="max-w-3xl mx-auto writing-content"
                style={{ 
                  fontFamily: getFontFamily(),
                  letterSpacing: `${letterSpacing}px`,
                  wordSpacing: `${wordSpacing}px`,
                  lineHeight: lineHeight,
                  WebkitFontSmoothing: 'antialiased',
                  MozOsxFontSmoothing: 'grayscale',
                  textRendering: 'optimizeLegibility'
                }}
              >
                <h2 className="text-xl font-semibold text-slate-900 mb-6 tracking-tight">Early Life and Artistic Failure</h2>
                <div className="text-slate-800 text-[15px] leading-7 whitespace-pre-line">
                  {renderText()}
                </div>
              </div>
            </div>

            {/* Footer actions */}
            <div className="flex items-center justify-between gap-4 px-6 py-4 border-t border-slate-100 bg-white">
              <div className="text-xs text-slate-500">
                {transcript ? `${transcript.length} characters` : `${SAMPLE_TEXT.length} characters`}
              </div>
              <button
                onClick={handleCopy}
                className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium border transition-all ${
                  copied 
                    ? 'bg-[#3D6E4E] text-white border-[#3D6E4E]' 
                    : 'bg-white text-slate-700 border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                }`}
              >
                {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                {copied ? 'Copied' : 'Copy to Clipboard'}
              </button>
            </div>
          </div>
        </div>

        {/* Tools Panel - Desktop always visible, Mobile drawer */}
        <div className={`
          fixed inset-y-0 right-0 z-40 w-80 bg-white border-l border-slate-200 shadow-xl transform transition-transform duration-300 ease-out
          lg:static lg:transform-none lg:shadow-none lg:w-80 lg:rounded-2xl lg:border lg:border-slate-200 lg:h-fit
          ${toolsOpen ? 'translate-x-0' : 'translate-x-full lg:translate-x-0'}
        `}>
          <div className="h-full lg:h-auto flex flex-col p-6">
            {/* Mobile drawer header */}
            <div className="flex items-center justify-between mb-6 lg:hidden">
              <h2 className="text-lg font-semibold text-slate-900">Tools</h2>
              <button 
                onClick={() => setToolsOpen(false)}
                className="p-2 rounded-lg hover:bg-slate-100 text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Desktop panel header */}
            <div className="hidden lg:flex items-center gap-2 mb-6">
              <div className="p-2 rounded-lg bg-[#E8F3EA] text-[#3D6E4E]">
                <Type className="w-4 h-4" />
              </div>
              <h2 className="text-lg font-semibold text-slate-900">Formatting Tools</h2>
            </div>

            <div className="space-y-6">
              {/* Font Choice */}
              <div className="relative" ref={fontDropdownRef}>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">Font</label>
                <button
                  onClick={() => {
                    setShowFontDropdown(!showFontDropdown);
                    setShowSpacingDropdown(false);
                    setShowTintPicker(false);
                  }}
                  className="flex items-center justify-between w-full px-3 py-2.5 rounded-lg border border-slate-200 bg-white text-sm text-slate-700 hover:border-slate-300 transition-colors"
                >
                  <span className="capitalize">{fontChoice === 'opendyslexic' ? 'OpenDyslexic' : fontChoice === 'roboto' ? 'Roboto' : 'System Default'}</span>
                  <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${showFontDropdown ? 'rotate-180' : ''}`} />
                </button>

                {showFontDropdown && (
                  <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl shadow-lg border border-slate-100 py-1.5 z-20">
                    {(['default', 'opendyslexic', 'roboto'] as FontChoice[]).map((font) => (
                      <button
                        key={font}
                        onClick={() => { setFontChoice(font); setShowFontDropdown(false); }}
                        className={`w-full text-left px-3 py-2 text-sm transition-colors ${
                          fontChoice === font 
                            ? 'bg-[#E8F3EA] text-[#3D6E4E] font-medium' 
                            : 'text-slate-700 hover:bg-slate-50'
                        }`}
                      >
                        {font === 'opendyslexic' ? 'OpenDyslexic' : font === 'roboto' ? 'Roboto' : 'System Default'}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Spacing */}
              <div className="relative" ref={spacingDropdownRef}>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">Spacing</label>
                <button
                  onClick={() => {
                    setShowSpacingDropdown(!showSpacingDropdown);
                    setShowFontDropdown(false);
                    setShowTintPicker(false);
                  }}
                  className="flex items-center justify-between w-full px-3 py-2.5 rounded-lg border border-slate-200 bg-white text-sm text-slate-700 hover:border-slate-300 transition-colors"
                >
                  <span>Adjust spacing</span>
                  <AlignJustify className="w-4 h-4 text-slate-400" />
                </button>

                {showSpacingDropdown && (
                  <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl shadow-lg border border-slate-100 py-1.5 z-20">
                    {(['letter', 'word', 'line'] as SpacingOption[]).map((option) => (
                      <button
                        key={option}
                        onClick={() => { 
                          setShowSpacingDropdown(false);
                          setShowSpacingPanel(true);
                        }}
                        className="w-full flex items-center justify-between px-3 py-2 text-sm text-slate-700 hover:bg-slate-50 transition-colors"
                      >
                        <span className="capitalize">{option} spacing</span>
                        <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
                      </button>
                    ))}
                  </div>
                )}

                {showSpacingPanel && (
                  <div className="mt-3 p-4 rounded-xl border border-slate-100 bg-slate-50">
                    <div className="flex items-center justify-between mb-4">
                      <span className="text-sm font-medium text-slate-700">Spacing controls</span>
                      <button 
                        onClick={() => setShowSpacingPanel(false)}
                        className="text-xs text-slate-500 hover:text-slate-700"
                      >
                        Hide
                      </button>
                    </div>
                    <div className="space-y-4">
                      <div>
                        <div className="flex justify-between mb-1.5">
                          <label className="text-xs text-slate-600 font-medium">Letter spacing</label>
                          <span className="text-xs text-slate-500">{letterSpacing}px</span>
                        </div>
                        <input 
                          type="range" 
                          min="0" 
                          max="5" 
                          step="0.5" 
                          value={letterSpacing}
                          onChange={(e) => setLetterSpacing(parseFloat(e.target.value))}
                          className="w-full h-1.5 bg-slate-200 rounded-full appearance-none cursor-pointer accent-[#3D6E4E]"
                        />
                      </div>
                      <div>
                        <div className="flex justify-between mb-1.5">
                          <label className="text-xs text-slate-600 font-medium">Word spacing</label>
                          <span className="text-xs text-slate-500">{wordSpacing}px</span>
                        </div>
                        <input 
                          type="range" 
                          min="0" 
                          max="10" 
                          step="1" 
                          value={wordSpacing}
                          onChange={(e) => setWordSpacing(parseFloat(e.target.value))}
                          className="w-full h-1.5 bg-slate-200 rounded-full appearance-none cursor-pointer accent-[#3D6E4E]"
                        />
                      </div>
                      <div>
                        <div className="flex justify-between mb-1.5">
                          <label className="text-xs text-slate-600 font-medium">Line height</label>
                          <span className="text-xs text-slate-500">{lineHeight.toFixed(1)}</span>
                        </div>
                        <input 
                          type="range" 
                          min="1" 
                          max="3" 
                          step="0.1" 
                          value={lineHeight}
                          onChange={(e) => setLineHeight(parseFloat(e.target.value))}
                          className="w-full h-1.5 bg-slate-200 rounded-full appearance-none cursor-pointer accent-[#3D6E4E]"
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Tinted Background Colour */}
              <div className="relative" ref={tintPickerRef}>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">Background Tint</label>
                <button
                  onClick={() => {
                    setShowTintPicker(!showTintPicker);
                    setShowFontDropdown(false);
                    setShowSpacingDropdown(false);
                  }}
                  className="flex items-center justify-between w-full px-3 py-2.5 rounded-lg border border-slate-200 bg-white text-sm text-slate-700 hover:border-slate-300 transition-colors"
                >
                  <span className="capitalize">{backgroundTint === 'none' ? 'No tint' : backgroundTint}</span>
                  <div 
                    className="w-4 h-4 rounded-full border border-slate-200"
                    style={{ backgroundColor: activeTintColor || '#ffffff' }}
                  />
                </button>

                {showTintPicker && (
                  <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl shadow-lg border border-slate-100 p-4 z-20">
                    <div className="grid grid-cols-5 gap-2">
                      <button
                        onClick={() => setBackgroundTint('none')}
                        className={`w-8 h-8 rounded-full border-2 border-slate-300 flex items-center justify-center transition-all ${
                          backgroundTint === 'none' ? 'ring-2 ring-[#3D6E4E] ring-offset-2' : 'hover:scale-105'
                        }`}
                        title="No tint"
                      >
                        <span className="block w-3 h-0.5 bg-slate-400 rounded-full" />
                      </button>
                      {TINT_COLORS.map((tint) => (
                        <button
                          key={tint.id}
                          onClick={() => setBackgroundTint(tint.id)}
                          className={`w-8 h-8 rounded-full transition-all ${
                            backgroundTint === tint.id ? 'ring-2 ring-[#3D6E4E] ring-offset-2' : 'hover:scale-105'
                          }`}
                          style={{ backgroundColor: tint.color }}
                          title={tint.id}
                        />
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="mt-8 pt-6 border-t border-slate-100">
              <button
                className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-white border border-slate-200 text-slate-700 text-sm font-medium hover:bg-slate-50 hover:border-slate-300 transition-colors"
              >
                <Download className="w-4 h-4" />
                Export Document
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile toggle + backdrop */}
      <div className="lg:hidden">
        {!toolsOpen && (
          <button
            onClick={() => setToolsOpen(true)}
            className="fixed right-4 bottom-6 z-30 inline-flex items-center gap-2 px-4 py-3 rounded-full bg-[#3D6E4E] text-white text-sm font-medium shadow-lg hover:bg-[#345e43] active:scale-95 transition-colors"
          >
            <Palette className="w-4 h-4" />
            Tools
          </button>
        )}
        {toolsOpen && (
          <div 
            className="fixed inset-0 bg-black/20 z-30 transition-opacity"
            onClick={() => setToolsOpen(false)}
          />
        )}
      </div>
    </motion.div>
  );
}
