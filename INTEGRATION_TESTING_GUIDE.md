# LexiAssist Frontend-Backend Integration Testing Guide

## Quick Start

### 1. Start All Backend Services

#### Go Microservices (Terminal 1-6)
```bash
# Terminal 1 - Gateway (Port 8080)
cd services/gateway
go run cmd/main.go

# Terminal 2 - User Service (Port 8081)
cd services/user
go run cmd/main.go

# Terminal 3 - Content Service (Port 8082)
cd services/content
go run cmd/main.go

# Terminal 4 - Analytics Service (Port 8083)
cd services/analytics
go run cmd/main.go

# Terminal 5 - Notification Service (Port 8084)
cd services/notification-service
go run main.go

# Terminal 6 - Sync Service (Port 8085)
cd services/sync-service
go run main.go
```

#### Python Microservices (Docker Compose)
```bash
cd "lexiassist-Python Services"
docker-compose up
```

Or run individually:
```bash
# AI Orchestrator (Port 8001)
cd "lexiassist-Python Services/services/orchestrator"
python main.py

# Audio Service (Port 8002)
cd "lexiassist-Python Services/services/audio"
python main.py

# Other services...
```

### 2. Verify Backend Health
```bash
curl http://localhost:8080/health
```

Expected response:
```json
{
  "service": "gateway",
  "status": "healthy",
  "upstream": {
    "user": "healthy",
    "content": "healthy",
    "analytics": "healthy",
    "notification": "healthy",
    "sync": "healthy",
    "ai": "healthy"
  }
}
```

### 3. Start Frontend
```bash
cd Frontend
npm install  # If not already installed
npm run dev
```

Frontend will be available at: `http://localhost:3000`

## Feature Testing Checklist

### Authentication ✅
- [ ] **Register** - Create a new account at `/register`
- [ ] **Email Verification** - Verify email with code
- [ ] **Login** - Log in at `/login`
- [ ] **Forgot Password** - Request password reset
- [ ] **Reset Password** - Reset password with token
- [ ] **Logout** - Logout from account

### Dashboard ✅
- [ ] **Study Stats** - Shows study streak, time, quizzes, materials
- [ ] **Topic Mastery** - Displays topic progress bars
- [ ] **Recent Flashcards** - Shows latest flashcard decks
- [ ] **Recent Quizzes** - Shows latest quizzes

### Chat Assistant ✅
- [ ] **Send Message** - Type and send a message
- [ ] **File Upload** - Upload PDF, DOC, TXT files
- [ ] **Folder Upload** - Upload entire folder
- [ ] **AI Response** - Receive AI-generated response
- [ ] **Streaming** - Toggle streaming mode
- [ ] **New Chat** - Start a new conversation

### Flashcards ✅
- [ ] **Upload Document** - Upload file to generate flashcards
- [ ] **Text Input** - Paste text to generate flashcards
- [ ] **Generate Flashcards** - AI generates flashcards
- [ ] **Flip Cards** - Click to flip between front/back
- [ ] **Navigate Cards** - Previous/Next buttons
- [ ] **Save Deck** - Save generated flashcards to backend

### Quizzes ✅
- [ ] **List Quizzes** - View all quizzes
- [ ] **Create Quiz** - Create a new quiz
- [ ] **Generate from Content** - AI generates quiz from text
- [ ] **Start Quiz** - Begin a quiz attempt
- [ ] **Answer Questions** - Submit answers
- [ ] **Complete Quiz** - Finish and see results

### Reading Assistant ✅
- [ ] **Upload Document** - Upload PDF/DOC for analysis
- [ ] **Text Analysis** - AI simplifies/explains text
- [ ] **Vocabulary Help** - Get definitions for difficult words
- [ ] **Text-to-Speech** - Listen to simplified text
- [ ] **Focus Mode** - Distraction-free reading
- [ ] **Font Options** - Change fonts for readability

### Text-to-Speech ✅
- [ ] **Upload Document** - Upload text file
- [ ] **Paste Text** - Direct text input
- [ ] **Voice Selection** - Choose voice/language
- [ ] **Speed Control** - Adjust reading speed
- [ ] **Play/Pause** - Control playback
- [ ] **Word Highlighting** - See current word highlighted

