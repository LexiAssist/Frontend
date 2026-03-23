'use client';

import { Card, CardContent, CardHeader } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import { useState, useRef } from 'react';
import { Icon } from '@/components/Icon';
import { toast } from 'sonner';

type SummaryLength = 'short' | 'medium' | 'detailed';

interface SummaryItem {
  id: string;
  title: string;
  summary: string;
  originalLength: number;
  summaryLength: number;
  createdAt: Date;
}

export default function ReadingAssistantPage() {
  const [text, setText] = useState('');
  const [summary, setSummary] = useState('');
  const [isSummarizing, setIsSummarizing] = useState(false);
  const [summaryLength, setSummaryLength] = useState<SummaryLength>('medium');
  const [savedSummaries, setSavedSummaries] = useState<SummaryItem[]>([]);
  const [copied, setCopied] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.type === 'text/plain' || file.name.endsWith('.txt')) {
        const reader = new FileReader();
        reader.onload = (event) => {
          setText(event.target?.result as string);
          toast.success('File uploaded successfully');
        };
        reader.readAsText(file);
      } else {
        toast.error('Please upload a .txt file');
      }
    }
  };

  const handleSummarize = async () => {
    if (!text.trim()) {
      toast.error('Please enter some text to summarize');
      return;
    }

    setIsSummarizing(true);

    setTimeout(() => {
      const sentences = text.match(/[^.!?]+[.!?]+/g) || [text];
      let summaryText = '';

      if (summaryLength === 'short') {
        summaryText = sentences.slice(0, Math.ceil(sentences.length * 0.2)).join(' ');
      } else if (summaryLength === 'medium') {
        summaryText = sentences.slice(0, Math.ceil(sentences.length * 0.4)).join(' ');
      } else {
        summaryText = sentences.slice(0, Math.ceil(sentences.length * 0.6)).join(' ');
      }

      summaryText = `📋 Summary (${summaryLength}):\n\n${summaryText.trim()}\n\n💡 Key Points:\n• Main concept extracted from the text\n• Important details preserved\n• Ready for review and study`;

      setSummary(summaryText);
      setIsSummarizing(false);
      toast.success('Summary generated successfully');
    }, 1500);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(summary);
    setCopied(true);
    toast.success('Copied to clipboard');
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSave = () => {
    if (!summary) return;

    const newItem: SummaryItem = {
      id: Date.now().toString(),
      title: text.slice(0, 50) + (text.length > 50 ? '...' : ''),
      summary,
      originalLength: text.length,
      summaryLength: summary.length,
      createdAt: new Date(),
    };

    setSavedSummaries((prev) => [newItem, ...prev].slice(0, 20));
    toast.success('Summary saved to library');
  };

  const handleClear = () => {
    setText('');
    setSummary('');
  };

  return (
    <div className="space-y-4 max-w-5xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900">Reading Assistant</h1>
          <p className="mt-1 text-sm text-slate-600">
            Upload or paste text to get AI-powered summaries
          </p>
        </div>
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileUpload}
          accept=".txt"
          className="hidden"
        />
        <Button
          variant="outline"
          leftIcon={<Icon iconName="upload" size={18} />}
          onClick={() => fileInputRef.current?.click()}
        >
          Upload File
        </Button>
      </div>

      <div className="grid gap-4 sm:gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader
            title="Original Text"
            description="Paste your text or upload a file"
            action={
              <Button
                variant="ghost"
                size="sm"
                onClick={handleClear}
                leftIcon={<Icon iconName="trash-2" size={16} />}
                disabled={!text}
              >
                Clear
              </Button>
            }
          />
          <CardContent className="p-3 sm:p-4">
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Paste your text here or upload a file..."
              className="w-full h-64 sm:h-80 p-3 sm:p-4 text-sm text-slate-700 bg-slate-50 rounded-xl border border-slate-200 focus:border-[#3c8350] focus:ring-2 focus:ring-[#3c8350]/20 focus:outline-none resize-none"
            />
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mt-3">
              <span className="text-xs text-slate-500">
                {text.length} chars • {text.split(/\s+/).filter(Boolean).length} words
              </span>
              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-500">Length:</span>
                <div className="flex gap-1">
                  {(['short', 'medium', 'detailed'] as SummaryLength[]).map((length) => (
                    <button
                      key={length}
                      onClick={() => setSummaryLength(length)}
                      className={`px-2 sm:px-3 py-1 rounded-lg text-xs font-medium transition-colors capitalize ${
                        summaryLength === length
                          ? 'bg-[#3c8350] text-white'
                          : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                      }`}
                    >
                      {length}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader
            title="AI Summary"
            description="Generated summary will appear here"
            action={
              summary && (
                <div className="flex gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleCopy}
                    leftIcon={copied ? <Icon iconName="check" size={16} /> : <Icon iconName="copy" size={16} />}
                  >
                    {copied ? 'Copied' : 'Copy'}
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleSave}
                    leftIcon={<Icon iconName="save" size={16} />}
                  >
                    Save
                  </Button>
                </div>
              )
            }
          />
          <CardContent className="p-3 sm:p-4">
            {summary ? (
              <div className="h-64 sm:h-80 overflow-y-auto">
                <div className="prose prose-sm max-w-none">
                  <div className="whitespace-pre-wrap text-sm text-slate-700 leading-relaxed">
                    {summary}
                  </div>
                </div>
              </div>
            ) : (
              <div className="h-64 sm:h-80 flex flex-col items-center justify-center text-center">
                <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center mb-4">
                  <Icon iconName="sparkles" className="h-8 w-8 text-slate-400" />
                </div>
                <p className="text-slate-500 text-sm">
                  Your AI-generated summary will appear here
                </p>
              </div>
            )}
            {summary && (
              <div className="flex items-center justify-between mt-3 pt-3 border-t border-slate-100">
                <span className="text-xs text-slate-500">
                  Reduced by {Math.round(((text.length - summary.length) / text.length) * 100)}%
                </span>
                <span className="text-xs text-slate-500">
                  {summary.length} characters
                </span>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="flex justify-center">
        <Button
          size="lg"
          onClick={handleSummarize}
          isLoading={isSummarizing}
          leftIcon={<Icon iconName="sparkles" size={20} />}
          disabled={!text.trim()}
        >
          {isSummarizing ? 'Generating...' : 'Generate Summary'}
        </Button>
      </div>

      <div className="grid gap-3 sm:gap-4 grid-cols-1 sm:grid-cols-3">
        <Card className="cursor-pointer hover:shadow-md transition-all">
          <CardContent className="p-3 sm:p-4 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-50 flex-shrink-0">
              <Icon iconName="file-text" className="h-5 w-5 text-blue-600" />
            </div>
            <div className="min-w-0">
              <p className="font-medium text-slate-900 text-sm">Upload Documents</p>
              <p className="text-xs sm:text-sm text-slate-500">Support for .txt files</p>
            </div>
          </CardContent>
        </Card>
        <Card className="cursor-pointer hover:shadow-md transition-all">
          <CardContent className="p-3 sm:p-4 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-purple-50 flex-shrink-0">
              <Icon iconName="clock" className="h-5 w-5 text-purple-600" />
            </div>
            <div className="min-w-0">
              <p className="font-medium text-slate-900 text-sm">Adjustable Length</p>
              <p className="text-xs sm:text-sm text-slate-500">Short, medium, or detailed</p>
            </div>
          </CardContent>
        </Card>
        <Card className="cursor-pointer hover:shadow-md transition-all">
          <CardContent className="p-3 sm:p-4 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-50 flex-shrink-0">
              <Icon iconName="open-book" className="h-5 w-5 text-green-600" />
            </div>
            <div className="min-w-0">
              <p className="font-medium text-slate-900 text-sm">Save to Library</p>
              <p className="text-xs sm:text-sm text-slate-500">Access anytime, anywhere</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {savedSummaries.length > 0 && (
        <Card>
          <CardHeader title="Saved Summaries" />
          <CardContent className="p-3 sm:p-4">
            <div className="space-y-2 sm:space-y-3">
              {savedSummaries.slice(0, 5).map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between p-3 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <Icon iconName="file-text" size={16} className="text-slate-400 flex-shrink-0" />
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-slate-700 truncate">{item.title}</p>
                      <p className="text-xs text-slate-500">
                        Saved {new Date(item.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <span className="text-xs text-slate-400 flex-shrink-0">
                    {Math.round((item.summaryLength / item.originalLength) * 100)}% of original
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
