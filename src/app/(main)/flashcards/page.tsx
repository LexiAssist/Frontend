"use client";

import Image from "next/image";
import { AnimatePresence, motion } from "framer-motion";
import { useRef, useState, useCallback } from "react";
import {
  ArrowLeft,
  ArrowRight,
  CloudUpload,
  FileText,
  HelpCircle,
  X,
  Sparkles,
} from "lucide-react";
import { FeatureHeader } from '@/components/FeatureHeader';
import { Button } from '@/components/ui/Button';
import { toast } from 'sonner';
import { useAuthStore } from '@/store/authStore';
import { useGenerateFlashcards, useCreateFlashcardDeck } from '@/hooks/useFlashcards';
import { flashcardApi } from '@/services/api';

type ViewState = "upload" | "ready" | "generated" | "list" | "textInput";

type SelectedDocument = {
  name: string;
  extension: string;
  content?: string;
};

type GeneratedFlashcard = {
  id: string;
  front: string;
  back: string;
};

const transitionProps = { duration: 0.22, ease: "easeOut" as const };

function getExtension(name: string) {
  const ext = name.split(".").pop()?.toUpperCase();
  return ext && ext !== name.toUpperCase() ? ext : "FILE";
}

function getDisplayName(name: string) {
  const withoutExt = name.replace(/\.[^.]+$/, "");
  return withoutExt || name;
}

function Banner() {
  return (
    <div className="relative overflow-hidden rounded-2xl bg-[#ff9a05] px-6 py-8 sm:px-8 sm:py-10 lg:px-12 lg:py-12">
      <div
        className="absolute inset-0 opacity-25"
        style={{
          backgroundImage:
            "radial-gradient(circle at 22px 22px, rgba(198,122,0,0.55) 0 20px, transparent 21px)",
          backgroundSize: "52px 52px",
        }}
      />
      <div className="relative z-10 flex min-h-[160px] sm:min-h-[180px] lg:min-h-[206px] flex-col sm:flex-row items-center justify-center gap-6 sm:gap-8 lg:gap-12">
        <div className="relative h-[120px] w-[160px] sm:h-[140px] sm:w-[180px] lg:h-[206px] lg:w-[225px] shrink-0 p-4">
          <Image
            src="/images/flashcard.jpg"
            alt="Flashcards illustration"
            fill
            className="object-contain mix-blend-screen"
          />
        </div>
        <div className="w-full max-w-[498px] text-center sm:text-left">
          <h2 className="text-[20px] sm:text-[24px] lg:text-[28px] font-semibold leading-[1.2] tracking-[-0.02em] text-[#272A28]">
            Flashcards
          </h2>
          <p className="pt-4 sm:pt-5 lg:pt-6 text-[16px] sm:text-[18px] lg:text-[20px] leading-[1.3] sm:leading-[1.2] tracking-[-0.02em] text-[#555C56]">
            Learn more effectively with AI-generated flashcards. Upload a document or enter text to get started.
          </p>
        </div>
      </div>
    </div>
  );
}

function UploadDropzone({ onChooseFile, onTextInput }: { onChooseFile: () => void; onTextInput: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={transitionProps}
      className="space-y-4"
    >
      <button
        type="button"
        onClick={onChooseFile}
        className="flex min-h-[220px] sm:min-h-[260px] lg:min-h-[286px] w-full flex-col items-center justify-center rounded-2xl border border-dashed border-[var(--primary-500)] bg-[rgba(60,131,80,0.18)] px-6 sm:px-8 py-8 sm:py-10 lg:py-12 text-center touch-target hover:bg-[rgba(60,131,80,0.25)] transition-colors"
      >
        <div className="flex h-[56px] w-[56px] sm:h-[68px] sm:w-[68px] lg:h-[78px] lg:w-[78px] items-center justify-center rounded-full bg-[var(--primary-500)]">
          <CloudUpload className="h-7 w-7 sm:h-9 sm:w-9 lg:h-10 lg:w-10 text-[var(--primary-50)]" />
        </div>
        <p className="pt-3 sm:pt-4 text-[18px] sm:text-[20px] lg:text-[24px] font-semibold leading-[1.2] tracking-[-0.02em] text-[var(--primary-500)]">
          Click to upload or drag and drop
        </p>
        <p className="pt-2 text-[14px] sm:text-[16px] lg:text-[18px] leading-[1.45] text-black/60">
          PDF, DOC, TXT (max 25MB)
        </p>
      </button>
      
      <div className="text-center">
        <span className="text-sm text-gray-500">or</span>
      </div>
      
      <button
        type="button"
        onClick={onTextInput}
        className="w-full py-4 px-6 rounded-lg border border-[var(--primary-500)] text-[var(--primary-500)] font-medium hover:bg-[var(--primary-50)] transition-colors"
      >
        Type or paste your content
      </button>
    </motion.div>
  );
}

