'use client';

import { Card, CardContent } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { SlidersHorizontal } from 'lucide-react';
import { Icon } from '@/components/Icon';
import { toast } from 'sonner';
import { FeatureHeader } from '@/components/FeatureHeader';
import dynamic from 'next/dynamic';
import { readingApi } from '@/services/api';
import { useAuthStore } from '@/store/authStore';

// Lazy load the illustration to improve initial page load performance
const BookLoverCuate = dynamic(() => import('@/components/illustrations/BookLoverCuate'), {
  loading: () => <div className="w-40 h-32 bg-gray-200/50 rounded-xl animate-pulse" />,
  ssr: false
});


type ViewState = 'home' | 'upload' | 'reading';
type TextMode = 'original' | 'simplified' | 'summarized';
type Difficulty = 'beginner' | 'intermediate';
type FontChoice = 'default' | 'opendyslexic' | 'roboto';
type BackgroundTint = 'none' | 'yellow' | 'blue' | 'green' | 'beige' | 'cream' | 'pink' | 'lavender' | 'mint' | 'peach' | 'sky' | 'rose' | 'sage' | 'warm' | 'cool';

interface VocabWord {
  word: string;
  definition: string;
  synonyms: string[];
}

const MOCK_ORIGINAL_TEXT = `Introduction to Machine Learning: Fundamentals and Applications

Machine learning represents one of the most transformative technologies of the 21st century, enabling computers to learn from data and improve their performance without explicit programming.

Core Concepts and Methodologies

Machine learning algorithms build mathematical models from training data to make predictions or decisions. The field encompasses three main paradigms: supervised learning, where models learn from labeled examples; unsupervised learning, which discovers hidden patterns in unlabeled data; and reinforcement learning, where agents learn through environmental feedback.

Deep learning, a subset of machine learning using artificial neural networks, has achieved remarkable success in image recognition, natural language processing, and game playing. These systems can automatically learn hierarchical representations of data, extracting increasingly complex features at each layer.`;

const MOCK_SIMPLIFIED_TEXT = `Introduction to Machine Learning: Simple Explanation

Machine learning is a type of computer technology that helps computers learn from information and get better at tasks without being directly programmed.

Basic Ideas and Methods

Machine learning uses special math programs that learn from example data to make predictions. There are three main types: supervised learning uses labeled examples, unsupervised learning finds patterns on its own, and reinforcement learning learns through trial and error.

Deep learning uses computer systems inspired by the human brain. It has achieved great success in recognizing images, understanding language, and playing complex games. These systems learn by finding patterns in data, discovering more complex ideas at each stage.`;

const MOCK_SUMMARIZED_TEXT = `• Definition: Machine learning enables computers to learn from data and improve performance without explicit programming.

• Main Types: Supervised learning uses labeled data, unsupervised learning finds hidden patterns, and reinforcement learning learns through environmental feedback.

• Deep Learning: A subset using neural networks that has achieved success in image recognition, language processing, and game playing.

• Key Advantage: Systems automatically learn hierarchical data representations, extracting complex features at each processing layer.`;

const MOCK_VOCAB_LIST: VocabWord[] = [
  { word: 'Algorithm', definition: 'A step-by-step procedure or formula for solving a problem', synonyms: ['Procedure', 'method', 'process', 'technique'] },
  { word: 'Antisemitic', definition: 'Hostile to or prejudiced against Jewish people', synonyms: ['Prejudiced', 'discriminatory', 'bigoted'] },
  { word: 'Nationalist', definition: 'A person who advocates political independence for their country', synonyms: ['Patriot', 'loyalist', 'chauvinist'] },
];

const BACKGROUND_TINTS: Record<BackgroundTint, string> = {
  none: '#ffffff',
  yellow: '#FFF9E6',
  blue: '#E8F4FD',
  green: '#E8F5E9',
  beige: '#F5F5DC',
  cream: '#FFFDD0',
  pink: '#FFE4E1',
  lavender: '#E6E6FA',
  mint: '#F0FFF0',
  peach: '#FFDAB9',
  sky: '#E0F7FA',
  rose: '#FFF0F3',
  sage: '#E8F3E8',
  warm: '#FFF8E7',
  cool: '#F0F8FF',
};

const TINT_COLORS = [
  { id: 'yellow', color: '#FFF9E6' },
  { id: 'blue', color: '#E8F4FD' },
  { id: 'green', color: '#E8F5E9' },
  { id: 'beige', color: '#F5F5DC' },
  { id: 'cream', color: '#FFFDD0' },
  { id: 'pink', color: '#FFE4E1' },
  { id: 'lavender', color: '#E6E6FA' },
  { id: 'mint', color: '#F0FFF0' },
  { id: 'peach', color: '#FFDAB9' },
  { id: 'sky', color: '#E0F7FA' },
  { id: 'rose', color: '#FFF0F3' },
  { id: 'sage', color: '#E8F3E8' },
  { id: 'warm', color: '#FFF8E7' },
  { id: 'cool', color: '#F0F8FF' },
];

