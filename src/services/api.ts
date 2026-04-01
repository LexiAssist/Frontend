/**
 * API Service Functions
 * Typed functions for calling backend APIs through Next.js API routes
 */

import { http, aiHttp } from './http';
import type { 
  User, 
  Quiz, 
  StudySet, 
  Flashcard,
  AIRequest, 
  AIResponse,
  ApiResponse,
  UserAnalytics 
} from '@/types';

// Auth Services
export const authApi = {
  login: (email: string, password: string) =>
    http.post<AuthResponse>('/api/v1/auth/login', { email, password }),
  
  register: (data: RegisterData) =>
    http.post<AuthResponse>('/api/v1/auth/register', data),
  
  logout: () =>
    http.post<void>('/api/v1/auth/logout', {}),
  
  getMe: () =>
    http.get<User>('/api/v1/users/me'),
  
  refreshToken: (refreshToken: string) =>
    http.post<AuthResponse>('/api/v1/auth/refresh', { refresh_token: refreshToken }),
};

interface RegisterData {
  email: string;
  password: string;
  first_name?: string;
  last_name?: string;
  school?: string;
  department?: string;
  academic_level?: string;
}

interface AuthResponse {
  access_token: string;
  refresh_token: string;
  token_type: string;
  expires_at: string;
  user: User;
}

// Course Services
export const courseApi = {
  getAll: (limit = 20, offset = 0) =>
    http.get<Course[]>(`/api/v1/courses?limit=${limit}&offset=${offset}`),
  
  getById: (id: string) =>
    http.get<Course>(`/api/v1/courses/${id}`),
  
  create: (data: CreateCourseData) =>
    http.post<Course>('/api/v1/courses', data),
  
  update: (id: string, data: Partial<CreateCourseData>) =>
    http.put<Course>(`/api/v1/courses/${id}`, data),
  
  delete: (id: string) =>
    http.delete<void>(`/api/v1/courses/${id}`),
};

interface Course {
  id: string;
  name: string;
  description?: string;
  color?: string;
  semester?: string;
  year?: number;
  created_at: string;
  updated_at: string;
}

interface CreateCourseData {
  name: string;
  description?: string;
  color?: string;
  semester?: string;
  year?: number;
}

// Flashcard Services
export const flashcardApi = {
  getAllDecks: (limit = 20, offset = 0) =>
    http.get<FlashcardDeck[]>(`/api/v1/flashcard-decks?limit=${limit}&offset=${offset}`),
  
  getDeckById: (id: string) =>
    http.get<FlashcardDeck>(`/api/v1/flashcard-decks/${id}`),
  
  createDeck: (data: CreateDeckData) =>
    http.post<FlashcardDeck>('/api/v1/flashcard-decks', data),
  
  generateFromContent: (content: string, userId: string) =>
    aiHttp.post<GenerateFlashcardsResponse>('/api/v1/ai/generate/flashcards', {
      query: content,
      user_id: userId,
    }),
};

interface FlashcardDeck {
  id: string;
  title: string;
  description?: string;
  cards?: Flashcard[];
  created_at: string;
  updated_at: string;
}

interface CreateDeckData {
  title: string;
  description?: string;
  course_id?: string;
}

interface GenerateFlashcardsResponse {
  flashcards: string;
  type: 'flashcards';
}

// Quiz Services
export const quizApi = {
  getAll: (limit = 20, offset = 0) =>
    http.get<Quiz[]>(`/api/v1/quizzes?limit=${limit}&offset=${offset}`),
  
  getById: (id: string) =>
    http.get<Quiz>(`/api/v1/quizzes/${id}`),
  
  create: (data: CreateQuizData) =>
    http.post<Quiz>('/api/v1/quizzes', data),
  
  startAttempt: (quizId: string) =>
    http.post<QuizAttempt>(`/api/v1/quizzes/${quizId}/start`, {}),
  
  submitAnswer: (attemptId: string, data: SubmitAnswerData) =>
    http.post<void>(`/api/v1/quiz-attempts/${attemptId}/answers`, data),
  
  completeAttempt: (attemptId: string) =>
    http.post<QuizResult>(`/api/v1/quiz-attempts/${attemptId}/complete`, {}),
  
  generateFromContent: (content: string, userId: string) =>
    aiHttp.post<GenerateQuizResponse>('/api/v1/ai/generate/quiz', {
      query: content,
      user_id: userId,
    }),
};

