/**
 * API Service Functions
 * Typed functions for calling backend APIs
 * Uses native fetch (Axios causes Network Errors in Next.js)
 */

import { useAuthStore } from '@/store/authStore';
import { wsClient } from '@/services/websocket';
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
        // Refresh failed, disconnect WebSocket and logout
        wsClient.disconnect();
        logout();
        if (typeof window !== 'undefined') {
          window.location.href = '/login?error=session_expired';
        }
        throw new Error('Session expired. Please log in again.');
      }
    } catch (refreshError) {
      // Disconnect WebSocket and logout on error
      wsClient.disconnect();
      logout();
      if (typeof window !== 'undefined') {
        window.location.href = '/login?error=session_expired';
      }
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
  console.log('[fetchFormData] URL:', url);
  const { accessToken, refreshAccessToken, logout } = useAuthStore.getState();
  
  const headers: HeadersInit = {};
  if (accessToken) {
    headers['Authorization'] = `Bearer ${accessToken}`;
  }
  
  // Use AbortController with 5-minute timeout for long-running AI operations
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 5 * 60 * 1000);
  
  try {
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
          
          try {
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
          } catch (retryError) {
            clearTimeout(retryTimeoutId);
            if (retryError instanceof Error && retryError.name === 'AbortError') {
              throw new Error('Generation is taking longer than expected. Please try with a smaller document');
            }
            throw retryError;
          }
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
  } catch (error) {
    clearTimeout(timeoutId);
    // Handle timeout error (Requirement 13.6)
    if (error instanceof Error && error.name === 'AbortError') {
      throw new Error('Generation is taking longer than expected. Please try with a smaller document');
    }
    throw error;
  }
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
      // Include status code in error message for proper handling (Requirements 7.4, 7.5)
      const errorMessage = error.message || error.error || 'Registration failed';
      throw new Error(`HTTP ${response.status}: ${errorMessage}`);
    }
    const result = await response.json();
    return result.data || result;
  },
  
  logout: () =>
    fetchApi<void>('/auth/logout', { method: 'POST' }),
  
  getMe: () =>
    fetchApi<{ data: User }>('/users/me').then(r => unwrap(r) as User),
    
  updateProfile: (data: Partial<User>) =>
    fetchApi<{ data: User }>('/users/me', {
      method: 'PUT',
      body: JSON.stringify(data)
    }).then(r => unwrap(r) as User),
  
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

// Helper to unwrap backend { data: T } envelope
const unwrap = <T>(res: { data: T } | T): T =>
  res && typeof res === 'object' && 'data' in (res as object) ? (res as { data: T }).data : (res as T);

