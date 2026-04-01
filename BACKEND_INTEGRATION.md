# LexiAssist Frontend - Backend Integration Guide

## Overview

This document describes how the frontend has been integrated with the backend microservices architecture.

## Architecture

```
Frontend (Next.js 16)
├── API Routes (Proxy Layer)
│   ├── /api/ai/chat → AI Orchestrator
│   ├── /api/flashcards → Content Service
│   ├── /api/quiz → Content Service
│   ├── /api/courses → Content Service
│   └── /api/analytics → Analytics Service
├── React Query Hooks
│   ├── useAI() - AI chat, summaries, retrieval
│   ├── useFlashcards() - CRUD operations
│   ├── useQuizzes() - Quiz management
│   ├── useCourses() - Course management
│   └── useAnalytics() - Study statistics
└── Services Layer
    ├── http.ts - Axios with JWT refresh
    └── api.ts - Typed API functions
```

## Features Connected

### 1. Authentication ✅
- **Location**: `src/store/authStore.ts`, `src/hooks/useAuth.ts`
- **Backend**: User Service (Port 8081)
- **Features**:
  - JWT RS256 token handling
  - Automatic token refresh (5 min before expiry)
  - Token rotation on refresh
  - Persistent auth state with Zustand
  - HTTP-only cookie support

**Usage**:
```typescript
const { login, logout, user, isAuthenticated } = useAuthStore();
const { mutate: loginMutate } = useLogin();

// Login
loginMutate({ email, password });

// Logout
await logout();
```

### 2. Flashcards ✅
- **Location**: `src/app/(main)/flashcards/page.tsx`
- **Backend**: Content Service + AI Orchestrator
- **Features**:
  - Upload documents (PDF, DOC, TXT)
  - Text input for content
  - AI-generated flashcards from content
  - Interactive card flip UI
  - Navigation between cards

**API Routes**:
- `POST /api/flashcards/generate` - Generate with AI
- `GET /api/flashcards` - List all decks
- `POST /api/flashcards` - Create new deck

**Usage**:
```typescript
const { mutate: generateFlashcards } = useGenerateFlashcards();

// Generate from content
generateFlashcards({ content: "Your study material...", userId });
```

### 3. Quizzes ✅
- **Location**: `src/app/(main)/quizzes/page.tsx`
- **Backend**: Content Service + AI Orchestrator + Analytics Service
- **Features**:
  - Upload documents for quiz generation
  - Text input for quiz topics
  - AI-generated multiple choice questions
  - Interactive quiz taking UI
  - Score tracking and review
  - Show existing quizzes from backend

**API Routes**:
- `POST /api/quiz/generate` - Generate with AI
- `GET /api/quiz` - List all quizzes
- `POST /api/quiz` - Create new quiz

**Usage**:
```typescript
const { mutate: generateQuiz } = useGenerateQuiz();
const { data: quizzes } = useQuizzes();

// Generate quiz
generateQuiz({ content: "Your content...", userId });
```

### 4. Chat Assistant (StudyBuddy) ✅
- **Location**: `src/app/(main)/chat-assistant/page.tsx`
- **Backend**: AI Orchestrator (Port 5005)
- **Features**:
  - Real-time chat interface
  - Message history
  - File attachment UI
  - Typing indicators
  - Conversation persistence
  - Sources citation

**API Routes**:
- `POST /api/ai/chat` - Send message to Gemini AI

**Usage**:
```typescript
const { mutate: sendMessage } = useAIChat();

// Send message
sendMessage({ 
  query: "Explain quantum physics", 
  userId,
  options: { conversationId }
});
```

### 5. Dashboard with Analytics ✅
- **Location**: `src/app/(main)/dashboard/page.tsx`
- **Backend**: Analytics Service (Port 8083)
- **Features**:
  - Study streak counter
  - Total study time
  - Quizzes completed
  - Materials reviewed
  - Recent flashcards list
  - Recent quizzes list
  - Quick action buttons

**API Routes**:
- `GET /api/analytics/stats` - Study statistics
- `GET /api/analytics/streak` - Current streak
- `GET /api/analytics/mastery` - Topic mastery

**Usage**:
```typescript
const { data: stats } = useStudyStats();
const { data: streak } = useStudyStreak();
const { data: flashcards } = useFlashcardDecks();
const { data: quizzes } = useQuizzes();
```

