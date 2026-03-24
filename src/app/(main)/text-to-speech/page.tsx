'use client';

import { Card, CardContent } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import { useState, useRef, useEffect } from 'react';
import { Icon } from '@/components/Icon';
import { toast } from 'sonner';

interface TTSHistoryItem {
  id: string;
  text: string;
  createdAt: Date;
}

interface UploadedFile {
  name: string;
  size: number;
  type: string;
}

// Hex pattern SVG background
const HexPattern = () => (
  <svg className="absolute inset-0 w-full h-full opacity-[0.08] pointer-events-none" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <pattern id="hex" x="0" y="0" width="56" height="48" patternUnits="userSpaceOnUse">
        <polygon points="14,2 42,2 56,26 42,46 14,46 0,26" fill="none" stroke="#3D6E4E" strokeWidth="1.5" />
      </pattern>
    </defs>
    <rect width="100%" height="100%" fill="url(#hex)" />
  </svg>
);

// TTS Illustration - Girl with big envelope
const TTSIllustration = ({ className }: { className?: string }) => (
  <img 
    src="/images/reading assitant svg (lady and envelope).svg" 
    alt="Girl with envelope" 
    className={className}
  />
);

export default function TextToSpeechPage() {
  const [text, setText] = useState('');
  const [isPlaying, setIsPlaying] = useState(false);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [history, setHistory] = useState<TTSHistoryItem[]>([]);
  const [showSettings, setShowSettings] = useState(false);
  const [dragging, setDragging] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<UploadedFile | null>(null);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const saved = localStorage.getItem('tts-history');
    if (saved) setHistory(JSON.parse(saved));
  }, []);

  useEffect(() => {
    localStorage.setItem('tts-history', JSON.stringify(history));
  }, [history]);

  const handleSpeak = () => {
    if (!text.trim()) {
      toast.error('Please enter some text to convert');
      return;
    }

    if (isPlaying) {
      window.speechSynthesis.cancel();
      setIsPlaying(false);
      return;
    }

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = playbackRate;
    utterance.pitch = 1;
    utterance.volume = 1;

    const voices = window.speechSynthesis.getVoices();
    const preferredVoice = voices.find((v) => v.name.includes('Google') || v.name.includes('Natural'));
    if (preferredVoice) utterance.voice = preferredVoice;

    utterance.onstart = () => setIsPlaying(true);
    utterance.onend = () => setIsPlaying(false);
    utterance.onerror = () => {
      setIsPlaying(false);
      toast.error('Error playing audio');
    };

    utteranceRef.current = utterance;
    window.speechSynthesis.speak(utterance);

    const newItem: TTSHistoryItem = {
      id: Date.now().toString(),
      text: text.slice(0, 100) + (text.length > 100 ? '...' : ''),
      createdAt: new Date(),
    };
    setHistory((prev) => [newItem, ...prev].slice(0, 10));
  };

  const handleClear = () => {
    setText('');
    window.speechSynthesis.cancel();
    setIsPlaying(false);
  };

  const clearHistory = () => {
    setHistory([]);
    localStorage.removeItem('tts-history');
    toast.success('History cleared');
  };

  const onDragOver = (e: React.DragEvent) => { e.preventDefault(); setDragging(true); };
  const onDragLeave = () => setDragging(false);
  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    const f = e.dataTransfer.files[0];
    if (f) handleFileUpload(f);
  };
  const onFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (f) handleFileUpload(f);
  };

  const handleFileUpload = (file: File) => {
    const allowedTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'text/plain', 'image/'];
    const isAllowed = allowedTypes.some(type => file.type === type || (type.endsWith('/') && file.type.startsWith(type)));
    
    if (!isAllowed) {
      toast.error('Please upload a PDF, DOC, TXT, or image file');
      return;
    }
    
    if (file.size > 25 * 1024 * 1024) {
      toast.error('File size must be less than 25MB');
      return;
    }
    
    setUploadedFile({ name: file.name, size: file.size, type: file.type });
    toast.success(`File "${file.name}" uploaded successfully`);
    setText(`[Content from ${file.name} will be extracted here...]`);
  };

  const removeFile = () => {
    setUploadedFile(null);
    if (fileRef.current) fileRef.current.value = '';
  };

  const formatBytes = (b: number) => b < 1024 * 1024 ? `${(b / 1024).toFixed(1)} KB` : `${(b / (1024 * 1024)).toFixed(1)} MB`;
  const getExt = (name: string) => name.split('.').pop()?.toUpperCase().slice(0, 4) || 'FILE';

  return (
    <div className="space-y-8">
      {/* Header - Clean Design */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <h1 className="text-[28px] font-bold text-[#1a1a1a] tracking-tight">Text to Speech</h1>
          <div className="w-10 h-10 rounded-full bg-[#3D6E4E] flex items-center justify-center shadow-md">
            <Icon name="volume" size={20} className="text-white" />
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={() => setShowSettings(!showSettings)} className="w-11 h-11 flex items-center justify-center rounded-xl bg-white text-[#5f5f5f] shadow-sm hover:shadow-md hover:scale-[1.02] transition-all border border-[#e5e7eb]">
            <Icon name="settings" size={20} />
          </button>
          <button className="w-11 h-11 flex items-center justify-center rounded-xl bg-white text-[#5f5f5f] shadow-sm hover:shadow-md hover:scale-[1.02] transition-all border border-[#e5e7eb]">
            <Icon name="moon" size={20} />
          </button>
        </div>
      </div>

      {/* Hero Card - Soft Blue */}
      <Card className="relative overflow-hidden border-0 rounded-2xl bg-[#EBF3FF] shadow-[0_2px_8px_rgba(0,0,0,0.06)] cursor-pointer hover:shadow-md transition-shadow" onClick={() => document.getElementById('text-input-area')?.focus()}>
        <HexPattern />
        <CardContent className="relative z-10 p-8 flex items-center gap-8">
          <div className="flex-shrink-0 w-32 h-28"><TTSIllustration className="w-full h-full" /></div>
          <div>
            <h2 className="text-xl font-bold text-[#1a1a1a] mb-2">Text to Speech Hub</h2>
            <p className="text-[15px] text-[#5f5f5f] leading-relaxed">Turn text into sound. Sit back, listen & watch the words light up as you learn.</p>
          </div>
        </CardContent>
      </Card>

      {/* Settings */}
      {showSettings && (
        <Card className="bg-white border border-[#e5e7eb] rounded-2xl shadow-[0_2px_8px_rgba(0,0,0,0.04)]">
          <CardContent className="p-5">
            <div className="flex items-center gap-4">
              <Icon name="volume" size={18} className="text-[#9ca3af]" />
              <span className="text-sm font-semibold text-[#1a1a1a]">Playback Speed:</span>
              <div className="flex gap-2">
                {[0.5, 1, 1.5, 2].map((rate) => (
                  <button key={rate} onClick={() => setPlaybackRate(rate)} className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all ${playbackRate === rate ? 'bg-[#3D6E4E] text-white shadow-sm' : 'bg-[#f8f9fa] text-[#5f5f5f] hover:bg-[#f0f7f1] border border-[#e5e7eb]'}`}>{rate}x</button>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Upload Zone - Sage Green */}
      <div className={`rounded-2xl border-2 border-dashed transition-all duration-200 cursor-pointer flex flex-col items-center justify-center py-16 px-6 gap-5 ${dragging ? 'border-[#3D6E4E] bg-[#E8F3EA] scale-[1.01]' : 'border-[#D4E8D7] bg-[#F0F7F1] hover:border-[#3D6E4E]'}`} onDragOver={onDragOver} onDragLeave={onDragLeave} onDrop={onDrop} onClick={() => !uploadedFile && fileRef.current?.click()}>
        <input ref={fileRef} type="file" accept=".pdf,.doc,.docx,.txt,image/*" className="hidden" onChange={onFileInput} />
        <div className="w-16 h-16 rounded-full bg-[#3D6E4E] flex items-center justify-center text-white shadow-lg shadow-[#3D6E4E]/20">
          <Icon name="upload" size={28} />
        </div>
        <div className="text-center">
          <p className="text-[#3D6E4E] font-semibold text-base">
            <span className="font-bold">Click to upload</span> or drag and drop
          </p>
          <p className="text-[#5f5f5f] text-sm mt-2">
            PDF, DOC, TXT, or Image files (max 25MB)
          </p>
        </div>
      </div>

      {/* File Preview */}
      {uploadedFile && (
        <div className="flex items-center gap-4 bg-white rounded-2xl p-4 shadow-[0_2px_8px_rgba(0,0,0,0.06)] border border-[#e5e7eb]">
          <div className="w-12 h-12 rounded-xl bg-[#E8F3EA] flex items-center justify-center text-[#3D6E4E] text-xs font-bold">
            {getExt(uploadedFile.name)}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-[#1a1a1a] truncate">{uploadedFile.name}</p>
            <p className="text-xs text-[#9ca3af]">{formatBytes(uploadedFile.size)}</p>
          </div>
          <button className="p-2.5 text-[#9ca3af] hover:text-red-500 hover:bg-red-50 rounded-xl transition-colors" onClick={(e) => { e.stopPropagation(); removeFile(); }}>
            <Icon name="close" size={20} />
          </button>
        </div>
      )}

      {/* Text Input */}
      <Card className="border border-[#e5e7eb] bg-white rounded-2xl shadow-[0_2px_8px_rgba(0,0,0,0.04)]">
        <CardContent className="p-6">
          <div className="flex items-center gap-2 mb-4 text-[#9ca3af]">
            <Icon name="font" size={18} />
            <span className="text-sm font-semibold text-[#1a1a1a]">Enter your text</span>
          </div>
          <textarea
            id="text-input-area"
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Type or paste your text here to convert it to speech..."
            className="w-full h-48 p-5 text-[15px] text-[#1a1a1a] bg-[#f8f9fa] rounded-xl border border-[#e5e7eb] focus:border-[#3D6E4E] focus:ring-2 focus:ring-[#3D6E4E]/10 focus:outline-none resize-none transition-all"
          />
          <div className="flex items-center justify-between gap-3 mt-5">
            <span className="text-sm text-[#9ca3af] font-medium">{text.length} characters</span>
            <div className="flex gap-2">
              <Button variant="ghost" size="sm" onClick={handleClear} leftIcon={<Icon name="trash" size={18} />} disabled={!text} className="text-sm px-4 py-2.5 h-auto font-medium">Clear</Button>
              <Button onClick={handleSpeak} leftIcon={isPlaying ? <Icon name="pause" size={18} /> : <Icon name="play" size={18} />} className={`text-sm px-5 py-2.5 h-auto font-semibold shadow-lg shadow-[#3D6E4E]/20 ${isPlaying ? 'bg-amber-500 hover:bg-amber-600' : ''}`}>{isPlaying ? 'Stop' : 'Convert to Speech'}</Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Feature Cards */}
      <div className="grid gap-4 grid-cols-3">
        <Card className="border border-[#e5e7eb] rounded-2xl shadow-[0_2px_8px_rgba(0,0,0,0.04)] hover:shadow-md transition-shadow">
          <CardContent className="p-5 flex items-center gap-4">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 flex-shrink-0">
              <Icon name="headphones" size={22} className="text-blue-600" />
            </div>
            <div className="min-w-0 hidden sm:block">
              <p className="font-semibold text-[#1a1a1a] text-sm">Natural Voices</p>
              <p className="text-xs text-[#9ca3af]">High-quality AI voices</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border border-[#e5e7eb] rounded-2xl shadow-[0_2px_8px_rgba(0,0,0,0.04)] hover:shadow-md transition-shadow">
          <CardContent className="p-5 flex items-center gap-4">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-purple-50 flex-shrink-0">
              <Icon name="settings" size={22} className="text-purple-600" />
            </div>
            <div className="min-w-0 hidden sm:block">
              <p className="font-semibold text-[#1a1a1a] text-sm">Speed Control</p>
              <p className="text-xs text-[#9ca3af]">Adjust playback speed</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border border-[#e5e7eb] rounded-2xl shadow-[0_2px_8px_rgba(0,0,0,0.04)] hover:shadow-md transition-shadow">
          <CardContent className="p-5 flex items-center gap-4">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-green-50 flex-shrink-0">
              <Icon name="download" size={22} className="text-green-600" />
            </div>
            <div className="min-w-0 hidden sm:block">
              <p className="font-semibold text-[#1a1a1a] text-sm">Download</p>
              <p className="text-xs text-[#9ca3af]">Save as MP3</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent History */}
      {history.length > 0 && (
        <Card className="border border-[#e5e7eb] rounded-2xl shadow-[0_2px_8px_rgba(0,0,0,0.04)]">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-5">
              <h3 className="font-bold text-[#1a1a1a] text-base">Recent Conversions</h3>
              <button onClick={clearHistory} className="text-sm font-medium text-[#9ca3af] hover:text-[#3D6E4E] transition-colors">Clear History</button>
            </div>
            <div className="space-y-2">
              {history.map((item) => (
                <div key={item.id} className="flex items-center justify-between p-4 bg-[#f8f9fa] rounded-xl hover:bg-[#f0f7f1] transition-colors">
                  <div className="flex items-center gap-3 min-w-0">
                    <Icon name="volume" size={18} className="text-[#9ca3af] flex-shrink-0" />
                    <span className="text-sm text-[#1a1a1a] truncate font-medium">{item.text}</span>
                  </div>
                  <span className="text-xs text-[#9ca3af] flex-shrink-0 ml-3 font-medium">{new Date(item.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