// Course Services
export const courseApi = {
  getAll: (limit = 20, offset = 0) =>
    fetchApi<{ data: Course[] }>(`/courses?limit=${limit}&offset=${offset}`).then(r => unwrap(r) as Course[]),
  
  getById: (id: string) =>
    fetchApi<{ data: Course }>(`/courses/${id}`).then(r => unwrap(r) as Course),
  
  create: (data: CreateCourseData) =>
    fetchApi<{ data: Course }>('/courses', { method: 'POST', body: JSON.stringify(data) }).then(r => unwrap(r) as Course),
  
  update: (id: string, data: Partial<CreateCourseData>) =>
    fetchApi<{ data: Course }>(`/courses/${id}`, { method: 'PUT', body: JSON.stringify(data) }).then(r => unwrap(r) as Course),
  
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
    fetchApi<{ data: FlashcardDeck[] }>(`/flashcard-decks?limit=${limit}&offset=${offset}`).then(r => unwrap(r) as FlashcardDeck[]),
  
  getDeckById: (id: string) =>
    fetchApi<{ data: FlashcardDeck }>(`/flashcard-decks/${id}`).then(r => unwrap(r) as FlashcardDeck),
  
  createDeck: (data: CreateDeckData) =>
    fetchApi<{ data: FlashcardDeck }>('/flashcard-decks', { method: 'POST', body: JSON.stringify(data) }).then(r => unwrap(r) as FlashcardDeck),
  
  generateFromContent: async (content: string, userId: string): Promise<GenerateFlashcardsResponse> => {
    // Create a text file from the content
    const blob = new Blob([content], { type: 'text/plain' });
    const file = new File([blob], 'flashcards.txt', { type: 'text/plain' });
    
    const formData = new FormData();
    formData.append('file', file);
    formData.append('user_id', userId);
    formData.append('num_cards', '10');
    
    // Use 5-minute timeout for AI generation (Requirement 13.2)
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
  cards?: Array<{
    front: string;
    back: string;
    order_index: number;
  }>;
}

interface FlashcardData {
  front: string;
  back: string;
  topic?: string;
}

interface GenerateFlashcardsResponse {
  session_id: string;
  user_id: string;
  filename?: string;
  num_requested: number;
  num_generated: number;
  flashcards: FlashcardData[];
}

// Quiz Services
export const quizApi = {
  getAll: async (limit = 20, offset = 0): Promise<Quiz[]> => {
    const response = await fetch(`/api/quiz?limit=${limit}&offset=${offset}`, {
      headers: getAuthHeaders(),
    });
    
    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Failed to fetch quizzes' }));
      throw new Error(error.message || 'Failed to fetch quizzes');
    }
    
    const result = await response.json();
    return unwrap(result) as Quiz[];
  },
  
  getById: (id: string) =>
    fetchApi<{ data: Quiz }>(`/quizzes/${id}`).then(r => unwrap(r) as Quiz),
  
  create: async (data: CreateQuizData): Promise<Quiz> => {
    const response = await fetch('/api/quiz', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeaders(),
      },
      body: JSON.stringify(data),
    });
    
    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Failed to create quiz' }));
      throw new Error(error.message || 'Failed to create quiz');
    }
    
    const result = await response.json();
    return unwrap(result) as Quiz;
  },
  
  startAttempt: async (quizId: string): Promise<QuizAttempt> => {
    const response = await fetch(`/api/v1/quizzes/${quizId}/start`, {
      method: 'POST',
      headers: getAuthHeaders(),
    });
    
    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Failed to start quiz' }));
      throw new Error(error.message || 'Failed to start quiz');
    }
    
    const result = await response.json();
    return unwrap(result) as QuizAttempt;
  },
  
  submitAnswer: async (attemptId: string, data: SubmitAnswerData): Promise<void> => {
    const response = await fetch(`/api/v1/quiz-attempts/${attemptId}/answers`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeaders(),
      },
      body: JSON.stringify(data),
    });
    
    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Failed to submit answer' }));
      throw new Error(error.message || 'Failed to submit answer');
    }
  },
  
  completeAttempt: async (attemptId: string): Promise<QuizResult> => {
    const response = await fetch(`/api/v1/quiz-attempts/${attemptId}/complete`, {
      method: 'POST',
      headers: getAuthHeaders(),
    });
    
    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Failed to complete quiz' }));
      throw new Error(error.message || 'Failed to complete quiz');
    }
    
    const result = await response.json();
    return unwrap(result) as QuizResult;
  },
  
  generateFromContent: async (content: string, userId: string, quizType: 'multiple_choice' | 'theory' = 'multiple_choice', numQuestions: number = 5): Promise<GenerateQuizResponse> => {
    // Create a text file from the content
    const blob = new Blob([content], { type: 'text/plain' });
    const file = new File([blob], 'quiz.txt', { type: 'text/plain' });
    
    const formData = new FormData();
    formData.append('file', file);
    formData.append('user_id', userId);
    formData.append('quiz_type', quizType);
    formData.append('num_questions', String(numQuestions));
    
    // Use 5-minute timeout for AI generation
    return fetchFormData('/study/quiz', formData);
  },
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

interface MCQOptions {
  A: string;
  B: string;
  C: string;
  D: string;
}

interface MultipleChoiceQuestion {
  question: string;
  options: MCQOptions;
  correct_answer: 'A' | 'B' | 'C' | 'D';
  explanation: string;
  topic: string;
}

interface TheoryQuestion {
  question: string;
  model_answer: string;
  marking_guide: string[];
  marks: number;
  topic: string;
}

interface GenerateQuizResponse {
  session_id: string;
  user_id: string;
  filename?: string;
  quiz_type: 'multiple_choice' | 'theory';
  num_requested: number;
  num_generated: number;
  questions: MultipleChoiceQuestion[] | TheoryQuestion[];
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
  
