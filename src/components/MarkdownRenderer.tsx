'use client';

import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { cn } from '@/lib/utils';

interface MarkdownRendererProps {
  content: string;
  className?: string;
}

/**
 * MarkdownRenderer
 *
 * Renders markdown content using react-markdown with GitHub-flavored markdown support.
 * Safe by default — does not render raw HTML unless explicitly configured.
 *
 * Used for AI-generated fields like `structured_notes` and `summary`.
 */
export function MarkdownRenderer({ content, className }: MarkdownRendererProps) {
  if (!content) return null;

  return (
    <ReactMarkdown
      remarkPlugins={[remarkGfm]}
      className={cn(
        'prose prose-slate max-w-none',
        // Headings
        'prose-headings:text-slate-900 prose-headings:font-semibold',
        'prose-h1:text-xl prose-h1:mb-4',
        'prose-h2:text-lg prose-h2:mb-3',
        'prose-h3:text-base prose-h3:mb-2',
        // Paragraphs
        'prose-p:text-[15px] prose-p:text-slate-700 prose-p:leading-7 prose-p:mb-4',
        // Lists
        'prose-ul:my-3 prose-ul:list-disc prose-ul:pl-5',
        'prose-ol:my-3 prose-ol:list-decimal prose-ol:pl-5',
        'prose-li:text-[15px] prose-li:text-slate-700 prose-li:mb-1',
        // Code
        'prose-code:bg-slate-100 prose-code:text-slate-800 prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded prose-code:text-sm prose-code:font-mono',
        'prose-pre:bg-slate-900 prose-pre:p-4 prose-pre:rounded-xl prose-pre:my-4',
        'prose-pre:code:bg-transparent prose-pre:code:text-slate-100 prose-pre:code:p-0 prose-pre:code:text-sm',
        // Blockquotes
        'prose-blockquote:border-l-4 prose-blockquote:border-[#3D6E4E] prose-blockquote:pl-4 prose-blockquote:italic prose-blockquote:text-slate-600 prose-blockquote:my-4',
        // Links
        'prose-a:text-[#407BFF] prose-a:underline hover:prose-a:text-[#3060cc]',
        // Tables
        'prose-table:w-full prose-table:border-collapse prose-table:my-4',
        'prose-th:border prose-th:border-slate-200 prose-th:p-2 prose-th:bg-slate-50 prose-th:text-left prose-th:text-sm prose-th:font-semibold prose-th:text-slate-700',
        'prose-td:border prose-td:border-slate-200 prose-td:p-2 prose-td:text-sm prose-td:text-slate-700',
        // Horizontal rule
        'prose-hr:border-slate-200 prose-hr:my-6',
        // Strong / bold
        'prose-strong:text-slate-900 prose-strong:font-semibold',
        className
      )}
    >
      {content}
    </ReactMarkdown>
  );
}
