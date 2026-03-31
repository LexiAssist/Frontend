'use client';

import { useEffect, useRef, useState } from 'react';
import {
  ArrowUp,
  BookOpenText,
  ChevronDown,
  LockKeyhole,
  Paperclip,
  PenLine,
  Pin,
  Sprout,
} from 'lucide-react';
import { FeatureHeader } from '@/components/FeatureHeader';

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

const starterPrompt = 'Explain empiricism in philosophy in simple terms.';

function LexiAssistSymbol() {
  return (
    <div className="relative flex h-14 w-14 items-center justify-center text-[var(--primary-500)]">
      <BookOpenText className="h-10 w-10" strokeWidth={1.8} />
      <Sprout className="absolute top-0 h-5 w-5" strokeWidth={2.2} />
    </div>
  );
}

export default function ChatAssistantPage() {
  const [prompt, setPrompt] = useState(starterPrompt);
  const [attachedItems, setAttachedItems] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const folderInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (folderInputRef.current) {
      folderInputRef.current.setAttribute('webkitdirectory', '');
      folderInputRef.current.setAttribute('directory', '');
    }
  }, []);

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

      <div className="flex justify-end pb-8 pt-2 lg:pb-10 lg:pt-4">
        <FeatureHeader />
      </div>

      <section className="flex flex-1 flex-col items-center">
        <div className="flex w-full max-w-[860px] flex-col items-center">
          <LexiAssistSymbol />
          <h1 className="pt-4 text-center text-[2rem] font-bold tracking-tight text-slate-950 sm:text-[2.35rem]">
            Good Afternoon, Victoria
          </h1>
          <p className="pt-2 text-center text-[2rem] font-bold tracking-tight text-slate-950 sm:text-[2.35rem]">
            What&apos;s on <span className="text-[var(--primary-500)]">your mind?</span>
          </p>

          <div className="mt-8 w-full rounded-xl border border-slate-300 bg-white shadow-[0_1px_2px_rgba(15,23,42,0.04)]">
            <textarea
              value={prompt}
              onChange={(event) => setPrompt(event.target.value)}
              className="min-h-[220px] w-full resize-none rounded-t-xl border-0 bg-transparent px-5 py-4 text-sm text-slate-900 outline-none placeholder:text-slate-400 sm:min-h-[180px]"
              placeholder={starterPrompt}
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
                className="flex h-9 w-9 items-center justify-center rounded-full border border-[var(--primary-500)] text-[var(--primary-500)] transition hover:bg-[var(--primary-50)]"
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
                    className="rounded-full bg-[var(--primary-50)] px-3 py-1 text-xs font-medium text-[var(--primary-700)]"
                  >
                    {item}
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
    </div>
  );
}
