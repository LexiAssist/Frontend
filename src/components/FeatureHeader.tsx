"use client";

import { useTheme } from "next-themes";
import { Sun, Moon, Settings } from "lucide-react";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";

interface FeatureHeaderProps {
  showSettings?: boolean;
  className?: string;
}

/**
 * FeatureHeader Component
 * 
 * Provides highly visible Dark Mode and Settings icon buttons
 * for all main feature pages. Positioned in the top-right corner.
 * 
 * Features:
 * - High-contrast white background buttons
 * - Clear sun/moon icons for theme toggle
 * - Settings gear icon linking to settings page
 * - Consistent sizing and spacing
 * - Smooth hover/active animations
 */
export function FeatureHeader({ 
  showSettings = true, 
  className = "" 
}: FeatureHeaderProps) {
  const { theme, setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const toggleTheme = () => {
    setTheme(resolvedTheme === "dark" ? "light" : "dark");
  };

  // Prevent hydration mismatch
  if (!mounted) {
    return (
      <div className={`flex items-center gap-3 ${className}`}>
        <div className="h-11 w-11 rounded-xl bg-white shadow-md animate-pulse" />
        {showSettings && <div className="h-11 w-11 rounded-xl bg-white shadow-md animate-pulse" />}
      </div>
    );
  }

  const isDark = resolvedTheme === "dark";

  return (
    <div className={`flex items-center gap-3 ${className}`}>
      {/* Dark Mode Toggle Button */}
      <motion.button
        onClick={toggleTheme}
        className="group relative flex items-center justify-center
                   h-11 w-11 rounded-xl
                   bg-white shadow-md shadow-slate-200/50
                   border border-slate-100
                   text-slate-700
                   hover:bg-slate-50 hover:shadow-lg hover:shadow-slate-200/50
                   focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary-500)]
                   transition-all duration-200"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
        title={isDark ? "Switch to light mode" : "Switch to dark mode"}
      >
        <AnimatePresence mode="wait" initial={false}>
          {isDark ? (
            <motion.div
              key="sun"
              initial={{ scale: 0, rotate: -90 }}
              animate={{ scale: 1, rotate: 0 }}
              exit={{ scale: 0, rotate: 90 }}
              transition={{ duration: 0.2 }}
            >
              <Sun className="w-5 h-5 text-amber-500" />
            </motion.div>
          ) : (
            <motion.div
              key="moon"
              initial={{ scale: 0, rotate: 90 }}
              animate={{ scale: 1, rotate: 0 }}
              exit={{ scale: 0, rotate: -90 }}
              transition={{ duration: 0.2 }}
            >
              <Moon className="w-5 h-5 text-slate-600" />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Active indicator dot */}
        <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full bg-[var(--primary-500)]" />
      </motion.button>

      {/* Settings Button */}
      {showSettings && (
        <Link href="/settings">
          <motion.button
            className="group flex items-center justify-center
                       h-11 w-11 rounded-xl
                       bg-white shadow-md shadow-slate-200/50
                       border border-slate-100
                       text-slate-700
                       hover:bg-slate-50 hover:shadow-lg hover:shadow-slate-200/50
                       hover:text-[var(--primary-500)]
                       focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary-500)]
                       transition-all duration-200"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            aria-label="Open settings"
            title="Settings"
          >
            <Settings className="w-5 h-5" />
          </motion.button>
        </Link>
      )}
    </div>
  );
}

export default FeatureHeader;
