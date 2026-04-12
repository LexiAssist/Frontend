'use client';

import { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Icon } from '@/components/Icon';
import { FeatureHeader } from '@/components/FeatureHeader';
import { toast } from 'sonner';
import { useAuthStore } from '@/store/authStore';
import { writingApi } from '@/services/api';

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

// Placeholder text removed - now using renderText() for dynamic empty state

// Icons
const MicrophoneIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 2a3 3 0 0 1 3 3v7a3 3 0 0 1-6 0V5a3 3 0 0 1 3-3Z"/>
    <path d="M19 10v2a7 7 0 0 1-14 0v-2"/>
    <line x1="12" x2="12" y1="19" y2="22"/>
  </svg>
);

const SparklesIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"/>
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

// Audio Waveform Visualization Component with Real-time Frequency Data
const AudioWaveform = ({ 
  level, 
  isRecording, 
  analyserRef 
}: { 
  level: number; 
  isRecording: boolean;
  analyserRef?: React.RefObject<AnalyserNode | null>;
}) => {
  const [frequencies, setFrequencies] = useState<number[]>(Array(12).fill(20));
  const animationRef = useRef<number | null>(null);
  
  useEffect(() => {
    if (!isRecording || !analyserRef?.current) {
      // Reset to idle state when not recording
      setFrequencies(Array(12).fill(20));
      if (animationRef.current !== null) {
        cancelAnimationFrame(animationRef.current);
        animationRef.current = null;
      }
      return;
    }
    
    const analyser = analyserRef.current;
    const dataArray = new Uint8Array(analyser.frequencyBinCount);
    
    const updateFrequencies = () => {
      analyser.getByteFrequencyData(dataArray);
      
      // Sample 12 frequency bands evenly across the spectrum
      const bands = 12;
      const newFrequencies = Array(bands).fill(0).map((_, i) => {
        const startIndex = Math.floor((i / bands) * (dataArray.length / 2));
        const endIndex = Math.floor(((i + 1) / bands) * (dataArray.length / 2));
        let sum = 0;
        for (let j = startIndex; j < endIndex; j++) {
          sum += dataArray[j];
        }
        const avg = sum / (endIndex - startIndex);
        // Normalize to 10-100% range
        return Math.max(10, Math.min(100, (avg / 255) * 100));
      });
      
      setFrequencies(newFrequencies);
      animationRef.current = requestAnimationFrame(updateFrequencies);
    };
    
    updateFrequencies();
    
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [isRecording, analyserRef]);
  
  const bars = 12;
  return (
    <div className="flex items-center justify-center gap-[3px] h-10">
      {Array.from({ length: bars }).map((_, i) => {
        const height = isRecording ? frequencies[i] || 20 : 20;
        return (
          <motion.div
            key={i}
            className="w-[3px] bg-gradient-to-t from-red-600 to-red-400 rounded-full"
            animate={{
              height: isRecording ? `${height}%` : '20%',
              opacity: isRecording ? Math.max(0.4, height / 100) : 0.4,
            }}
            transition={{
              type: "spring",
              stiffness: 400,
              damping: 15,
              mass: 0.5,
            }}
          />
        );
      })}
    </div>
  );
};

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

const TrashIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 6h18"/>
    <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/>
    <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/>
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

  // AI Backend Integration State
  const { user } = useAuthStore();
  const [isRecording, setIsRecording] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [sessionId, setSessionId] = useState<string | undefined>(undefined);
  const [showHistory, setShowHistory] = useState(false);
  const [history, setHistory] = useState<any[]>([]);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);
  
  // Audio visualization state
  const [audioLevel, setAudioLevel] = useState(0);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  
  // Stats
  const wordCount = transcript?.trim() ? transcript.trim().split(/\s+/).length : 0;
  const charCount = transcript?.length || 0;
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const isRecordingRef = useRef(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const sessionIdRef = useRef<string | undefined>(undefined);
  
  // Keep sessionIdRef in sync with sessionId state
  useEffect(() => {
    sessionIdRef.current = sessionId;
  }, [sessionId]);

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
    if (!transcript) return;
    navigator.clipboard.writeText(transcript);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  
  // Clear transcript
  const handleClear = () => {
    if (!transcript) return;
    if (confirm('Are you sure you want to clear all text?')) {
      setTranscript('');
      setSessionId(undefined);
      sessionIdRef.current = undefined;
      toast.success('Text cleared');
    }
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

  const sendChunk = async (blob: Blob) => {
    if (!user) return;
    
    try {
      // Use the current sessionId from ref to ensure latest value
      const currentSessionId = sessionIdRef.current;
      const res = await writingApi.transcribe(blob, 'en', currentSessionId);
      const reader = res.body?.getReader();
      if (!reader) {
        toast.error('Failed to start transcription');
        return;
      }

      const decoder = new TextDecoder();
      let done = false;
      let buffer = '';
      let chunkText = ''; // Collect text for this chunk
      
      while (!done) {
        const { value, done: doneReading } = await reader.read();
        done = doneReading;
        if (value) {
          buffer += decoder.decode(value, { stream: true });
          
          // Process complete SSE events (separated by double newlines)
          const events = buffer.split('\n\n');
          buffer = events.pop() || ''; // Keep incomplete event in buffer
          
          for (const event of events) {
            if (!event.trim()) continue;
            
            const lines = event.split('\n');
            let eventType = '';
            let eventData = '';
            
            for (const line of lines) {
              if (line.startsWith('event: ')) {
                eventType = line.substring(7).trim();
              } else if (line.startsWith('data: ')) {
                eventData = line.substring(6).trim();
              }
            }
            
            // Handle session_id event - only update if we don't have one yet
            if (eventType === 'session_id' && eventData && !sessionIdRef.current) {
              setSessionId(eventData);
              sessionIdRef.current = eventData;
              console.log('[Transcribe] New Session ID:', eventData);
            }
            
            // Handle text data events (only regular data events with text, not session_id)
            if (eventData && eventData !== '[DONE]' && eventType !== 'session_id') {
              chunkText += eventData;
            }
          }
        }
      }
      
      // Process any remaining data in buffer
      if (buffer.trim()) {
        const lines = buffer.split('\n');
        let eventType = '';
        for (const line of lines) {
          if (line.startsWith('event: ')) {
            eventType = line.substring(7).trim();
          } else if (line.startsWith('data: ') && eventType !== 'session_id') {
            const text = line.substring(6).trim();
            if (text && text !== '[DONE]') {
              chunkText += text;
            }
          }
        }
      }
      
      // Append the complete chunk text to transcript with a space separator
      if (chunkText.trim()) {
        setTranscript(prev => {
          const separator = prev && !prev.endsWith(' ') ? ' ' : '';
          return prev + separator + chunkText.trim();
        });
      }
    } catch(err) {
      console.error('Transcription error:', err);
      toast.error('Failed to transcribe audio');
    }
  };

  const recordNextChunk = () => {
     if (!isRecordingRef.current || !streamRef.current) return;
     
     const mr = new MediaRecorder(streamRef.current, { 
       mimeType: 'audio/webm;codecs=opus' 
     });
     
     mr.ondataavailable = async (e) => {
       if (e.data.size > 0) {
          await sendChunk(e.data);
       }
     };
     
     mr.onerror = (e) => {
       console.error('MediaRecorder error:', e);
       toast.error('Recording error occurred');
       stopRecording();
     };
     
     mr.start();
     mediaRecorderRef.current = mr;
     
     timeoutRef.current = setTimeout(() => {
       if (mr.state === 'recording') {
         mr.stop();
       }
       if (isRecordingRef.current) {
         recordNextChunk();
       }
     }, 5000); // 5 second chunks for faster transcription
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
      
      // Set up audio visualization
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      audioContextRef.current = audioContext;
      const analyser = audioContext.createAnalyser();
      analyser.fftSize = 256;
      analyserRef.current = analyser;
      
      const source = audioContext.createMediaStreamSource(stream);
      source.connect(analyser);
      
      // Start visualization loop
      const dataArray = new Uint8Array(analyser.frequencyBinCount);
      const updateAudioLevel = () => {
        if (!isRecordingRef.current) return;
        analyser.getByteFrequencyData(dataArray);
        const average = dataArray.reduce((a, b) => a + b) / dataArray.length;
        setAudioLevel(average / 128); // Normalize to 0-1
        animationFrameRef.current = requestAnimationFrame(updateAudioLevel);
      };
      updateAudioLevel();
      
      toast.success("Recording started");
      recordNextChunk();
    } catch (err) {
      toast.error('Failed to access microphone');
    }
  };

  const stopRecording = () => {
    isRecordingRef.current = false;
    setIsRecording(false);
    setAudioLevel(0);
    
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }
    
    if (audioContextRef.current) {
      audioContextRef.current.close();
      audioContextRef.current = null;
    }
    
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      mediaRecorderRef.current.stop();
    }
    
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(t => t.stop());
      streamRef.current = null;
    }
    
    toast.success('Recording stopped');
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
      console.error('Note generation error:', err);
      toast.error('Failed to generate structured notes');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDownloadMarkdown = () => {
    if (!transcript) {
      toast.error('No content to download');
      return;
    }
    
    const blob = new Blob([transcript], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `notes_${new Date().toISOString().split('T')[0]}.md`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    toast.success('Markdown downloaded');
  };

  const handleDownloadPDF = () => {
    if (!transcript) {
      toast.error('No content to download');
      return;
    }
    
    // For PDF export, we'll create a simple text-based PDF
    // In a production app, you'd use a library like jsPDF or pdfmake
    toast.info('PDF export coming soon. Use markdown export for now.');
  };

  const handleViewHistory = async () => {
    if (!user) {
      toast.error('You must be logged in to view history');
      return;
    }
    
    setShowHistory(true);
    setIsLoadingHistory(true);
    
    try {
      const sessions = await writingApi.getHistory(user.id);
      setHistory(sessions);
    } catch (err) {
      console.error('Failed to load history:', err);
      toast.error('Failed to load history');
    } finally {
      setIsLoadingHistory(false);
    }
  };

  const handleLoadSession = (session: any) => {
    setTranscript(session.structured_notes || session.raw_text);
    setSessionId(session.session_id);
    setShowHistory(false);
    toast.success('Session loaded');
  };

  // Render text with basic markdown support
  const renderText = () => {
    if (!transcript || transcript.trim() === '') {
      return (
        <div className="flex flex-col items-center justify-center h-[200px] text-gray-400">
          <div className={`p-6 rounded-full mb-5 transition-all duration-500 ${isRecording ? 'bg-red-50 animate-pulse' : 'bg-gray-100'}`}>
            <MicrophoneIcon className={`w-10 h-10 transition-all duration-500 ${isRecording ? 'text-red-400' : 'text-gray-300'}`} />
          </div>
          <p className="text-center text-sm font-medium">
            {isRecording 
              ? "Listening... Your words will appear here as you speak." 
              : "Click 'Start Recording' to transcribe your lecture or notes."}
          </p>
          <p className="text-center text-xs text-gray-300 mt-2">
            Speak clearly for best results
          </p>
        </div>
      );
    }
    
    // Split by lines and render with basic formatting
    const lines = transcript.split('\n');
    return (
      <div className="space-y-2">
        {lines.map((line, idx) => {
          // Headers
          if (line.startsWith('# ')) {
            return <h1 key={idx} className="text-2xl font-bold mt-4 mb-2">{line.substring(2)}</h1>;
          }
          if (line.startsWith('## ')) {
            return <h2 key={idx} className="text-xl font-bold mt-3 mb-2">{line.substring(3)}</h2>;
          }
          if (line.startsWith('### ')) {
            return <h3 key={idx} className="text-lg font-semibold mt-2 mb-1">{line.substring(4)}</h3>;
          }
          // Bullet points
          if (line.startsWith('- ') || line.startsWith('* ')) {
            return <li key={idx} className="ml-4">{line.substring(2)}</li>;
          }
          // Numbered lists
          if (/^\d+\.\s/.test(line)) {
            return <li key={idx} className="ml-4">{line.replace(/^\d+\.\s/, '')}</li>;
          }
          // Bold text (simple **text** pattern)
          if (line.includes('**')) {
            const parts = line.split('**');
            return (
              <p key={idx}>
                {parts.map((part, i) => i % 2 === 1 ? <strong key={i}>{part}</strong> : part)}
              </p>
            );
          }
          // Regular paragraph
          if (line.trim()) {
            return <p key={idx}>{line}</p>;
          }
          // Empty line
          return <br key={idx} />;
        })}
      </div>
    );
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="min-h-[calc(100vh-80px)] relative"
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <h1 className="text-[28px] font-bold text-gray-900 dark:text-gray-100 tracking-tight">Writing Assistant</h1>
          <div className="w-10 h-10 rounded-full bg-[#3D6E4E] flex items-center justify-center shadow-md">
            <MicrophoneIcon className="w-5 h-5 text-white" />
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={handleViewHistory}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors shadow-sm"
          >
            View History
          </button>
          <FeatureHeader />
        </div>
      </div>

      {/* Main Content */}
      <div className="relative">
        {/* Editor Card */}
        <div 
          className="rounded-2xl sm:rounded-3xl p-4 sm:p-6 lg:p-8 relative shadow-[0_1px_3px_rgba(0,0,0,0.04)] border border-gray-200/40 dark:border-gray-700/40 bg-[#FAFAFA] dark:bg-gray-900/50"
        >
          {/* Tools Toggle Button - Top Right */}
          <button
            onClick={() => setToolsOpen(true)}
            className="absolute top-4 right-4 p-2 rounded-xl bg-white shadow-sm border border-gray-200 text-gray-600 hover:text-[#3D6E4E] hover:border-[#3D6E4E] hover:shadow-md transition-all duration-200 z-10"
            aria-label="Open tools"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.47a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2Z"/>
              <circle cx="12" cy="12" r="3"/>
            </svg>
          </button>

          {/* Recording Control Bar - Centered and prominent */}
          <div className="flex flex-col items-center mb-8">
            {/* Main recording button / waveform display */}
            <div className="flex items-center justify-center">
              {isRecording ? (
                <div className="flex items-center gap-4 bg-gradient-to-r from-red-50 to-orange-50 px-6 py-3 rounded-full border border-red-100 shadow-sm">
                  <div className="flex items-center gap-3">
                    <span className="flex h-3 w-3 relative">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
                    </span>
                    <AudioWaveform level={audioLevel} isRecording={isRecording} analyserRef={analyserRef} />
                  </div>
                  <div className="h-8 w-px bg-red-200 mx-1"></div>
                  <button 
                    onClick={stopRecording} 
                    className="bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white px-5 py-2 font-semibold text-sm rounded-full flex items-center gap-2 transition-all duration-200 ease-out shadow-md hover:shadow-lg active:scale-[0.96]"
                  >
                    <span className="w-2.5 h-2.5 bg-white rounded-sm" />
                    Stop Recording
                  </button>
                </div>
              ) : (
                <button 
                  onClick={startRecording}
                  className="bg-[#3D6E4E] hover:bg-[#2d5239] text-white px-8 py-4 font-semibold text-base flex items-center gap-3 rounded-full transition-all duration-200 ease-out shadow-lg hover:shadow-xl active:scale-[0.96]"
                >
                  <MicrophoneIcon className="w-6 h-6" />
                  Start Recording
                </button>
              )}
            </div>
            
            {/* Status text below button */}
            <div className="mt-3">
              {isRecording ? (
                <span className="text-red-500 text-sm font-medium animate-pulse">Recording in progress...</span>
              ) : transcript ? (
                <span className="text-green-600 text-sm font-medium">Recording complete</span>
              ) : (
                <span className="text-gray-400 text-sm">Click to start transcribing your lecture or notes</span>
              )}
            </div>
          </div>

          {/* Text Content Area */}
          <div className="relative">
            {/* Text Content */}
            <div 
              className="writing-content pr-4 max-h-[400px] overflow-y-auto"
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
              <div className="text-gray-800 dark:text-gray-200 text-[15px] leading-[1.75] whitespace-pre-line min-h-[200px]">
                {renderText()}
              </div>
            </div>
          </div>

          {/* Bottom: Stats and Actions Toolbar */}
          <div className="mt-6 pt-4 border-t border-gray-200/60">
            {/* Primary Actions - Full width button style */}
            <div className="flex items-center gap-3 mb-4">
              <button 
                onClick={handleGenerateNotes}
                disabled={!transcript || isProcessing}
                className={`flex-1 bg-[#3D6E4E] text-white px-5 py-3 rounded-xl text-sm font-semibold transition-all duration-200 ease-out shadow-sm hover:shadow-md hover:bg-[#345e43] active:bg-[#2a4d36] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:shadow-sm disabled:hover:bg-[#3D6E4E] disabled:active:scale-100 flex items-center justify-center gap-2`}
              >
                {isProcessing ? (
                  <>
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                    Structuring your notes...
                  </>
                ) : (
                  <>
                    <SparklesIcon className="w-4 h-4" />
                    Clean and Structure Notes
                  </>
                )}
              </button>
            </div>
            
            {/* Secondary Actions Row */}
            <div className="flex items-center justify-between">
              {/* Stats on the left */}
              <div className="flex items-center gap-4 text-sm text-gray-500">
                <span className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-gray-400"></span>
                  {wordCount} words
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-gray-400"></span>
                  {charCount} characters
                </span>
              </div>
              
              {/* Action buttons on the right */}
              <div className="flex items-center gap-2">
                {transcript && (
                  <button
                    onClick={handleClear}
                    className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all duration-200"
                  >
                    <TrashIcon className="w-4 h-4" />
                    Clear
                  </button>
                )}
                <button
                  onClick={handleCopy}
                  disabled={!transcript}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ease-out active:scale-[0.96] disabled:opacity-50 disabled:cursor-not-allowed ${
                    copied 
                      ? 'bg-green-100 text-green-700' 
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {copied ? (
                    <>
                      <CheckIcon className="w-4 h-4" />
                      <span>Copied!</span>
                    </>
                  ) : (
                    <>
                      <ClipboardIcon className="w-4 h-4" />
                      <span>Copy</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tools Drawer - Inline on desktop, overlay on mobile */}
      <div className={`fixed inset-y-0 right-0 w-80 bg-white dark:bg-gray-900 shadow-2xl border-l border-gray-200 dark:border-gray-700 transform transition-transform duration-300 ease-out z-40 ${toolsOpen ? 'translate-x-0' : 'translate-x-full'}`}>
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
                <button 
                  onClick={handleDownloadMarkdown}
                  className="w-full flex items-center gap-4 px-5 py-3.5 text-sm text-gray-700 hover:bg-gray-50/80 active:scale-[0.98] transition-all duration-300 ease-out rounded-xl mx-2 w-[calc(100%-16px)]"
                >
                  <ExportIcon className="w-5 h-5" />
                  <span className="font-medium">Download as Markdown</span>
                </button>
                <button 
                  onClick={handleDownloadPDF}
                  className="w-full flex items-center gap-4 px-5 py-3.5 text-sm text-gray-700 hover:bg-gray-50/80 active:scale-[0.98] transition-all duration-300 ease-out rounded-xl mx-2 w-[calc(100%-16px)]"
                >
                  <WordIcon className="w-5 h-5" />
                  <span className="font-medium">Download as PDF</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Backdrop when tools open */}
      {toolsOpen && (
        <div 
          className="fixed inset-0 bg-black/30 z-30 transition-opacity duration-300"
          onClick={() => setToolsOpen(false)}
        />
      )}

      {/* History Modal */}
      {showHistory && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-3xl w-full max-h-[80vh] overflow-hidden">
            <div className="p-6 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Note History</h2>
              <button
                onClick={() => setShowHistory(false)}
                className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto max-h-[calc(80vh-120px)]">
              {isLoadingHistory ? (
                <div className="flex items-center justify-center py-12">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#3D6E4E]"></div>
                </div>
              ) : history.length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                  <p>No previous sessions found</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {history.map((session) => (
                    <div
                      key={session.session_id}
                      className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors cursor-pointer"
                      onClick={() => handleLoadSession(session)}
                    >
                      <div className="flex items-start justify-between mb-2">
                        <h3 className="font-semibold text-gray-900 dark:text-gray-100">
                          {session.subject || 'Untitled Session'}
                        </h3>
                        <span className="text-sm text-gray-500">
                          {new Date(session.created_at).toLocaleDateString()}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
                        {session.structured_notes || session.raw_text}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </motion.div>
  );
}