### Writing Assistant ✅
- [ ] **Voice Recording** - Record speech
- [ ] **Transcription** - Convert speech to text
- [ ] **Note Generation** - Structure raw text into notes
- [ ] **History** - View previous writing sessions

### Settings ✅
- [ ] **Profile Update** - Change name, school, department
- [ ] **Notification Preferences** - Toggle email/push notifications
- [ ] **Change Password** - Update password
- [ ] **Session Management** - View and revoke active sessions
- [ ] **Logout All** - Logout from all devices

## API Endpoint Testing

### Auth Endpoints
```bash
# Register
curl -X POST http://localhost:8080/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123","first_name":"Test","last_name":"User"}'

# Login
curl -X POST http://localhost:8080/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}'

# Get Profile (requires auth token)
curl http://localhost:8080/api/v1/users/me \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Content Endpoints
```bash
# List Courses
curl http://localhost:8080/api/v1/courses \
  -H "Authorization: Bearer YOUR_TOKEN"

# List Materials
curl http://localhost:8080/api/v1/materials \
  -H "Authorization: Bearer YOUR_TOKEN"

# List Quizzes
curl http://localhost:8080/api/v1/quizzes \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Analytics Endpoints
```bash
# Study Stats
curl http://localhost:8080/api/v1/analytics/study-stats \
  -H "Authorization: Bearer YOUR_TOKEN"

# Study Streak
curl http://localhost:8080/api/v1/analytics/study-streak \
  -H "Authorization: Bearer YOUR_TOKEN"

# Goals
curl http://localhost:8080/api/v1/analytics/goals \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### AI Endpoints
```bash
# Chat
curl -X POST http://localhost:8080/api/v1/ai/chat \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"query":"Explain quantum mechanics","user_id":"YOUR_USER_ID"}'

# Retrieve Context (RAG)
curl -X POST http://localhost:8080/api/v1/ai/retrieve \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"query":"quantum mechanics","user_id":"YOUR_USER_ID","top_k":5}'
```

## Troubleshooting

### CORS Errors
If you see CORS errors in the browser console:
1. Check Gateway CORS configuration
2. Ensure `NEXT_PUBLIC_API_GATEWAY_URL` matches the Gateway URL
3. Verify the Gateway allows `http://localhost:3000`

### WebSocket Connection Failed
1. Check Sync Service is running on port 8085
2. Verify `NEXT_PUBLIC_WS_URL=ws://localhost:8080` in `.env.local`
3. Check browser console for specific error messages

### File Upload Fails
1. Verify Content Service is running
2. Check MinIO is accessible (if used for storage)
3. Ensure file size is under limit (25MB)
4. Check browser Network tab for specific error

### AI Response Errors
1. Verify AI Orchestrator is running
2. Check Python services logs
3. Ensure document was successfully ingested before querying

### Authentication Errors
1. Check User Service is running
2. Verify JWT token is not expired
3. Check token refresh is working
4. Ensure `Authorization: Bearer TOKEN` header is present

## Environment Variables

Ensure `.env.local` has these values:
```env
# Disable Mock Mode - Connect to Real Backend
NEXT_PUBLIC_USE_MOCK_API=false
NEXT_PUBLIC_MOCK_MODE=false

# API Gateway URL (Go Backend)
NEXT_PUBLIC_API_GATEWAY_URL=http://localhost:8080

# AI Service URL (Route through Gateway for security)
NEXT_PUBLIC_AI_PROXY_URL=http://localhost:8080

# WebSocket URL for Real-Time Sync
NEXT_PUBLIC_WS_URL=ws://localhost:8080
```

## Integration Verification

Run this in browser console to verify integration:
```javascript
// Check API connection
fetch('/health')
  .then(r => r.json())
  .then(data => console.log('✅ Backend connected:', data))
  .catch(e => console.error('❌ Backend connection failed:', e));

// Check auth state
const token = localStorage.getItem('access_token');
console.log(token ? '✅ User authenticated' : '❌ No auth token');
```

## Next Steps After Testing

1. **All tests passing?** ✅ The integration is complete!
2. **Some tests failing?** Check the troubleshooting section
3. **Need new features?** Refer to `INTEGRATION_STATUS.md` for planned features
