/**
 * API Service Functions
 * Typed functions for calling backend APIs
 * Uses native fetch (Axios causes Network Errors in Next.js)
 */

import { useAuthStore } from '@/store/authStore';
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

// Helper to get auth headers
const getAuthHeaders = (token?: string | null): HeadersInit => {
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
  };
  const authToken = token ?? useAuthStore.getState().accessToken;
  if (authToken) {
    headers['Authorization'] = `Bearer ${authToken}`;
  }
  return headers;
};

// Helper for fetch requests with auto token refresh
const fetchWithAuth = async <T>(
  url: string, 
  options?: RequestInit,
  retry = true
): Promise<T> => {
  const response = await fetch(url, {
    ...options,
    headers: {
      ...getAuthHeaders(),
      ...(options?.headers || {}),
    },
  });

  // Handle 401 - try to refresh token and retry once
  if (response.status === 401 && retry) {
    const { refreshAccessToken, logout } = useAuthStore.getState();
    
    try {
      const refreshed = await refreshAccessToken();
      
      if (refreshed) {
        // Retry the original request with new token
        const retryResponse = await fetch(url, {
          ...options,
          headers: {
            ...getAuthHeaders(),
            ...(options?.headers || {}),
          },
        });
        
        if (!retryResponse.ok) {
          const errorData = await retryResponse.json().catch(() => ({}));
          throw new Error(errorData.message || `Request failed: ${retryResponse.status}`);
        }
        
        return retryResponse.json();
      } else {
        // Refresh failed, logout
        logout();
        throw new Error('Session expired. Please log in again.');
      }
    } catch (refreshError) {
      logout();
      throw new Error('Session expired. Please log in again.');
    }
  }

  if (!response.ok) {
    const errorText = await response.text().catch(() => 'Unknown error');
    let errorMessage = `Request failed: ${response.status}`;
    try {
      const errorData = JSON.parse(errorText);
      errorMessage = errorData.message || errorData.error || errorData.detail || errorText;
    } catch {
      errorMessage = errorText || errorMessage;
    }
    throw new Error(errorMessage);
  }

  return response.json();
};

// Helper for fetch requests - calls /api/v1/* which is proxied to backend
const fetchApi = async <T>(path: string, options?: RequestInit): Promise<T> => {
  const url = `/api/v1${path}`;
  return fetchWithAuth<T>(url, options);
};

// Helper for FormData requests (no Content-Type header, browser sets it with boundary)
const fetchFormData = async <T>(path: string, formData: FormData, retry = true): Promise<T> => {
  const url = `/api/v1${path}`;
  const { accessToken, refreshAccessToken, logout } = useAuthStore.getState();
  
  const headers: HeadersInit = {};
  if (accessToken) {
    headers['Authorization'] = `Bearer ${accessToken}`;
  }
  
  // Use AbortController with 5-minute timeout for long-running AI operations
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 5 * 60 * 1000);
  
  const response = await fetch(url, {
    method: 'POST',
    headers,
    body: formData,
    signal: controller.signal,
  });
  
  clearTimeout(timeoutId);

  // Handle 401 - try to refresh token
  if (response.status === 401 && retry) {
    try {
      const refreshed = await refreshAccessToken();
      
      if (refreshed) {
        const { accessToken: newToken } = useAuthStore.getState();
        const newHeaders: HeadersInit = {};
        if (newToken) {
          newHeaders['Authorization'] = `Bearer ${newToken}`;
        }
        
        // Create new FormData (old one may be consumed)
        const newFormData = new FormData();
        for (const [key, value] of formData.entries()) {
          newFormData.append(key, value);
        }
        
        // Use AbortController for retry as well
        const retryController = new AbortController();
        const retryTimeoutId = setTimeout(() => retryController.abort(), 5 * 60 * 1000);
        
        const retryResponse = await fetch(url, {
          method: 'POST',
          headers: newHeaders,
          body: newFormData,
          signal: retryController.signal,
        });
        
        clearTimeout(retryTimeoutId);
        
        if (!retryResponse.ok) {
          const errorData = await retryResponse.json().catch(() => ({}));
          throw new Error(errorData.message || `Request failed: ${retryResponse.status}`);
        }
        
        return retryResponse.json();
      } else {
        logout();
        throw new Error('Session expired. Please log in again.');
      }
    } catch (refreshError) {
      logout();
      throw new Error('Session expired. Please log in again.');
    }
  }

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || `Request failed: ${response.status}`);
  }

  return response.json();
};

