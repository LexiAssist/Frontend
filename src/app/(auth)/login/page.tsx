/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import { useState } from "react";
import Link from "next/link";
import { useAuth } from "@/hooks/useAuth";
import { Icon } from "@/components/Icon";
import Logo from "@/components/auth/Logo";
import Image from "next/image";

// Social Login Button Component - improved consistency
function SocialLoginButton({
  provider,
  label
}: {
  provider: "google" | "link";
  label: string;
}) {
  const iconSrc = provider === "google"
    ? "/images/social/google.png"
    : "/images/social/linkedin.png";

  return (
    <button
      type="button"
      className="flex items-center justify-center gap-3 h-12 px-4 sm:px-6 bg-white border border-[#D0D5DD] rounded-full hover:bg-gray-50 hover:border-[#377749]/30 hover:shadow-sm active:scale-[0.98] transition-all duration-200 text-sm font-medium text-[#374151]"
    >
      <div className="relative w-5 h-5 flex-shrink-0">
        <Image
          src={iconSrc}
          alt={`${label} icon`}
          fill
          className="object-contain"
        />
      </div>
      <span className="whitespace-nowrap hidden sm:inline">{label}</span>
      <span className="whitespace-nowrap sm:hidden">{provider === 'google' ? 'Google' : 'LinkedIn'}</span>
    </button>
  );
}

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const { login } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      await login({ email, password });
    } catch (err) {
      setError("Invalid email or password. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

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
        <div className="w-full max-w-[480px] space-y-6 sm:space-y-8">
          {/* Mobile Logo */}
          <div className="lg:hidden flex justify-center">
            <Logo />
          </div>

          {/* Header */}
          <div className="space-y-2 text-center lg:text-left">
            <h1 className="text-2xl sm:text-3xl font-semibold tracking-[-0.02em] text-[#272A28]">
              Welcome Back
            </h1>
            <p className="text-[#555C56]">
              Log into your account
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Email Input */}
            <div className="space-y-2">
              <label
                htmlFor="email"
                className="block text-sm font-medium text-[#101928]"
              >
                Email
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                className="w-full h-12 px-4 rounded-full border border-[#D0D5DD] bg-white text-sm text-[#101928] placeholder:text-[#98A2B3] focus:outline-none focus:ring-2 focus:ring-[#377749]/20 focus:border-[#377749] transition-all duration-200"
                required
              />
            </div>

            {/* Password Input */}
            <div className="space-y-2">
              <label
                htmlFor="password"
                className="block text-sm font-medium text-[#101928]"
              >
                Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  className="w-full h-12 px-4 pr-12 rounded-full border border-[#D0D5DD] bg-white text-sm text-[#101928] placeholder:text-[#98A2B3] focus:outline-none focus:ring-2 focus:ring-[#377749]/20 focus:border-[#377749] transition-all duration-200"
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
            </div>

            {/* Error Message */}
            {error && (
              <div className="text-sm text-red-600 bg-red-50 px-4 py-3 rounded-xl">
                {error}
              </div>
            )}

            {/* Login Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full h-12 bg-[#377749] hover:bg-[#2d6340] active:bg-[#265538] text-white font-semibold rounded-full transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center shadow-sm hover:shadow-md active:scale-[0.98]"
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                "Login"
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-[#E5E7EB]" />
            </div>
            <div className="relative flex justify-center">
              <span className="px-4 bg-white text-sm text-[#5D655F]">or</span>
            </div>
          </div>

          {/* Social Login Buttons */}
          <div className="grid grid-cols-2 gap-3 sm:gap-4">
            <SocialLoginButton provider="google" label="Google" />
            <SocialLoginButton provider="linkedin" label="LinkedIn" />
          </div>

          {/* Register Link */}
          <div className="flex items-center justify-center gap-2 text-sm">
            <span className="text-[#555C56]">Don&apos;t have an account?</span>
            <Link
              href="/register"
              className="font-semibold text-[#3C8350] hover:text-[#377749] transition-colors"
            >
              Register
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