  // Load previous conversation by ID (Requirement 17.4)
  getConversation: (conversationId: string) =>
    fetchApi<ConversationDetail>(`/ai/conversation/${conversationId}`),
  
  // Stream chat responses for real-time display (Requirement 17.6)
  chatStream: async (
    query: string,
    userId: string,
    options: ChatOptions | undefined,
    onToken: (token: string) => void,
    onComplete: (response: ChatResponse) => void,
    onError: (error: Error) => void
  ): Promise<void> => {
    const { accessToken } = useAuthStore.getState();
    
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };
    if (accessToken) {
      headers['Authorization'] = `Bearer ${accessToken}`;
    }
    
    try {
      const response = await fetch('/api/v1/ai/chat/stream', {
        method: 'POST',
        headers,
        body: JSON.stringify({
          query,
          user_id: userId,
          context_chunks: options?.contextChunks || [],
          material_id: options?.materialId,
          conversation_id: options?.conversationId,
        }),
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
      let fullResponse = '';
      
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        
        buffer += decoder.decode(value, { stream: true });
        
        // Parse SSE events from buffer
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';
        
        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.slice(6);
            if (data === '[DONE]') {
              // Stream complete
              continue;
            }
            try {
              const parsed = JSON.parse(data);
              if (parsed.token) {
                fullResponse += parsed.token;
                onToken(parsed.token);
              }
              if (parsed.complete) {
                onComplete({
                  response: fullResponse,
                  conversation_id: parsed.conversation_id,
                  tokens_used: parsed.tokens_used || 0,
                  model: parsed.model || 'unknown',
                  sources: parsed.sources || [],
                });
              }
            } catch (e) {
              // Ignore parse errors for partial data
            }
          }
        }
      }
    } catch (error) {
      onError(error as Error);
    }
  },
  
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

interface ConversationDetail {
  conversation_id: string;
  user_id: string;
  created_at: string;
  updated_at: string;
  messages: Array<{
    id: string;
    role: 'user' | 'assistant';
    content: string;
    timestamp: string;
    sources?: string[];
  }>;
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
    const { accessToken } = useAuthStore.getState();
    
    // The backend Audio Service expects JSON body with: text, voice_id, speed
    // Map language to voice_id (edge-tts format)
    const voiceId = language === 'en' ? 'en-US-JennyNeural' : 
                    language === 'en-uk' ? 'en-GB-SoniaNeural' :
                    language === 'es' ? 'es-ES-ElviraNeural' :
                    language === 'fr' ? 'fr-FR-DeniseNeural' :
                    language === 'de' ? 'de-DE-KatjaNeural' :
                    language === 'it' ? 'it-IT-ElsaNeural' :
                    language === 'pt' ? 'pt-PT-RaquelNeural' :
                    language === 'ja' ? 'ja-JP-NanamiNeural' :
                    language === 'zh' ? 'zh-CN-XiaoxiaoNeural' :
                    language === 'ko' ? 'ko-KR-SunHiNeural' :
                    language === 'ar' ? 'ar-SA-ZariyahNeural' :
                    language === 'hi' ? 'hi-IN-SwaraNeural' :
                    language === 'ru' ? 'ru-RU-SvetlanaNeural' :
                    'en-US-JennyNeural';
    
    // Map slow (boolean) to speed (float): slow=true -> 0.75, slow=false -> 1.0
    const speed = slow ? 0.75 : 1.0;
    
    const body = JSON.stringify({
      text,
      voice_id: voiceId,
      speed,
    });
    