const ReadingAssistantIllustration = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 225 168" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
    <path d="M47.0518 21.0077C59.6113 -5.77589 104.224 -2.00051 121.441 16.8358C138.658 35.6722 144.256 47.7417 159.786 40.7135C175.315 33.6854 195.12 35.5596 196.236 57.91C197.352 80.2604 179.194 106.675 150.3 114.491C121.405 122.308 121.428 149.974 83.2048 144.392C62.3653 141.347 61.8928 118.776 64.8358 100.106C67.7788 81.4363 32.4808 52.0667 47.0518 21.0077Z" fill="#407BFF"/>
    <path opacity="0.9" d="M47.0518 21.0077C59.6113 -5.77589 104.224 -2.00051 121.441 16.8358C138.658 35.6722 144.256 47.7417 159.786 40.7135C175.315 33.6854 195.12 35.5596 196.236 57.91C197.352 80.2604 179.194 106.675 150.3 114.491C121.405 122.308 121.428 149.974 83.2048 144.392C62.3653 141.347 61.8928 118.776 64.8358 100.106C67.7788 81.4363 32.4808 52.0667 47.0518 21.0077Z" fill="white"/>
    <path d="M112.5 167.847C160.687 167.847 199.751 165.563 199.751 162.747C199.751 159.93 160.687 157.647 112.5 157.647C64.3129 157.647 25.2495 159.93 25.2495 162.747C25.2495 165.563 64.3129 167.847 112.5 167.847Z" fill="#F5F5F5"/>
    <path d="M179.55 163.697H100.098C99.6205 163.697 99.1626 163.507 98.8251 163.169C98.4875 162.831 98.2979 162.373 98.2979 161.895V107.359L136.363 78.5257C137.043 78.0087 137.871 77.7236 138.724 77.7123C139.578 77.7009 140.413 77.9639 141.106 78.4626L181.35 107.359V161.908C181.346 162.384 181.155 162.839 180.818 163.174C180.481 163.509 180.025 163.697 179.55 163.697Z" fill="#407BFF"/>
    <path opacity="0.2" d="M179.55 163.697H100.098C99.6205 163.697 99.1626 163.507 98.8251 163.169C98.4875 162.831 98.2979 162.373 98.2979 161.895V107.359L136.363 78.5257C137.043 78.0087 137.871 77.7236 138.724 77.7123C139.578 77.7009 140.413 77.9639 141.106 78.4626L181.35 107.359V161.908C181.346 162.384 181.155 162.839 180.818 163.174C180.481 163.509 180.025 163.697 179.55 163.697Z" fill="black"/>
    <path d="M165.483 138.017H109.233C109.924 137.567 110.492 136.95 110.885 136.224C111.278 135.498 111.484 134.685 111.483 133.859V49.3183C111.484 48.4313 111.738 47.563 112.217 46.8165C112.696 46.0699 113.378 45.4763 114.183 45.106H170.433C169.628 45.4763 168.946 46.0699 168.467 46.8165C167.988 47.563 167.734 48.4313 167.733 49.3183V133.859C167.734 134.685 167.528 135.498 167.135 136.224C166.742 136.95 166.174 137.567 165.483 138.017Z" fill="#407BFF"/>
    <path opacity="0.7" d="M165.483 138.017H109.233C109.924 137.567 110.492 136.95 110.885 136.224C111.278 135.498 111.484 134.685 111.483 133.859V49.3183C111.484 48.4313 111.738 47.563 112.217 46.8165C112.696 46.0699 113.378 45.4763 114.183 45.106H170.433C169.628 45.4763 168.946 46.0699 168.467 46.8165C167.988 47.563 167.734 48.4313 167.733 49.3183V133.859C167.734 134.685 167.528 135.498 167.135 136.224C166.742 136.95 166.174 137.567 165.483 138.017Z" fill="white"/>
    <path d="M181.35 107.359V161.913C181.346 162.355 181.18 162.779 180.884 163.107C180.588 163.434 180.182 163.641 179.743 163.688H179.563H100.098H99.9134C99.4766 163.639 99.0729 163.431 98.7786 163.104C98.4843 162.777 98.3197 162.353 98.3159 161.913V107.359L133.69 131.805L135.625 133.156L138.73 135.305L142.011 133.156L144.054 131.805L181.35 107.359Z" fill="#407BFF"/>
    <path opacity="0.2" d="M181.35 161.201V161.738C181.366 162.202 181.211 162.657 180.915 163.015C180.619 163.374 180.202 163.611 179.744 163.684H179.564H100.098H99.9136C99.4563 163.61 99.0419 163.371 98.7478 163.013C98.4537 162.654 98.3002 162.201 98.3161 161.738V161.197L133.691 131.8L135.626 133.152L138.731 135.301L142.011 133.152L144.054 131.8L181.35 161.201Z" fill="black"/>
    <path d="M181.35 161.422V161.913C181.35 162.391 181.16 162.849 180.823 163.187C180.485 163.525 180.027 163.715 179.55 163.715H100.098C99.6205 163.715 99.1626 163.525 98.8251 163.187C98.4875 162.849 98.2979 162.391 98.2979 161.913V161.422L135.607 133.143L136.363 132.57C137.044 132.054 137.871 131.77 138.724 131.758C139.578 131.747 140.413 132.009 141.106 132.507L142.006 133.143L181.35 161.422Z" fill="#407BFF"/>
  </svg>
);

