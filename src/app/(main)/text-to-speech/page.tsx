'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Icon } from '@/components/Icon';
import { toast } from 'sonner';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { useAuthStore } from '@/store/authStore';
import { FeatureHeader } from '@/components/FeatureHeader';

// Voice options type
interface VoiceOption {
  id: string;
  name: string;
  lang: string;
}

// Speed options
const speedOptions = [
  { value: '0.5', label: '0.5x' },
  { value: '0.75', label: '0.75x' },
  { value: '1', label: '1.0x' },
  { value: '1.25', label: '1.25x' },
  { value: '1.5', label: '1.5x' },
  { value: '2', label: '2.0x' },
];

// Reading options
const readingOptions = [
  { value: 'word', label: 'Word by Word' },
  { value: 'line', label: 'Line by Line' },
  { value: 'paragraph', label: 'Paragraph' },
];

// Tinted background colors
const tintedColors = [
  '#FFF9E6', // Light yellow (default)
  '#FFF5E6', // Cream
  '#F0F7F1', // Light sage
  '#E8F4F8', // Light blue
  '#F5E6FF', // Light purple
  '#FFE6F0', // Light pink
  '#E6F5FF', // Light cyan
  '#F5F5DC', // Beige
  '#F0E6D3', // Tan
  '#E6D3C0', // Light brown
  '#D3C0E6', // Lavender
  '#C0E6D3', // Mint
  '#E6C0D3', // Rose
  '#C0D3E6', // Powder blue
  '#D3E6C0', // Pale green
  '#FFFFFF', // White
];

// Highlight colors
const highlightColors = [
  '#C8B5FF', // Light purple (default)
  '#FFB5B5', // Light red
  '#B5FFB5', // Light green
  '#B5D4FF', // Light blue
  '#FFE4B5', // Light orange
  '#FFB5E4', // Light pink
  '#E4FFB5', // Light lime
  '#B5FFE4', // Light cyan
  '#FFD700', // Gold
  '#FFA500', // Orange
  '#87CEEB', // Sky blue
  '#98FB98', // Pale green
  '#DDA0DD', // Plum
  '#F0E68C', // Khaki
  '#FFB6C1', // Light pink
  '#20B2AA', // Light sea green
];

// Sample document content
const sampleDocument = {
  title: 'Early Life and Artistic Failure',
  content: `Adolf Hitler's life remains one of the most studied and scrutinized periods in modern history, marking the transition from a failed artist to the architect of a global catastrophe.

Early Life and Artistic Failure

Adolf Hitler was born on April 20, 1889, in the small Austrian town of Braunau am Inn. His early years were shaped by a difficult relationship with his strict father and a deep devotion to his mother. In 1907, he moved to Vienna with dreams of becoming an artist. However, he was twice rejected by the Academy of Fine Arts. During his years of poverty in Vienna, he began to adopt the extreme nationalist and antisemitic ideologies that would later define his regime.`,
};

