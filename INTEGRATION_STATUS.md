# LexiAssist Frontend-Backend Integration Status

## Overview
This document tracks the integration status between the Next.js frontend and the Go/Python backend microservices.

## Backend Services Architecture

### Go Microservices (via Gateway at :8080)
| Service | Port | Status | Description |
|---------|------|--------|-------------|
| Gateway | 8080 | ✅ Active | API Gateway, routes to all services |
| User Service | 8081 | ✅ Active | Auth, profiles, sessions |
| Content Service | 8082 | ✅ Active | Courses, materials, quizzes, flashcards |
| Analytics Service | 8083 | ✅ Active | Study stats, goals, quiz attempts |
| Notification Service | 8084 | ✅ Active | Email, push notifications |
| Sync Service | 8085 | ✅ Active | WebSocket real-time sync |

### Python Microservices
| Service | Port | Status | Description |
|---------|------|--------|-------------|
| AI Orchestrator | 8001 | ✅ Active | LLM orchestration, RAG |
| Audio Service | 8002 | ✅ Active | TTS, STT |
| Ingestion Service | 8003 | ✅ Active | Document processing, chunking |
| Retrieval Service | 8004 | ✅ Active | Vector search |
| Evaluation Service | 8005 | ✅ Active | Quiz grading |

## Integration Status by Feature

### 1. Authentication & User Management ✅ COMPLETE
**Frontend**: `/login`, `/register`, `/settings`
**Backend**: User Service (Go)
**APIs**:
- ✅ `POST /api/v1/auth/login` - Login
- ✅ `POST /api/v1/auth/register` - Register
- ✅ `POST /api/v1/auth/logout` - Logout
- ✅ `POST /api/v1/auth/refresh` - Token refresh
- ✅ `POST /api/v1/auth/verify-email` - Email verification
- ✅ `POST /api/v1/auth/forgot-password` - Password reset request
- ✅ `POST /api/v1/auth/reset-password` - Password reset
- ✅ `GET /api/v1/users/me` - Get current user
- ✅ `PUT /api/v1/users/me` - Update profile
- ✅ `POST /api/v1/users/me/change-password` - Change password
- ✅ `GET /api/v1/users/me/sessions` - List sessions
- ✅ `DELETE /api/v1/users/me/sessions/:id` - Revoke session
- ✅ `POST /api/v1/auth/logout-all` - Logout all devices

### 2. Dashboard & Analytics ✅ COMPLETE
**Frontend**: `/dashboard`
**Backend**: Analytics Service (Go)
**APIs**:
- ✅ `GET /api/v1/analytics/study-stats` - Study statistics
- ✅ `GET /api/v1/analytics/study-streak` - Study streak
- ✅ `GET /api/v1/analytics/topic-mastery` - Topic mastery scores
- ✅ `GET /api/v1/analytics/goals` - Learning goals
- ✅ `POST /api/v1/analytics/goals` - Create goal
- ✅ `POST /api/v1/analytics/goals/:id/complete` - Complete goal
- ✅ `POST /api/v1/analytics/study-sessions` - Record session

### 3. Chat Assistant ✅ COMPLETE
**Frontend**: `/chat-assistant`
**Backend**: AI Orchestrator (Python) via Gateway
**APIs**:
- ✅ `POST /api/v1/ai/chat` - Chat with AI
- ✅ `GET /api/v1/ai/conversation/:id` - Get conversation history
- ✅ `POST /api/v1/ai/retrieve` - RAG context retrieval
- ✅ File upload via `/api/v1/materials`

### 4. Flashcards ✅ COMPLETE
**Frontend**: `/flashcards`
**Backend**: Content Service (Go) + AI Orchestrator (Python)
**APIs**:
- ✅ `GET /api/v1/flashcard-decks` - List decks
- ✅ `GET /api/v1/flashcard-decks/:id` - Get deck
- ✅ `POST /api/v1/flashcard-decks` - Create deck
- ✅ `POST /api/v1/study/flashcards` - Generate from content

### 5. Quizzes ✅ COMPLETE
**Frontend**: `/quizzes`
**Backend**: Content Service (Go) + Analytics Service (Go) + AI Orchestrator (Python)
**APIs**:
- ✅ `GET /api/v1/quizzes` - List quizzes
- ✅ `GET /api/v1/quizzes/:id` - Get quiz
- ✅ `POST /api/v1/quizzes` - Create quiz
- ✅ `POST /api/v1/quizzes/:id/start` - Start attempt
- ✅ `POST /api/v1/quiz-attempts/:id/answers` - Submit answer
- ✅ `POST /api/v1/quiz-attempts/:id/complete` - Complete attempt
- ✅ `POST /api/v1/study/quiz` - Generate from content

### 6. Materials ✅ COMPLETE
**Frontend**: `/chat-assistant` (file upload)
**Backend**: Content Service (Go) + Ingestion Service (Python)
**APIs**:
- ✅ `GET /api/v1/materials` - List materials
- ✅ `POST /api/v1/materials` - Upload material
- ✅ `GET /api/v1/materials/:id` - Get material
- ✅ `POST /api/v1/materials/:id/presign` - Get upload URL
- ✅ `GET /api/v1/courses/:id/materials` - Get course materials

