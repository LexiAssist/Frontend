// User Types
export interface User {
  id: string;
  email: string;
  name: string;
  avatar?: string;
  role: 'student' | 'instructor' | 'admin';
  school?: string;
  department?: string;
  level?: string;
  createdAt: string;
  updatedAt: string;
}

// Auth Types
export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterCredentials {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
  school?: string;
  department?: string;
  level?: string;
}

export interface AuthResponse {
  user: User;
  message?: string;
}

// Study Material Types
export interface StudyMaterial {
  id: string;
  title: string;
  content: string;
  subject: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

// Quiz Types
export interface Quiz {
  id: string;
  title: string;
  description: string;
  subject: string;
  difficulty: 'easy' | 'medium' | 'hard';
  timeLimit?: number; // in minutes
  questions: Question[];
  sourceMaterial?: string;
  createdBy: string;
  createdAt: string;
}

export interface Question {
  id: string;
  type: 'multiple_choice' | 'true_false' | 'short_answer';
  question: string;
  options?: string[];
  correctAnswer: string | string[] | boolean;
  explanation?: string;
  points: number;
}

export interface QuizAttempt {
  id: string;
  quizId: string;
  userId: string;
  score: number;
  maxScore: number;
  answers: Record<string, string | string[]>;
  timeTaken: number; // in seconds
  completedAt: string;
}

// Flashcard Types
export interface Flashcard {
  id: string;
  front: string;
  back: string;
  category?: string;
  difficulty?: 'easy' | 'medium' | 'hard';
  createdAt: string;
}

export interface StudySet {
  id: string;
  title: string;
  description: string;
  cards: Flashcard[];
  subject?: string;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

// AI Types
export interface AIRequest {
  prompt: string;
  context?: string;
  type: 'explain' | 'summarize' | 'quiz' | 'chat' | 'rewrite' | 'flashcards';
  options?: {
    summaryLength?: 'short' | 'medium' | 'detailed';
    rewriteMode?: 'grammar' | 'academic' | 'simple' | 'creative';
    questionCount?: number;
    difficulty?: 'easy' | 'medium' | 'hard';
  };
}

export interface AIResponse {
  content: string;
  type: string;
  metadata?: Record<string, unknown>;
}

// Text to Speech Types
export interface TTSRequest {
  text: string;
  voice?: string;
  speed?: number;
  pitch?: number;
}

export interface TTSItem {
  id: string;
  text: string;
  audioUrl?: string;
  createdAt: string;
}

// Summary Types
export interface Summary {
  id: string;
  title: string;
  originalText: string;
  summary: string;
  originalLength: number;
  summaryLength: number;
  lengthType: 'short' | 'medium' | 'detailed';
  createdAt: string;
}

// Chat Types
export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;

}

export interface ChatConversation {
  id: string;
  title: string;
  messages: ChatMessage[];
  userId: string;
  createdAt: string;
  updatedAt: string;
}

// Analytics Types
export interface UserAnalytics {
  totalStudyTime: number; // in minutes
  quizzesTaken: number;
  averageScore: number;
  streakDays: number;
  subjectsStudied: string[];
  weeklyProgress: WeeklyProgress[];
  flashcardsReviewed: number;
  summariesCreated: number;
}

export interface WeeklyProgress {
  date: string;
  studyTime: number;
  quizzesCompleted: number;
  averageScore: number;
  flashcardsReviewed: number;
}

// API Response Types
export interface ApiResponse<T> {
  data: T;
  message?: string;
  success: boolean;
}

export interface ApiError {
  message: string;
  code?: string;
  errors?: Record<string, string[]>;
}

// UI Types
export interface Toast {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  message: string;
  duration?: number;
}

// Navigation Types
export interface NavItem {
  name: string;
  href: string;
  icon: string;
  submenu?: NavItem[];
}
