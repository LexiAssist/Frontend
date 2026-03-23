'use client';

import { Card, CardContent } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import { useState, useRef, useEffect } from 'react';
import { Icon } from '@/components/Icon';
import { toast } from 'sonner';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

interface Conversation {
  id: string;
  title: string;
  messages: Message[];
  updatedAt: Date;
}

const suggestedPrompts = [
  'Explain quantum physics in simple terms',
  'Help me understand photosynthesis',
  'What are the key events of World War II?',
  'Solve this math problem: 2x + 5 = 15',
  'Summarize the theory of evolution',
];

export default function ChatAssistantPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 120)}px`;
    }
  }, [input]);

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input.trim(),
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    setTimeout(() => {
      const responses = [
        `I'd be happy to help you with that! Let me break it down:\n\n${userMessage.content}\n\nThis is a great question. Here's what I understand about this topic:\n\n1. Key concept explanation\n2. Important details to remember\n3. Practical applications\n\nWould you like me to elaborate on any specific part?`,
        `Great question! Based on my knowledge:\n\n${userMessage.content}\n\nHere are the main points:\n• First important point\n• Second crucial detail\n• Third relevant information\n\nIs there anything specific you'd like me to clarify?`,
        `I can help with that! Regarding "${userMessage.content.slice(0, 30)}...":\n\nThis topic involves several key concepts. Let me explain it step by step:\n\nStep 1: Understanding the basics\nStep 2: Exploring deeper concepts\nStep 3: Practical applications\n\nFeel free to ask follow-up questions!`,
      ];

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: responses[Math.floor(Math.random() * responses.length)],
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, assistantMessage]);
      setIsLoading(false);
    }, 1500);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleNewChat = () => {
    if (messages.length > 0) {
      const newConversation: Conversation = {
        id: Date.now().toString(),
        title: messages[0].content.slice(0, 50) + '...',
        messages,
        updatedAt: new Date(),
      };
      setConversations((prev) => [newConversation, ...prev].slice(0, 10));
    }
    setMessages([]);
    toast.success('New chat started');
  };

  const handleClear = () => {
    setMessages([]);
    toast.success('Chat cleared');
  };

  const handlePromptClick = (prompt: string) => {
    setInput(prompt);
  };

  return (
    <div className="space-y-4 max-w-5xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900">Chat Assistant</h1>
          <p className="mt-1 text-sm text-slate-600">
            Ask questions and get AI-powered academic help
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleClear}
            leftIcon={<Icon name="trash" size={16} />}
            disabled={messages.length === 0}
          >
            Clear
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleNewChat}
          >
            New Chat
          </Button>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-4">
        <Card className="lg:col-span-1 hidden lg:flex flex-col">
          <CardContent className="p-4 flex flex-col h-[500px]">
            <div className="flex items-center gap-2 mb-4">
              <Icon name="clock" size={16} className="text-slate-500" />
              <span className="text-sm font-medium text-slate-700">Recent</span>
            </div>
            <div className="flex-1 overflow-y-auto space-y-2">
              {conversations.length === 0 ? (
                <p className="text-sm text-slate-400 text-center py-4">
                  No recent conversations
                </p>
              ) : (
                conversations.map((conv) => (
                  <div
                    key={conv.id}
                    className="p-3 rounded-lg bg-slate-50 hover:bg-slate-100 cursor-pointer transition-colors"
                  >
                    <p className="text-sm font-medium text-slate-700 line-clamp-1">
                      {conv.title}
                    </p>
                    <p className="text-xs text-slate-500 mt-1">
                      {new Date(conv.updatedAt).toLocaleDateString()}
                    </p>
                  </div>
                ))
              )}
            </div>

          </CardContent>
        </Card>

        <Card className="lg:col-span-3">
          <CardContent className="p-0 flex flex-col h-[500px] lg:h-[600px]">
            <div className="flex-1 overflow-y-auto p-3 sm:p-4 space-y-4">
              {messages.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center">
                  <div className="w-16 h-16 rounded-full bg-[#3c8350]/10 flex items-center justify-center mb-4">
                    <Icon name="brain" className="h-8 w-8 text-[#3c8350]" />
                  </div>
                  <h3 className="text-lg font-semibold text-slate-900 mb-2 text-center">
                    How can I help you today?
                  </h3>
                  <p className="text-sm text-slate-500 mb-6 text-center max-w-md px-4">
                    Ask me anything about your studies. I'm here to help explain concepts,
                    solve problems, and guide your learning.
                  </p>
                  <div className="flex flex-wrap gap-2 justify-center max-w-lg px-4">
                    {suggestedPrompts.map((prompt) => (
                      <button
                        key={prompt}
                        onClick={() => handlePromptClick(prompt)}
                        className="px-3 py-2 bg-slate-100 hover:bg-slate-200 rounded-lg text-sm text-slate-600 transition-colors text-left"
                      >
                        {prompt}
                      </button>
                    ))}
                  </div>
                </div>
              ) : (
                messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex gap-3 ${
                      message.role === 'user' ? 'flex-row-reverse' : ''
                    }`}
                  >
                    <Avatar className="h-8 w-8 flex-shrink-0">
                      {message.role === 'user' ? (
                        <AvatarFallback className="bg-slate-200 text-slate-700">
                          <Icon name="user" size={14} />
                        </AvatarFallback>
                      ) : (
                        <AvatarFallback className="bg-[#3c8350] text-white">
                          <Icon name="robot" size={14} />
                        </AvatarFallback>
                      )}
                    </Avatar>
                    <div
                      className={`max-w-[85%] sm:max-w-[80%] rounded-2xl px-4 py-3 ${
                        message.role === 'user'
                          ? 'bg-[#3c8350] text-white'
                          : 'bg-slate-100 text-slate-700'
                      }`}
                    >
                      <div className="whitespace-pre-wrap text-sm leading-relaxed">
                        {message.content}
                      </div>
                      <span
                        className={`text-xs mt-2 block ${
                          message.role === 'user' ? 'text-white/70' : 'text-slate-400'
                        }`}
                      >
                        {new Date(message.timestamp).toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
                    </div>
                  </div>
                ))
              )}
              {isLoading && (
                <div className="flex gap-3">
                  <Avatar className="h-8 w-8 flex-shrink-0">
                    <AvatarFallback className="bg-[#3c8350] text-white">
                      <Icon name="robot" size={14} />
                    </AvatarFallback>
                  </Avatar>
                  <div className="bg-slate-100 rounded-2xl px-4 py-3">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" />
                      <div
                        className="w-2 h-2 bg-slate-400 rounded-full animate-bounce"
                        style={{ animationDelay: '0.1s' }}
                      />
                      <div
                        className="w-2 h-2 bg-slate-400 rounded-full animate-bounce"
                        style={{ animationDelay: '0.2s' }}
                      />
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            <div className="border-t border-slate-100 p-3 sm:p-4">
              <div className="flex items-end gap-2">
                <button
                  className="p-2 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors flex-shrink-0"
                  title="Attach file (coming soon)"
                >
                  <Icon name="paperclip" size={20} />
                </button>
                <div className="flex-1 relative">
                  <textarea
                    ref={textareaRef}
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Ask anything about your studies..."
                    className="w-full px-4 py-3 pr-12 text-sm text-slate-700 bg-slate-50 rounded-xl border border-slate-200 focus:border-[#3c8350] focus:ring-2 focus:ring-[#3c8350]/20 focus:outline-none resize-none min-h-[48px] max-h-[120px]"
                    rows={1}
                  />
                </div>
                <Button
                  onClick={handleSend}
                  disabled={!input.trim() || isLoading}
                  leftIcon={<Icon name="send" size={18} />}
                  className="flex-shrink-0"
                >
                  Send
                </Button>
              </div>
              <p className="text-xs text-slate-400 mt-2 text-center">
                AI responses are generated for educational purposes. Always verify important information.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