// Auth Services
export const authApi = {
  login: async (email: string, password: string): Promise<LoginResponse> => {
    const response = await fetch('/api/v1/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.message || 'Login failed');
    }
    const data = await response.json();
    return data.data || data;
  },
  
  register: async (data: RegisterData): Promise<User> => {
    const response = await fetch('/api/v1/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.message || 'Registration failed');
    }
    const result = await response.json();
    return result.data || result;
  },
  
  logout: () =>
    fetchApi<void>('/auth/logout', { method: 'POST' }),
  
  getMe: () =>
    fetchApi<User>('/users/me'),
  
  refreshToken: async (refreshToken: string): Promise<LoginResponse> => {
    const response = await fetch('/api/v1/auth/refresh', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refresh_token: refreshToken }),
    });
    if (!response.ok) {
      throw new Error('Token refresh failed');
    }
    const data = await response.json();
    return data.data || data;
  },
  
  verifyEmail: (userId: string, code: string) =>
    fetchApi<void>(`/auth/verify-email?user_id=${userId}`, { 
      method: 'POST', 
      body: JSON.stringify({ code }) 
    }),
  
  resendVerification: (userId: string) =>
    fetchApi<void>('/auth/resend-verification', { 
      method: 'POST',
      headers: { 'X-User-ID': userId }
    }),
  
  forgotPassword: (email: string) =>
    fetchApi<void>('/auth/forgot-password', { 
      method: 'POST', 
      body: JSON.stringify({ email }) 
    }),
  
  resetPassword: (token: string, newPassword: string) =>
    fetchApi<void>('/auth/reset-password', { 
      method: 'POST', 
      body: JSON.stringify({ token, new_password: newPassword }) 
    }),
  
  changePassword: (currentPassword: string, newPassword: string) =>
    fetchApi<void>('/users/me/change-password', { 
      method: 'POST', 
      body: JSON.stringify({ current_password: currentPassword, new_password: newPassword }) 
    }),
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

interface LoginResponse {
  access_token: string;
  refresh_token: string;
  token_type: string;
  expires_at: string;
  user: User;
}

