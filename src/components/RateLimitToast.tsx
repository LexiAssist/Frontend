'use client';

import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { Clock } from 'lucide-react';

interface RateLimitToastProps {
  retryAfter: number;
  toastId: string | number;
}

function RateLimitToastContent({ retryAfter, toastId }: RateLimitToastProps) {
  const [secondsLeft, setSecondsLeft] = useState(retryAfter);

  useEffect(() => {
    if (secondsLeft <= 0) {
      toast.dismiss(toastId);
      return;
    }
    const interval = setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          toast.dismiss(toastId);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [secondsLeft, toastId]);

  const formatTime = (s: number) => {
    const mins = Math.floor(s / 60);
    const secs = s % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const progress = retryAfter > 0 ? ((retryAfter - secondsLeft) / retryAfter) * 100 : 100;

  return (
    <div className="flex items-center gap-3 p-1 min-w-[240px]">
      <Clock className="w-5 h-5 text-amber-500 flex-shrink-0 animate-pulse" />
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-slate-900">Too many requests</p>
        <p className="text-xs text-slate-500">
          Please wait <span className="font-mono font-semibold text-amber-600">{formatTime(secondsLeft)}</span>
        </p>
        <div className="mt-1.5 h-1.5 bg-slate-100 rounded-full overflow-hidden">
          <div
            className="h-full bg-amber-500 rounded-full transition-all duration-1000 ease-linear"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>
    </div>
  );
}

/** Fixed toast ID to prevent duplicate rate-limit toasts */
const RATE_LIMIT_TOAST_ID = 'rate-limit-toast';

/**
 * Show a rate-limit toast with a live countdown timer.
 * Automatically dismisses when the countdown reaches zero.
 * Duplicate calls replace the existing toast.
 */
export function showRateLimitToast(retryAfter: number) {
  if (typeof window === 'undefined') return;

  // Dismiss any existing rate limit toast to avoid stacking
  toast.dismiss(RATE_LIMIT_TOAST_ID);

  toast.custom(
    (id) => <RateLimitToastContent retryAfter={retryAfter} toastId={id} />,
    {
      id: RATE_LIMIT_TOAST_ID,
      duration: Infinity,
      position: 'top-center',
    }
  );
}