### 6. HTTP Client with Auto-Refresh ✅
- **Location**: `src/services/http.ts`
- **Features**:
  - Automatic JWT token injection
  - Token expiration detection
  - Background token refresh
  - Request retry after refresh
  - 401 redirect to login

**Configuration**:
```typescript
// Normal API calls
http.get('/api/v1/courses');
http.post('/api/v1/quizzes', data);

// AI service calls (longer timeout)
aiHttp.post('/api/v1/ai/chat', data);
```

## Type Safety

All types have been aligned between frontend and backend:

| Backend Field | Frontend Field | Notes |
|--------------|----------------|-------|
| `first_name` | `first_name` / `name` | `name` is computed |
| `academic_level` | `academic_level` / `level` | Alias for compatibility |
| `created_at` | `created_at` / `createdAt` | Both formats supported |
| `study_stats` | `StudyStats` | Full type mapping |

## Environment Variables

```env
# Required
NEXT_PUBLIC_API_GATEWAY_URL=http://localhost:8080
NEXT_PUBLIC_AI_PROXY_URL=http://localhost:8000

# Optional (for development)
NEXT_PUBLIC_USE_MOCK_API=false
NEXT_PUBLIC_MOCK_MODE=false
```

## How to Test

### 1. Start Backend Services
```bash
cd lexiassist-backend/infra
docker-compose up -d
```

### 2. Verify Backend Health
```bash
curl http://localhost:8080/health
```

### 3. Configure Frontend
```bash
cd lexiassist-frontend
# Edit .env.local
NEXT_PUBLIC_USE_MOCK_API=false
NEXT_PUBLIC_API_GATEWAY_URL=http://localhost:8080
NEXT_PUBLIC_AI_PROXY_URL=http://localhost:8000
```

### 4. Run Frontend
```bash
npm run dev
```

### 5. Test Flow
1. Register/Login at `/login`
2. Check dashboard shows real stats
3. Create flashcards from text
4. Generate a quiz from content
5. Chat with StudyBuddy

## Error Handling

All hooks include error handling with toast notifications:

```typescript
const { mutate, error, isError } = useGenerateFlashcards();

if (isError) {
  console.error('Error:', error.message);
}
```

## Caching Strategy

React Query caching configuration:

| Data Type | Stale Time | Cache Time |
|-----------|-----------|------------|
| User | 5 min | 10 min |
| Courses | 1 min | 5 min |
| Flashcards | 1 min | 5 min |
| Quizzes | 1 min | 5 min |
| Analytics | 30 sec | 2 min |

## Security

- JWT tokens stored in memory (Zustand)
- HTTP-only cookies for refresh tokens
- Automatic token refresh before expiry
- 401 redirects to login page
- Rate limit handling (429 responses)

## Remaining Work

### Features Not Yet Connected:
1. **Reading Assistant** - Needs AI summary integration
2. **Writing Assistant** - Needs speech-to-text API
3. **Text-to-Speech** - Needs audio service integration
4. **Materials Upload** - Needs MinIO/S3 presigned URLs
5. **Notifications** - Needs notification service connection
6. **Settings** - Needs user preferences API
7. **Courses Management** - UI exists but not fully connected

### API Routes to Create:
- `/api/materials/upload` - File upload with presigned URL
- `/api/ai/speech-to-text` - Audio transcription
- `/api/ai/text-to-speech` - Audio generation
- `/api/notifications/preferences` - Notification settings
- `/api/user/settings` - User preferences

## Debugging

### Check API Calls
Open browser DevTools → Network tab:
- Look for `localhost:3000/api/*` requests
- These proxy to `localhost:8080/api/v1/*`

### Check Auth State
```javascript
// In browser console
JSON.parse(localStorage.getItem('lexi-auth-storage'))
```

### Check React Query Cache
```javascript
// In browser console (React Query DevTools)
window.__REACT_QUERY_DEVTOOLS__
```

## Support

For backend issues, check:
```bash
docker-compose logs gateway
docker-compose logs user-service
docker-compose logs ai-orchestrator
```

For frontend issues, check browser console for:
- 401 Unauthorized (token issues)
- 429 Too Many Requests (rate limiting)
- 503 Service Unavailable (backend down)
