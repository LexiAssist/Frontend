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
  FileText,
  Loader2,
  MessageSquare,
} from 'lucide-react';
import { FeatureHeader } from '@/components/FeatureHeader';
import { useAuthStore } from '@/store/authStore';
import { useAIChat, useConversation } from '@/hooks/useAI';
import { materialApi, aiApi } from '@/services/api';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';
import { FormattedMessage } from '@/components/chat/FormattedMessage';

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

// Helper to check if AI response is a "no context" response
const isNoContextResponse = (response: string): boolean => {
  const noContextPatterns = [
    "don't have enough information",
    "no relevant context",
    "cannot find information",
    "no documents",
    "insufficient information",
    "context not found",
  ];
  return noContextPatterns.some(pattern => 
    response.toLowerCase().includes(pattern.toLowerCase())
  );
};

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  sources?: string[];
}

interface UploadedFile {
  id: string;
  name: string;
  status: 'uploading' | 'processing' | 'ready' | 'error';
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
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [conversationId, setConversationId] = useState<string | undefined>();
  const [isTyping, setIsTyping] = useState(false);
  const [useStreaming, setUseStreaming] = useState(false); // Toggle for streaming
  const [streamingMessage, setStreamingMessage] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const folderInputRef = useRef<HTMLInputElement>(null);
  const chatInputRef = useRef<HTMLTextAreaElement>(null);
  
  const { user } = useAuthStore();
  const chatMutation = useAIChat();
  
  // Load previous conversation if conversationId is provided (Requirement 17.4)
  const { data: conversationData, isLoading: isLoadingConversation } = useConversation(conversationId);

  useEffect(() => {
    if (folderInputRef.current) {
      folderInputRef.current.setAttribute('webkitdirectory', '');
      folderInputRef.current.setAttribute('directory', '');
    }
  }, []);
  
  // Load conversation messages when conversation data is fetched (Requirement 17.4)
  useEffect(() => {
    if (conversationData && typeof conversationData === 'object' && 'messages' in conversationData) {
      const data = conversationData as any;
      if (data.messages && Array.isArray(data.messages)) {
        const loadedMessages: Message[] = data.messages.map((msg: any, idx: number) => ({
          id: msg.id || `loaded-${Date.now()}-${idx}`,
          role: msg.role,
          content: msg.content,
          timestamp: new Date(msg.timestamp),
          sources: msg.sources,
        }));
        setMessages(loadedMessages);
      }
    }
  }, [conversationData]);

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

  const uploadFile = async (file: File): Promise<string | null> => {
    try {
      // Upload file directly - backend handles everything
      const material = await materialApi.upload(file);
      toast.success(`Uploaded ${file.name}`);
      return material.id;
    } catch (error: any) {
      console.error('Upload error:', error);
      // Don't show error toast here - handle it in the calling function
      throw error;
    }
  };