    const response = await fetch('/api/v1/ai/text-to-speech', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(accessToken ? { 'Authorization': `Bearer ${accessToken}` } : {}),
      },
      body,
    });
    
    if (!response.ok) {
      const contentType = response.headers.get('content-type') || '';
      let errorMessage = 'TTS failed';
      try {
        if (contentType.includes('application/json')) {
          const error = await response.json();
          errorMessage = error.details || error.error || `TTS failed (${response.status})`;
        } else {
          const text = await response.text();
          errorMessage = text || `TTS failed (${response.status})`;
        }
      } catch {
        errorMessage = `TTS failed (${response.status})`;
      }
      throw new Error(errorMessage);
    }
    
    // Verify we got audio content
    const contentType = response.headers.get('content-type') || '';
    console.log('[TTS] Response content-type:', contentType);
    
    const blob = await response.blob();
    console.log('[TTS] Response blob size:', blob.size, 'type:', blob.type);
    
    if (blob.size === 0) {
      throw new Error('TTS returned empty audio');
    }
    
    // Ensure correct MIME type for MP3
    return new Blob([blob], { type: 'audio/mpeg' });
  },
  
  speechToText: async (audioFile: File, language: string = 'en-US') => {
    const formData = new FormData();
    formData.append('audio', audioFile);
    formData.append('language', language);
    
    return fetchFormData<SpeechToTextResponse>('/ai/speech-to-text', formData);
  },
  
  // Fetch supported languages for TTS (Requirement 18.6)
  getLanguages: () =>
    fetchApi<LanguagesResponse>('/ai/languages'),
    
  // Health check for audio service
  healthCheck: async (): Promise<boolean> => {
    try {
      const response = await fetch('/api/v1/ai/languages', { method: 'GET' });
      return response.ok;
    } catch {
      return false;
    }
  },
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
    fetchApi<{ data: StudyStats }>('/analytics/study-stats').then(r => unwrap(r) as StudyStats),
  
  getStudyStreak: () =>
    fetchApi<{ data: StudyStreak }>('/analytics/study-streak').then(r => unwrap(r) as StudyStreak),
  
  getTopicMastery: () =>
    fetchApi<{ data: TopicMastery[] }>('/analytics/topic-mastery').then(r => unwrap(r) as TopicMastery[]),
  
  recordStudySession: (data: StudySessionData) =>
    fetchApi<void>('/analytics/study-sessions', { method: 'POST', body: JSON.stringify(data) }),
    
  getGoals: () =>
    fetchApi<{ data: LearningGoal[] }>('/analytics/goals').then(r => unwrap(r) as LearningGoal[]),
    
  createGoal: (data: CreateGoalData) =>
    fetchApi<{ data: LearningGoal }>('/analytics/goals', { method: 'POST', body: JSON.stringify(data) }).then(r => unwrap(r) as LearningGoal),
    
  completeGoal: (id: string) =>
    fetchApi<{ data: LearningGoal }>(`/analytics/goals/${id}/complete`, { method: 'POST' }).then(r => unwrap(r) as LearningGoal),
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

export interface LearningGoal {
  id: string;
  user_id: string;
  title: string;
  description?: string;
  target_date?: string;
  target_score?: number;
  current_score?: number;
  is_completed: boolean;
  completed_at?: string;
  status?: 'in_progress' | 'completed' | 'failed';  // Legacy field for compatibility
  course_id?: string;
  created_at: string;
  updated_at: string;
}

export interface CreateGoalData {
  title: string;
  description?: string;
  target_date?: string;  // ISO date string
  target_score?: number;  // Target value (e.g., study minutes, quiz score)
  course_id?: string;
}

// Session Services
export const sessionApi = {
  getSessions: () =>
    fetchApi<{ data: Session[] }>('/users/me/sessions').then(r => unwrap(r) as Session[]),
  
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
  device_name?: string;
  device_type?: string;
  os?: string;
  browser?: string;
  location?: string;
  created_at: string;
  last_active_at: string;
  is_current: boolean;
}