export default function ReadingAssistantPage() {
  const [viewState, setViewState] = useState<ViewState>('home');
  const [textMode, setTextMode] = useState<TextMode>('original');
  const [difficulty, setDifficulty] = useState<Difficulty>('intermediate');
  const [focusMode, setFocusMode] = useState(false);
  const [showDifficultyDropdown, setShowDifficultyDropdown] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  
  const [toolsCollapsed, setToolsCollapsed] = useState(false);
  const [showMobileTools, setShowMobileTools] = useState(false);
  
  const [fontChoice, setFontChoice] = useState<FontChoice>('default');
  const [showFontDropdown, setShowFontDropdown] = useState(false);
  const [letterSpacing, setLetterSpacing] = useState(0);
  const [wordSpacing, setWordSpacing] = useState(0);
  const [lineHeight, setLineHeight] = useState(1.6);
  const [backgroundTint, setBackgroundTint] = useState<BackgroundTint>('none');
  const [showTintPicker, setShowTintPicker] = useState(false);
  const [dimSurrounding, setDimSurrounding] = useState(false);
  const [showSpacingPanel, setShowSpacingPanel] = useState(false);
  
  const [selectedWord, setSelectedWord] = useState<VocabWord | null>(null);
  const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 });
  
  const [originalText, setOriginalText] = useState('');
  const [simplifiedText, setSimplifiedText] = useState('');
  const [summarizedText, setSummarizedText] = useState('');
  const [vocabList, setVocabList] = useState<VocabWord[]>([]);
  const [ttsAudioB64, setTtsAudioB64] = useState<string>('');
  
  // SSE Streaming state
  const [streamStage, setStreamStage] = useState<'idle' | 'extracting' | 'storing' | 'summarizing' | 'vocab' | 'tts' | 'complete'>('idle');
  const [streamingSummary, setStreamingSummary] = useState('');
  const [streamingVocab, setStreamingVocab] = useState<VocabWord[]>([]);
  const [streamProgress, setStreamProgress] = useState(0);
  
  const { user } = useAuthStore();

  useEffect(() => {
    if (viewState === 'reading') {
      setOriginalText(MOCK_ORIGINAL_TEXT);
      setSimplifiedText(MOCK_SIMPLIFIED_TEXT);
    }
  }, [viewState]);

  useEffect(() => {
    const handleClickOutside = () => {
      setShowFontDropdown(false);
      setShowDifficultyDropdown(false);
      setShowTintPicker(false);
    };
    window.addEventListener('click', handleClickOutside);
    return () => window.removeEventListener('click', handleClickOutside);
  }, []);

  const handleFileUpload = (file: File) => {
    const allowed = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'text/plain'];
    if (!allowed.includes(file.type) && !file.type.startsWith('image/')) {
      toast.error('Please upload PDF, DOC, TXT, or image');
      return;
    }
    if (file.size > 25 * 1024 * 1024) {
      toast.error('File must be under 25MB');
      return;
    }
    setUploadedFile(file);
    setViewState('upload');
    toast.success(`"${file.name}" uploaded`);
  };

  const removeFile = () => {
    setUploadedFile(null);
    setViewState('home');
    if (fileRef.current) fileRef.current.value = '';
  };

  const handleSubmit = async () => {
    if (!uploadedFile) return;
    if (!user) {
      toast.error('You must be logged in');
      return;
    }

    setIsProcessing(true);
    setStreamStage('extracting');
    setStreamingSummary('');
    setStreamingVocab([]);
    setStreamProgress(0);
    
    try {
      await readingApi.analyseStream(
        uploadedFile,
        user.id,
        (event) => {
          switch (event.type) {
            case 'status':
              setStreamStage(event.data.stage);
              break;
            case 'summary_token':
              setStreamingSummary(prev => prev + event.data.token);
              break;
            case 'vocab':
              setStreamingVocab(prev => [...prev, {
                word: event.data.term,
                definition: event.data.definition,
                synonyms: event.data.context_snippet ? [event.data.context_snippet] : []
              }]);
              break;
            case 'progress':
              setStreamProgress(event.data.percent);
              break;
            case 'complete':
              // Use streaming data as fallback if available
              const finalSummary = event.data.summary || streamingSummary;
              const finalVocab = event.data.vocab_terms?.map((t: any) => ({
                word: t.term,
                definition: t.definition,
                synonyms: t.context_snippet ? [t.context_snippet] : []
              })) || streamingVocab;
              
              setSummarizedText(finalSummary);
              setVocabList(finalVocab);
              setTtsAudioB64(event.data.tts_audio_b64 || '');
              
              // Fallback mocks for original/simplified text
              setOriginalText(`[Extracted Document: ${uploadedFile.name}]\n\n${MOCK_ORIGINAL_TEXT}`);
              setSimplifiedText(`[Simplified version of ${uploadedFile.name}]\n\n${MOCK_SIMPLIFIED_TEXT}`);
              
              setViewState('reading');
              setTextMode('summarized');
              setIsProcessing(false);
              setStreamStage('complete');
              toast.success('Document analysed successfully');
              break;
            case 'error':
              console.error('Stream error:', event.data);
              toast.error(event.data.message || 'Analysis failed');
              setIsProcessing(false);
              setStreamStage('idle');
              break;
          }
        },
        (error) => {
          console.error('Analysis error:', error);
          toast.error(error.message || 'Failed to analyse document');
          setIsProcessing(false);
          setStreamStage('idle');
        }
      );
    } catch (error: any) {
      setIsProcessing(false);
      setStreamStage('idle');
      console.error('Analysis error:', error);
      toast.error(error.message || 'Failed to analyse document');
    }
  };

  const handleSummarize = () => {
    setIsProcessing(true);
    setTimeout(() => {
      setSummarizedText(MOCK_SUMMARIZED_TEXT);
      setTextMode('summarized');
      setIsProcessing(false);
      toast.success('Text summarized');
    }, 1500);
  };

  const handleWordClick = (word: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const vocab = vocabList.find(v => v.word.toLowerCase() === word.toLowerCase());
    if (vocab) {
      setSelectedWord(vocab);
      setTooltipPosition({ x: e.clientX, y: e.clientY });
    }
  };

  const getFontFamily = () => {
    switch (fontChoice) {
      case 'opendyslexic': return 'OpenDyslexic, sans-serif';
      case 'roboto': return 'Roboto, sans-serif';
      default: return 'inherit';
    }
  };

  const getCurrentText = () => {
    if (textMode === 'summarized') return summarizedText;
    if (textMode === 'simplified') return simplifiedText;
    return originalText;
  };

  if (focusMode) {
    return (
      <div className="fixed inset-0 z-50 overflow-auto" style={{ backgroundColor: BACKGROUND_TINTS[backgroundTint] }}>
        <div className="sticky top-0 backdrop-blur-sm border-b border-[#e5e7eb] px-4 sm:px-6 py-3 flex items-center justify-between" style={{ backgroundColor: `${BACKGROUND_TINTS[backgroundTint]}f0` }}>
          <div className="flex items-center gap-2 px-3 py-1.5 bg-white rounded-full border border-[#e5e7eb] text-sm shadow-sm">
            <Icon name="file" size={14} className="text-[#3D6E4E]" />
            <span className="text-[#1a1a1a] font-medium hidden sm:inline">ML_Introduction.pdf</span>
            <span className="text-[#1a1a1a] font-medium sm:hidden">Document</span>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => setTextMode('original')} className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${textMode === 'original' ? 'bg-[#3D6E4E] text-white shadow-sm' : 'bg-white text-[#5f5f5f] border border-[#e5e7eb] hover:border-[#3D6E4E]'}`}>Original</button>
            <div className="relative">
              <button onClick={(e) => { e.stopPropagation(); setShowDifficultyDropdown(!showDifficultyDropdown); }} className={`px-3 py-1.5 rounded-lg text-sm font-medium border flex items-center gap-1.5 transition-all ${textMode === 'simplified' || textMode === 'summarized' ? 'bg-[#3D6E4E] text-white border-[#3D6E4E] shadow-sm' : 'bg-white text-[#5f5f5f] border-[#e5e7eb] hover:border-[#3D6E4E]'}`}>
                <span className="hidden sm:inline">Simplified</span>
                <span className="sm:hidden">Simple</span>
                <Icon name="chevron-down" size={14} />
              </button>
              {showDifficultyDropdown && (
                <div className="absolute top-full mt-2 right-0 bg-white rounded-xl shadow-lg border border-[#e5e7eb] py-2 w-36 z-50">
                  <button onClick={() => { setDifficulty('beginner'); setTextMode('simplified'); setShowDifficultyDropdown(false); }} className={`block w-full text-left px-4 py-2 text-sm ${difficulty === 'beginner' ? 'bg-[#f0f7f1] text-[#3D6E4E] font-medium' : 'text-[#5f5f5f] hover:bg-[#f8f9fa]'}`}>Beginner</button>
                  <button onClick={() => { setDifficulty('intermediate'); setTextMode('simplified'); setShowDifficultyDropdown(false); }} className={`block w-full text-left px-4 py-2 text-sm ${difficulty === 'intermediate' ? 'bg-[#f0f7f1] text-[#3D6E4E] font-medium' : 'text-[#5f5f5f] hover:bg-[#f8f9fa]'}`}>Intermediate</button>
                </div>
              )}
            </div>
            <button onClick={() => setFocusMode(false)} className="p-2 rounded-full bg-gray-900 text-white hover:bg-gray-800 shadow-lg transition-colors"><Icon name="close" size={20} /></button>
          </div>
        </div>
        <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8">
          <h1 className="text-2xl font-bold text-[#1a1a1a] mb-6">{textMode === 'summarized' ? 'Summary' : 'Early Life and Artistic Failure'}</h1>
          <DimmedText content={getCurrentText()} dimmed={dimSurrounding} fontFamily={getFontFamily()} letterSpacing={letterSpacing} wordSpacing={wordSpacing} lineHeight={lineHeight} vocabList={vocabList} onWordClick={handleWordClick} />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-80px)]">
      {/* Header - Clean Design */}
      <div className="flex items-center justify-between mb-10 pt-8">
        <div className="flex items-center gap-4">
          <h1 className="text-[28px] font-bold text-[#1a1a1a] tracking-tight">Reading Assistant</h1>
          <div className="w-10 h-10 rounded-full bg-[#3D6E4E] flex items-center justify-center shadow-md">
            <Icon name="search" size={18} className="text-white" />
          </div>
        </div>
        <div className="flex items-center gap-3">
          {viewState === 'reading' && (
            <motion.button 
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowMobileTools(!showMobileTools)} 
              className="lg:hidden w-11 h-11 flex items-center justify-center rounded-xl bg-white text-[#3D6E4E] shadow-sm hover:shadow-md transition-all border border-[#e5e7eb] touch-target"
              aria-label="Reading Tools"
            >
              <SlidersHorizontal className="h-5 w-5" />
            </motion.button>
          )}
          <FeatureHeader />
        </div>
      </div>

      {/* HOME - Clean Card Design */}
      {viewState === 'home' && (
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
          className="w-full space-y-6 sm:space-y-8"
        >
          {/* Hero Card with Soft Blue Background */}
          <Card className="relative overflow-hidden border-0 rounded-2xl bg-[#EBF3FF] shadow-[0_2px_8px_rgba(0,0,0,0.06)]">
            <div className="absolute inset-0 opacity-[0.08]">
              <svg className="w-full h-full" viewBox="0 0 400 200" preserveAspectRatio="xMidYMid slice">
                <defs><pattern id="p1" x="0" y="0" width="60" height="60" patternUnits="userSpaceOnUse">
                  <path d="M0 30 Q15 15 30 30 Q45 45 60 30" fill="none" stroke="#407BFF" strokeWidth="1.5"/>
                  <path d="M30 0 Q45 15 30 30 Q15 45 30 60" fill="none" stroke="#407BFF" strokeWidth="1.5"/>
                </pattern></defs>
                <rect width="100%" height="100%" fill="url(#p1)"/>
              </svg>
            </div>
            <CardContent className="relative z-10 p-8 flex items-center gap-8">
              <div className="flex-shrink-0 w-40 h-32" aria-hidden="true">
                <BookLoverCuate />
              </div>
              <div>
                <h2 className="text-xl font-bold text-[#1a1a1a] mb-2">Reading Assistant</h2>
                <p className="text-[15px] text-[#5f5f5f] leading-relaxed">Study with confidence as words are simplified into easy-to-understand bits</p>
              </div>
            </CardContent>
          </Card>

          {/* Upload Zone - Clean Sage Green */}
          <motion.div 
            whileTap={{ scale: 0.99 }}
            className="rounded-2xl border-2 border-dashed border-[#D4E8D7] bg-[#F0F7F1] transition-all duration-200 cursor-pointer flex flex-col items-center justify-center py-12 sm:py-16 px-4 sm:px-6 gap-4 sm:gap-5 hover:border-[#3D6E4E] hover:bg-[#E8F3EA]"
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => { e.preventDefault(); const f = e.dataTransfer.files[0]; if (f) handleFileUpload(f); }}
            onClick={() => fileRef.current?.click()}
          >
            <input ref={fileRef} type="file" accept=".pdf,.doc,.docx,.txt,image/*" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFileUpload(f); }} />
            <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-[#3D6E4E] flex items-center justify-center text-white shadow-lg shadow-[#3D6E4E]/20 transition-transform duration-200 active:scale-95">
              <Icon name="upload" size={24} className="sm:w-7 sm:h-7" />
            </div>
            <div className="text-center">
              <p className="text-[#3D6E4E] font-semibold text-sm sm:text-base">
                <span className="font-bold">Click to upload</span> or drag and drop
              </p>
              <p className="text-[#5f5f5f] text-xs sm:text-sm mt-2">
                PDF, DOC, TXT, or Image files (max 25MB)
              </p>
            </div>
          </motion.div>
        </motion.div>
      )}

      {/* UPLOAD */}
      {viewState === 'upload' && uploadedFile && (
        <div className="w-full space-y-8">
          <Card className="relative overflow-hidden border-0 rounded-2xl bg-[#EBF3FF] shadow-[0_2px_8px_rgba(0,0,0,0.06)]">
            <div className="absolute inset-0 opacity-[0.06]">
              <svg className="w-full h-full" viewBox="0 0 400 200" preserveAspectRatio="xMidYMid slice">
                <defs><pattern id="p2" x="0" y="0" width="60" height="60" patternUnits="userSpaceOnUse"><path d="M0 30 Q15 15 30 30" fill="none" stroke="#407BFF" strokeWidth="1.5"/></pattern></defs>
                <rect width="100%" height="100%" fill="url(#p2)"/>
              </svg>
            </div>
            <CardContent className="relative z-10 p-6 flex items-center gap-6">
              <div className="flex-shrink-0 w-28 h-22" aria-hidden="true">
                {/* TODO: Insert specific Reading Assistant SVG here. Link later. */}
              </div>
              <div>
                <h2 className="text-lg font-bold text-[#1a1a1a] mb-1">Reading Assistant</h2>
                <p className="text-sm text-[#5f5f5f]">Study with confidence</p>
              </div>
            </CardContent>
          </Card>

          <div className="space-y-5 max-w-md">
            <p className="text-base font-semibold text-[#1a1a1a]">Document uploaded</p>
            
            <div className="flex items-center gap-4 bg-white rounded-2xl p-4 shadow-[0_2px_8px_rgba(0,0,0,0.06)] border border-[#e5e7eb]">
              <div className="w-12 h-12 rounded-xl bg-[#E8F3EA] flex items-center justify-center">
                <Icon name="file" size={24} className="text-[#3D6E4E]" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-[#1a1a1a] truncate">{uploadedFile.name.replace(/\.[^/.]+$/, '')}</p>
                <p className="text-xs text-[#9ca3af]">{uploadedFile.name.split('.').pop()?.toUpperCase()}</p>
              </div>
              <button onClick={removeFile} className="p-2.5 text-[#9ca3af] hover:text-red-500 hover:bg-red-50 rounded-xl transition-colors">
                <Icon name="close" size={20} />
              </button>
            </div>

            <Button onClick={handleSubmit} isLoading={isProcessing} className="w-full rounded-xl py-4 text-base font-semibold shadow-lg shadow-[#3D6E4E]/20">
              Submit Document
            </Button>
            
            {/* Streaming Progress Indicator */}
            {isProcessing && (
              <div className="bg-white rounded-2xl p-5 shadow-[0_2px_8px_rgba(0,0,0,0.06)] border border-[#e5e7eb] space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-[#1a1a1a]">
                    {streamStage === 'extracting' && '📄 Extracting text...'}
                    {streamStage === 'storing' && '💾 Storing document...'}
                    {streamStage === 'summarizing' && '✨ Generating summary...'}
                    {streamStage === 'vocab' && '📚 Extracting vocabulary...'}
                    {streamStage === 'tts' && '🔊 Generating audio...'}
                    {streamStage === 'complete' && '✅ Complete!'}
                  </span>
                  {streamStage === 'tts' && (
                    <span className="text-xs text-[#5f5f5f]">{streamProgress}%</span>
                  )}
                </div>
                
                {/* Progress bar */}
                <div className="h-2 bg-[#e5e7eb] rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-[#3D6E4E] transition-all duration-300 rounded-full"
                    style={{ 
                      width: streamStage === 'extracting' ? '10%' :
                             streamStage === 'storing' ? '25%' :
                             streamStage === 'summarizing' ? '50%' :
                             streamStage === 'vocab' ? '70%' :
                             streamStage === 'tts' ? `${streamProgress}%` :
                             streamStage === 'complete' ? '100%' : '0%'
                    }}
                  />
                </div>
                
                {/* Live summary preview */}
                {streamingSummary && (
                  <div className="mt-4 p-4 bg-[#f8f9fa] rounded-xl">
                    <p className="text-xs font-semibold text-[#5f5f5f] mb-2">Summary Preview:</p>
                    <p className="text-sm text-[#1a1a1a] line-clamp-4">{streamingSummary}</p>
                  </div>
                )}
                
                {/* Live vocab preview */}
                {streamingVocab.length > 0 && (
                  <div className="mt-3">
                    <p className="text-xs font-semibold text-[#5f5f5f] mb-2">
                      Vocabulary ({streamingVocab.length} terms):
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {streamingVocab.slice(0, 5).map((v, i) => (
                        <span key={i} className="px-2 py-1 bg-[#EBF3FF] text-[#407BFF] text-xs rounded-lg">
                          {v.word}
                        </span>
                      ))}
                      {streamingVocab.length > 5 && (
                        <span className="px-2 py-1 bg-gray-100 text-gray-500 text-xs rounded-lg">
                          +{streamingVocab.length - 5} more
                        </span>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* READING */}
      {viewState === 'reading' && (
        <div className="flex gap-6">
          {/* Main Content */}
          <div className="flex-1">
            <Card 
              className="border border-[#e5e7eb] shadow-[0_2px_8px_rgba(0,0,0,0.06)] rounded-2xl overflow-hidden" 
              style={{ backgroundColor: BACKGROUND_TINTS[backgroundTint] }}
            >
              {/* Header */}
              <div className="flex flex-wrap items-center justify-between gap-3 px-5 py-4 border-b border-[#e5e7eb]" style={{ backgroundColor: `${BACKGROUND_TINTS[backgroundTint]}f0` }}>
                <div className="flex items-center gap-2.5 px-3 py-1.5 bg-white rounded-full border border-[#e5e7eb] text-sm shadow-sm">
                  <Icon name="file" size={16} className="text-[#3D6E4E]" />
                  <span className="text-[#1a1a1a] font-medium truncate max-w-[140px]">ML_Introduction.pdf</span>
                </div>
                <div className="flex items-center gap-2">
                  <button 
                    onClick={() => setTextMode('original')} 
                    className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                      textMode === 'original'
                        ? 'bg-white text-[#1a1a1a] border-2 border-[#3D6E4E] shadow-sm'
                        : 'bg-transparent text-[#5f5f5f] hover:bg-white/50'
                    }`}
                  >
                    Original
                  </button>
                  <div className="relative">
                    <button 
                      onClick={(e) => { e.stopPropagation(); setShowDifficultyDropdown(!showDifficultyDropdown); }} 
                      className={`px-4 py-2 rounded-xl text-sm font-medium border-2 flex items-center gap-2 transition-all ${
                        textMode === 'simplified' || textMode === 'summarized'
                          ? 'bg-[#3D6E4E] text-white border-[#3D6E4E] shadow-sm'
                          : 'bg-transparent text-[#5f5f5f] hover:bg-white/50'
                      }`}
                    >
                      Simplified
                      <Icon name="chevron-down" size={16} />
                    </button>
                    {showDifficultyDropdown && (
                      <div className="absolute top-full mt-2 right-0 bg-white rounded-xl shadow-lg border border-[#e5e7eb] py-2 w-36 z-50" onClick={(e) => e.stopPropagation()}>
                        <button onClick={() => { setDifficulty('beginner'); setTextMode('simplified'); setShowDifficultyDropdown(false); }} className={`block w-full text-left px-4 py-2.5 text-sm ${difficulty === 'beginner' ? 'bg-[#f0f7f1] text-[#3D6E4E] font-semibold' : 'text-[#5f5f5f] hover:bg-[#f8f9fa]'}`}>Beginner</button>
                        <button onClick={() => { setDifficulty('intermediate'); setTextMode('simplified'); setShowDifficultyDropdown(false); }} className={`block w-full text-left px-4 py-2.5 text-sm ${difficulty === 'intermediate' ? 'bg-[#f0f7f1] text-[#3D6E4E] font-semibold' : 'text-[#5f5f5f] hover:bg-[#f8f9fa]'}`}>Intermediate</button>
                      </div>
                    )}
                  </div>
                  <button onClick={() => setFocusMode(true)} className="p-2.5 rounded-xl hover:bg-black/5 text-[#5f5f5f] transition-colors ml-1" title="Focus Mode">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3"/></svg>
                  </button>
                  <button onClick={() => setViewState('home')} className="p-2.5 rounded-xl hover:bg-black/5 text-[#5f5f5f] transition-colors">
                    <Icon name="close" size={20} />
                  </button>
                </div>
              </div>

              {/* Content */}
              <CardContent className="p-8">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                  <h2 className="text-xl font-bold text-[#1a1a1a]">{textMode === 'summarized' ? 'Summary' : uploadedFile?.name || 'Document'}</h2>
                  {ttsAudioB64 && textMode === 'summarized' && (
                    <audio 
                      controls 
                      src={`data:audio/wav;base64,${ttsAudioB64}`} 
                      className="h-10 w-full sm:w-auto"
                    />
                  )}
                </div>
                <DimmedText content={getCurrentText()} dimmed={dimSurrounding} fontFamily={getFontFamily()} letterSpacing={letterSpacing} wordSpacing={wordSpacing} lineHeight={lineHeight} vocabList={vocabList} onWordClick={handleWordClick} />
              </CardContent>
            </Card>
          </div>

          {/* Desktop Tools Panel */}
          <div className={`hidden lg:block flex-shrink-0 transition-all duration-300 ${toolsCollapsed ? 'w-12' : 'w-64'}`}>
            <ToolsPanel 
              collapsed={toolsCollapsed} 
              setCollapsed={setToolsCollapsed}
              fontChoice={fontChoice}
              setFontChoice={setFontChoice}
              showFontDropdown={showFontDropdown}
              setShowFontDropdown={setShowFontDropdown}
              letterSpacing={letterSpacing}
              setLetterSpacing={setLetterSpacing}
              wordSpacing={wordSpacing}
              setWordSpacing={setWordSpacing}
              lineHeight={lineHeight}
              setLineHeight={setLineHeight}
              backgroundTint={backgroundTint}
              setBackgroundTint={setBackgroundTint}
              showTintPicker={showTintPicker}
              setShowTintPicker={setShowTintPicker}
              dimSurrounding={dimSurrounding}
              setDimSurrounding={setDimSurrounding}
              showSpacingPanel={showSpacingPanel}
              setShowSpacingPanel={setShowSpacingPanel}
              isProcessing={isProcessing}
              handleSummarize={handleSummarize}
              vocabList={vocabList}
              handleWordClick={handleWordClick}
              isMobile={false}
            />
          </div>

          {/* Mobile Tools Sheet */}
          {showMobileTools && (
            <>
              <div className="lg:hidden fixed inset-0 bg-black/40 backdrop-blur-sm z-[60]" onClick={() => setShowMobileTools(false)} />
              <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white rounded-t-3xl z-[70] max-h-[85vh] overflow-y-auto shadow-[0_-4px_20px_rgba(0,0,0,0.15)]">
                <div className="p-6">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-lg font-bold text-[#1a1a1a]">Reading Tools</h3>
                    <button onClick={() => setShowMobileTools(false)} className="p-2.5 rounded-xl hover:bg-[#f8f9fa] transition-colors">
                      <Icon name="close" size={24} />
                    </button>
                  </div>
                  <ToolsPanel 
                    collapsed={false}
                    setCollapsed={() => {}}
                    fontChoice={fontChoice}
                    setFontChoice={setFontChoice}
                    showFontDropdown={showFontDropdown}
                    setShowFontDropdown={setShowFontDropdown}
                    letterSpacing={letterSpacing}
                    setLetterSpacing={setLetterSpacing}
                    wordSpacing={wordSpacing}
                    setWordSpacing={setWordSpacing}
                    lineHeight={lineHeight}
                    setLineHeight={setLineHeight}
                    backgroundTint={backgroundTint}
                    setBackgroundTint={setBackgroundTint}
                    showTintPicker={showTintPicker}
                    setShowTintPicker={setShowTintPicker}
                    dimSurrounding={dimSurrounding}
                    setDimSurrounding={setDimSurrounding}
                    showSpacingPanel={showSpacingPanel}
                    setShowSpacingPanel={setShowSpacingPanel}
                    isProcessing={isProcessing}
                    handleSummarize={handleSummarize}
                    vocabList={vocabList}
                    handleWordClick={handleWordClick}
                    isMobile={true}
                  />
                </div>
              </div>
            </>
          )}
        </div>
      )}

      {/* Word Tooltip */}
      {selectedWord && (
        <div className="fixed z-50 bg-white rounded-2xl shadow-xl border border-[#e5e7eb] p-4 w-64" style={{ left: Math.min(tooltipPosition.x, window.innerWidth - 280), top: Math.min(tooltipPosition.y + 20, window.innerHeight - 180) }} onClick={(e) => e.stopPropagation()}>
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <h4 className="font-bold text-base text-[#1a1a1a]">{selectedWord.word}</h4>
              <button className="text-[#3D6E4E] hover:scale-110 transition-transform"><Icon name="volume" size={18} /></button>
            </div>
            <button onClick={() => setSelectedWord(null)} className="text-[#9ca3af] hover:text-[#5f5f5f]"><Icon name="close" size={18} /></button>
          </div>
          <p className="text-sm text-[#5f5f5f] mb-3 leading-relaxed">{selectedWord.definition}</p>
          <div className="border-t border-[#e5e7eb] pt-2">
            <p className="text-xs text-[#3D6E4E] font-semibold">Synonyms: <span className="text-[#9ca3af] font-normal">{selectedWord.synonyms.join(', ')}</span></p>
          </div>
        </div>
      )}
    </div>
  );
}