  const handleFileSelection = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files ?? []);
    if (files.length === 0) return;

    // Add files to state as "uploading"
    const newFiles: UploadedFile[] = files.map(file => ({
      id: `temp-${Date.now()}-${file.name}`,
      name: file.name,
      status: 'uploading',
    }));
    
    setUploadedFiles(prev => [...prev, ...newFiles]);
    event.target.value = '';

    // Upload each file
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const tempId = newFiles[i].id;
      
      try {
        const materialId = await uploadFile(file);
        
        if (materialId && materialId.trim() !== '') {
          setUploadedFiles(prev => 
            prev.map(f => 
              f.id === tempId 
                ? { ...f, id: materialId, status: 'processing' }
                : f
            )
          );
        }
      } catch (error: any) {
        console.error(`Failed to upload ${file.name}:`, error);
        toast.error(`Failed to upload ${file.name}: ${error.message}`);
        setUploadedFiles(prev => prev.filter(f => f.id !== tempId));
      }
    }
  };

  const handleFolderSelection = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files ?? []);
    if (files.length === 0) return;

    // Filter for document files
    const validFiles = files.filter(f => 
      f.type.includes('pdf') || 
      f.type.includes('text') || 
      f.type.includes('document') ||
      f.name.endsWith('.pdf') ||
      f.name.endsWith('.txt') ||
      f.name.endsWith('.doc') ||
      f.name.endsWith('.docx')
    );

    if (validFiles.length === 0) {
      toast.error('No valid documents found in folder');
      return;
    }

    // Add files to state as "uploading"
    const newFiles: UploadedFile[] = validFiles.map(file => ({
      id: `temp-${Date.now()}-${file.name}`,
      name: file.name,
      status: 'uploading',
    }));
    
    setUploadedFiles(prev => [...prev, ...newFiles]);
    event.target.value = '';

    // Upload files
    for (let i = 0; i < validFiles.length; i++) {
      const file = validFiles[i];
      const tempId = newFiles[i].id;
      
      try {
        const materialId = await uploadFile(file);
        
        if (materialId && materialId.trim() !== '') {
          setUploadedFiles(prev => 
            prev.map(f => 
              f.id === tempId 
                ? { ...f, id: materialId, status: 'processing' }
                : f
            )
          );
        }
      } catch (error: any) {
        console.error(`Failed to upload ${file.name}:`, error);
        toast.error(`Failed to upload ${file.name}: ${error.message}`);
        setUploadedFiles(prev => prev.filter(f => f.id !== tempId));
      }
    }
  };

  const removeFile = (fileId: string) => {
    setUploadedFiles(prev => prev.filter(f => f.id !== fileId));
  };

  const clearAllFiles = () => {
    setUploadedFiles([]);
  };

  const handleSubmit = async () => {
    if (!prompt.trim()) return;
    if (!user?.id) {
      toast.error('Please log in to use the chat assistant');
      return;
    }

    const userMessage: Message = {
      id: `msg-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      role: 'user',
      content: prompt,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setPrompt('');
    setIsTyping(true);

    try {
      // Get material IDs from uploaded files
      const materialIds = uploadedFiles
        .filter(f => !f.id.startsWith('temp-'))
        .map(f => f.id);

      // Retrieve context chunks from the retrieval service
      let contextChunks: string[] = [];
      if (uploadedFiles.length > 0) {
        try {
          const retrievalResult = await aiApi.retrieveContext(
            userMessage.content,
            user.id,
            5 // top_k
          );
          contextChunks = retrievalResult.results?.map((c: any) => c.chunk_text) || [];
        } catch (err) {
          console.warn('Failed to retrieve context:', err);
          // Continue without context - AI will inform user
        }
      }

      // Use streaming if enabled (Requirement 17.6)
      let useStreamingFallback = false;
      if (useStreaming) {
        try {
          setStreamingMessage('');
          
          await aiApi.chatStream(
            userMessage.content,
            user.id,
            {
              conversationId,
              contextChunks,
            },
            // onToken callback
            (token: string) => {
              setStreamingMessage(prev => prev + token);
            },
            // onComplete callback
            (response) => {
              // Update conversation ID for follow-up messages
              if (response.conversation_id) {
                setConversationId(response.conversation_id);
              }

              // Check if AI returned a "no context" response
              let content = response.response;
              if (isNoContextResponse(content) && uploadedFiles.length === 0) {
                content = `I don't have any documents to reference yet. To get the most accurate answers, please upload your study materials using the "Attach" button above.\n\nIn the meantime, I can try to help with general knowledge questions, but my answers will be more helpful once I can reference your specific course materials.`;
              }

              const assistantMessage: Message = {
                id: `msg-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
                role: 'assistant',
                content: content,
                timestamp: new Date(),
                sources: response.sources,
              };

              setMessages(prev => [...prev, assistantMessage]);
              setStreamingMessage('');
              setIsTyping(false);
            },
            // onError callback
            (error) => {
              console.error('Chat stream error:', error);
              // Fall back to non-streaming on error
              useStreamingFallback = true;
            }
          );
        } catch (error) {
          console.warn('Streaming failed, falling back to standard chat:', error);
          useStreamingFallback = true;
        }
      }
      
      // Fall back to non-streaming if streaming failed or was not enabled
      if (!useStreaming || useStreamingFallback) {
        // Use regular non-streaming chat
        const response = await chatMutation.mutateAsync({
          query: userMessage.content,
          userId: user.id,
          options: {
            conversationId,
            contextChunks,
          },
        });

        // Update conversation ID for follow-up messages
        if (response.conversation_id) {
          setConversationId(response.conversation_id);
        }

        // Check if AI returned a "no context" response
        let content = response.response;
        if (isNoContextResponse(content) && uploadedFiles.length === 0) {
          content = `I don't have any documents to reference yet. To get the most accurate answers, please upload your study materials using the "Attach" button above.\n\nIn the meantime, I can try to help with general knowledge questions, but my answers will be more helpful once I can reference your specific course materials.`;
        }

        const assistantMessage: Message = {
          id: `msg-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
          role: 'assistant',
          content: content,
          timestamp: new Date(),
          sources: response.sources,
        };

        setMessages(prev => [...prev, assistantMessage]);
        setIsTyping(false);
      }
    } catch (error) {
      console.error('Chat error:', error);
      toast.error('Failed to get response. Please try again.');
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
    setUploadedFiles([]);
    setPrompt('');
  };

  // Render attachment button component
  const AttachmentButton = ({ variant = 'default' }: { variant?: 'default' | 'compact' }) => (
    <div className="flex items-center gap-1">
      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept=".pdf,.txt,.doc,.docx,.md"
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
      
      {variant === 'default' ? (
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
      ) : (
        <button
          type="button"
          onClick={openFilePicker}
          className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-500 hover:text-[var(--primary-500)] hover:bg-[var(--primary-50)] transition-colors"
          title="Attach files"
        >
          <Paperclip className="h-5 w-5" />
        </button>
      )}
    </div>
  );

  // Render uploaded files list
  const UploadedFilesList = () => {
    if (uploadedFiles.length === 0) return null;

    return (
      <div className="flex flex-wrap gap-2 px-3 py-2 bg-slate-50 border-t border-slate-200">
        {uploadedFiles.map((file) => (
          <span
            key={file.id}
            className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium ${
              file.status === 'uploading'
                ? 'bg-amber-50 text-amber-700 border border-amber-200'
                : file.status === 'processing'
                ? 'bg-blue-50 text-blue-700 border border-blue-200'
                : 'bg-[var(--primary-50)] text-[var(--primary-700)] border border-[var(--primary-200)]'
            }`}
          >
            {file.status === 'uploading' ? (
              <Loader2 className="h-3 w-3 animate-spin" />
            ) : file.status === 'processing' ? (
              <FileText className="h-3 w-3" />
            ) : (
              <FileText className="h-3 w-3" />
            )}
            <span className="max-w-[150px] truncate">{file.name}</span>
            {file.status === 'uploading' && <span className="text-[10px]">(uploading...)</span>}
            {file.status === 'processing' && <span className="text-[10px]">(processing...)</span>}
            <button 
              onClick={() => removeFile(file.id)} 
              className="ml-1 hover:text-red-500 transition-colors"
              disabled={file.status === 'uploading'}
            >
              <X className="h-3 w-3" />
            </button>
          </span>
        ))}
        {uploadedFiles.length > 0 && (
          <button
            onClick={clearAllFiles}
            className="text-xs text-slate-400 hover:text-slate-600 underline"
          >
            Clear all
          </button>
        )}
      </div>
    );
  };

  return (
    <div className="mx-auto flex h-[calc(100vh-4rem)] w-full max-w-6xl flex-col lg:h-screen overflow-hidden">
      {/* Header - Fixed at top */}
      <div className="flex justify-between items-center pb-4 pt-2 lg:pb-6 lg:pt-4 flex-shrink-0">
        <div className="flex items-center gap-3">
          <LexiAssistSymbol />
          <div>
            <h1 className="text-lg font-semibold text-slate-900">LexiAssist Chat</h1>
            <p className="text-sm text-slate-500">
              {isLoadingConversation ? (
                <span className="flex items-center gap-2">
                  <Loader2 className="w-3 h-3 animate-spin" />
                  Loading conversation...
                </span>
              ) : conversationId ? (
                'Continuing conversation'
              ) : (
                'New conversation'
              )}
              {uploadedFiles.length > 0 && (
                <span className="ml-2 text-[var(--primary-500)]">
                  • {uploadedFiles.length} document{uploadedFiles.length !== 1 ? 's' : ''} attached
                </span>
              )}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setUseStreaming(!useStreaming)}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
                useStreaming
                  ? 'bg-[var(--primary-500)] text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
              title="Toggle streaming responses"
            >
              <MessageSquare className="w-3 h-3 inline mr-1" />
              {useStreaming ? 'Streaming' : 'Standard'}
            </button>
          </div>
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
        <section className="flex flex-1 flex-col items-center justify-center overflow-y-auto">
          <div className="flex w-full max-w-[860px] flex-col items-center">
            <LexiAssistSymbol />
            <h1 className="pt-4 text-center text-[2rem] font-bold tracking-tight text-slate-950 sm:text-[2.35rem]">
              Good Afternoon, {user?.first_name || user?.name?.split(' ')[0] || 'Student'}
            </h1>
            <p className="pt-2 text-center text-[2rem] font-bold tracking-tight text-slate-950 sm:text-[2.35rem]">
              What&apos;s on <span className="text-[var(--primary-500)]">your mind?</span>
            </p>
            
            {/* Document upload notice */}
            <div className="mt-4 flex items-center gap-2 rounded-lg bg-amber-50 border border-amber-200 px-4 py-2 text-sm text-amber-800">
              <BookOpenText className="h-4 w-4 flex-shrink-0" />
              <span>💡 Tip: Upload your study materials for more accurate, context-aware answers!</span>
            </div>

            <div className="mt-8 w-full rounded-xl border border-slate-300 bg-white shadow-[0_1px_2px_rgba(15,23,42,0.04)]">
              <textarea
                value={prompt}
                onChange={(event) => setPrompt(event.target.value)}
                onKeyDown={handleKeyDown}
                className="min-h-[220px] w-full resize-none rounded-t-xl border-0 bg-transparent px-5 py-4 text-base text-slate-900 outline-none placeholder:text-slate-400 sm:min-h-[180px] md:text-sm"
                placeholder="Ask me anything about your studies..."
              />

              <UploadedFilesList />

              <div className="flex items-center justify-between gap-3 px-3 pb-3 pt-2">
                <div className="flex flex-wrap items-center gap-2">
                  <AttachmentButton />
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
        <section className="flex flex-1 flex-col min-h-0">
          {/* Messages - Scrollable area */}
          <div className="flex-1 overflow-y-auto px-4 py-6 space-y-6 scrollbar-thin scrollbar-thumb-slate-300 scrollbar-track-transparent">
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
                    {message.role === 'assistant' ? (
                      <FormattedMessage content={message.content} />
                    ) : (
                      <p className="text-sm leading-relaxed whitespace-pre-wrap">
                        {message.content}
                      </p>
                    )}
                    {message.sources && message.sources.length > 0 && (
                      <div className="mt-3 pt-3 border-t border-slate-200/50">
                        <p className="text-xs text-slate-500">Sources:</p>
                        <div className="flex flex-wrap gap-2 mt-1">
                          {message.sources.filter(Boolean).map((source, idx) => (
                            <span key={`${message.id}-source-${idx}`} className="text-xs bg-slate-200/50 px-2 py-1 rounded">
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
                    {streamingMessage ? (
                      <div className="relative">
                        <FormattedMessage content={streamingMessage} />
                        <span className="inline-block w-0.5 h-4 bg-[var(--primary-500)] ml-0.5 animate-pulse align-middle" />
                      </div>
                    ) : (
                      <div className="flex gap-1">
                        <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                        <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                        <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                      </div>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
            <div ref={messagesEndRef} />
          </div>

          {/* Input area - Fixed at bottom */}
          <div className="border-t border-slate-200 bg-white p-4 flex-shrink-0">
            <div className="max-w-4xl mx-auto">
              {/* Show uploaded files above input */}
              {uploadedFiles.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-2">
                  {uploadedFiles.map((file) => (
                    <span
                      key={file.id}
                      className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium ${
                        file.status === 'uploading'
                          ? 'bg-amber-50 text-amber-700 border border-amber-200'
                          : file.status === 'processing'
                          ? 'bg-blue-50 text-blue-700 border border-blue-200'
                          : 'bg-[var(--primary-50)] text-[var(--primary-700)] border border-[var(--primary-200)]'
                      }`}
                    >
                      {file.status === 'uploading' ? (
                        <Loader2 className="h-3 w-3 animate-spin" />
                      ) : (
                        <FileText className="h-3 w-3" />
                      )}
                      <span className="max-w-[120px] truncate">{file.name}</span>
                      <button 
                        onClick={() => removeFile(file.id)} 
                        className="ml-1 hover:text-red-500 transition-colors"
                        disabled={file.status === 'uploading'}
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </span>
                  ))}
                </div>
              )}

              <div className="relative rounded-xl border border-slate-300 bg-white shadow-sm">
                <div className="flex items-end gap-2 px-2 py-2">
                  <AttachmentButton variant="compact" />
                  <textarea
                    ref={chatInputRef}
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Type your message..."
                    rows={1}
                    className="flex-1 resize-none border-0 bg-transparent px-2 py-2 text-sm text-slate-900 outline-none placeholder:text-slate-400 max-h-32 min-h-[40px]"
                  />
                  <button
                    onClick={handleSubmit}
                    disabled={!prompt.trim() || chatMutation.isPending}
                    className="p-2 rounded-lg bg-[var(--primary-500)] text-white disabled:opacity-50 disabled:cursor-not-allowed hover:bg-[var(--primary-600)] transition-colors"
                  >
                    <ArrowUp className="h-4 w-4" />
                  </button>
                </div>
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
