"use client";

import { useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useResetPassword } from "@/hooks/useAuth";
import { Icon } from "@/components/Icon";
import Logo from "@/components/auth/Logo";
import Image from "next/image";

export default function ResetPasswordPage() {
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState("");
  const [isSuccess, setIsSuccess] = useState(false);
  
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get("token");
  
  const resetPasswordMutation = useResetPassword();

  // Password validation
  const validatePassword = (password: string) => {
    if (password.length < 8) {
      return "Password must be at least 8 characters long";
    }
    if (!/[A-Z]/.test(password)) {
      return "Password must contain at least one uppercase letter";
    }
    if (!/[a-z]/.test(password)) {
      return "Password must contain at least one lowercase letter";
    }
    if (!/[0-9]/.test(password)) {
      return "Password must contain at least one number";
    }
    return "";
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    // Validate token
    if (!token) {
      setError("Invalid or expired reset link. Please request a new one.");
      return;
    }

    // Validate password
    const passwordError = validatePassword(newPassword);
    if (passwordError) {
      setError(passwordError);
      return;
    }

    // Check passwords match
    if (newPassword !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    try {
      await resetPasswordMutation.mutateAsync({ token, newPassword });
      setIsSuccess(true);
    } catch (err) {
      // Error is handled by the mutation
    }
  };

  // Redirect if no token after a short delay
  useEffect(() => {
    if (!token) {
      const timer = setTimeout(() => {
        router.push("/forgot-password");
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [token, router]);

  if (!token) {
    return (
      <div className="min-h-screen w-full flex bg-white">
        <div className="w-full flex items-center justify-center px-4 sm:px-6 lg:px-8">
          <div className="w-full max-w-md text-center space-y-4">
            <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto">
              <svg
                className="w-8 h-8 text-red-500"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <h1 className="text-2xl font-semibold text-[#272A28]">
              Invalid Reset Link
            </h1>
            <p className="text-[#555C56]">
              This password reset link is invalid or has expired. Redirecting you to request a new one...
            </p>
            <Link
              href="/forgot-password"
              className="inline-block h-12 px-8 bg-[#377749] hover:bg-[#2d6340] text-white font-semibold rounded-full transition-all duration-200 flex items-center justify-center mx-auto shadow-sm hover:shadow-md"
            >
              Request New Link
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full flex bg-white">
      {/* Left Panel - Image Asset Space */}
      <div className="hidden lg:flex lg:w-1/2 bg-[#ECF3EE] relative overflow-hidden">
        {/* Logo */}
        <div className="absolute top-8 left-8 z-10">
          <Logo />
        </div>

        {/* Image Asset Container - Full coverage */}
        <div className="absolute inset-0">
          <Image
            src="/images/girl on a laptop.svg"
            alt="Girl studying on laptop"
            fill
            className="object-cover"
            priority
          />
        </div>
      </div>

      {/* Right Panel - Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        <div className="w-full max-w-md space-y-6 sm:space-y-8">
          {/* Mobile Logo */}
          <div className="lg:hidden flex justify-center">
            <Logo />
          </div>

          {/* Success State */}
          {isSuccess ? (
            <div className="space-y-6 text-center lg:text-left">
              <div className="flex items-center justify-center lg:justify-start">
                <div className="w-16 h-16 bg-[#377749]/10 rounded-full flex items-center justify-center">
                  <svg
                    className="w-8 h-8 text-[#377749]"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                </div>
              </div>
              <div className="space-y-2">
                <h1 className="text-2xl sm:text-3xl font-semibold tracking-[-0.02em] text-[#272A28]">
                  Password reset successful!
                </h1>
                <p className="text-[#555C56]">
                  Your password has been reset successfully. You can now log in with your new password.
                </p>
              </div>
              <Link
                href="/login"
                className="w-full h-12 bg-[#377749] hover:bg-[#2d6340] active:bg-[#265538] text-white font-semibold rounded-full transition-all duration-200 flex items-center justify-center shadow-sm hover:shadow-md active:scale-[0.98]"
              >
                Go to Login
              </Link>
            </div>
          ) : (
            <>
              {/* Header */}
              <div className="space-y-2 text-center lg:text-left">
                <div className="flex items-center justify-center lg:justify-start mb-4">
                  <div className="w-12 h-12 bg-[#377749]/10 rounded-full flex items-center justify-center">
                    <svg
                      className="w-6 h-6 text-[#377749]"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                      />
                    </svg>
                  </div>
                </div>
                <h1 className="text-2xl sm:text-3xl font-semibold tracking-[-0.02em] text-[#272A28]">
                  Create new password
                </h1>
                <p className="text-[#555C56]">
                  Enter your new password below. Make sure it&apos;s strong and unique.
                </p>
              </div>

              {/* Form */}
              <form onSubmit={handleSubmit} className="space-y-5">
                {/* New Password Input */}
                <div className="space-y-2">
                  <label
                    htmlFor="newPassword"
                    className="block text-sm font-medium text-[#101928]"
                  >
                    New Password
                  </label>
                  <div className="relative">
                    <input
                      id="newPassword"
                      type={showPassword ? "text" : "password"}
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="Enter new password"
                      className="w-full h-12 px-4 pr-12 rounded-full border border-[#D0D5DD] bg-white text-base text-[#101928] placeholder:text-[#98A2B3] focus:outline-none focus:ring-2 focus:ring-[#377749]/20 focus:border-[#377749] transition-all duration-200 md:text-sm"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 p-1 text-[#667185] hover:text-[#101928] transition-colors"
                      aria-label={showPassword ? "Hide password" : "Show password"}
                    >
                      {showPassword ? <Icon name="eye-off" size={18} /> : <Icon name="eye" size={18} />}
                    </button>
                  </div>
                  {/* Password Requirements */}
                  <div className="text-xs text-[#555C56] space-y-1">
                    <p>Password must:</p>
                    <ul className="space-y-1 ml-4">
                      <li className={newPassword.length >= 8 ? "text-[#377749]" : ""}>
                        • Be at least 8 characters
                      </li>
                      <li className={/[A-Z]/.test(newPassword) ? "text-[#377749]" : ""}>
                        • Include an uppercase letter
                      </li>
                      <li className={/[a-z]/.test(newPassword) ? "text-[#377749]" : ""}>
                        • Include a lowercase letter
                      </li>
                      <li className={/[0-9]/.test(newPassword) ? "text-[#377749]" : ""}>
                        • Include a number
                      </li>
                    </ul>
                  </div>
                </div>

                {/* Confirm Password Input */}
                <div className="space-y-2">
                  <label
                    htmlFor="confirmPassword"
                    className="block text-sm font-medium text-[#101928]"
                  >
                    Confirm Password
                  </label>
                  <div className="relative">
                    <input
                      id="confirmPassword"
                      type={showConfirmPassword ? "text" : "password"}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Confirm new password"
                      className="w-full h-12 px-4 pr-12 rounded-full border border-[#D0D5DD] bg-white text-base text-[#101928] placeholder:text-[#98A2B3] focus:outline-none focus:ring-2 focus:ring-[#377749]/20 focus:border-[#377749] transition-all duration-200 md:text-sm"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 p-1 text-[#667185] hover:text-[#101928] transition-colors"
                      aria-label={showConfirmPassword ? "Hide password" : "Show password"}
                    >
                      {showConfirmPassword ? <Icon name="eye-off" size={18} /> : <Icon name="eye" size={18} />}
                    </button>
                  </div>
                  {confirmPassword && newPassword !== confirmPassword && (
                    <p className="text-sm text-red-600">Passwords do not match</p>
                  )}
                </div>

                {/* Error Message */}
                {error && (
                  <div className="text-sm text-red-600 bg-red-50 px-4 py-3 rounded-xl">
                    {error}
                  </div>
                )}

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={resetPasswordMutation.isPending}
                  className="w-full h-12 bg-[#377749] hover:bg-[#2d6340] active:bg-[#265538] text-white font-semibold rounded-full transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center shadow-sm hover:shadow-md active:scale-[0.98]"
                >
                  {resetPasswordMutation.isPending ? (
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    "Reset Password"
                  )}
                </button>
              </form>

              {/* Back to Login */}
              <div className="flex items-center justify-center gap-2 text-sm pt-4 border-t border-[#E5E7EB]">
                <span className="text-[#555C56]">Remember your password?</span>
                <Link
                  href="/login"
                  className="font-semibold text-[#3C8350] hover:text-[#377749] transition-colors"
                >
                  Sign in
                </Link>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
