"use client";

import {
  BookOpen,
  ChevronUp,
  FileText,
  Home,
  LogOut,
  Menu,
  Moon,
  PenLine,
  Settings,
  Volume2,
  X,
} from "lucide-react";
import Image from "next/image";

// --- Sidebar Components ---

function Logo() {
  return (
    <div className="flex items-center gap-3 px-2">
      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-white/10">
        <svg
          viewBox="0 0 24 24"
          fill="none"
          className="h-6 w-6 text-white"
          stroke="currentColor"
          strokeWidth="1.5"
        >
          <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
        </svg>
      </div>
      <span className="text-xl font-bold text-white">LexiAssist</span>
    </div>
  );
}

function Sidebar() {
  return (
    <aside className="fixed left-0 top-0 z-50 flex h-screen w-64 flex-col bg-[#3f835b]">
      {/* Logo Area */}
      <div className="p-6">
        <Logo />
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1 px-4 py-4">
        {/* Dashboard */}
        <a
          href="#"
          className="flex items-center gap-3 rounded-lg px-4 py-3 text-white/90 transition hover:bg-white/10"
        >
          <Home className="h-5 w-5" />
          <span className="font-medium">Dashboard</span>
        </a>

        {/* Tools Label */}
        <div className="px-4 py-2">
          <span className="text-xs font-medium uppercase tracking-wider text-white/60">
            Tools
          </span>
        </div>

        {/* Text to Speech */}
        <a
          href="#"
          className="flex items-center gap-3 rounded-lg px-4 py-3 text-white/90 transition hover:bg-white/10"
        >
          <Volume2 className="h-5 w-5" />
          <span className="font-medium">Text to Speech</span>
        </a>

        {/* Reading Assistant */}
        <a
          href="#"
          className="flex items-center gap-3 rounded-lg px-4 py-3 text-white/90 transition hover:bg-white/10"
        >
          <BookOpen className="h-5 w-5" />
          <span className="font-medium">Reading Assistant</span>
        </a>

        {/* Writing Assistant */}
        <a
          href="#"
          className="flex items-center gap-3 rounded-lg px-4 py-3 text-white/90 transition hover:bg-white/10"
        >
          <PenLine className="h-5 w-5" />
          <span className="font-medium">Writing Assistant</span>
        </a>

        {/* StudyBuddy Section */}
        <div className="mt-2">
          <button className="flex w-full items-center justify-between rounded-lg px-4 py-3 text-white/90 transition hover:bg-white/10">
            <div className="flex items-center gap-3">
              <Menu className="h-5 w-5" />
              <span className="font-medium">StudyBuddy</span>
            </div>
            <ChevronUp className="h-4 w-4" />
          </button>

          {/* Sub-menu */}
          <div className="mt-1 space-y-1 pl-4">
            <a
              href="#"
              className="flex items-center gap-3 rounded-full bg-white/10 px-4 py-2.5 text-white/80 transition hover:bg-white/20"
            >
              <span className="text-sm font-medium">Chat Assistant</span>
            </a>
            <a
              href="#"
              className="flex items-center gap-3 rounded-full bg-white/10 px-4 py-2.5 text-white/80 transition hover:bg-white/20"
            >
              <span className="text-sm font-medium">Flashcards</span>
            </a>
            <a
              href="#"
              className="flex items-center gap-3 rounded-full bg-white px-4 py-2.5 text-[#3f835b] transition"
            >
              <span className="text-sm font-bold">Quizzes</span>
            </a>
          </div>
        </div>
      </nav>

      {/* User Profile */}
      <div className="border-t border-white/10 p-4">
        <div className="flex items-center gap-3 rounded-lg px-2 py-3">
          <div className="relative h-10 w-10 overflow-hidden rounded-full border-2 border-white/20">
            <div className="h-full w-full bg-gradient-to-br from-amber-200 to-amber-400" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="truncate text-sm font-bold text-white">Alison Eyo</p>
            <p className="truncate text-xs text-white/70">alis@lexiassist</p>
          </div>
          <button className="rounded-full p-2 text-white/70 transition hover:bg-white/10 hover:text-white">
            <LogOut className="h-5 w-5" />
          </button>
        </div>
      </div>
    </aside>
  );
}

// --- Main Content Components ---