### 7. Courses ✅ COMPLETE
**Frontend**: Dashboard references
**Backend**: Content Service (Go)
**APIs**:
- ✅ `GET /api/v1/courses` - List courses
- ✅ `GET /api/v1/courses/:id` - Get course
- ✅ `POST /api/v1/courses` - Create course
- ✅ `PUT /api/v1/courses/:id` - Update course
- ✅ `DELETE /api/v1/courses/:id` - Delete course

### 8. Text-to-Speech ✅ COMPLETE
**Frontend**: `/text-to-speech`
**Backend**: Audio Service (Python)
**APIs**:
- ✅ `POST /api/v1/ai/text-to-speech` - Convert text to speech
- ✅ `GET /api/v1/ai/languages` - Get supported languages

### 9. Reading Assistant ✅ COMPLETE
**Frontend**: `/reading-assistant`
**Backend**: AI Monolith Service (Python port 8000)
**APIs**:
- ✅ `POST /api/v1/reading/analyse` - Analyze document
- ✅ `POST /api/v1/reading/analyse/stream` - Stream analysis
- ✅ `GET /api/v1/reading/:id` - Get session

### 10. Writing Assistant ✅ COMPLETE
**Frontend**: `/writing-assistant`
**Backend**: AI Monolith Service (Python port 8000)
**APIs**:
- ✅ `POST /api/v1/writing/transcribe` - Speech-to-text
- ✅ `POST /api/v1/writing/notes` - Generate notes
- ✅ `GET /api/v1/writing/history` - Get history

### 11. Notifications ⚠️ PARTIAL
**Frontend**: Settings page (preferences UI only)
**Backend**: Notification Service (Go)
**APIs**:
- ✅ `GET /api/v1/notifications/preferences` - Get preferences
- ✅ `PUT /api/v1/notifications/preferences` - Update preferences
- ⚠️ `POST /api/v1/notifications/devices/register` - Device registration (not implemented)
- ⚠️ `GET /api/v1/notifications/reminders` - Study reminders (not implemented)
- ⚠️ `POST /api/v1/notifications/reminders` - Create reminder (not implemented)

### 12. Sync Service ⚠️ PARTIAL
**Frontend**: `SyncProvider` component
**Backend**: Sync Service (Go)
**APIs**:
- ✅ `GET /api/v1/ws` - WebSocket connection
- ⚠️ `GET /api/v1/sync/state` - Sync state (not implemented)
- ⚠️ `POST /api/v1/sync/ack` - Acknowledge sync (not implemented)
- ⚠️ `GET /api/v1/presence` - Presence (not implemented)

### 13. Goals ⚠️ UI INCOMPLETE
**Frontend**: Dashboard shows goals but no management UI
**Backend**: Analytics Service (Go)
**APIs**: ✅ All APIs exist, need UI for goal management

## Missing Features to Implement

### 1. Notification Preferences (Partial)
The settings page has UI for notifications but needs to connect to real API:
```typescript
// In useSettings.ts, saveNotifications should call:
await notificationApi.updatePreferences(settings);
```

### 2. Privacy Settings (Mock)
Privacy settings in settings page are mocked:
```typescript
// In useSettings.ts, savePrivacy is currently a mock
// Needs privacy API endpoint in backend
```

### 3. Account Deletion (Mock)
Account deletion is mocked:
```typescript
// In useSettings.ts, deleteAccount is currently a mock
// Needs DELETE /api/v1/users/me endpoint
```

### 4. Study Reminders
No UI for managing study reminders:
- Create reminder UI
- List reminders
- Edit/delete reminders

### 5. Goal Management UI
Goals are displayed but cannot be managed:
- Create goal form
- Edit goal
- Delete goal
- Mark goal complete

### 6. Course Management UI
No UI for managing courses:
- Create course
- Edit course
- Delete course
- View course materials

## Testing Integration

1. **Start Backend Services**:
   ```bash
   # Go services
   cd services/gateway && go run cmd/main.go
   cd services/user && go run cmd/main.go
   # ... etc for all services
   
   # Python services
   cd "lexiassist-Python Services"
   docker-compose up
   ```

2. **Verify Health Check**:
   ```bash
   curl http://localhost:8080/health
   ```

3. **Test Frontend**:
   ```bash
   cd Frontend
   npm run dev
   ```

## Common Issues & Solutions

### CORS Errors
Make sure the Gateway has CORS middleware enabled and configured for `http://localhost:3000`.

### WebSocket Connection Fails
The WebSocket URL in `.env.local` must match the Sync Service endpoint:
```
NEXT_PUBLIC_WS_URL=ws://localhost:8080
```

### File Upload Fails
File uploads require multipart/form-data. The `fetchFormData` helper in `api.ts` handles this.

### Token Refresh Loop
If you see infinite token refresh requests, check that the `refresh_token` endpoint is working correctly.

## Next Steps

1. ✅ Connect notification preferences to real API
2. ✅ Create goal management UI
3. ✅ Create course management UI
4. ✅ Add study reminders UI
5. ✅ Implement real privacy settings API
6. ✅ Implement account deletion API