// Material Services - Simplified to use direct upload
export const materialApi = {
  getAll: (limit = 20, offset = 0) =>
    fetchApi<{ data: Material[] }>(`/materials?limit=${limit}&offset=${offset}`).then(r => unwrap(r) as Material[]),
  
  getById: (id: string) =>
    fetchApi<{ data: Material }>(`/materials/${id}`).then(r => unwrap(r) as Material),
  
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
    
    const material = unwrap(createRes) as Material;

    // Step 2: Get presigned URL
    console.log('[Upload] Getting presigned URL for material:', material.id);
    const presignRes = await fetchApi<{ data: { url: string; material_id: string; expires_at: number } }>(`/materials/${material.id}/presign`, {
      method: 'POST',
      body: JSON.stringify({ action: 'upload' }),
    });
    const presignData = unwrap(presignRes) as { url: string; material_id: string; expires_at: number };
    console.log('[Upload] Got presigned URL:', presignData.url);

    // Step 3: Upload file to MinIO
    let uploadUrl = presignData.url;
    if (!uploadUrl) {
      throw new Error('Failed to get upload URL from server');
    }
    
    // Replace internal Docker hostname with localhost for browser access if needed
    if (uploadUrl.includes('minio:9000')) {
      uploadUrl = uploadUrl.replace('minio:9000', 'localhost:9000');
    }
    
    console.log('[Upload] Uploading to:', uploadUrl);
    console.log('[Upload] File:', file.name, 'Size:', file.size, 'Type:', file.type);
    
    const uploadResponse = await fetch(uploadUrl, {
      method: 'PUT',
      body: file,
      headers: {
        'Content-Type': file.type || 'application/octet-stream',
      },
    });

    console.log('[Upload] Response status:', uploadResponse.status, uploadResponse.statusText);
    
    if (!uploadResponse.ok) {
      const errorText = await uploadResponse.text().catch(() => 'No error details');
      console.error('[Upload] Failed:', uploadResponse.status, errorText);
      throw new Error(`Failed to upload file to storage: ${uploadResponse.status} ${uploadResponse.statusText}`);
    }
    
    console.log('[Upload] Success!');

    // Step 4: Trigger ingestion to process the file
    console.log('[Upload] Triggering ingestion for material:', material.id);
    try {
      await materialApi.processFromStorage(material.id, material.title);
      console.log('[Upload] Ingestion triggered successfully');
    } catch (ingestionError: any) {
      console.error('[Upload] Ingestion failed:', ingestionError);
      // Don't throw here - file is uploaded, ingestion can be retried later
    }

    return material;
  },
  
  // Process uploaded file from MinIO storage
  processFromStorage: async (materialId: string, filename: string): Promise<void> => {
    // Get current user from auth store
    const { user } = useAuthStore.getState();
    const userId = user?.id || 'unknown';
    
    // Sanitize filename to match what was saved in MinIO
    const sanitizedFilename = filename
      .replace(/\s+/g, '_')           // Replace spaces with underscores
      .replace(/[^a-zA-Z0-9_.-]/g, '') // Remove special characters
      .replace(/^.*[\\\/]/, '');      // Get basename only
    
    console.log('[Upload] Sanitized filename:', sanitizedFilename);
    
    // Call ingestion service directly (not through gateway)
    const response = await fetch('http://localhost:5002/process-from-storage', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        material_id: materialId,
        user_id: userId,
        filename: sanitizedFilename,
      }),
    });
    
    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Ingestion failed: ${error}`);
    }
  },
  
  create: (data: CreateMaterialData) =>
    fetchApi<{ data: Material }>('/materials', { method: 'POST', body: JSON.stringify(data) }).then(r => unwrap(r) as Material),
  
  delete: (id: string) =>
    fetchApi<void>(`/materials/${id}`, { method: 'DELETE' }),
  
  getPresignedUrl: (id: string) =>
    fetchApi<{ data: { url: string } }>(`/materials/${id}/presign`, { 
      method: 'POST', 
      body: JSON.stringify({ action: 'upload' }),
    }).then(r => unwrap(r) as { url: string }),
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
  
  // SSE Streaming version for real-time progress (simulated from non-streaming backend)
  analyseStream: async (
    file: File,
    userId: string,
    onEvent: (event: ReadingStreamEvent) => void,
    onError: (error: Error) => void,
    summaryType = 'concise',
    voice = 'Zephyr',
    temperature = 1.0
  ): Promise<void> => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('user_id', userId);
    formData.append('summary_type', summaryType);
    formData.append('voice', voice);
    formData.append('temperature', temperature.toString());
    
    const { accessToken } = useAuthStore.getState();
    
    console.log('[analyseStream] Access token:', accessToken ? 'Present' : 'Missing');
    
    try {
      // Simulate streaming progress events
      onEvent({ type: 'status', data: { stage: 'Extracting text from document...' } });
      
      const headers: HeadersInit = {};
      if (accessToken) {
        headers['Authorization'] = `Bearer ${accessToken}`;
      }
      
      console.log('[analyseStream] Request headers:', headers);
      console.log('[analyseStream] Starting fetch at:', new Date().toISOString());
      
      // No AbortController - let the request run as long as needed
      // The API route has maxDuration set to 5 minutes
      const response = await fetch('/api/v1/reading/analyse', {
        method: 'POST',
        headers,
        body: formData,
      });
      
      console.log('[analyseStream] Response received at:', new Date().toISOString());
      
      if (!response.ok) {
        const errorText = await response.text().catch(() => 'Unknown error');
        console.error('[analyseStream] Error response:', response.status, errorText);
        throw new Error(`HTTP error! status: ${response.status} - ${errorText}`);
      }
      
      // Parse the JSON response
      const result = await response.json();
      console.log('[analyseStream] Got result:', result);
      
      // Simulate streaming events from the result
      onEvent({ type: 'status', data: { stage: 'Generating summary...' } });
      
      // Stream summary tokens (simulate typing effect)
      const summary = result.summary || '';
      const words = summary.split(' ');
      for (let i = 0; i < Math.min(words.length, 20); i++) {
        onEvent({ type: 'summary_token', data: { token: words[i] + ' ' } });
        await new Promise(resolve => setTimeout(resolve, 10)); // Small delay for effect
      }
      
      // Send remaining summary at once
      if (words.length > 20) {
        onEvent({ type: 'summary_token', data: { token: words.slice(20).join(' ') } });
      }
      
      onEvent({ type: 'status', data: { stage: 'Extracting vocabulary...' } });
      
      // Send vocab terms
      const vocabTerms = result.vocab_terms || [];
      for (const term of vocabTerms) {
        onEvent({ 
          type: 'vocab', 
          data: { 
            term: term.term, 
            definition: term.definition, 
            context_snippet: term.context_snippet 
          } 
        });
      }
      
      onEvent({ type: 'progress', data: { percent: 100 } });
      
      // Send complete event with all data
      onEvent({ 
        type: 'complete', 
        data: { 
          session_id: result.session_id,
          summary: result.summary,
          vocab_terms: result.vocab_terms,
          tts_audio_b64: result.tts_audio_b64
        } 
      });
      
    } catch (error) {
      // Handle timeout error (Requirement 16.7)
      if (error instanceof Error && error.name === 'AbortError') {
        onError(new Error('Analysis is taking longer than expected. Please try with a smaller document'));
      } else {
        onError(error as Error);
      }
    }
  },
  
  getSession: (sessionId: string, userId: string) =>
    fetchApi<ReadingSessionDetail>(`/reading/${sessionId}?user_id=${userId}`),
  
  // Async polling version - uses the Next.js API route with long timeout
  analyseAsync: async (
    file: File,
    userId: string,
    onProgress: (progress: number, message: string) => void,
    summaryType = 'concise',
    voice = 'Zephyr',
    temperature = 1.0
  ): Promise<ReadingAnalysisResponse> => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('user_id', userId);
    formData.append('summary_type', summaryType);
    formData.append('voice', voice);
    formData.append('temperature', temperature.toString());
    
    console.log('[analyseAsync] Starting analysis with simulated progress...');
    
    // Start simulated progress updates
    let progress = 0;
    const progressInterval = setInterval(() => {
      progress += Math.random() * 3 + 1; // Random increment between 1-4%
      if (progress > 95) progress = 95; // Cap at 95% until complete
      
      let message = 'Processing...';
      if (progress < 20) message = 'Extracting text from document...';
      else if (progress < 40) message = 'Storing document...';
      else if (progress < 70) message = 'Generating summary...';
      else if (progress < 90) message = 'Extracting vocabulary...';
      else message = 'Generating audio...';
      
      onProgress(Math.floor(progress), message);
    }, 1500); // Update every 1.5 seconds
    
    try {
      // Use the existing analyse endpoint (with long timeout handled by API route)
      const result = await fetchFormData<ReadingAnalysisResponse>(
        '/reading/analyse',
        formData
      );
      
      clearInterval(progressInterval);
      onProgress(100, 'Complete!');
      
      return result;
    } catch (error) {
      clearInterval(progressInterval);
      throw error;
    }
  },
  
  // Simplify text to a specific reading level
  simplify: async (text: string, level: 'beginner' | 'intermediate'): Promise<{ simplified_text: string; level: string }> => {
    return fetchApi('/reading/simplify', {
      method: 'POST',
      body: JSON.stringify({ text, level }),
    });
  },
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
  transcribe: async (audioFile: Blob, language: string = 'en', sessionId?: string, retry = true): Promise<Response> => {
    const formData = new FormData();
    formData.append('audio', audioFile, 'recording.webm');
    formData.append('language', language);
    if (sessionId) formData.append('session_id', sessionId);
    
    const { accessToken, refreshAccessToken } = useAuthStore.getState();
    
    const headers: HeadersInit = {};
    if (accessToken) {
      headers['Authorization'] = `Bearer ${accessToken}`;
    }
    
    const response = await fetch('/api/v1/writing/transcribe', {
      method: 'POST',
      headers,
      body: formData
    });
    
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
          newFormData.append('audio', audioFile, 'recording.webm');
          newFormData.append('language', language);
          if (sessionId) newFormData.append('session_id', sessionId);
          
          return fetch('/api/v1/writing/transcribe', {
            method: 'POST',
            headers: newHeaders,
            body: newFormData
          });
        }
      } catch (refreshError) {
        console.error('Token refresh failed:', refreshError);
      }
    }
    
    return response;
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
    }).then(r => unwrap(r) as NotesResponse),
  
  getHistory: (userId: string, limit: number = 20, offset: number = 0) =>
    fetchApi<{ data: WritingSession[] }>(`/writing/history?user_id=${userId}&limit=${limit}&offset=${offset}`).then(r => unwrap(r) as WritingSession[]),
};

export interface NotesResponse {
  session_id: string;
  user_id: string;
  structured_notes: string;
}

export interface WritingSession {
  session_id: string;
  user_id: string;
  subject: string;
  raw_text: string;
  structured_notes: string;
  created_at: string;
}

// Notification Services
export interface NotificationSettings {
  emailNotifications: boolean;
  pushNotifications: boolean;
  weeklyDigest: boolean;
  marketingEmails: boolean;
}

export interface NotificationReminder {
  id: string;
  title: string;
  time: string; // HH:mm format
  days: string[]; // ['monday', 'tuesday', etc]
  enabled: boolean;
}

export interface NotificationDevice {
  token: string;
  platform: 'web' | 'ios' | 'android';
  browser?: string;
}

export interface NotificationHistoryItem {
  id: string;
  type: 'reminder' | 'achievement' | 'system';
  title: string;
  message: string;
  read: boolean;
  created_at: string;
}

export const notificationApi = {
  // Preferences
  getPreferences: () =>
    fetchApi<{ data: NotificationSettings }>('/notifications/preferences').then(r => unwrap(r) as NotificationSettings),
  
  updatePreferences: (settings: NotificationSettings) =>
    fetchApi<void>('/notifications/preferences', { method: 'PUT', body: JSON.stringify(settings) }),
  
  // Device registration for push notifications
  registerDevice: (device: NotificationDevice) =>
    fetchApi<void>('/notifications/devices/register', { method: 'POST', body: JSON.stringify(device) }),
  
  unregisterDevice: (token: string) =>
    fetchApi<void>(`/notifications/devices/${token}`, { method: 'DELETE' }),
  
  // Study reminders
  getReminders: () =>
    fetchApi<{ data: NotificationReminder[] }>('/notifications/reminders').then(r => unwrap(r) as NotificationReminder[]),
  
  createReminder: (reminder: Omit<NotificationReminder, 'id'>) =>
    fetchApi<{ data: NotificationReminder }>('/notifications/reminders', { 
      method: 'POST', 
      body: JSON.stringify(reminder) 
    }).then(r => unwrap(r) as NotificationReminder),
  
  updateReminder: (id: string, reminder: Partial<NotificationReminder>) =>
    fetchApi<{ data: NotificationReminder }>(`/notifications/reminders/${id}`, { 
      method: 'PUT', 
      body: JSON.stringify(reminder) 
    }).then(r => unwrap(r) as NotificationReminder),
  
  deleteReminder: (id: string) =>
    fetchApi<void>(`/notifications/reminders/${id}`, { method: 'DELETE' }),
  
  // Notification history
  getHistory: (limit = 20, offset = 0) =>
    fetchApi<{ data: NotificationHistoryItem[] }>(`/notifications/history?limit=${limit}&offset=${offset}`)
      .then(r => unwrap(r) as NotificationHistoryItem[]),
  
  markAsRead: (id: string) =>
    fetchApi<void>(`/notifications/history/${id}/read`, { method: 'POST' }),
  
  markAllAsRead: () =>
    fetchApi<void>('/notifications/history/read-all', { method: 'POST' }),
};