function TextInputState({ 
  onSubmit, 
  onCancel, 
  isLoading 
}: { 
  onSubmit: (text: string) => void; 
  onCancel: () => void;
  isLoading: boolean;
}) {
  const [text, setText] = useState('');

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={transitionProps}
      className="w-full max-w-2xl"
    >
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
        <h3 className="text-lg font-semibold text-slate-900 mb-4">Enter your content</h3>
        
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Paste your study material here..."
          className="w-full min-h-[200px] p-4 rounded-xl border border-slate-200 focus:border-[var(--primary-500)] focus:ring-1 focus:ring-[var(--primary-500)] outline-none resize-none"
        />
        
        <div className="flex gap-3 mt-4">
          <Button
            onClick={onCancel}
            variant="outline"
            className="flex-1 rounded-xl"
          >
            Cancel
          </Button>
          <Button
            onClick={() => onSubmit(text)}
            isLoading={isLoading}
            disabled={!text.trim()}
            className="flex-1 rounded-xl"
          >
            Generate Flashcards
          </Button>
        </div>
      </div>
    </motion.div>
  );
}

function ReadyState({
  document,
  onCancel,
  onSubmit,
  isLoading,
}: {
  document: SelectedDocument;
  onCancel: () => void;
  onSubmit: () => void;
  isLoading: boolean;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={transitionProps}
      className="w-full max-w-md"
    >
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
        <h3 className="text-lg font-semibold text-slate-900 mb-4">Document uploaded</h3>

        <div className="flex items-center gap-4 rounded-xl bg-slate-50 px-4 py-4 border border-slate-100">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[var(--primary-500)] shrink-0">
            <FileText className="h-5 w-5 text-white" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-medium text-slate-900 truncate">
              {document.name}
            </p>
            <p className="text-xs text-slate-500">{document.extension}</p>
          </div>

          <button
            type="button"
            onClick={onCancel}
            disabled={isLoading}
            className="rounded-lg p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 transition-colors disabled:opacity-50 shrink-0"
            aria-label="Remove selected document"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <Button
          onClick={onSubmit}
          isLoading={isLoading}
          className="mt-5 w-full rounded-xl"
        >
          Generate Flashcards
        </Button>
      </div>
    </motion.div>
  );
}

function SideCard({ side }: { side: "left" | "right" }) {
  return (
    <div
      className={[
        "hidden h-[214px] w-[180px] rounded-xl bg-[#6ca378] px-5 py-6 lg:block lg:h-[258px] lg:w-[180px]",
        side === "left"
          ? "origin-right scale-[0.98]"
          : "origin-left scale-[0.98]",
      ].join(" ")}
    >
      <div className="flex h-full flex-col justify-center gap-5">
        <div className="h-4 w-[85%] rounded-full bg-[rgba(236,243,238,0.85)]" />
        <div className="h-4 w-[65%] rounded-full bg-[rgba(236,243,238,0.85)]" />
        <div className="h-4 w-[85%] rounded-full bg-[rgba(236,243,238,0.85)]" />
      </div>
    </div>
  );
}

