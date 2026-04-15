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
  provider: "google" | "linkedin"; 
  label: string;
}) {
  const iconSrc = provider === "google" 
    ? "/images/google-icon-logo-svgrepo-com.svg" 
    : "/images/linkedin-svgrepo-com.svg";

  return (
    <button
      type="button"
      className="flex items-center justify-center gap-3 h-12 px-4 sm:px-6 bg-white border border-[#D0D5DD] rounded-full hover:bg-gray-50 hover:border-[#377749]/30 hover:shadow-sm active:scale-[0.98] transition-all duration-200 text-sm font-medium text-[#374151]"
    >
      <div className="relative w-5 h-5 shrink-0">
        <Image 
          src={iconSrc} 
          alt={`${label} icon`} 
          width={20}
          height={20}
          className="object-contain"
        />
      </div>
      <span className="whitespace-nowrap hidden sm:inline">{label}</span>
      <span className="whitespace-nowrap sm:hidden">{provider === 'google' ? 'Google' : 'LinkedIn'}</span>
    </button>
  );
}

export default function RegisterPage() {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  
  const { register } = useAuth();

  // Client-side validation (Requirement 7.6)
  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validatePassword = (password: string): boolean => {
    return password.length >= 8;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setFieldErrors({});
    
    // Client-side validation (Requirement 7.6)
    const errors: Record<string, string> = {};
    
    if (!validateEmail(email)) {
      errors.email = "Please enter a valid email address";
    }
    
    if (!validatePassword(password)) {
      errors.password = "Password must be at least 8 characters long";
    }
    
    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      return;
    }
    
    setIsLoading(true);

    try {
      await register({ first_name: firstName, last_name: lastName, email, password });
    } catch (err: any) {
      // Handle specific error codes (Requirements 7.4, 7.5)
      const errorMessage = err?.message || "";
      
      // HTTP 409 - Email already exists (Requirement 7.4)
      if (errorMessage.includes("409") || errorMessage.toLowerCase().includes("already exists")) {
        setError("An account with this email already exists");
      }
      // HTTP 400 - Validation errors (Requirement 7.5)
      else if (errorMessage.includes("400") || errorMessage.toLowerCase().includes("validation")) {
        // Try to parse field-specific errors if available
        try {
          const parsedError = JSON.parse(errorMessage);
          if (parsedError.errors) {
            setFieldErrors(parsedError.errors);
          } else {
            setError(errorMessage);
          }
        } catch {
          setError(errorMessage);
        }
      }
      else {
        setError(errorMessage || "Registration failed. Please try again.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex bg-white">
      {/* Left Panel - Image Asset Space */}
      <div className="hidden lg:flex lg:w-1/2 bg-[#ECF3EE] relative items-center justify-center p-8">
        {/* Logo */}
        <div className="absolute top-8 left-8 z-10">
          <Logo />
        </div>
        
        {/* Image Asset Container */}
        <div className="absolute inset-0">
          <Image
            src="/images/Girl out the window.svg"
            alt="Girl looking out window"
            fill
            className="object-cover"
            priority
          />
        </div>
      </div>

      {/* Right Panel - Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        <div className="w-full max-w-120 space-y-6 sm:space-y-8">
          {/* Mobile Logo */}
          <div className="lg:hidden flex justify-center">
            <Logo />
          </div>

          {/* Header */}
          <div className="space-y-2 text-center lg:text-left">
            <h1 className="text-2xl sm:text-3xl font-semibold tracking-[-0.02em] text-[#272A28]">
              Welcome to LexiAssist!
            </h1>
            <p className="text-[#555C56]">
              Register your account
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* First Name Input */}
            <div className="space-y-2">
              <label 
                htmlFor="firstName" 
                className="block text-sm font-medium text-[#101928]"
              >
                First Name
              </label>
              <input
                id="firstName"
                type="text"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                placeholder="Enter your first name"
                className="w-full h-12 px-4 rounded-full border border-[#D0D5DD] bg-white text-base text-[#101928] placeholder:text-[#98A2B3] focus:outline-none focus:ring-2 focus:ring-[#377749]/20 focus:border-[#377749] transition-all duration-200 md:text-sm"
                required
              />
            </div>

            {/* Last Name Input */}
            <div className="space-y-2">
              <label 
                htmlFor="lastName" 
                className="block text-sm font-medium text-[#101928]"
              >
                Last Name
              </label>
              <input
                id="lastName"
                type="text"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                placeholder="Enter your last name"
                className="w-full h-12 px-4 rounded-full border border-[#D0D5DD] bg-white text-base text-[#101928] placeholder:text-[#98A2B3] focus:outline-none focus:ring-2 focus:ring-[#377749]/20 focus:border-[#377749] transition-all duration-200 md:text-sm"
                required
              />
            </div>

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
                onChange={(e) => {
                  setEmail(e.target.value);
                  // Clear field error on change
                  if (fieldErrors.email) {
                    setFieldErrors(prev => ({ ...prev, email: "" }));
                  }
                }}
                placeholder="Enter your email"
                className={`w-full h-12 px-4 rounded-full border ${
                  fieldErrors.email ? "border-red-500" : "border-[#D0D5DD]"
                } bg-white text-base text-[#101928] placeholder:text-[#98A2B3] focus:outline-none focus:ring-2 ${
                  fieldErrors.email ? "focus:ring-red-500/20 focus:border-red-500" : "focus:ring-[#377749]/20 focus:border-[#377749]"
                } transition-all duration-200 md:text-sm`}
                required
              />
              {fieldErrors.email && (
                <p className="text-sm text-red-600">{fieldErrors.email}</p>
              )}
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
                  onChange={(e) => {
                    setPassword(e.target.value);
                    // Clear field error on change
                    if (fieldErrors.password) {
                      setFieldErrors(prev => ({ ...prev, password: "" }));
                    }
                  }}
                  placeholder="Create a password (min 8 characters)"
                  className={`w-full h-12 px-4 pr-12 rounded-full border ${
                    fieldErrors.password ? "border-red-500" : "border-[#D0D5DD]"
                  } bg-white text-base text-[#101928] placeholder:text-[#98A2B3] focus:outline-none focus:ring-2 ${
                    fieldErrors.password ? "focus:ring-red-500/20 focus:border-red-500" : "focus:ring-[#377749]/20 focus:border-[#377749]"
                  } transition-all duration-200 md:text-sm`}
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
              {fieldErrors.password && (
                <p className="text-sm text-red-600">{fieldErrors.password}</p>
              )}
              {!fieldErrors.password && password.length > 0 && password.length < 8 && (
                <p className="text-sm text-amber-600">Password must be at least 8 characters</p>
              )}
            </div>

            {/* Error Message */}
            {error && (
              <div className="text-sm text-red-600 bg-red-50 px-4 py-3 rounded-xl">
                {error}
              </div>
            )}

            {/* Sign Up Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full h-12 bg-[#377749] hover:bg-[#2d6340] active:bg-[#265538] text-white font-semibold rounded-full transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center shadow-sm hover:shadow-md active:scale-[0.98]"
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                "Sign Up"
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

          {/* Login Link */}
          <div className="flex items-center justify-center gap-2 text-sm">
            <span className="text-[#555C56]">Already have an account?</span>
            <Link 
              href="/login" 
              className="font-semibold text-[#3C8350] hover:text-[#377749] transition-colors"
            >
              Sign in
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
