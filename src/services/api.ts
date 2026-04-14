/**
 * API Service Functions
 * Typed functions for calling backend APIs
 * Uses native fetch with automatic token refresh via TokenManager
 */

import { useAuthStore } from '@/store/authStore';
import { tokenManager } from './tokenManager';
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

// ─────────────────────────────────────────────────────────────────────────────
// Token Refresh Setup
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Initialize proactive token refresh
 * Call this once when the app starts
 */
export function initTokenRefresh(): () => void {
  // Check token every minute for proactive refresh
  const intervalId = setInterval(() => {
    if (tokenManager.shouldRefreshToken()) {
      console.log('[TokenRefresh] Proactive refresh triggered');
      tokenManager.performRefresh();
    }
  }, 60 * 1000);

  // Also check on visibility change (tab becomes active)
  const handleVisibilityChange = () => {
    if (document.visibilityState === 'visible') {
      if (tokenManager.shouldRefreshToken()) {
        console.log('[TokenRefresh] Proactive refresh on visibility change');
        tokenManager.performRefresh();
      }
    }
  };
  document.addEventListener('visibilitychange', handleVisibilityChange);

  // Return cleanup function
  return () => {
    clearInterval(intervalId);
    document.removeEventListener('visibilitychange', handleVisibilityChange);
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// Core HTTP Helpers with Token Refresh
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Get auth headers with valid token
 */
async function getAuthHeaders(): Promise<HeadersInit> {
  const token = await tokenManager.getValidToken();
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
  };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
}

/**
 * Enhanced fetch with automatic token refresh
 * - Proactively refreshes token before requests if needed
 * - Handles 401 by refreshing and retrying once
 * - Prevents multiple simultaneous refresh attempts
 */
async function fetchWithAuth(
  url: string,
  options?: RequestInit,
  retryOn401 = true
): Promise<Response> {
  // Ensure we have a valid token before the request
  const headers = await getAuthHeaders();
  
  const response = await fetch(url, {
    ...options,
    headers: {
      ...headers,
      ...(options?.headers || {}),
    },
  });

  // Handle 401 - refresh token and retry
  if (response.status === 401 && retryOn401) {
    const refreshed = await tokenManager.handleUnauthorized();
    
    if (refreshed) {
      // Retry with new token
      const newHeaders = await getAuthHeaders();
      const retryResponse = await fetch(url, {
        ...options,
        headers: {
          ...newHeaders,
          ...(options?.headers || {}),
        },
      });
      return retryResponse;
    } else {
      // Refresh failed - logout already called by tokenManager
      throw new Error('Session expired. Please log in again.');
    }
  }

  return response;
}

/**
 * Generic API fetch helper
 */
async function fetchApi<T>(path: string, options?: RequestInit): Promise<T> {
  const url = `/api/v1${path}`;
  const response = await fetchWithAuth(url, options);
  
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
}

// ─────────────────────────────────────────────────────────────────────────────
// FormData Helpers (for file uploads)
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Clone FormData for retry
 */
function cloneFormData(original: FormData): FormData {
  const clone = new FormData();
  original.forEach((value, key) => {
    clone.append(key, value);
  });
  return clone;
}

/**
 * Fetch with FormData and automatic token refresh
 */
async function fetchFormData<T>(
  path: string,
  formData: FormData,
  retryOn401 = true
): Promise<T> {
  const url = `/api/v1${path}`;
  const token = await tokenManager.getValidToken();
  
  const headers: HeadersInit = {};
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
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
    
    // Handle 401
    if (response.status === 401 && retryOn401) {
      const refreshed = await tokenManager.handleUnauthorized();
      
      if (refreshed) {
        const newToken = await tokenManager.getValidToken();
        const newHeaders: HeadersInit = {};
        if (newToken) {
          newHeaders['Authorization'] = `Bearer ${newToken}`;
        }
        
        // Clone FormData for retry
        const newFormData = cloneFormData(formData);
        
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
    throw error;
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// SSE Streaming Helper
// ─────────────────────────────────────────────────────────────────────────────

export interface ReadingStreamEvent {
  type: 'status' | 'summary_token' | 'vocab' | 'progress' | 'complete' | 'error';
  data: any;
}

/**
 * SSE Event Parser - DEBUG VERSION with detailed logging
 * 
 * Backend sends events in format:
 *   event: <type>
 *   data: <json>
 *   
 *   (blank line)
 */
function parseSSEEvents(buffer: string): { parsed: ReadingStreamEvent[]; remainder: string } {
  const events: ReadingStreamEvent[] = [];
  
  // Split on double newlines which delimit SSE events
  const parts = buffer.split('\n\n');
  
  // The last part might be incomplete (no trailing \n\n), so keep it as remainder
  const remainder = parts.pop() || '';
  
  console.log(`[SSE Parser] Processing ${parts.length} events, remainder: ${remainder.length} chars`);
  
  for (let i = 0; i < parts.length; i++) {
    const part = parts[i];
    if (!part.trim()) continue;
    
    let eventType: string | null = null;
    let eventData: string | null = null;
    
    const lines = part.split('\n');
    for (const line of lines) {
      if (line.startsWith('event: ')) {
        eventType = line.slice(7).trim();
      } else if (line.startsWith('data: ')) {
        eventData = line.slice(6);
      }
    }
    
    if (eventType && eventData !== null) {
      let parsedData: any;
      try {
        parsedData = JSON.parse(eventData);
      } catch (e) {
        console.warn(`[SSE Parser] Failed to parse data for event "${eventType}":`, eventData.slice(0, 100));
        parsedData = eventData;
      }
      
      console.log(`[SSE Parser] Parsed event: ${eventType}`, 
        eventType === 'complete' ? '(complete event with full data)' : 
        eventType === 'summary_token' ? { token: parsedData.token?.slice(0, 20) + '...' } :
        { keys: Object.keys(parsedData) }
      );
      
      events.push({ type: eventType as ReadingStreamEvent['type'], data: parsedData });
    } else {
      console.warn('[SSE Parser] Missing event type or data:', { eventType, hasData: eventData !== null });
    }
  }
  
  return { parsed: events, remainder };
}

// ─────────────────────────────────────────────────────────────────────────────
// API Services
// ─────────────────────────────────────────────────────────────────────────────

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

// Audio Services
export const audioApi = {
  textToSpeech: async (text: string, language: string = 'en', slow: boolean = false): Promise<Blob> => {
    const formData = new FormData();
    formData.append('text', text);
    formData.append('language', language);
    formData.append('slow', slow ? 'true' : 'false');
    
    const token = await tokenManager.getValidToken();
    
    const headers: HeadersInit = {};
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
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

// Session Services
export const sessionApi = {
  getSessions: () =>
    fetchApi<Session[]>('/users/me/sessions'),
  
  revokeSession: (sessionId: string) =>
    fetchApi<void>(`/users/me/sessions/${sessionId}`, { method: 'DELETE' }),
  
  logoutAll: () =>
    fetchApi<void>('/auth/logout-all', { method: 'POST' }),
};

// Material Services
export const materialApi = {
  getAll: (limit = 20, offset = 0) =>
    fetchApi<Material[]>(`/materials?limit=${limit}&offset=${offset}`),
  
  getById: (id: string) =>
    fetchApi<Material>(`/materials/${id}`),
  
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

// Reading Assistant
export const readingApi = {
  extractText: async (file: File): Promise<{ text: string }> => {
    const formData = new FormData();
    formData.append('file', file);
    return fetchFormData('/reading/extract', formData);
  },

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
    // Helper to create FormData (since it can only be read once)
    const createFormData = () => {
      const fd = new FormData();
      fd.append('file', file);
      fd.append('user_id', userId);
      fd.append('summary_type', summaryType);
      fd.append('voice', voice);
      return fd;
    };
    
    // Ensure we have a valid token before starting
    const token = await tokenManager.getValidToken();
    
    if (!token) {
      onError(new Error('Not authenticated'));
      return;
    }
    
    console.log('[analyseStream] Starting stream with token:', token.slice(0, 20) + '...');
    
    try {
      const response = await fetch('/api/v1/reading/analyse/stream', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: createFormData(),
      });
      
      // Handle 401 by refreshing and retrying once
      if (response.status === 401) {
        console.log('[analyseStream] Got 401, attempting refresh...');
        const refreshed = await tokenManager.handleUnauthorized();
        
        if (refreshed) {
          const newToken = await tokenManager.getValidToken();
          console.log('[analyseStream] Retrying with new token...');
          const retryResponse = await fetch('/api/v1/reading/analyse/stream', {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${newToken}`,
            },
            body: createFormData(),
          });
          
          if (!retryResponse.ok) {
            throw new Error(`HTTP error! status: ${retryResponse.status}`);
          }
          
          await processStream(retryResponse, onEvent);
          return;
        } else {
          throw new Error('Session expired. Please log in again.');
        }
      }
      
      if (!response.ok) {
        const errorText = await response.text().catch(() => 'Unknown error');
        throw new Error(`HTTP error! status: ${response.status} - ${errorText}`);
      }
      
      console.log('[analyseStream] Stream connected, starting to read...');
      await processStream(response, onEvent);
    } catch (error) {
      console.error('[analyseStream] Error:', error);
      onError(error as Error);
    }
  },
  
  getSession: (sessionId: string, userId: string) =>
    fetchApi<ReadingSessionDetail>(`/reading/${sessionId}?user_id=${userId}`),
};

/**
 * Process SSE stream with detailed logging
 */
async function processStream(
  response: Response,
  onEvent: (event: ReadingStreamEvent) => void
): Promise<void> {
  const reader = response.body?.getReader();
  const decoder = new TextDecoder();
  
  if (!reader) {
    throw new Error('No response body');
  }
  
  let buffer = '';
  let eventCount = 0;
  let lastActivityTime = Date.now();
  let isComplete = false;
  
  console.log('[processStream] Starting to read stream...');
  
  try {
    while (true) {
      const { done, value } = await reader.read();
      
      if (value) {
        lastActivityTime = Date.now();
        const decoded = decoder.decode(value, { stream: !done });
        buffer += decoded;
        
        console.log(`[processStream] Received ${value.length} bytes, buffer now ${buffer.length} chars`);
      }
      
      // Parse SSE events from buffer
      const events = parseSSEEvents(buffer);
      buffer = events.remainder;
      
      // Process each parsed event
      for (const event of events.parsed) {
        eventCount++;
        console.log(`[processStream] Event #${eventCount}: ${event.type}`, 
          event.type === 'complete' ? { 
            hasSummary: !!event.data.summary,
            summaryLength: event.data.summary?.length,
            vocabCount: event.data.vocab_terms?.length,
            hasAudio: !!event.data.tts_audio_b64,
            audioLength: event.data.tts_audio_b64?.length
          } : ''
        );
        
        onEvent(event);
        
        // Stop reading on complete or error
        if (event.type === 'complete' || event.type === 'error') {
          isComplete = true;
          console.log(`[processStream] Stream finished with ${event.type} event`);
          return;
        }
      }
      
      if (done) {
        console.log('[processStream] Reader done');
        break;
      }
    }
    
    // Flush any remaining data in buffer
    if (buffer.trim()) {
      console.log('[processStream] Flushing remaining buffer:', buffer.slice(0, 200));
      const finalEvents = parseSSEEvents(buffer + '\n\n');
      for (const event of finalEvents.parsed) {
        eventCount++;
        console.log(`[processStream] Flushed event #${eventCount}: ${event.type}`);
        onEvent(event);
        if (event.type === 'complete' || event.type === 'error') {
          isComplete = true;
        }
      }
    }
    
    // If we never got a complete event, something went wrong
    if (!isComplete) {
      console.error('[processStream] Stream ended without complete event');
      throw new Error('Stream ended unexpectedly. Please try again.');
    }
    
    console.log(`[processStream] Total events processed: ${eventCount}`);
  } catch (error) {
    console.error('[processStream] Error:', error);
    throw error;
  } finally {
    reader.releaseLock();
  }
}

// Writing Assistant
export const writingApi = {
  transcribe: async (audioFile: Blob, language: string = 'en', sessionId?: string) => {
    const formData = new FormData();
    formData.append('audio', audioFile, 'recording.webm');
    formData.append('language', language);
    if (sessionId) formData.append('session_id', sessionId);
    
    const token = await tokenManager.getValidToken();
    
    const headers: HeadersInit = {};
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
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

// ─────────────────────────────────────────────────────────────────────────────
// Type Definitions
// ─────────────────────────────────────────────────────────────────────────────

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

interface SpeechToTextResponse {
  text: string;
  confidence: number;
  language: string;
  original_format: string;
}

interface LanguagesResponse {
  supported_languages: Record<string, string>;
}

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

export interface Session {
  id: string;
  user_id: string;
  ip_address: string;
  user_agent: string;
  created_at: string;
  last_active_at: string;
  is_current: boolean;
}

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

export interface NotesResponse {
  session_id: string;
  user_id: string;
  structured_notes: string;
}