// Tools Panel Component
interface ToolsPanelProps {
  collapsed: boolean;
  setCollapsed: (v: boolean) => void;
  fontChoice: FontChoice;
  setFontChoice: (v: FontChoice) => void;
  showFontDropdown: boolean;
  setShowFontDropdown: (v: boolean) => void;
  letterSpacing: number;
  setLetterSpacing: (v: number) => void;
  wordSpacing: number;
  setWordSpacing: (v: number) => void;
  lineHeight: number;
  setLineHeight: (v: number) => void;
  backgroundTint: BackgroundTint;
  setBackgroundTint: (v: BackgroundTint) => void;
  showTintPicker: boolean;
  setShowTintPicker: (v: boolean) => void;
  dimSurrounding: boolean;
  setDimSurrounding: (v: boolean) => void;
  showSpacingPanel: boolean;
  setShowSpacingPanel: (v: boolean) => void;
  isProcessing: boolean;
  handleSummarize: () => void;
  vocabList: VocabWord[];
  handleWordClick: (word: string, e: React.MouseEvent) => void;
  isMobile: boolean;
}

function ToolsPanel({ 
  collapsed, setCollapsed, fontChoice, setFontChoice, showFontDropdown, setShowFontDropdown,
  letterSpacing, setLetterSpacing, wordSpacing, setWordSpacing, lineHeight, setLineHeight,
  backgroundTint, setBackgroundTint, showTintPicker, setShowTintPicker, dimSurrounding, setDimSurrounding,
  showSpacingPanel, setShowSpacingPanel, isProcessing, handleSummarize, vocabList, handleWordClick, isMobile
}: ToolsPanelProps) {
  const cardBase = isMobile 
    ? "bg-[#f8f9fa] rounded-2xl p-5 border border-[#e5e7eb]" 
    : "bg-white rounded-2xl p-5 border border-[#e5e7eb] shadow-[0_2px_8px_rgba(0,0,0,0.04)]";
  
  if (collapsed && !isMobile) {
    return (
      <div className="sticky top-0">
        <button onClick={() => setCollapsed(false)} className="p-2 rounded-xl hover:bg-[#f0f7f1] text-[#5f5f5f] transition-colors" title="Expand tools">
          <Icon name="chevron-left" size={20} />
        </button>
      </div>
    );
  }

  return (
    <div className={`space-y-4 ${isMobile ? '' : 'sticky top-0'}`}>
      {!isMobile && (
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-base font-bold text-[#3D6E4E]">Tools</h3>
          <button onClick={() => setCollapsed(true)} className="p-2 rounded-xl hover:bg-[#f0f7f1] text-[#5f5f5f] transition-colors">
            <Icon name="chevron-right" size={20} />
          </button>
        </div>
      )}

      {/* Font */}
      <div className={cardBase}>
        <button onClick={(e) => { e.stopPropagation(); setShowFontDropdown(!showFontDropdown); setShowSpacingPanel(false); }} className="w-full flex items-center justify-between text-sm font-semibold text-[#1a1a1a]">
          Font Choice <Icon name="chevron-down" size={18} className={`transition-transform text-[#9ca3af] ${showFontDropdown ? 'rotate-180' : ''}`} />
        </button>
        {showFontDropdown && (
          <div className="mt-3 bg-white rounded-xl shadow-lg border border-[#e5e7eb] py-2 overflow-hidden" onClick={(e) => e.stopPropagation()}>
            {(['default', 'opendyslexic', 'roboto'] as FontChoice[]).map((font) => (
              <button key={font} onClick={() => { setFontChoice(font); setShowFontDropdown(false); }} className={`w-full text-left px-4 py-3 text-sm capitalize transition-colors ${fontChoice === font ? 'bg-[#f0f7f1] text-[#3D6E4E] font-semibold' : 'text-[#5f5f5f] hover:bg-[#f8f9fa]'}`}>
                {font === 'opendyslexic' ? 'OpenDyslexic' : font === 'roboto' ? 'Roboto' : 'Default'}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Spacing */}
      <div className={cardBase}>
        <button onClick={() => { setShowSpacingPanel(!showSpacingPanel); setShowFontDropdown(false); }} className="w-full flex items-center justify-between text-sm font-semibold text-[#1a1a1a]">
          Spacing <Icon name="chevron-down" size={18} className={`transition-transform text-[#9ca3af] ${showSpacingPanel ? 'rotate-180' : ''}`} />
        </button>
        {showSpacingPanel && (
          <div className="mt-4 space-y-4">
            <div>
              <div className="flex justify-between mb-1.5">
                <label className="text-xs font-medium text-[#5f5f5f]">Letter spacing</label>
                <span className="text-xs text-[#9ca3af]">{letterSpacing}px</span>
              </div>
              <input type="range" min="0" max="5" step="0.5" value={letterSpacing} onChange={(e) => setLetterSpacing(parseFloat(e.target.value))} className="w-full h-2 bg-[#e5e7eb] rounded-lg accent-[#3D6E4E] cursor-pointer" />
            </div>
            <div>
              <div className="flex justify-between mb-1.5">
                <label className="text-xs font-medium text-[#5f5f5f]">Word spacing</label>
                <span className="text-xs text-[#9ca3af]">{wordSpacing}px</span>
              </div>
              <input type="range" min="0" max="10" step="1" value={wordSpacing} onChange={(e) => setWordSpacing(parseFloat(e.target.value))} className="w-full h-2 bg-[#e5e7eb] rounded-lg accent-[#3D6E4E] cursor-pointer" />
            </div>
            <div>
              <div className="flex justify-between mb-1.5">
                <label className="text-xs font-medium text-[#5f5f5f]">Line height</label>
                <span className="text-xs text-[#9ca3af]">{lineHeight.toFixed(1)}</span>
              </div>
              <input type="range" min="1" max="3" step="0.1" value={lineHeight} onChange={(e) => setLineHeight(parseFloat(e.target.value))} className="w-full h-2 bg-[#e5e7eb] rounded-lg accent-[#3D6E4E] cursor-pointer" />
            </div>
          </div>
        )}
      </div>

      {/* Dim Surrounding */}
      <div className={`${cardBase} flex items-center justify-between`}>
        <span className="text-sm font-semibold text-[#1a1a1a]">Dim surrounding</span>
        <button onClick={() => setDimSurrounding(!dimSurrounding)} className={`w-11 h-6 rounded-full transition-colors relative ${dimSurrounding ? 'bg-[#3D6E4E]' : 'bg-[#e5e7eb]'}`}>
          <span className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow-sm transition-all ${dimSurrounding ? 'left-6' : 'left-1'}`} />
        </button>
      </div>

      {/* Background Tint */}
      <div className={cardBase}>
        <div className="flex items-center justify-between mb-3">
          <span className="text-sm font-semibold text-[#1a1a1a]">Background</span>
          <button onClick={() => setShowTintPicker(!showTintPicker)} className="text-xs font-semibold text-[#3D6E4E] hover:underline">
            {showTintPicker ? 'Hide' : 'Show'} colors
          </button>
        </div>
        <div className="grid grid-cols-8 gap-1.5">
          <button onClick={() => setBackgroundTint('none')} className={`w-7 h-7 rounded-full border-2 flex items-center justify-center bg-white transition-all ${backgroundTint === 'none' ? 'border-[#3D6E4E] ring-2 ring-[#3D6E4E]/20' : 'border-[#e5e7eb]'}`} title="White">
            <Icon name="close" size={12} className="text-[#9ca3af]" />
          </button>
          {TINT_COLORS.map((tint) => (
            <button key={tint.id} onClick={() => setBackgroundTint(tint.id as BackgroundTint)} className={`w-7 h-7 rounded-full border-2 transition-all ${backgroundTint === tint.id ? 'border-[#3D6E4E] ring-2 ring-[#3D6E4E]/20 scale-110' : 'border-transparent hover:scale-105'}`} style={{ backgroundColor: tint.color }} />
          ))}
        </div>
        <div className="mt-3 text-xs text-[#9ca3af] text-center font-medium">
          {backgroundTint === 'none' ? 'White (default)' : TINT_COLORS.find(t => t.id === backgroundTint)?.id.charAt(0).toUpperCase() + TINT_COLORS.find(t => t.id === backgroundTint)!.id.slice(1)}
        </div>
      </div>

      {/* Summarize */}
      <Button 
        onClick={handleSummarize} 
        isLoading={isProcessing} 
        variant="outline" 
        className="w-full rounded-xl py-3.5 text-sm font-semibold border-2 border-[#3D6E4E] text-[#3D6E4E] hover:bg-[#f0f7f1] transition-colors" 
        leftIcon={<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="18" x2="21" y2="18"/></svg>}
      >
        Summarize Text
      </Button>

      {/* Vocab */}
      <div className={cardBase}>
        <h4 className="text-sm font-bold text-[#3D6E4E] mb-3">Vocabulary List</h4>
        <div className="space-y-1">
          {vocabList.map((vocab) => (
            <button key={vocab.word} onClick={(e) => handleWordClick(vocab.word, e)} className="w-full text-left px-3 py-2.5 rounded-xl text-sm font-medium text-[#1a1a1a] hover:bg-[#f0f7f1] transition-colors">
              {vocab.word}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

// Dimmed Text Component
function DimmedText({ 
  content, 
  dimmed, 
  fontFamily, 
  letterSpacing, 
  wordSpacing, 
  lineHeight, 
  vocabList, 
  onWordClick 
}: { 
  content: string; 
  dimmed: boolean; 
  fontFamily: string; 
  letterSpacing: number; 
  wordSpacing: number; 
  lineHeight: number; 
  vocabList: VocabWord[]; 
  onWordClick: (word: string, e: React.MouseEvent) => void;
}) {
  const [activeParagraph, setActiveParagraph] = useState<number | null>(null);
  const paragraphs = content.split('\n').filter(p => p.trim());

  return (
    <div className="text-[15px] text-[#1a1a1a] leading-[1.7]" style={{ fontFamily, letterSpacing: `${letterSpacing}px`, wordSpacing: `${wordSpacing}px`, lineHeight }}>
      {paragraphs.map((paragraph, idx) => {
        if (paragraph.trim().startsWith('•')) {
          return (
            <div key={idx} className={`mb-4 pl-5 relative transition-opacity duration-300 ${dimmed && activeParagraph !== idx ? 'opacity-30' : 'opacity-100'}`} onMouseEnter={() => dimmed && setActiveParagraph(idx)} onMouseLeave={() => dimmed && setActiveParagraph(null)}>
              <span className="absolute left-0 text-[#3D6E4E] text-lg">•</span>
              <span>{paragraph.replace('•', '').trim()}</span>
            </div>
          );
        }
        if (paragraph.trim() === 'Early Life and Artistic Failure') {
          return <h3 key={idx} className="font-bold text-lg text-[#1a1a1a] mt-8 mb-4">{paragraph}</h3>;
        }
        
        const words = paragraph.split(/(\s+)/);
        const highlighted = vocabList.map(v => v.word.toLowerCase());
        
        return (
          <p key={idx} className={`mb-5 transition-opacity duration-300 ${dimmed && activeParagraph !== idx ? 'opacity-30' : 'opacity-100'}`} onMouseEnter={() => dimmed && setActiveParagraph(idx)} onMouseLeave={() => dimmed && setActiveParagraph(null)}>
            {words.map((word, wIdx) => {
              const clean = word.replace(/[^a-zA-Z]/g, '').toLowerCase();
              if (highlighted.includes(clean) && clean.length > 0) {
                const vocab = vocabList.find(v => v.word.toLowerCase() === clean);
                return <span key={wIdx} className="bg-[#EBF3FF] px-1 rounded cursor-pointer hover:bg-[#d4e5ff] transition-colors border-b-2 border-[#407BFF] font-medium" onClick={(e) => onWordClick(word, e)} title={vocab?.definition}>{word}</span>;
              }
              return <span key={wIdx}>{word}</span>;
            })}
          </p>
        );
      })}
    </div>
  );
}
