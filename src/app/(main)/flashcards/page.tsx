"use client";

import Image from "next/image";
import { AnimatePresence, motion } from "framer-motion";
import { useRef, useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  CloudUpload,
  FileText,
  HelpCircle,
  X,
} from "lucide-react";
import { FeatureHeader } from '@/components/FeatureHeader';

type ViewState = "upload" | "ready" | "generated";

type SelectedDocument = {
  name: string;
  extension: string;
};

const flashcardQuestion =
  "What was the name of the failed coup attempt by Hitler and the Nazi Party in 1923?";

const transitionProps = { duration: 0.22, ease: "easeOut" as const };

function getExtension(name: string) {
  const ext = name.split(".").pop()?.toUpperCase();
  return ext && ext !== name.toUpperCase() ? ext : "FILE";
}

function getDisplayName(name: string) {
  const withoutExt = name.replace(/\.[^.]+$/, "");
  return withoutExt || name;
}

function FlashcardsBannerArt() {
  return (
    <div className="relative h-[206px] w-[225px] shrink-0">
      <Image
        src="/images/flashcard.jpg"
        alt="Flashcards illustration"
        fill
        className="object-contain mix-blend-screen"
      />
    </div>
  );
}

function PageHeader({ title }: { title: string }) {
  return (
    <div className="flex items-center justify-between">
      <h1 className="text-[28px] font-semibold leading-[1.2] tracking-[-0.02em] text-[#272A28]">
        {title}
      </h1>
      <FeatureHeader />
    </div>
  );
}

function Banner() {
  return (
    <div className="relative overflow-hidden rounded-lg bg-[#ff9a05] px-12 py-10">
      <div
        className="absolute inset-0 opacity-25"
        style={{
          backgroundImage:
            "radial-gradient(circle at 22px 22px, rgba(198,122,0,0.55) 0 20px, transparent 21px)",
          backgroundSize: "52px 52px",
        }}
      />
      <div className="relative z-10 flex min-h-[206px] items-center justify-center gap-[52px]">
        <FlashcardsBannerArt />
        <div className="w-full max-w-[498px]">
          <h2 className="text-[28px] font-semibold leading-[1.2] tracking-[-0.02em] text-[#272A28]">
            Flashcards
          </h2>
          <p className="pt-7 text-[20px] leading-[1.2] tracking-[-0.02em] text-[#555C56]">
            Learn more effectively with generated flashcards
          </p>
        </div>
      </div>
    </div>
  );
}

function UploadDropzone({ onChooseFile }: { onChooseFile: () => void }) {
  return (
    <motion.button
      type="button"
      onClick={onChooseFile}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={transitionProps}
      className="flex min-h-[286px] w-full flex-col items-center justify-center rounded-lg border border-dashed border-[var(--primary-500)] bg-[rgba(60,131,80,0.18)] px-8 text-center"
    >
      <div className="flex h-[78px] w-[78px] items-center justify-center rounded-full bg-[var(--primary-500)]">
        <CloudUpload className="h-10 w-10 text-[var(--primary-50)]" />
      </div>
      <p className="pt-4 text-[24px] font-semibold leading-[1.2] tracking-[-0.02em] text-[var(--primary-500)]">
        Click to upload or drag and drop
      </p>
      <p className="pt-2 text-[18px] leading-[1.45] text-black/60">
        PDF, DOC, TXT, image (Size maximun)
      </p>
    </motion.button>
  );
}

function ReadyState({
  document,
  onCancel,
  onSubmit,
}: {
  document: SelectedDocument;
  onCancel: () => void;
  onSubmit: () => void;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={transitionProps}
      className="w-full"
    >
      <p className="text-[20px] font-medium leading-[1.2] tracking-[-0.02em] text-[#6b6f6c]">
        Document uploaded
      </p>

      <div className="mt-5 flex h-[64px] w-full max-w-[380px] items-center justify-between rounded-lg bg-[#efefef] px-6">
        <div className="flex items-center gap-4">
          <div className="flex h-10 w-10 items-center justify-center text-[var(--primary-500)]">
            <FileText className="h-8 w-8 fill-current stroke-[1.6]" />
          </div>
          <div>
            <p className="text-[16px] font-medium text-[#555C56]">
              {document.name}
            </p>
            <p className="pt-1 text-[14px] text-[#888d89]">
              {document.extension}
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={onCancel}
          className="rounded-full p-1 text-black transition hover:bg-white"
          aria-label="Remove selected document"
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      <button
        type="button"
        onClick={onSubmit}
        className="mt-6 inline-flex h-[52px] w-full max-w-[380px] items-center justify-center rounded-full bg-[var(--primary-500)] px-8 text-[16px] font-semibold text-white transition hover:bg-[var(--primary-600)]"
      >
        Submit
      </button>
    </motion.div>
  );
}

