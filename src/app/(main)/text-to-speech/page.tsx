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
import { audioApi } from '@/services/api';

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

// No sample document - user must upload their own file

export default function TextToSpeechPage() {
  const { user } = useAuthStore();
  const [currentStep, setCurrentStep] = useState<'upload' | 'processing' | 'reading'>('upload');
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [extractedText, setExtractedText] = useState<string>('');
  const [documentTitle, setDocumentTitle] = useState<string>('');
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentWordIndex, setCurrentWordIndex] = useState(-1);
  const [words, setWords] = useState<string[]>([]);
  
  // Settings
  const [selectedVoice, setSelectedVoice] = useState<string>('en');
  const [speed, setSpeed] = useState<string>('1');
  const [readingMode, setReadingMode] = useState<string>('word');
  const [dimSurrounding, setDimSurrounding] = useState(false);
  const [tintedBgEnabled, setTintedBgEnabled] = useState(false);
  const [tintedBgColor, setTintedBgColor] = useState('#FFF9E6');
  const [highlightEnabled, setHighlightEnabled] = useState(true);
  const [highlightColor, setHighlightColor] = useState('#C8B5FF');
  
  // Refs
  const fileInputRef = useRef<HTMLInputElement>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [dragging, setDragging] = useState(false);
  const [voices, setVoices] = useState<VoiceOption[]>([]);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [previewAudio, setPreviewAudio] = useState<HTMLAudioElement | null>(null);
  const [previewAudioUrl, setPreviewAudioUrl] = useState<string | null>(null);
  const [previewingVoice, setPreviewingVoice] = useState<string | null>(null);
  const [lastTtsRequest, setLastTtsRequest] = useState<number>(0);

  // Load available voices (gTTS supported languages with accents)
  useEffect(() => {
    const gttsVoices: VoiceOption[] = [
      // English variants
      { id: 'en', name: 'English (US)', lang: 'en' },
      { id: 'en-uk', name: 'English (UK)', lang: 'en-uk' },
      { id: 'en-au', name: 'English (Australia)', lang: 'en-au' },
      { id: 'en-in', name: 'English (India)', lang: 'en-in' },
      { id: 'en-ca', name: 'English (Canada)', lang: 'en-ca' },
      
      // European languages
      { id: 'es', name: 'Spanish (Spain)', lang: 'es' },
      { id: 'es-us', name: 'Spanish (Mexico)', lang: 'es-us' },
      { id: 'fr', name: 'French (France)', lang: 'fr' },
      { id: 'fr-ca', name: 'French (Canada)', lang: 'fr-ca' },
      { id: 'de', name: 'German', lang: 'de' },
      { id: 'it', name: 'Italian', lang: 'it' },
      { id: 'pt', name: 'Portuguese (Portugal)', lang: 'pt' },
      { id: 'pt-br', name: 'Portuguese (Brazil)', lang: 'pt-br' },
      { id: 'nl', name: 'Dutch', lang: 'nl' },
      { id: 'pl', name: 'Polish', lang: 'pl' },
      { id: 'tr', name: 'Turkish', lang: 'tr' },
      { id: 'sv', name: 'Swedish', lang: 'sv' },
      { id: 'cs', name: 'Czech', lang: 'cs' },
      { id: 'el', name: 'Greek', lang: 'el' },
      { id: 'hu', name: 'Hungarian', lang: 'hu' },
      { id: 'ro', name: 'Romanian', lang: 'ro' },
      { id: 'da', name: 'Danish', lang: 'da' },
      { id: 'fi', name: 'Finnish', lang: 'fi' },
      { id: 'no', name: 'Norwegian', lang: 'no' },
      { id: 'sk', name: 'Slovak', lang: 'sk' },
      { id: 'bg', name: 'Bulgarian', lang: 'bg' },
      { id: 'hr', name: 'Croatian', lang: 'hr' },
      { id: 'uk', name: 'Ukrainian', lang: 'uk' },
      { id: 'ca', name: 'Catalan', lang: 'ca' },
      
      // Asian languages
      { id: 'ja', name: 'Japanese', lang: 'ja' },
      { id: 'zh', name: 'Chinese (Simplified)', lang: 'zh' },
      { id: 'zh-tw', name: 'Chinese (Traditional)', lang: 'zh-tw' },
      { id: 'ko', name: 'Korean', lang: 'ko' },
      { id: 'th', name: 'Thai', lang: 'th' },
      { id: 'vi', name: 'Vietnamese', lang: 'vi' },
      { id: 'id', name: 'Indonesian', lang: 'id' },
      { id: 'ms', name: 'Malay', lang: 'ms' },
      { id: 'tl', name: 'Filipino', lang: 'tl' },
      { id: 'ta', name: 'Tamil', lang: 'ta' },
      
      // Middle Eastern & African
      { id: 'ar', name: 'Arabic', lang: 'ar' },
      { id: 'iw', name: 'Hebrew', lang: 'iw' },
      { id: 'fa', name: 'Persian', lang: 'fa' },
      { id: 'hi', name: 'Hindi', lang: 'hi' },
      { id: 'bn', name: 'Bengali', lang: 'bn' },
      { id: 'mr', name: 'Marathi', lang: 'mr' },
      { id: 'te', name: 'Telugu', lang: 'te' },
      { id: 'ur', name: 'Urdu', lang: 'ur' },
      { id: 'sw', name: 'Swahili', lang: 'sw' },
      { id: 'af', name: 'Afrikaans', lang: 'af' },
      
      // Slavic & Baltic
      { id: 'ru', name: 'Russian', lang: 'ru' },
      { id: 'sr', name: 'Serbian', lang: 'sr' },
      { id: 'mk', name: 'Macedonian', lang: 'mk' },
      { id: 'sl', name: 'Slovenian', lang: 'sl' },
      { id: 'lt', name: 'Lithuanian', lang: 'lt' },
      { id: 'lv', name: 'Latvian', lang: 'lv' },
      { id: 'et', name: 'Estonian', lang: 'et' },
    ];
    setVoices(gttsVoices);
    if (!selectedVoice) {
      setSelectedVoice('en');
    }
  }, []);
  
  // Cleanup audio URL on unmount
  useEffect(() => {
    return () => {
      if (audioUrl) {
        URL.revokeObjectURL(audioUrl);
      }
      if (previewAudioUrl) {
        URL.revokeObjectURL(previewAudioUrl);
      }
      if (previewAudio) {
        previewAudio.pause();
      }
    };
  }, [audioUrl, previewAudioUrl, previewAudio]);

  // Invalidate cached preview audio when settings or text change
  useEffect(() => {
    if (previewAudio) {
      previewAudio.pause();
      previewAudio.currentTime = 0;
      setPreviewAudio(null);
    }
    if (previewAudioUrl) {
      URL.revokeObjectURL(previewAudioUrl);
      setPreviewAudioUrl(null);
    }
    setPreviewingVoice(null);
  }, [selectedVoice, speed, extractedText]);

  // Invalidate cached main audio when settings or text change
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      audioRef.current = null;
    }
    if (audioUrl) {
      URL.revokeObjectURL(audioUrl);
      setAudioUrl(null);
    }
    setIsPlaying(false);
    setCurrentWordIndex(-1);
  }, [selectedVoice, speed, extractedText]);

  // Preview generated TTS audio
  const handlePreviewAudio = async () => {
    if (!extractedText) {
      toast.error('No text to preview');
      return;
    }
    
    // Rate limit: max 1 request per 3 seconds
    const now = Date.now();
    if (now - lastTtsRequest < 3000) {
      toast.info('Please wait a moment before generating audio again');
      return;
    }
    
    // If already playing preview, stop it
    if (previewAudio && !previewAudio.paused) {
      previewAudio.pause();
      previewAudio.currentTime = 0;
      setPreviewingVoice(null);
      return;
    }
    
    // Stop main audio if playing so preview doesn't overlap
    if (audioRef.current) {
      audioRef.current.pause();
    }

    // If preview already generated, just play it
    if (previewAudioUrl && previewAudio) {
      previewAudio.play();
      setPreviewingVoice('preview');
      return;
    }
    
    setPreviewingVoice('preview');
    setIsGenerating(true);
    setLastTtsRequest(now);
    
    try {
      // Generate TTS for a preview (first 500 characters)
      const previewText = extractedText.slice(0, 500);
      
      const audioBlob = await audioApi.textToSpeech(previewText, selectedVoice, parseFloat(speed) < 1.0);
      
      // Clean up old preview URL before creating new one
      if (previewAudioUrl) {
        URL.revokeObjectURL(previewAudioUrl);
      }
      
      const url = URL.createObjectURL(audioBlob);
      setPreviewAudioUrl(url);
      
      const audio = new Audio(url);
      setPreviewAudio(audio);
      
      audio.onended = () => {
        setPreviewingVoice(null);
      };
      
      audio.onerror = () => {
        setPreviewingVoice(null);
        toast.error('Error playing preview');
      };
      
      audio.playbackRate = parseFloat(speed);
      await audio.play();
      toast.success('Playing preview of document');
      
    } catch (error: any) {
      console.error('Preview error:', error);
      if (error.response?.status === 429) {
        toast.error('Rate limit exceeded. Please wait a few seconds.');
      } else if (error.response?.status === 401) {
        toast.error('Authentication failed. Please log in again.');
      } else {
        toast.error('Failed to generate preview. Please try again.');
      }
      setPreviewingVoice(null);
    } finally {
      setIsGenerating(false);
    }
  };

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

  const extractTextFromFile = async (file: File): Promise<string> => {
    // Only accept text files - PDF/DOCX require backend processing
    if (file.type === 'text/plain' || file.name.endsWith('.txt')) {
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (e) => {
          const content = e.target?.result as string;
          if (!content || content.trim().length === 0) {
            reject(new Error('File is empty'));
            return;
          }
          resolve(content);
        };
        reader.onerror = () => reject(new Error('Failed to read file'));
        reader.readAsText(file);
      });
    }
    
    // Reject other file types - they need backend processing
    throw new Error('Only .txt files are supported for now. PDF/DOCX support coming soon.');
  };

  const handleFileUpload = async (file: File) => {
    // Only allow text files for now
    const isTxtFile = file.type === 'text/plain' || file.name.endsWith('.txt');
    
    if (!isTxtFile) {
      toast.error('Please upload a .txt file. PDF and DOC support coming soon.');
      return;
    }

    if (file.size > 25 * 1024 * 1024) {
      toast.error('File size must be less than 25MB');
      return;
    }

    setUploadedFile(file);
    
    // Extract text from file
    try {
      const text = await extractTextFromFile(file);
      setExtractedText(text);
      setWords(text.split(/\s+/));
      setDocumentTitle(file.name.replace(/\.[^/.]+$/, ''));
      toast.success(`File "${file.name}" loaded successfully (${text.split(/\s+/).length} words)`);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to read file';
      toast.error(message);
      console.error(error);
      setUploadedFile(null);
    }
  };

  const removeFile = () => {
    setUploadedFile(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleSubmit = () => {
    if (!uploadedFile) {
      toast.error('Please upload a .txt file first');
      return;
    }
    if (!extractedText || extractedText.trim().length === 0) {
      toast.error('No text content found in file');
      return;
    }
    setCurrentStep('reading');
    toast.success('Document loaded successfully');
  };

  const handlePlayPause = () => {
    if (isPlaying && audioRef.current) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      if (audioRef.current && audioRef.current.paused) {
        audioRef.current.play();
        setIsPlaying(true);
      } else {
        startSpeech();
      }
    }
  };

  const generateAndPlaySpeech = async () => {
    if (!extractedText || extractedText.trim().length === 0) {
      toast.error('No text to speak. Please upload a file first.');
      return;
    }
    
    // Rate limit: max 1 request per 3 seconds
    const now = Date.now();
    if (now - lastTtsRequest < 3000) {
      toast.info('Please wait a moment before generating audio again');
      return;
    }
    setLastTtsRequest(now);
    
    // Stop current playback
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }

    // Stop preview audio if playing so main audio doesn't overlap
    if (previewAudio) {
      previewAudio.pause();
      previewAudio.currentTime = 0;
      setPreviewingVoice(null);
    }
    
    setIsGenerating(true);
    
    try {
      // Call backend TTS API through the Gateway
      const audioBlob = await audioApi.textToSpeech(extractedText, selectedVoice, parseFloat(speed) < 1.0);
      
      // Create audio URL from blob
      const url = URL.createObjectURL(audioBlob);
      
      // Clean up old URL
      if (audioUrl) {
        URL.revokeObjectURL(audioUrl);
      }
      
      setAudioUrl(url);
      
      // Create and play audio
      const audio = new Audio(url);
      audioRef.current = audio;
      
      audio.onplay = () => setIsPlaying(true);
      audio.onended = () => {
        setIsPlaying(false);
        setCurrentWordIndex(-1);
      };
      audio.onpause = () => setIsPlaying(false);
      audio.onerror = () => {
        toast.error('Error playing audio');
        setIsPlaying(false);
      };
      
      // Play at selected speed
      audio.playbackRate = parseFloat(speed);
      await audio.play();
      
      toast.success('Playing text-to-speech audio');
      
    } catch (error: any) {
      console.error('TTS Error:', error);
      if (error.response?.status === 429) {
        toast.error('Rate limit exceeded. Please wait a few seconds before trying again.');
      } else if (error.response?.status === 401) {
        toast.error('Authentication failed. Please refresh the page and log in again.');
      } else {
        toast.error('Failed to generate speech. Please try again.');
      }
    } finally {
      setIsGenerating(false);
    }
  };
  
  // Legacy function for compatibility
  const startSpeech = () => {
    generateAndPlaySpeech();
  };

  const handleSkipBack = () => {
    // Restart current audio
    if (audioRef.current) {
      audioRef.current.currentTime = 0;
      audioRef.current.play();
      setIsPlaying(true);
    }
  };

  const handleSkipForward = () => {
    // Stop current audio
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
    setIsPlaying(false);
    setCurrentWordIndex(-1);
  };

  const handleClose = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }
    if (audioUrl) {
      URL.revokeObjectURL(audioUrl);
      setAudioUrl(null);
    }
    setIsPlaying(false);
    setCurrentWordIndex(-1);
    setCurrentStep('upload');
    setUploadedFile(null);
  };

  const handleExportAudio = () => {
    // Use main audio URL, or fallback to preview audio URL
    const urlToDownload = audioUrl || previewAudioUrl;
    
    if (!urlToDownload) {
      toast.info('Please generate audio first by clicking Play or Preview');
      return;
    }
    
    try {
      // Generate filename
      const timestamp = new Date().toISOString().slice(0, 19).replace(/:/g, '-');
      const baseName = documentTitle?.trim() || 'text-to-speech';
      const filename = `${baseName.replace(/\s+/g, '_').replace(/[^a-zA-Z0-9_-]/g, '')}_${timestamp}.mp3`;
      
      // Download directly from the blob URL
      const link = document.createElement('a');
      link.href = urlToDownload;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      toast.success(`Downloaded: ${filename}`);
    } catch (error) {
      console.error('Download error:', error);
      toast.error('Failed to download audio. Please try again.');
    }
  };

  // Render text with highlighting
  const renderHighlightedText = () => {
    if (!highlightEnabled || currentWordIndex < 0) {
      return <span>{extractedText}</span>;
    }

    const allWords = extractedText.split(/(\s+)/);
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
            <div className="relative z-10 p-6 sm:p-8 lg:p-10 flex flex-col sm:flex-row items-center gap-6 sm:gap-8">
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
                TXT files only (max 25MB)
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
              <div className="flex items-center gap-3 sm:gap-4 bg-white rounded-2xl p-6 shadow-sm border border-[#e5e7eb] w-full max-w-none">
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
                    {uploadedFile?.name || `${documentTitle}.txt`}
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
                    disabled={isGenerating}
                    className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors disabled:opacity-50"
                  >
                    {isGenerating ? (
                      <div className="w-5 h-5 border-2 border-[#1a1a1a] border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <Icon name={isPlaying ? 'pause' : 'play'} size={20} className="text-[#1a1a1a]" />
                    )}
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
                  {documentTitle || 'No Document'}
                </h3>
                <div
                  className="text-[15px] leading-relaxed text-[#1a1a1a] whitespace-pre-wrap"
                  style={{
                    opacity: dimSurrounding && isPlaying ? 0.3 : 1,
                  }}
                >
                  {extractedText ? renderHighlightedText() : (
                    <span className="text-gray-400 italic">No content loaded. Please go back and upload a .txt file.</span>
                  )}
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
                    <SelectContent side="bottom" align="start" sideOffset={4} className="max-h-64">
                      {voices.length > 0 ? (
                        voices.map((voice) => (
                          <SelectItem key={voice.id} value={voice.id}>
                            {voice.name}
                          </SelectItem>
                        ))
                      ) : (
                        <>
                          <SelectItem value="en">English (US)</SelectItem>
                          <SelectItem value="en-uk">English (UK)</SelectItem>
                          <SelectItem value="es">Spanish</SelectItem>
                        </>
                      )}
                    </SelectContent>
                  </Select>
                </div>
                
                {/* Preview Audio Button */}
                <button
                  onClick={handlePreviewAudio}
                  disabled={isGenerating}
                  className="w-full bg-white border-2 border-[#3D6E4E] text-[#3D6E4E] font-semibold py-2.5 px-4 rounded-xl hover:bg-[#E8F3EA] transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {isGenerating && previewingVoice === 'preview' ? (
                    <>
                      <div className="w-4 h-4 border-2 border-[#3D6E4E] border-t-transparent rounded-full animate-spin" />
                      Generating...
                    </>
                  ) : previewingVoice === 'preview' ? (
                    <>
                      <Icon name="pause" size={18} />
                      Stop Preview
                    </>
                  ) : (
                    <>
                      <Icon name="volume" size={18} />
                      Preview Audio
                    </>
                  )}
                </button>

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
                  disabled={!audioUrl && !previewAudioUrl}
                  className={`w-full mt-4 font-semibold py-3 px-6 rounded-full transition-colors shadow-lg flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed ${
                    audioUrl || previewAudioUrl
                      ? 'bg-[#3D6E4E] text-white hover:bg-[#2d5a3d] shadow-[#3D6E4E]/20'
                      : 'bg-gray-300 text-gray-500'
                  }`}
                >
                  <Icon name="download" size={18} />
                  {audioUrl || previewAudioUrl ? 'Export Audio (MP3)' : 'Generate Audio First'}
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
}