function GeneratedState({ 
  flashcards, 
  currentIndex, 
  onNext, 
  onPrev, 
  onFlip, 
  isFlipped,
  onSaveDeck,
  isSaving
}: { 
  flashcards: GeneratedFlashcard[];
  currentIndex: number;
  onNext: () => void;
  onPrev: () => void;
  onFlip: () => void;
  isFlipped: boolean;
  onSaveDeck: () => void;
  isSaving: boolean;
}) {
  const currentCard = flashcards[currentIndex];

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={transitionProps}
      className="pt-2"
    >
      <div className="mx-auto flex max-w-[760px] items-center justify-center gap-4 sm:gap-8 lg:gap-12 px-4 sm:px-0">
        <SideCard side="left" />

        <div 
          onClick={onFlip}
          className="relative h-[280px] w-[210px] sm:h-[321px] sm:w-[241px] lg:h-[360px] lg:w-[290px] overflow-hidden rounded-2xl bg-[var(--primary-500)] px-4 sm:px-6 py-5 sm:py-7 text-white shadow-md cursor-pointer transition-transform hover:scale-[1.02]"
        >
          <div className="relative z-10 flex h-full flex-col items-center text-center">
            <div className="flex h-10 w-10 sm:h-12 sm:w-12 items-center justify-center rounded-full border-[3px] border-white">
              <HelpCircle className="h-6 w-6 sm:h-7 sm:w-7" />
            </div>
            <p className="pt-2 text-[16px] sm:text-[18px] font-semibold">{currentIndex + 1}/{flashcards.length}</p>
            <p className="max-w-[180px] sm:max-w-[205px] pt-5 sm:pt-7 text-[16px] sm:text-[18px] lg:text-[20px] font-semibold leading-[1.35]">
              {isFlipped ? currentCard.back : currentCard.front}
            </p>

            <div className="mt-auto pb-2 sm:pb-3">
              <span className="text-sm text-white/70">
                {isFlipped ? 'Click to see question' : 'Click to reveal answer'}
              </span>
            </div>
          </div>

          <div className="absolute bottom-0 left-[-12%] h-[60px] sm:h-[86px] w-[60%] rounded-[50%] bg-[rgba(236,243,238,0.22)]" />
          <div className="absolute bottom-0 right-[-14%] h-[60px] sm:h-[86px] w-[60%] rounded-[50%] bg-[rgba(25,55,34,0.45)]" />
        </div>

        <SideCard side="right" />
      </div>

      <div className="flex items-center justify-center gap-6 sm:gap-10 pt-8 sm:pt-12">
        <button
          type="button"
          onClick={onPrev}
          disabled={currentIndex === 0}
          className="flex h-11 w-11 items-center justify-center rounded-full border border-slate-200 text-slate-600 transition hover:bg-slate-50 hover:border-slate-300 disabled:opacity-50"
          aria-label="Previous flashcard"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
        <button
          type="button"
          onClick={onNext}
          disabled={currentIndex === flashcards.length - 1}
          className="flex h-11 w-11 items-center justify-center rounded-full border border-slate-200 text-slate-600 transition hover:bg-slate-50 hover:border-slate-300 disabled:opacity-50"
          aria-label="Next flashcard"
        >
          <ArrowRight className="h-5 w-5" />
        </button>
      </div>

      {/* Save Deck Button */}
      <div className="flex justify-center pt-6">
        <Button
          onClick={onSaveDeck}
          isLoading={isSaving}
          className="px-8"
        >
          Save Flashcard Deck
        </Button>
      </div>
    </motion.div>
  );
}

export default function FlashcardsPage() {
  const [viewState, setViewState] = useState<ViewState>("upload");
  const [selectedDocument, setSelectedDocument] = useState<SelectedDocument | null>(null);
  const [inputText, setInputText] = useState('');
  const [generatedFlashcards, setGeneratedFlashcards] = useState<GeneratedFlashcard[]>([]);
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const { user } =