function Header() {
  return (
    <header className="flex items-center justify-between">
      <h1 className="text-[28px] font-bold tracking-tight text-[#1a1a1a]">
        Quizzes
      </h1>
      <div className="flex items-center gap-3">
        <button className="flex h-11 w-11 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-700 shadow-sm transition hover:bg-slate-50">
          <Settings className="h-5 w-5" />
        </button>
        <button className="flex h-11 w-11 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-700 shadow-sm transition hover:bg-slate-50">
          <Moon className="h-5 w-5" />
        </button>
      </div>
    </header>
  );
}

function HeroBanner() {
  return (
    <div className="relative overflow-hidden rounded-2xl bg-[#df7361]">
      {/* Grid Pattern Overlay */}
      <div
        className="absolute inset-0 opacity-20"
        style={{
          backgroundImage: `
            linear-gradient(to right, rgba(0,0,0,0.15) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(0,0,0,0.15) 1px, transparent 1px)
          `,
          backgroundSize: "40px 40px",
        }}
      />

      <div className="relative z-10 flex items-center justify-between gap-8 px-10 py-8">
        {/* Illustration Placeholder */}
        <div className="flex-shrink-0">
          <div className="relative h-[200px] w-[240px]">
            {/* Quiz illustration placeholder */}
            <svg
              viewBox="0 0 200 180"
              fill="none"
              className="h-full w-full"
            >
              {/* Background elements */}
              <rect x="20" y="40" width="140" height="100" rx="8" fill="white" fillOpacity="0.9" />
              <rect x="35" y="55" width="100" height="8" rx="4" fill="#df7361" fillOpacity="0.3" />
              <rect x="35" y="70" width="80" height="6" rx="3" fill="#df7361" fillOpacity="0.2" />
              <rect x="35" y="82" width="90" height="6" rx="3" fill="#df7361" fillOpacity="0.2" />
              <rect x="35" y="94" width="70" height="6" rx="3" fill="#df7361" fillOpacity="0.2" />
              
              {/* Checkmark */}
              <circle cx="160" cy="50" r="18" fill="white" />
              <path d="M152 50L157 55L168 44" stroke="#df7361" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
              
              {/* Person silhouette */}
              <ellipse cx="100" cy="165" rx="35" ry="10" fill="rgba(0,0,0,0.1)" />
              <circle cx="100" cy="110" r="25" fill="#2d3748" />
              <path d="M75 140 Q100 120 125 140 L125 170 L75 170 Z" fill="#2d3748" />
              
              {/* Laptop */}
              <rect x="60" y="130" width="80" height="50" rx="4" fill="white" />
              <rect x="65" y="135" width="70" height="35" rx="2" fill="#e2e8f0" />
            </svg>
          </div>
        </div>

        {/* Text Content */}
        <div className="flex-1 max-w-md">
          <h2 className="text-[32px] font-bold text-white">Quizzes</h2>
          <p className="mt-3 text-[15px] leading-relaxed text-white/95">
            upload a document and we will automatically generate questions to test your understanding of the content.
          </p>
        </div>
      </div>
    </div>
  );
}

function DocumentCard() {
  return (
    <div className="max-w-md">
      <h3 className="mb-4 text-base font-medium text-[#6b6f6c]">
        Document uploaded
      </h3>

      {/* File Card */}
      <div className="flex items-center gap-4 rounded-xl bg-[#f0f0f0] p-4">
        <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-[#3f835b]">
          <FileText className="h-6 w-6 text-white" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="truncate text-[15px] font-semibold text-[#1a1a1a]">
            History of Hitler
          </p>
          <p className="text-sm text-[#888d89]">PDF</p>
        </div>
        <button className="rounded-full p-2 text-[#888d89] transition hover:bg-white hover:text-[#1a1a1a]">
          <X className="h-5 w-5" />
        </button>
      </div>

      {/* Submit Button */}
      <button className="mt-4 w-full rounded-full bg-[#3f835b] py-3.5 text-[15px] font-bold text-white shadow-md transition hover:bg-[#367a52] active:scale-[0.98]">
        Submit
      </button>
    </div>
  );
}

// --- Main Page ---

export default function QuizzesPage() {
  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />

      {/* Main Content */}
      <main className="ml-64 flex-1 p-10">
        <div className="mx-auto max-w-4xl space-y-10">
          <Header />
          <HeroBanner />
          <DocumentCard />
        </div>
      </main>
    </div>
  );
}
