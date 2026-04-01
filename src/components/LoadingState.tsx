"use client";

import { motion } from "framer-motion";
import { Loader2 } from "lucide-react";

interface LoadingStateProps {
  variant?: "spinner" | "skeleton" | "pulse";
  message?: string;
  rows?: number;
  className?: string;
}

/**
 * LoadingState Component
 * 
 * Reusable loading state with multiple variants:
 * - spinner: Animated spinning loader with optional message
 * - skeleton: Skeleton cards for content loading
 * - pulse: Pulse animation for generic loading states
 */
export function LoadingState({
  variant = "spinner",
  message = "Loading...",
  rows = 3,
  className = "",
}: LoadingStateProps) {
  if (variant === "spinner") {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className={`flex flex-col items-center justify-center gap-4 py-12 ${className}`}
      >
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
        >
          <Loader2 className="w-8 h-8 text-[var(--primary-500)]" />
        </motion.div>
        {message && (
          <p className="text-slate-600 text-sm font-medium">{message}</p>
        )}
      </motion.div>
    );
  }

  if (variant === "skeleton") {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className={`space-y-4 ${className}`}
      >
        {Array.from({ length: rows }).map((_, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="bg-slate-100 rounded-xl p-4 space-y-3"
          >
            <div className="h-4 bg-slate-200 rounded w-3/4 animate-pulse" />
            <div className="h-3 bg-slate-200 rounded w-1/2 animate-pulse" />
            <div className="flex gap-2">
              <div className="h-8 bg-slate-200 rounded-lg w-20 animate-pulse" />
              <div className="h-8 bg-slate-200 rounded-lg w-20 animate-pulse" />
            </div>
          </motion.div>
        ))}
      </motion.div>
    );
  }

  // Pulse variant
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className={`flex flex-col items-center justify-center gap-4 py-12 ${className}`}
    >
      <div className="w-12 h-12 bg-[var(--primary-200)] rounded-full animate-pulse" />
      {message && (
        <p className="text-slate-600 text-sm font-medium animate-pulse">{message}</p>
      )}
    </motion.div>
  );
}

/**
 * ButtonLoading Component
 * 
 * Small spinner for button loading states
 */
export function ButtonLoading({ className = "" }: { className?: string }) {
  return (
    <motion.div
      animate={{ rotate: 360 }}
      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
      className={className}
    >
      <Loader2 className="w-4 h-4" />
    </motion.div>
  );
}

export default LoadingState;