export default function TextToSpeechPage() {
  const { user } = useAuthStore();
  const [currentStep, setCurrentStep] = useState<'upload' | 'processing' | 'reading'>('upload');
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentWordIndex, setCurrentWordIndex] = useState(-1);
  const [words, setWords] = useState<string[]>([]);
  
  // Settings
  const [selectedVoice, setSelectedVoice] = useState<string>('Alex');
  const [speed, setSpeed] = useState<string>('1');
  const [readingMode, setReadingMode] = useState<string>('word');
  const [dimSurrounding, setDimSurrounding] = useState(false);
  const [tintedBgEnabled, setTintedBgEnabled] = useState(false);
  const [tintedBgColor, setTintedBgColor] = useState('#FFF9E6');
  const [highlightEnabled, setHighlightEnabled] = useState(true);
  const [highlightColor, setHighlightColor] = useState('#C8B5FF');
  
  // Refs
  const fileInputRef = useRef<HTMLInputElement>(null);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);
  const [dragging, setDragging] = useState(false);
  const [voices, setVoices] = useState<VoiceOption[]>([]);

  // Load available voices
  useEffect(() => {
    const loadVoices = () => {
      const availableVoices = window.speechSynthesis.getVoices();
      const voiceOptions: VoiceOption[] = availableVoices.map((v, i) => ({
        id: `${v.name}-${i}`,
        name: v.name,
        lang: v.lang,
      }));
      setVoices(voiceOptions);
      if (voiceOptions.length > 0 && !selectedVoice) {
        setSelectedVoice(voiceOptions[0].id);
      }
    };
    
    loadVoices();
    window.speechSynthesis.onvoiceschanged = loadVoices;
    
    // Parse words from sample document
    setWords(sampleDocument.content.split(/\s+/));
  }, []);

  // Drag and drop handlers
  const onDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragging(true);
  }, []);

  const onDragLeave = useCallback(() => {
    setDragging(false);
  }, []);

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFileUpload(file);
  }, []);

  const handleFileUpload = (file: File) => {
    const allowedTypes = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'text/plain',
      'image/',
    ];
    const isAllowed = allowedTypes.some(
      (type) => file.type === type || (type.endsWith('/') && file.type.startsWith(type))
    );

    if (!isAllowed) {
      toast.error('Please upload a PDF, DOC, TXT, or image file');
      return;
    }

    if (file.size > 25 * 1024 * 1024) {
      toast.error('File size must be less than 25MB');
      return;
    }

    setUploadedFile(file);
    toast.success(`File "${file.name}" uploaded successfully`);
  };

  const removeFile = () => {
    setUploadedFile(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleSubmit = () => {
    if (!uploadedFile) {
      toast.error('Please upload a file first');
      return;
    }
    setCurrentStep('reading');
    toast.success('Document loaded successfully');
  };

  const handlePlayPause = () => {
    if (isPlaying) {
      window.speechSynthesis.pause();
      setIsPlaying(false);
    } else {
      if (window.speechSynthesis.paused) {
        window.speechSynthesis.resume();
        setIsPlaying(true);
      } else {
        startSpeech();
      }
    }
  };

  const startSpeech = () => {
    if (!sampleDocument.content) return;

    window.speechSynthesis.cancel();
    
    const utterance = new SpeechSynthesisUtterance(sampleDocument.content);
    utterance.rate = parseFloat(speed);
    utterance.pitch = 1;
    utterance.volume = 1;

    // Find selected voice
    const availableVoices = window.speechSynthesis.getVoices();
    const voice = availableVoices.find((v) => v.name.includes(selectedVoice) || selectedVoice.includes(v.name));
    if (voice) utterance.voice = voice;

    utterance.onstart = () => setIsPlaying(true);
    utterance.onend = () => {
      setIsPlaying(false);
      setCurrentWordIndex(-1);
    };
    utterance.onpause = () => setIsPlaying(false);
    utterance.onresume = () => setIsPlaying(true);
    
    // Word boundary tracking
    utterance.onboundary = (event) => {
      if (event.name === 'word') {
        const charIndex = event.charIndex;
        const textUpToIndex = sampleDocument.content.substring(0, charIndex);
        const wordCount = textUpToIndex.split(/\s+/).filter(w => w.length > 0).length;
        setCurrentWordIndex(wordCount);
      }
    };

    utteranceRef.current = utterance;
    window.speechSynthesis.speak(utterance);
  };

  const handleSkipBack = () => {
    // Restart current utterance
    if (isPlaying) {
      window.speechSynthesis.cancel();
      startSpeech();
    }
  };

  const handleSkipForward = () => {
    // Stop current speech
    window.speechSynthesis.cancel();
    setIsPlaying(false);
    setCurrentWordIndex(-1);
  };

  const handleClose = () => {
    window.speechSynthesis.cancel();
    setIsPlaying(false);
    setCurrentWordIndex(-1);
    setCurrentStep('upload');
    setUploadedFile(null);
  };

  const handleExportAudio = () => {
    toast.info('Export to MP3 feature coming soon!');
  };

  // Render text with highlighting
  const renderHighlightedText = () => {
    if (!highlightEnabled || currentWordIndex < 0) {
      return <span>{sampleDocument.content}</span>;
    }

    const allWords = sampleDocument.content.split(/(\s+)/);
    let wordCounter = 0;

    return (
      <>
        {allWords.map((word, index) => {
          if (word.trim().length === 0) {
            return <span key={index}>{word}</span>;
          }
          
          const isCurrentWord = wordCounter === currentWordIndex;
          wordCounter++;
          
          return (
            <span
              key={index}
              style={{
                backgroundColor: isCurrentWord ? highlightColor : 'transparent',
                padding: isCurrentWord ? '2px 4px' : '0',
                borderRadius: isCurrentWord ? '4px' : '0',
                transition: 'background-color 0.1s ease',
              }}
            >
              {word}
            </span>
          );
        })}
      </>
    );
  };

  // Hex pattern SVG background
  const HexPattern = () => (
    <svg
      className="absolute inset-0 w-full h-full opacity-[0.08] pointer-events-none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <pattern
          id="hex"
          x="0"
          y="0"
          width="56"
          height="48"
          patternUnits="userSpaceOnUse"
        >
          <polygon
            points="14,2 42,2 56,26 42,46 14,46 0,26"
            fill="none"
            stroke="#3D6E4E"
            strokeWidth="1.5"
          />
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill="url(#hex)" />
    </svg>
  );

  return (
    <div className="min-h-screen">
      {/* Header */}
      <div className="flex items-center justify-between mb-6 pt-8">
        <div className="flex flex-col gap-2">
          <h1 className="text-2xl font-bold text-[#1a1a1a]">
            {currentStep === 'upload' ? `Hello, ${user?.name?.split(' ')[0] || 'Victoria'}!` : 'Text to speech Learning Hub'}
          </h1>
          {currentStep === 'upload' && (
            <p className="text-[#5f5f5f]">Pick a tool to get started with</p>
          )}
        </div>
        <FeatureHeader />
      </div>

      {/* Step 1: Upload */}
      {currentStep === 'upload' && (
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
          className="space-y-6 w-full"
        >
          {/* Hero Banner Card - Full Width */}
          <div className="relative overflow-hidden border-0 rounded-2xl bg-[#EBF3FF] shadow-sm w-full">
            <HexPattern />
            <div className="relative z-10 p-4 sm:p-6 lg:p-8 flex flex-col sm:flex-row items-center gap-4 sm:gap-6">
              <div className="flex-shrink-0 w-24 h-20 sm:w-32 sm:h-28 lg:w-40 lg:h-32">
                <img
                  src="/images/reading assitant svg (lady and envelope).svg"
                  alt="Text to Speech Illustration"
                  className="w-full h-full object-contain"
                />
              </div>
              <div className="text-center sm:text-left">
                <h2 className="text-lg sm:text-xl font-bold text-[#1a1a1a] mb-2">
                  Text to speech Learning Hub
                </h2>
                <p className="text-sm sm:text-[15px] text-[#5f5f5f] leading-relaxed max-w-md">
                  Turn text into sound. Sit back, listen & watch the words light up as you learn.
                </p>
              </div>
            </div>
          </div>

          {/* Upload Zone - Full Width */}
          <motion.div
            whileTap={{ scale: 0.99 }}
            className={`rounded-2xl border-2 border-dashed transition-all duration-200 cursor-pointer flex flex-col items-center justify-center py-12 sm:py-16 px-4 sm:px-6 gap-4 sm:gap-5 w-full ${
              dragging
                ? 'border-[#3D6E4E] bg-[#E8F3EA] scale-[1.01]'
                : 'border-[#D4E8D7] bg-[#F0F7F1] hover:border-[#3D6E4E]'
            }`}
            onDragOver={onDragOver}
            onDragLeave={onDragLeave}
            onDrop={onDrop}
            onClick={() => !uploadedFile && fileInputRef.current?.click()}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf,.doc,.docx,.txt,image/*"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) handleFileUpload(file);
              }}
            />
            <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-[#3D6E4E] flex items-center justify-center text-white shadow-lg transition-transform duration-200 active:scale-95">
              <Icon name="upload" size={28} className="sm:w-8 sm:h-8" />
            </div>
            <div className="text-center">
              <p className="text-[#3D6E4E] font-semibold text-sm sm:text-base">
                <span className="font-bold">Click to upload</span> or drag and drop
              </p>
              <p className="text-[#5f5f5f] text-xs sm:text-sm mt-2">
                PDF, DOC, TXT, image (max 25MB)
              </p>
            </div>
          </motion.div>

          {/* File Preview and Submit - Full Width */}
          {uploadedFile && (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-4 w-full"
            >
              <p className="text-[#5f5f5f] text-sm font-medium">Document uploaded</p>
              <div className="flex items-center gap-3 sm:gap-4 bg-white rounded-xl p-3 sm:p-4 shadow-sm border border-[#e5e7eb] w-full max-w-none">
                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg bg-[#E8F3EA] flex items-center justify-center flex-shrink-0">
                  <Icon name="document" size={20} className="text-[#3D6E4E] sm:w-6 sm:h-6" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-[#1a1a1a] truncate">
                    {uploadedFile.name.replace(/\.[^/.]+$/, '')}
                  </p>
                  <p className="text-xs text-[#9ca3af]">
                    {uploadedFile.name.split('.').pop()?.toUpperCase() || 'FILE'}
                  </p>
                </div>
                <motion.button
                  whileTap={{ scale: 0.95 }}
                  onClick={(e) => {
                    e.stopPropagation();
                    removeFile();
                  }}
                  className="p-2.5 text-[#9ca3af] hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors touch-target"
                >
                  <Icon name="close" size={18} />
                </motion.button>
              </div>
              <motion.button
                whileTap={{ scale: 0.98 }}
                onClick={handleSubmit}
                className="w-full bg-[#3D6E4E] text-white font-semibold py-3.5 sm:py-3 px-6 rounded-full hover:bg-[#2d5a3d] transition-colors shadow-lg shadow-[#3D6E4E]/20 active:scale-[0.98] touch-target"
              >
                Submit
              </motion.button>
            </motion.div>
          )}
        </motion.div>
      )}

      {/* Step 2: Reading Interface */}
      {currentStep === 'reading' && (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
          className="flex flex-col lg:flex-row gap-4 sm:gap-6 relative"
        >
          {/* Main Content Area */}
          <div className="flex-1 min-w-0">
            <div
              className="rounded-2xl p-6 transition-colors duration-300"
              style={{
                backgroundColor: tintedBgEnabled ? tintedBgColor : '#F8F9FA',
              }}
            >
              {/* Audio Controls Bar */}
              <div className="flex items-center justify-between mb-6 bg-white rounded-xl p-3 shadow-sm">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-[#E8F3EA] flex items-center justify-center">
                    <Icon name="document" size={20} className="text-[#3D6E4E]" />
                  </div>
                  <span className="text-sm font-medium text-[#1a1a1a] truncate max-w-[200px]">
                    {uploadedFile?.name || 'History of Hitler.pdf'}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleSkipBack}
                    className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors"
                  >
                    <Icon name="skip-back" size={20} className="text-[#1a1a1a]" />
                  </button>
                  <button
                    onClick={handlePlayPause}
                    className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors"
                  >
                    <Icon name={isPlaying ? 'pause' : 'play'} size={20} className="text-[#1a1a1a]" />
                  </button>
                  <button
                    onClick={handleSkipForward}
                    className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors"
                  >
                    <Icon name="skip-forward" size={20} className="text-[#1a1a1a]" />
                  </button>
                  <button
                    onClick={handleClose}
                    className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors ml-2"
                  >
                    <Icon name="close" size={20} className="text-[#1a1a1a]" />
                  </button>
                </div>
              </div>

              {/* Document Content */}
              <div
                className="prose prose-sm max-w-none transition-opacity duration-300"
                style={{
                  opacity: dimSurrounding && isPlaying ? 0.4 : 1,
                }}
              >
                <h3 className="text-lg font-bold text-[#1a1a1a] mb-4">
                  {sampleDocument.title}
                </h3>
                <div
                  className="text-[15px] leading-relaxed text-[#1a1a1a] whitespace-pre-wrap"
                  style={{
                    opacity: dimSurrounding && isPlaying ? 0.3 : 1,
                  }}
                >
                  {renderHighlightedText()}
                </div>
              </div>
            </div>
          </div>

          {/* Tools Panel - With proper isolation */}
          <div className="w-full lg:w-72 flex-shrink-0 relative" style={{ isolation: 'isolate' }}>
            <div className="bg-white rounded-2xl p-5 shadow-sm border border-[#e5e7eb]">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-[#3D6E4E]">Tools</h3>
                <div className="flex items-center gap-2">
                  <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                    <Icon name="bookmark" size={20} className="text-[#5f5f5f]" />
                  </button>
                  <button className="w-8 h-8 flex items-center justify-center bg-[#3D6E4E] rounded-full hover:bg-[#2d5a3d] transition-colors">
                    <Icon name="chevron-right" size={16} className="text-white" />
                  </button>
                </div>
              </div>

              <div className="space-y-4">
                {/* Voice Option */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-[#5f5f5f]">Voice Option</label>
                  <Select value={selectedVoice} onValueChange={setSelectedVoice}>
                    <SelectTrigger className="w-full bg-white border-gray-200 rounded-xl h-11 text-sm">
                      <SelectValue placeholder="Select voice" />
                    </SelectTrigger>
                    <SelectContent side="bottom" align="start" sideOffset={4}>
                      {voices.length > 0 ? (
                        voices.map((voice) => (
                          <SelectItem key={voice.id} value={voice.id}>
                            {voice.name}
                          </SelectItem>
                        ))
                      ) : (
                        <>
                          <SelectItem value="Alex">Alex</SelectItem>
                          <SelectItem value="Nadia">Nadia</SelectItem>
                          <SelectItem value="Jake">Jake</SelectItem>
                        </>
                      )}
                    </SelectContent>
                  </Select>
                </div>

                {/* Speed */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-[#5f5f5f]">Speed</label>
                  <Select value={speed} onValueChange={setSpeed}>
                    <SelectTrigger className="w-full bg-white border-gray-200 rounded-xl h-11 text-sm">
                      <SelectValue placeholder="Select speed" />
                    </SelectTrigger>
                    <SelectContent side="bottom" align="start" sideOffset={4}>
                      {speedOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Reading Options */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-[#5f5f5f]">Reading Options</label>
                  <Select value={readingMode} onValueChange={setReadingMode}>
                    <SelectTrigger className="w-full bg-white border-gray-200 rounded-xl h-11 text-sm">
                      <SelectValue placeholder="Select mode" />
                    </SelectTrigger>
                    <SelectContent side="bottom" align="start" sideOffset={4}>
                      {readingOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Dim Surrounding Text Toggle */}
                <div className="flex items-center justify-between py-2">
                  <span className="text-sm font-medium text-[#5f5f5f]">Dim Surrounding Text</span>
                  <Switch
                    checked={dimSurrounding}
                    onCheckedChange={setDimSurrounding}
                    className="data-[state=checked]:bg-[#3D6E4E]"
                  />
                </div>

                {/* Tinted Background Colour */}
                <div className="flex items-center justify-between py-2">
                  <span className="text-sm font-medium text-[#5f5f5f]">Tinted Background Colour</span>
                  <div className="flex items-center gap-2">
                    <Popover>
                      <PopoverTrigger asChild>
                        <button
                          className="w-6 h-6 rounded-full border-2 border-gray-200 shadow-sm"
                          style={{ backgroundColor: tintedBgColor }}
                        />
                      </PopoverTrigger>
                      <PopoverContent 
                        className="w-64 p-3 bg-white border border-gray-200 shadow-xl" 
                        align="end"
                        side="bottom"
                        sideOffset={4}
                      >
                        <div className="grid grid-cols-5 gap-2">
                          {tintedColors.map((color) => (
                            <button
                              key={color}
                              onClick={() => {
                                setTintedBgColor(color);
                                setTintedBgEnabled(true);
                              }}
                              className={`w-8 h-8 rounded-full border-2 transition-all hover:scale-110 ${
                                tintedBgColor === color ? 'border-[#3D6E4E] ring-2 ring-[#3D6E4E]/20' : 'border-gray-200'
                              }`}
                              style={{ backgroundColor: color }}
                            />
                          ))}
                        </div>
                        <div className="mt-3 flex items-center justify-between pt-2 border-t border-gray-100">
                          <span className="text-xs text-[#5f5f5f]">Enable tint</span>
                          <Switch
                            checked={tintedBgEnabled}
                            onCheckedChange={setTintedBgEnabled}
                            className="data-[state=checked]:bg-[#3D6E4E]"
                          />
                        </div>
                      </PopoverContent>
                    </Popover>
                  </div>
                </div>

                {/* Highlight Colour */}
                <div className="flex items-center justify-between py-2">
                  <span className="text-sm font-medium text-[#5f5f5f]">Highlight Colour</span>
                  <div className="flex items-center gap-2">
                    <Popover>
                      <PopoverTrigger asChild>
                        <button
                          className="w-6 h-6 rounded-full border-2 border-gray-200 shadow-sm"
                          style={{ backgroundColor: highlightColor }}
                        />
                      </PopoverTrigger>
                      <PopoverContent 
                        className="w-64 p-3 bg-white border border-gray-200 shadow-xl" 
                        align="end"
                        side="bottom"
                        sideOffset={4}
                      >
                        <div className="grid grid-cols-5 gap-2">
                          {highlightColors.map((color) => (
                            <button
                              key={color}
                              onClick={() => {
                                setHighlightColor(color);
                                setHighlightEnabled(true);
                              }}
                              className={`w-8 h-8 rounded-full border-2 transition-all hover:scale-110 ${
                                highlightColor === color ? 'border-[#3D6E4E] ring-2 ring-[#3D6E4E]/20' : 'border-gray-200'
                              }`}
                              style={{ backgroundColor: color }}
                            />
                          ))}
                        </div>
                        <div className="mt-3 flex items-center justify-between pt-2 border-t border-gray-100">
                          <span className="text-xs text-[#5f5f5f]">Enable highlight</span>
                          <Switch
                            checked={highlightEnabled}
                            onCheckedChange={setHighlightEnabled}
                            className="data-[state=checked]:bg-[#3D6E4E]"
                          />
                        </div>
                      </PopoverContent>
                    </Popover>
                  </div>
                </div>

                {/* Export Audio Button */}
                <button
                  onClick={handleExportAudio}
                  className="w-full mt-4 bg-[#3D6E4E] text-white font-semibold py-3 px-6 rounded-full hover:bg-[#2d5a3d] transition-colors shadow-lg shadow-[#3D6E4E]/20 flex items-center justify-center gap-2"
                >
                  <Icon name="download" size={18} />
                  Export Audio (MP3)
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
}
