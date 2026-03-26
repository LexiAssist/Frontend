'use client';

import { useState, useRef, useEffect } from 'react';
import { Icon } from "@/components/Icon";
import { toast } from 'sonner';

export default function WritingAssistantPage() {
  // Merged State from both versions
  const [text, setText] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [showTools, setShowTools] = useState(false); // For mobile tools sidebar
  const [expandedTool, setExpandedTool] = useState<string | null>('tools'); // For sidebar accordions

  // State from new code
  const [confidence, setConfidence] = useState<'low' | 'high'>('low');
  const [isProcessing, setIsProcessing] = useState(false);
  const [isCopied, setIsCopied] = useState(false);
  const [exportOpen, setExportOpen] = useState(false);
  const [fontChoice, setFontChoice] = useState('System Default');
  const [spacing, setSpacing] = useState('Normal');
  const [tintedBg, setTintedBg] = useState(false);

  // Refs
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // --- From new code: Initial text and options ---
  useEffect(() => {
    setText(`Adolf Hitler's life remains one of the most studied and scrutinized periods in modern history, marking the transition from a failed artist to the architect of a global catastrophe.
Early Life and Artistic Failure
Adolf Hitler was born on April 20, 1889, in the small Austrian town of Braunau am Inn. His early years were shaped by a difficult relationship with his strict father and a deep devotion to his mother. In 1907, he moved to Vienna with dreams of becoming an artist. However, he was twice rejected by the Academy of Fine Arts. During his years of poverty in Vienna, he began to adopt the extreme nationalist and antisemitic ideologies that would later define his regime.`);
  }, []);

  const fontOptions = [
    'System Default',
    'OpenDyslexic',
    'Arial',
    'Times New Roman',
    'Georgia',
    'Verdana',
    'Comic Sans MS'
  ];

  const spacingOptions = [
    'Compact',
    'Normal',
    'Relaxed',
    'Wide'
  ];

  // --- From new code: Style helpers ---
  const getFontFamily = () => {
    switch (fontChoice) {
      case 'OpenDyslexic':
        return 'OpenDyslexic, sans-serif';
      case 'Arial':
        return 'Arial, sans-serif';
      case 'Times New Roman':
        return 'Times New Roman, serif';
      case 'Georgia':
        return 'Georgia, serif';
      case 'Verdana':
        return 'Verdana, sans-serif';
      case 'Comic Sans MS':
        return 'Comic Sans MS, cursive';
      default:
        return 'system-ui, -apple-system, sans-serif';
    }
  };

  const getLineHeight = () => {
    switch (spacing) {
      case 'Compact':
        return '1.4';
      case 'Normal':
        return '1.6';
      case 'Relaxed':
        return '1.8';
      case 'Wide':
        return '2.0';
      default:
        return '1.6';
    }
  };

  // --- From old code: Speech Recognition ---
  useEffect(() => {
    if (typeof window !== 'undefined' && ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window)) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = true;
      recognitionRef.current.interimResults = true;

      recognitionRef.current.onresult = (event) => {
        let finalTranscript = '';
        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcript = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            finalTranscript += transcript + ' ';
          }
        }
        if (finalTranscript) {
          setText((prev) => prev + finalTranscript);
        }
      };

      recognitionRef.current.onerror = (event) => {
        console.error('Speech recognition error', event.error);
        setIsRecording(false);
        toast.error('Voice recognition error. Please try again.');
      };

      recognitionRef.current.onend = () => {
        setIsRecording(false);
      };
    }
  }, []);

  const toggleRecording = () => {
    if (!recognitionRef.current) {
      toast.error('Voice recognition not supported in your browser');
      return;
    }
    if (isRecording) {
      recognitionRef.current.stop();
      toast.success('Voice recording stopped');
    } else {
      recognitionRef.current.start();
      setIsRecording(true);
      toast.success('Voice recording started. Speak now...');
    }
  };

  // --- From new code, adapted: Core Functions ---
  const handleCleanAndStructure = async () => {
    if (!text.trim()) {
      toast.error('Please enter some text first');
      return;
    }
    setIsProcessing(true);
    setConfidence('low');
    toast.info('Cleaning and structuring text...');
    
    try {
      // This is a placeholder for an actual API call.
      // In a real app, you'd have a backend endpoint to securely handle your API key.
      await new Promise(resolve => setTimeout(resolve, 1500));
      const improvedText = text.replace(/(\r\n|\n|\r)/gm, " ").replace(/\s+/g, ' ').trim() + " (Improved)";

      setText(improvedText);
      setConfidence('high');
      toast.success('Text cleaned and structured!');
    } catch (error) {
      console.error("Error improving text:", error);
      toast.error('Failed to improve text. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCopyToClipboard = async () => {
    if (!text) return;
    try {
      await navigator.clipboard.writeText(text);
      setIsCopied(true);
      toast.success('Copied to clipboard');
      setTimeout(() => setIsCopied(false), 2000);
    } catch (error) {
      console.error("Failed to copy:", error);
      toast.error('Failed to copy text.');
    }
  };

  const exportToGoogleDocs = () => {
    toast.info('Export to Google Docs coming soon!');
  };

  const downloadAsTxt = () => {
    if (!text) {
      toast.error("There's nothing to download.");
      return;
    }
    const blob = new Blob([text], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'writing-assistant-export.txt';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success("Downloading as .txt file.");
  };

  // --- From old code: UI Toggles ---
  const toggleTool = (tool: string) => {
    setExpandedTool(expandedTool === tool ? null : tool);
  };

  return (
    <div className="flex h-[calc(100vh-4rem)] bg-[#fafafa] overflow-hidden -mx-4 -my-4 sm:-mx-6 lg:-mx-8">
      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <header className="flex items-center justify-between px-6 py-4 bg-white border-b border-gray-200 flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="bg-[#3c8350] rounded-full p-2">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
              </svg>
            </div>
            <h1 className="text-2xl font-semibold text-gray-900">Writing Assistant</h1>
          </div>

          <div className="flex items-center gap-4">
            <button 
              onClick={() => setShowTools(!showTools)}
              className="md:hidden p-2 hover:bg-gray-100 rounded-lg transition-colors"
              aria-label="Toggle tools"
            >
              <Icon name="settings" className="w-5 h-5 text-gray-600" />
            </button>
            <button
              onClick={() => setIsDarkMode(!isDarkMode)}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              aria-label="Toggle dark mode"
            >
              {isDarkMode ? <Icon name="sun" className="w-5 h-5 text-gray-600" /> : <Icon name="moon" className="w-5 h-5 text-gray-600" />}
            </button>
            <div className="w-10 h-10 rounded-full bg-[#3c8350] flex items-center justify-center text-white font-medium ring-2 ring-gray-200">
              U
            </div>
          </div>
        </header>

        {/* Writing Area */}
        <main className="flex-1 p-4 md:p-6 lg:p-8 overflow-hidden flex flex-col">
          <div className="flex-1 flex flex-col max-w-6xl mx-auto w-full min-h-0">
            {/* Controls */}
            <div className="bg-white rounded-t-2xl shadow-sm border border-gray-200 p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 flex-shrink-0">
              <div className="flex items-center gap-3">
                <div className={`w-3 h-3 rounded-full ${confidence === 'low' ? 'bg-orange-500' : 'bg-emerald-500'}`} />
                <span className={`text-sm font-medium ${confidence === 'low' ? 'text-orange-500' : 'text-emerald-500'}`}>
                  {confidence === 'low' ? 'Low confidence' : 'High confidence'}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={toggleRecording}
                  className={`p-2.5 rounded-full transition-all ${
                    isRecording 
                      ? 'bg-red-100 text-red-600 ring-2 ring-red-200' 
                      : 'hover:bg-gray-100 text-[#3c8350]'
                  }`}
                  aria-label={isRecording ? 'Stop recording' : 'Start recording'}
                >
                  <Icon name="microphone" className="w-5 h-5" />
                </button>
                <button
                  className="p-2.5 hover:bg-gray-100 rounded-full transition-colors"
                  aria-label="Audio visualization"
                >
                  <Icon name="audio-waveform" className="w-5 h-5 text-gray-700" />
                </button>
                <button
                  onClick={handleCleanAndStructure}
                  disabled={isProcessing || !text}
                  className="ml-auto bg-[#2b5d39] text-white px-6 py-2.5 rounded-full hover:bg-[#234a2d] transition-all font-medium text-sm disabled:opacity-50 disabled:cursor-not-allowed shadow-sm hover:shadow"
                >
                  {isProcessing ? 'Processing...' : 'Clean and Structure'}
                </button>
              </div>
            </div>

            {/* Text Area */}
            <div className="flex-1 bg-white rounded-b-2xl shadow-sm border border-t-0 border-gray-200 overflow-hidden flex flex-col">
              <div 
                className="flex-1 overflow-y-auto"
                style={{ backgroundColor: tintedBg ? '#fef9f3' : 'transparent' }}
              >
                <textarea
                  ref={textareaRef}
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  placeholder="Start typing or use voice input to begin writing..."
                  className="w-full h-full min-h-[400px] resize-none outline-none text-gray-900 bg-transparent placeholder:text-gray-400 px-6 py-6 text-base md:text-lg"
                  style={{ 
                    fontFamily: getFontFamily(),
                    lineHeight: getLineHeight()
                  }}
                />
              </div>

              {/* Action Buttons */}
              <div className="p-4 flex justify-end items-center gap-3 border-t border-gray-200 bg-white/50 flex-shrink-0">
                <button
                  onClick={handleCopyToClipboard}
                  className="flex items-center justify-center gap-2 px-6 py-2.5 bg-[#2b5d39] hover:bg-[#234a2d] text-white rounded-full font-medium transition-all shadow-sm hover:shadow disabled:opacity-50"
                  disabled={!text}
                >
                  {isCopied ? (
                    <>
                      <Icon name="check" size={18} />
                      <span>Copied</span>
                    </>
                  ) : (
                    <>
                      <Icon name="copy" size={18} />
                      <span>Copy to clipboard</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </main>
      </div>

      {/* Right Sidebar - Tools Panel */}
      <aside
        className={`${
          showTools ? 'translate-x-0' : 'translate-x-full'
        } md:translate-x-0 fixed md:relative right-0 top-16 md:top-0 h-[calc(100vh-4rem)] md:h-full w-80 bg-[#f4f4f4] border-l border-gray-200 rounded-tl-3xl rounded-bl-3xl shadow-2xl md:shadow-none transition-transform duration-300 z-50 overflow-y-auto flex flex-col`}
      >
        <div className="p-6 flex-1 flex flex-col min-h-0">
          {/* Close button for mobile */}
          <button
            onClick={() => setShowTools(false)}
            className="md:hidden absolute top-4 right-4 p-2 hover:bg-gray-200 rounded-lg transition-colors"
            aria-label="Close tools"
          >
            <Icon name="x" className="w-5 h-5 text-gray-600" />
          </button>

          {/* Tools Header - Collapsible */}
          <div className="mb-6">
            <button
              onClick={() => toggleTool('tools')}
              className="w-full flex items-center justify-between group"
            >
              <h2 className="text-xl text-[#3c8350] font-medium tracking-tight">Tools</h2>
              <div className={`w-10 h-10 bg-[#3c8350] rounded-full flex items-center justify-center transition-transform duration-200 ${
                expandedTool === 'tools' ? '' : 'rotate-180'
              }`}>
                <Icon name="chevron-down" className="w-5 h-5 text-white" />
              </div>
            </button>
          </div>

          {/* Collapsible Tools Section */}
          <div className={`overflow-y-auto flex-1 transition-all duration-300 ${
            expandedTool === 'tools' ? 'max-h-[2000px] opacity-100' : 'max-h-0 opacity-0'
          }`}>
            {/* Font Choice Dropdown */}
            <div className="mb-4">
              <button 
                onClick={() => toggleTool('font')}
                className="w-full flex items-center justify-between text-left py-3 px-4 text-lg text-gray-700 hover:bg-white/50 rounded-lg transition-colors"
              >
                <span className="font-normal">Font Choice</span>
                <Icon name="chevron-down" className={`w-5 h-5 text-[#3c8350] transition-transform duration-200 ${
                  expandedTool === 'font' ? 'rotate-180' : ''
                }`} />
              </button>
              {expandedTool === 'font' && (
                <div className="mt-2 bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                  {fontOptions.map((font) => (
                    <button
                      key={font}
                      onClick={() => {
                        setFontChoice(font);
                      }}
                      className={`w-full text-left px-4 py-2.5 hover:bg-gray-50 transition-colors ${
                        fontChoice === font ? 'bg-[#3c8350]/10 text-[#3c8350] font-medium' : 'text-gray-700'
                      }`}
                      style={{ fontFamily: font === 'System Default' ? 'system-ui' : font }}
                    >
                      {font}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Spacing Dropdown */}
            <div className="mb-4">
              <button 
                onClick={() => toggleTool('spacing')}
                className="w-full flex items-center justify-between text-left py-3 px-4 text-lg text-gray-700 hover:bg-white/50 rounded-lg transition-colors"
              >
                <span className="font-normal">Spacing</span>
                <Icon name="chevron-down" className={`w-5 h-5 text-[#3c8350] transition-transform duration-200 ${
                  expandedTool === 'spacing' ? 'rotate-180' : ''
                }`} />
              </button>
              {expandedTool === 'spacing' && (
                <div className="mt-2 bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                  {spacingOptions.map((space) => (
                    <button
                      key={space}
                      onClick={() => {
                        setSpacing(space);
                      }}
                      className={`w-full text-left px-4 py-2.5 hover:bg-gray-50 transition-colors ${
                        spacing === space ? 'bg-[#3c8350]/10 text-[#3c8350] font-medium' : 'text-gray-700'
                      }`}
                    >
                      {space}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Tinted Backgrounds Toggle */}
            <div className="mb-6">
              <div className="flex items-center justify-between py-3 px-4 hover:bg-white/50 rounded-lg transition-colors">
                <span className="text-lg text-gray-700 font-normal">Tinted backgrounds</span>
                <button 
                  onClick={() => setTintedBg(!tintedBg)}
                  className={`w-12 h-7 rounded-full flex items-center transition-colors ${tintedBg ? 'bg-[#3c8350]' : 'bg-gray-300'}`}
                >
                  <span className={`block w-5 h-5 bg-white rounded-full shadow transform transition-transform ${tintedBg ? 'translate-x-6' : 'translate-x-1'}`} />
                </button>
              </div>
            </div>

            {/* Bookmark Icon */}
            <div className="mb-4">
              <button className="p-3 hover:bg-white/50 rounded-lg transition-colors flex items-center gap-2 text-gray-600 hover:text-[#3c8350]" aria-label="Bookmark">
                <Icon name="bookmark" className="w-6 h-6" />
                <span className="text-base font-normal">Save preferences</span>
              </button>
            </div>
          </div>

          {/* Export Button - Updated */}
          <div className="mt-auto pt-6 border-t border-gray-200">
            {exportOpen && (
              <div className="mb-4 bg-white border border-gray-200 rounded-xl shadow-lg overflow-hidden">
                <button
                  onClick={exportToGoogleDocs}
                  className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors border-b border-gray-100"
                >
                  <Icon name="file-text" className="w-6 h-6 text-blue-500" />
                  <span className="text-base font-normal text-gray-900">Export to Google Docs</span>
                </button>
                <button
                  onClick={downloadAsTxt}
                  className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors"
                >
                  <Icon name="file-text" className="w-6 h-6 text-green-700" />
                  <span className="text-base font-normal text-gray-900">Download as .txt</span>
                </button>
              </div>
            )}
            <button
              onClick={() => setExportOpen(!exportOpen)}
              className="w-full bg-[#2b5d39] text-white px-6 py-4 rounded-full hover:bg-[#234a2d] transition-all font-medium text-lg flex items-center justify-center gap-3 shadow-sm hover:shadow"
            >
              <Icon name="download" className="w-5 h-5" />
              Export options
              <Icon name="chevron-down" className={`w-5 h-5 transition-transform ${exportOpen ? 'rotate-180' : ''}`} />
            </button>
          </div>
        </div>
      </aside>

      {/* Overlay for mobile */}
      {showTools && (
        <div
          className="md:hidden fixed inset-0 bg-black bg-opacity-60 z-40"
          onClick={() => setShowTools(false)}
        />
      )}
    </div>
  );
}