function SideCard({ side }: { side: "left" | "right" }) {
  return (
    <div
      className={[
        "hidden h-[214px] w-[180px] rounded-md bg-[#6ca378] px-5 py-6 md:block lg:h-[258px] lg:w-[180px]",
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

function GeneratedState() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={transitionProps}
      className="pt-8"
    >
      <div className="mx-auto flex max-w-[760px] items-center justify-center gap-[46px]">
        <SideCard side="left" />

        <div className="relative h-[321px] w-[241px] overflow-hidden rounded-md bg-[var(--primary-500)] px-6 py-7 text-white shadow-sm sm:h-[360px] sm:w-[290px]">
          <div className="relative z-10 flex h-full flex-col items-center text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-full border-[3px] border-white">
              <HelpCircle className="h-7 w-7" />
            </div>
            <p className="pt-2 text-[18px] font-semibold">1/50</p>
            <p className="max-w-[205px] pt-7 text-[18px] font-semibold leading-[1.35] sm:max-w-[220px] sm:text-[20px]">
              {flashcardQuestion}
            </p>

            <div className="mt-auto pb-3">
              <button
                type="button"
                className="rounded-full bg-white px-8 py-3 text-[15px] font-semibold text-[var(--primary-500)]"
              >
                Answer
              </button>
            </div>
          </div>

          <div className="absolute bottom-0 left-[-12%] h-[86px] w-[60%] rounded-[50%] bg-[rgba(236,243,238,0.22)]" />
          <div className="absolute bottom-0 right-[-14%] h-[86px] w-[60%] rounded-[50%] bg-[rgba(25,55,34,0.45)]" />
        </div>

        <SideCard side="right" />
      </div>

      <div className="flex items-center justify-center gap-10 pt-14">
        <button
          type="button"
          className="flex h-10 w-10 items-center justify-center rounded-full border border-[var(--primary-500)] text-[var(--primary-500)] transition hover:bg-[var(--primary-50)]"
          aria-label="Previous flashcard"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
        <button
          type="button"
          className="flex h-10 w-10 items-center justify-center rounded-full border border-[var(--primary-500)] text-[var(--primary-500)] transition hover:bg-[var(--primary-50)]"
          aria-label="Next flashcard"
        >
          <ArrowRight className="h-5 w-5" />
        </button>
      </div>
    </motion.div>
  );
}

export default function FlashcardsPage() {
  const [viewState, setViewState] = useState<ViewState>("upload");
  const [selectedDocument, setSelectedDocument] =
    useState<SelectedDocument | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleOpenPicker = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setSelectedDocument({
      name: getDisplayName(file.name),
      extension: getExtension(file.name),
    });
    setViewState("ready");
    event.target.value = "";
  };

  const resetUpload = () => {
    setSelectedDocument(null);
    setViewState("upload");
  };

  const headerTitle =
    viewState === "generated" && selectedDocument
      ? selectedDocument.name
      : "FlashCards";

  return (
    <div className="mx-auto w-full max-w-[1008px] pb-8">
      <input
        ref={fileInputRef}
        type="file"
        className="hidden"
        accept=".pdf,.doc,.docx,.txt,.png,.jpg,.jpeg,.webp"
        onChange={handleFileChange}
      />

      <div className="space-y-[42px] pt-8">
        <PageHeader title={headerTitle} />

        <AnimatePresence mode="wait">
          {viewState === "generated" ? (
            <motion.div
              key="generated"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <GeneratedState />
            </motion.div>
          ) : (
            <motion.div
              key={viewState}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-[42px]"
            >
              <Banner />

              {viewState === "upload" ? (
                <UploadDropzone onChooseFile={handleOpenPicker} />
              ) : selectedDocument ? (
                <ReadyState
                  document={selectedDocument}
                  onCancel={resetUpload}
                  onSubmit={() => setViewState("generated")}
                />
              ) : null}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