// Course Services
export const courseApi = {
  getAll: (limit = 20, offset = 0) =>
    fetchApi<Course[]>(`/courses?limit=${limit}&offset=${offset}`),
  
  getById: (id: string) =>
    fetchApi<Course>(`/courses/${id}`),
  
  create: (data: CreateCourseData) =>
    fetchApi<Course>('/courses', { method: 'POST', body: JSON.stringify(data) }),
  
  update: (id: string, data: Partial<CreateCourseData>) =>
    fetchApi<Course>(`/courses/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  
  delete: (id: string) =>
    fetchApi<void>(`/courses/${id}`, { method: 'DELETE' }),
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
    fetchApi<FlashcardDeck[]>(`/flashcard-decks?limit=${limit}&offset=${offset}`),
  
  getDeckById: (id: string) =>
    fetchApi<FlashcardDeck>(`/flashcard-decks/${id}`),
  
  createDeck: (data: CreateDeckData) =>
    fetchApi<FlashcardDeck>('/flashcard-decks', { method: 'POST', body: JSON.stringify(data) }),
  
  generateFromContent: async (content: string, userId: string): Promise<GenerateFlashcardsResponse> => {
    const blob = new Blob([content], { type: 'text/plain' });
    const file = new File([blob], 'flashcards.txt', { type: 'text/plain' });
    
    const formData = new FormData();
    formData.append('file', file);
    formData.append('user_id', userId);
    formData.append('num_cards', '10');
    
    return fetchFormData('/study/flashcards', formData);
  },
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
    fetchApi<Quiz[]>(`/quizzes?limit=${limit}&offset=${offset}`),
  
  getById: (id: string) =>
    fetchApi<Quiz>(`/quizzes/${id}`),
  
  create: (data: CreateQuizData) =>
    fetchApi<Quiz>('/quizzes', { method: 'POST', body: JSON.stringify(data) }),
  
  startAttempt: (quizId: string) =>
    fetchApi<QuizAttempt>(`/quizzes/${quizId}/start`, { method: 'POST' }),
  
  submitAnswer: (attemptId: string, data: SubmitAnswerData) =>
    fetchApi<void>(`/quiz-attempts/${attemptId}/answers`, { method: 'POST', body: JSON.stringify(data) }),
  
  completeAttempt: (attemptId: string) =>
    fetchApi<QuizResult>(`/quiz-attempts/${attemptId}/complete`, { method: 'POST' }),
  
  generateFromContent: (content: string, userId: string) =>
    fetchApi<GenerateQuizResponse>('/ai/generate/quiz', { 
      method: 'POST', 
      body: JSON.stringify({ query: content, user_id: userId }) 
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
    fetchApi<ChatResponse>('/ai/chat', {
      method: 'POST',
      body: JSON.stringify({
        query,
        user_id: userId,
        context_chunks: options?.contextChunks || [],
        material_id: options?.materialId,
        conversation_id: options?.conversationId,
      }),
    }),
  
  generateSummary: (content: string, userId: string, options?: SummaryOptions) =>
    fetchApi<SummaryResponse>('/ai/generate/summary', {
      method: 'POST',
      body: JSON.stringify({
        query: content,
        user_id: userId,
        context_chunks: options?.contextChunks || [],
        material_id: options?.materialId,
      }),
    }),
  
  retrieveContext: (query: string, userId: string, topK = 5) =>
    fetchApi<RetrieveResponse>('/ai/retrieve', {
      method: 'POST',
      body: JSON.stringify({ query, user_id: userId, top_k: topK }),
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

// Audio Services
export const audioApi = {
  textToSpeech: async (text: string, language: string = 'en', slow: boolean = false): Promise<Blob> => {
    const formData = new FormData();
    formData.append('text', text);
    formData.append('language', language);
    formData.append('slow', slow ? 'true' : 'false');
    
    const { accessToken } = useAuthStore.getState();
    
    const headers: HeadersInit = {};
    if (accessToken) {
      headers['Authorization'] = `Bearer ${accessToken}`;
    }
    
    const response = await fetch('/api/v1/ai/text-to-speech', {
      method: 'POST',
      headers,
      body: formData,
    });
    
    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'TTS failed' }));
      throw new Error(error.details || error.error || 'TTS failed');
    }
    
    return response.blob();
  },
  
  speechToText: async (audioFile: File, language: string = 'en-US') => {
    const formData = new FormData();
    formData.append('audio', audioFile);
    formData.append('language', language);
    
    return fetchFormData<SpeechToTextResponse>('/ai/speech-to-text', formData);
  },
  
  getLanguages: () =>
    fetchApi<LanguagesResponse>('/ai/languages'),
};

interface SpeechToTextResponse {
  text: string;
  confidence: number;
  language: string;
  original_format: string;
}

interface LanguagesResponse {
  supported_languages: Record<string, string>;
}

// Analytics Services
export const analyticsApi = {
  getStudyStats: () =>
    fetchApi<StudyStats>('/analytics/study-stats'),
  
  getStudyStreak: () =>
    fetchApi<StudyStreak>('/analytics/study-streak'),
  
  getTopicMastery: () =>
    fetchApi<TopicMastery[]>('/analytics/topic-mastery'),
  
  recordStudySession: (data: StudySessionData) =>
    fetchApi<void>('/analytics/study-sessions', { method: 'POST', body: JSON.stringify(data) }),
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

// Session Services
export const sessionApi = {
  getSessions: () =>
    fetchApi<Session[]>('/users/me/sessions'),
  
  revokeSession: (sessionId: string) =>
    fetchApi<void>(`/users/me/sessions/${sessionId}`, { method: 'DELETE' }),
  
  logoutAll: () =>
    fetchApi<void>('/auth/logout-all', { method: 'POST' }),
};

export interface Session {
  id: string;
  user_id: string;
  ip_address: string;
  user_agent: string;
  created_at: string;
  last_active_at: string;
  is_current: boolean;
}

// Material Services - Simplified to use direct upload
export const materialApi = {
  getAll: (limit = 20, offset = 0) =>
    fetchApi<Material[]>(`/materials?limit=${limit}&offset=${offset}`),
  
  getById: (id: string) =>
    fetchApi<Material>(`/materials/${id}`),
  
  // Upload file using presigned URL flow
  upload: async (file: File, courseId?: string): Promise<Material> => {
    // Step 1: Create material metadata
    const createRes = await fetchApi<{ data: Material }>('/materials', {
      method: 'POST',
      body: JSON.stringify({
        title: file.name,
        file_size: file.size,
        mime_type: file.type || 'application/octet-stream',
        course_id: courseId,
      }),
    });
    
    const material = createRes.data;

    // Step 2: Get presigned URL
    const presignRes = await fetchApi<{ data: { upload_url: string } }>(`/materials/${material.id}/presign`, {
      method: 'POST',
    });

    // Step 3: Upload file to MinIO
    const uploadResponse = await fetch(presignRes.data.upload_url, {
      method: 'PUT',
      body: file,
      headers: {
        'Content-Type': file.type || 'application/octet-stream',
      },
    });

    if (!uploadResponse.ok) {
      throw new Error('Failed to upload file to storage');
    }

    return material;
  },
  
  create: (data: CreateMaterialData) =>
    fetchApi<Material>('/materials', { method: 'POST', body: JSON.stringify(data) }),
  
  delete: (id: string) =>
    fetchApi<void>(`/materials?id=${id}`, { method: 'DELETE' }),
  
  getPresignedUrl: (id: string) =>
    fetchApi<{ upload_url: string }>(`/materials/${id}/presign`, { method: 'POST' }),
};

interface Material {
  id: string;
  title: string;
  description?: string;
  content_type: string;
  file_size: number;
  file_url?: string;
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

// Reading Assistant
export interface ReadingStreamEvent {
  type: 'status' | 'summary_token' | 'vocab' | 'progress' | 'complete' | 'error';
  data: any;
}

export const readingApi = {
  analyse: async (file: File, userId: string, summaryType = 'concise', voice = 'Zephyr', speakerLabel = 'Reader', temperature = 1.0): Promise<ReadingAnalysisResponse> => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('user_id', userId);
    formData.append('summary_type', summaryType);
    formData.append('voice', voice);
    formData.append('speaker_label', speakerLabel);
    formData.append('temperature', temperature.toString());
    
    return fetchFormData('/reading/analyse', formData);
  },
  
  // SSE Streaming version for real-time progress
  analyseStream: async (
    file: File,
    userId: string,
    onEvent: (event: ReadingStreamEvent) => void,
    onError: (error: Error) => void,
    summaryType = 'concise',
    voice = 'Zephyr'
  ): Promise<void> => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('user_id', userId);
    formData.append('summary_type', summaryType);
    formData.append('voice', voice);
    
    const { accessToken } = useAuthStore.getState();
    
    console.log('[analyseStream] Access token:', accessToken ? 'Present' : 'Missing');
    
    try {
      const headers: HeadersInit = {};
      if (accessToken) {
        headers['Authorization'] = `Bearer ${accessToken}`;
      }
      
      console.log('[analyseStream] Request headers:', headers);
      
      const response = await fetch('/api/v1/reading/analyse/stream', {
        method: 'POST',
        headers,
        body: formData,
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      
      if (!reader) {
        throw new Error('No response body');
      }
      
      let buffer = '';
      
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        
        buffer += decoder.decode(value, { stream: true });
        
        // Parse SSE events from buffer
        const events = parseSSEEvents(buffer);
        buffer = events.remainder;
        
        // Process each parsed event
        for (const event of events.parsed) {
          onEvent(event);
          
          // Stop reading on complete or error
          if (event.type === 'complete' || event.type === 'error') {
            return;
          }
        }
      }
    } catch (error) {
      onError(error as Error);
    }
  },
  
  getSession: (sessionId: string, userId: string) =>
    fetchApi<ReadingSessionDetail>(`/reading/${sessionId}?user_id=${userId}`),
};

// SSE Event Parser
function parseSSEEvents(buffer: string): { parsed: ReadingStreamEvent[]; remainder: string } {
  const events: ReadingStreamEvent[] = [];
  const lines = buffer.split('\n');
  let currentEvent: Partial<ReadingStreamEvent> = {};
  let i = 0;
  
  for (; i < lines.length; i++) {
    const line = lines[i];
    
    if (line.startsWith('event: ')) {
      currentEvent.type = line.slice(7) as ReadingStreamEvent['type'];
    } else if (line.startsWith('data: ')) {
      try {
        currentEvent.data = JSON.parse(line.slice(6));
      } catch {
        currentEvent.data = line.slice(6);
      }
    } else if (line === '' && currentEvent.type) {
      events.push(currentEvent as ReadingStreamEvent);
      currentEvent = {};
    }
  }
  
  // Keep incomplete lines in buffer
  const remainder = lines.slice(i).join('\n');
  return { parsed: events, remainder };
}

export interface VocabTerm {
  term: string;
  definition: string;
  context_snippet: string;
}

export interface ReadingAnalysisResponse {
  session_id: string;
  user_id: string;
  summary_type: string;
  summary: string;
  vocab_terms: VocabTerm[];
  tts_audio_b64: string;
  audio_mime_type: string;
  voice: string;
}

export interface ReadingSessionDetail {
  session_id: string;
  user_id: string;
  filename?: string;
  created_at: string;
  summary_type: string;
  summary: string;
  vocab_terms: VocabTerm[];
  tts_audio_b64: string;
}

// Writing Assistant
export const writingApi = {
  transcribe: async (audioFile: Blob, language: string = 'en', sessionId?: string) => {
    const formData = new FormData();
    formData.append('audio', audioFile, 'recording.webm');
    formData.append('language', language);
    if (sessionId) formData.append('session_id', sessionId);
    
    const { accessToken } = useAuthStore.getState();
    
    const headers: HeadersInit = {};
    if (accessToken) {
      headers['Authorization'] = `Bearer ${accessToken}`;
    }
    
    return fetch('/api/v1/writing/transcribe', {
      method: 'POST',
      headers,
      body: formData
    });
  },
  
  generateNotes: (sessionId: string, rawText: string, subject: string, userId: string, save: boolean = true) =>
    fetchApi<NotesResponse>('/writing/notes', {
      method: 'POST',
      body: JSON.stringify({
        session_id: sessionId,
        raw_text: rawText,
        subject,
        user_id: userId,
        save,
      }),
    }),
};

export interface NotesResponse {
  session_id: string;
  user_id: string;
  structured_notes: string;
}