interface CreateQuizData {
  title: string;
  description?: string;
  course_id?: string;
  time_limit_minutes?: number;
  difficulty?: 'easy' | 'medium' | 'hard';
  questions?: QuizQuestion[];
}

interface QuizQuestion {
  question_text: string;
  question_type: 'multiple_choice' | 'true_false' | 'short_answer';
  options?: QuizOption[];
  correct_answer?: string;
  explanation?: string;
  points?: number;
}

interface QuizOption {
  text: string;
  is_correct: boolean;
}

interface QuizAttempt {
  id: string;
  quiz_id: string;
  user_id: string;
  started_at: string;
}

interface SubmitAnswerData {
  question_id: string;
  answer: string;
  time_taken_seconds?: number;
}

interface QuizResult {
  attempt_id: string;
  score: number;
  total_points: number;
  correct_answers: number;
  total_questions: number;
}

interface GenerateQuizResponse {
  quiz: string;
  type: 'quiz';
}

// AI Services
export const aiApi = {
  chat: (query: string, userId: string, options?: ChatOptions) =>
    aiHttp.post<ChatResponse>('/api/v1/ai/chat', {
      query,
      user_id: userId,
      context_chunks: options?.contextChunks || [],
      material_id: options?.materialId,
      conversation_id: options?.conversationId,
    }),
  
  generateSummary: (content: string, userId: string, options?: SummaryOptions) =>
    aiHttp.post<SummaryResponse>('/api/v1/ai/generate/summary', {
      query: content,
      user_id: userId,
      context_chunks: options?.contextChunks || [],
      material_id: options?.materialId,
    }),
  
  retrieveContext: (query: string, userId: string, topK = 5) =>
    aiHttp.post<RetrieveResponse>('/api/v1/ai/retrieve', {
      query,
      user_id: userId,
      top_k: topK,
    }),
};

interface ChatOptions {
  contextChunks?: string[];
  materialId?: string;
  conversationId?: string;
}

interface ChatResponse {
  response: string;
  conversation_id: string;
  tokens_used: number;
  model: string;
  sources: string[];
}

interface SummaryOptions {
  contextChunks?: string[];
  materialId?: string;
  length?: 'short' | 'medium' | 'detailed';
}

interface SummaryResponse {
  summary: string;
  type: 'summary';
}

interface RetrieveResponse {
  query: string;
  results: Array<{
    chunk_id: string;
    material_id: string;
    chunk_text: string;
    similarity_score: number;
  }>;
}

// Analytics Services
export const analyticsApi = {
  getStudyStats: () =>
    http.get<StudyStats>('/api/v1/analytics/study-stats'),
  
  getStudyStreak: () =>
    http.get<StudyStreak>('/api/v1/analytics/study-streak'),
  
  getTopicMastery: () =>
    http.get<TopicMastery[]>('/api/v1/analytics/topic-mastery'),
  
  recordStudySession: (data: StudySessionData) =>
    http.post<void>('/api/v1/analytics/study-sessions', data),
};

interface StudyStats {
  current_streak: number;
  total_study_days: number;
  total_study_minutes: number;
  total_quizzes_completed: number;
  total_materials_reviewed: number;
  last_study_date: string;
}

interface StudyStreak {
  current_streak: number;
  longest_streak: number;
  last_study_date: string;
}

interface TopicMastery {
  topic: string;
  mastery_score: number;
  last_reviewed: string;
}

interface StudySessionData {
  session_date: string;
  duration_minutes: number;
  quizzes_completed?: number;
  materials_reviewed?: number;
}

// Material Services
export const materialApi = {
  getAll: (limit = 20, offset = 0) =>
    http.get<Material[]>(`/api/v1/materials?limit=${limit}&offset=${offset}`),
  
  getById: (id: string) =>
    http.get<Material>(`/api/v1/materials/${id}`),
  
  create: (data: CreateMaterialData) =>
    http.post<Material>('/api/v1/materials', data),
  
  getPresignedUrl: (id: string) =>
    http.post<{ upload_url: string }>(`/api/v1/materials/${id}/presign`, {}),
};

interface Material {
  id: string;
  title: string;
  description?: string;
  content_type: string;
  file_size: number;
  processing_status: 'pending' | 'processing' | 'completed' | 'failed';
  course_id?: string;
  created_at: string;
  updated_at: string;
}

interface CreateMaterialData {
  title: string;
  description?: string;
  content_type: string;
  file_size: number;
  course_id?: string;
}
