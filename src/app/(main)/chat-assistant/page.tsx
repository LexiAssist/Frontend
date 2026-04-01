'use client';

import { useEffect, useRef, useState } from 'react';
import {
  ArrowUp,
  BookOpenText,
  ChevronDown,
  LockKeyhole,
  Paperclip,
  Pin,
  PenLine,
  Sprout,
  User,
  Bot,
  X,
} from 'lucide-react';
import { FeatureHeader } from '@/components/FeatureHeader';
import { useAuthStore } from '@/store/authStore';
import { useAIChat } from '@/hooks/useAI';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';

const starterCards = [
  {
    title: 'Summarize this into key points',
    icon: BookOpenText,
  },
  {
    title: 'Give me the most important ideas from this topic.',
    icon: Pin,
  },
  {
    title: 'Explain empiricism in philosophy in simple terms.',
    icon: PenLine,
  },
];

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  sources?: string[];
}

function LexiAssistSymbol() {
  return (
    <div className="relative flex h-14 w-14 items-center justify-center text-[var(--primary-500)]">
      <BookOpenText className="h-10 w-10" strokeWidth={1.8} />
      <Sprout className="absolute top-0 h-5 w-5" strokeWidth={2.2} />
    </div>
  );
}

export default function ChatAssistantPage() {
  const [prompt, setPrompt] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [attachedItems, setAttachedItems] = useState<string[]>([]);
  const [conversationId, setConversationId] = useState<string | undefined>();
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const folderInputRef = useRef<HTMLInputElement>(null);
  
  const { user } = useAuthStore();
  const chatMutation = useAIChat();

  useEffect(() => {
    if (folderInputRef.current) {
      folderInputRef.current.setAttribute('webkitdirectory', '');
      folderInputRef.current.setAttribute('directory', '');
    }
  }, []);

  // Auto-scroll to bottom of messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  const openFilePicker = () => {
    fileInputRef.current?.click();
  };

  const openFolderPicker = () => {
    folderInputRef.current?.click();
  };

  const handleFileSelection = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files ?? []);
    setAttachedItems(files.map((file) => file.name));
    event.target.value = '';
  };

  const handleFolderSelection = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files ?? []);
    if (files.length === 0) return;

    const folderName =
      files[0].webkitRelativePath.split('/')[0] || `${files.length} items selected`;

    setAttachedItems([`${folderName} (${files.length} files)`]);
    event.target.value = '';
  };

  const clearAttachment = () => {
    setAttachedItems([]);
  };

  const handleSubmit = async () => {
    if (!prompt.trim()) return;
    if (!user?.id) {
      toast.error('Please log in to use the chat assistant');
      return;
    }

    const userMessage: Message = {
      id: `msg-${Date.now()}`,
      role: 'user',
      content: prompt,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setPrompt('');
    setIsTyping(true);

    try {
      const response = await chatMutation.mutateAsync({
        query: userMessage.content,
        userId: user.id,
        options: {
          conversationId,
        },
      });

      // Update conversation ID for follow-up messages
      if (response.conversation_id) {
        setConversationId(response.conversation_id);
      }

      const assistantMessage: Message = {
        id: `msg-${Date.now() + 1}`,
        role: 'assistant',
        content: response.response,
        timestamp: new Date(),
        sources: response.sources,
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      console.error('Chat error:', error);
      toast.error('Failed to get response. Please try again.');
    } finally {
      setIsTyping(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const startNewChat = () => {
    setMessages([]);
    setConversationId(undefined);
    setAttachedItems([]);
    setPrompt('');
  };

  return (
    <div className="mx-auto flex min-h-[calc(100vh-4rem)] w-full max-w-6xl flex-col lg:min-h-screen">
      <input
        ref={fileInputRef}
        type="file"
        multiple
        className="hidden"
        onChange={handleFileSelection}
      />
      <input
        ref={folderInputRef}
        type="file"
        multiple
        className="hidden"
        onChange={handleFolderSelection}
      />

      <div className="flex justify-between items-center pb-4 pt-2 lg:pb-6 lg:pt-4">
        <div className="flex items-center gap-3">
          <LexiAssistSymbol />
          <div>
            <h1 className="text-lg font-semibold text-slate-900">LexiAssist Chat</h1>
            <p className="text-sm text-slate-500">
              {conversationId ? 'Continuing conversation' : 'New conversation'}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {messages.length > 0 && (
            <button
              onClick={startNewChat}
              className="px-4 py-2 text-sm font-medium text-[var(--primary-500)] hover:bg-[var(--primary-50)] rounded-lg transition-colors"
            >
              New Chat
            </button>
          )}
          <FeatureHeader />
        </div>
      </div>

      {messages.length === 0 ? (
        /* Empty State with Starter Cards */
        <section className="flex flex-1 flex-col items-center justify-center">
          <div className="flex w-full max-w-[860px] flex-col items-center">
            <LexiAssistSymbol />
            <h1 className="pt-4 text-center text-[2rem] font-bold tracking-tight text-slate-950 sm:text-[2.35rem]">
              Good Afternoon, {user?.name?.split(' ')[0] || 'Student'}
            </h1>
            <p className="pt-2 text-center text-[2rem] font-bold tracking-tight text-slate-950 sm:text-[2.35rem]">
              What&apos;s on <span className="text-[var(--primary-500)]">your mind?</span>
            </p>

            <div className="mt-8 w-full rounded-xl border border-slate-300 bg-white shadow-[0_1px_2px_rgba(15,23,42,0.04)]">
              <textarea
                value={prompt}
                onChange={(event) => setPrompt(event.target.value)}
                onKeyDown={handleKeyDown}
                className="min-h-[220px] w-full resize-none rounded-t-xl border-0 bg-transparent px-5 py-4 text-base text-slate-900 outline-none placeholder:text-slate-400 sm:min-h-[180px] md:text-sm"
                placeholder="Ask me anything about your studies..."
              />

              <div className="flex items-center justify-between gap-3 px-3 pb-3">
                <div className="flex flex-wrap items-center gap-2">
                  <div className="flex items-center overflow-hidden rounded-full bg-[var(--primary-500)] text-white">
                    <button
                      type="button"
                      onClick={openFilePicker}
                      className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium transition hover:bg-[var(--primary-600)]"
                    >
                      <Paperclip className="h-4 w-4" />
                      <span>Attach</span>
                    </button>
                    <button
                      type="button"
                      onClick={openFolderPicker}
                      className="border-l border-white/20 px-2.5 py-2 transition hover:bg-[var(--primary-600)]"
                      aria-label="Choose folder"
                      title="Choose folder"
                    >
                      <ChevronDown className="h-4 w-4" />
                    </button>
                  </div>
                  <button
                    type="button"
                    className="flex h-9 w-9 items-center justify-center rounded-full bg-[var(--primary-500)]/12 text-[var(--primary-500)] transition hover:bg-[var(--primary-500)]/18"
                    aria-label="Private mode"
                  >
                    <LockKeyhole className="h-4 w-4" />
                  </button>
                </div>

                <button
                  type="button"
                  onClick={handleSubmit}
                  disabled={!prompt.trim() || chatMutation.isPending}
                  className="flex h-9 w-9 items-center justify-center rounded-full border border-[var(--primary-500)] text-[var(--primary-500)] transition hover:bg-[var(--primary-50)] disabled:opacity-50 disabled:cursor-not-allowed"
                  aria-label="Submit prompt"
                >
                  <ArrowUp className="h-4 w-4" />
                </button>
              </div>

              {attachedItems.length > 0 ? (
                <div className="flex flex-wrap gap-2 px-3 pb-4">
                  {attachedItems.map((item) => (
                    <span
                      key={item}
                      className="inline-flex items-center gap-1 rounded-full bg-[var(--primary-50)] px-3 py-1 text-xs font-medium text-[var(--primary-700)]"
                    >
                      {item}
                      <button onClick={clearAttachment} className="hover:text-[var(--primary-900)]">
                        <X className="h-3 w-3" />
                      </button>
                    </span>
                  ))}
                </div>
              ) : null}
            </div>

            <div className="w-full pt-7">
              <p className="text-xs font-semibold uppercase tracking-[0.08em] text-slate-400">
                Get started with an example below
              </p>

              <div className="mt-5 grid gap-4 md:grid-cols-3">
                {starterCards.map((card) => {
                  const Icon = card.icon;

                  return (
                    <button
                      key={card.title}
                      type="button"
                      onClick={() => setPrompt(card.title)}
                      className="flex min-h-[104px] flex-col justify-between rounded-xl border border-slate-200 bg-slate-50 p-4 text-left transition hover:-translate-y-0.5 hover:border-slate-300 hover:bg-white"
                    >
                      <p className="max-w-[180px] text-sm leading-5 text-slate-900">{card.title}</p>
                      <Icon className="h-4 w-4 text-slate-900" />
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </section>
      ) : (
        /* Chat Interface with Messages */
        <section className="flex flex-1 flex-col">
          <div className="flex-1 overflow-y-auto px-4 py-6 space-y-6">
            <AnimatePresence>
              {messages.map((message, index) => (
                <motion.div
                  key={message.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className={`flex gap-4 ${
                    message.role === 'user' ? 'justify-end' : 'justify-start'
                  }`}
                >
                  {message.role === 'assistant' && (
                    <div className="w-8 h-8 rounded-full bg-[var(--primary-500)] flex items-center justify-center flex-shrink-0">
                      <Bot className="w-5 h-5 text-white" />
                    </div>
                  )}
                  
                  <div
                    className={`max-w-[80%] rounded-2xl px-5 py-3 ${
                      message.role === 'user'
                        ? 'bg-[var(--primary-500)] text-white'
                        : 'bg-slate-100 text-slate-900'
                    }`}
                  >
                    <p className="text-sm leading-relaxed whitespace-pre-wrap">
                      {message.content}
                    </p>
                    {message.sources && message.sources.length > 0 && (
                      <div className="mt-3 pt-3 border-t border-slate-200/50">
                        <p className="text-xs text-slate-500">Sources:</p>
                        <div className="flex flex-wrap gap-2 mt-1">
                          {message.sources.map((source, idx) => (
                            <span key={idx} className="text-xs bg-slate-200/50 px-2 py-1 rounded">
                              {source}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                    <p className={`text-xs mt-2 ${
                      message.role === 'user' ? 'text-white/60' : 'text-slate-400'
                    }`}>
                      {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>

                  {message.role === 'user' && (
                    <div className="w-8 h-8 rounded-full bg-slate-300 flex items-center justify-center flex-shrink-0">
                      <User className="w-5 h-5 text-slate-600" />
                    </div>
                  )}
                </motion.div>
              ))}

              {isTyping && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex gap-4 justify-start"
                >
                  <div className="w-8 h-8 rounded-full bg-[var(--primary-500)] flex items-center justify-center flex-shrink-0">
                    <Bot className="w-5 h-5 text-white" />
                  </div>
                  <div className="bg-slate-100 rounded-2xl px-5 py-3">
                    <div className="flex gap-1">
                      <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                      <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                      <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
            <div ref={messagesEndRef} />
          </div>

          {/* Input area */}
          <div className="border-t border-slate-200 bg-white p-4">
            <div className="max-w-4xl mx-auto">
              <div className="relative rounded-xl border border-slate-300 bg-white shadow-sm">
                <textarea
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Type your message..."
                  rows={1}
                  className="w-full resize-none rounded-xl border-0 bg-transparent px-4 py-3 pr-12 text-sm text-slate-900 outline-none placeholder:text-slate-400 max-h-32"
                  style={{ minHeight: '44px' }}
                />
                <button
                  onClick={handleSubmit}
                  disabled={!prompt.trim() || chatMutation.isPending}
                  className="absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-lg bg-[var(--primary-500)] text-white disabled:opacity-50 disabled:cursor-not-allowed hover:bg-[var(--primary-600)] transition-colors"
                >
                  <ArrowUp className="h-4 w-4" />
                </button>
              </div>
              <p className="text-xs text-slate-400 mt-2 text-center">
                Press Enter to send, Shift + Enter for new line
              </p>
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
