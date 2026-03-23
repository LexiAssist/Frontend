# LexiAssist Routes Documentation

## 📁 Application Routes

### Authentication Routes (Public)
| Route | File | Description | Status |
|-------|------|-------------|--------|
| `/` | `src/app/page.tsx` | Landing page | ✅ Working |
| `/login` | `src/app/(auth)/login/page.tsx` | User login | ✅ Working |
| `/register` | `src/app/(auth)/register/page.tsx` | User registration | ✅ Working |

### Main Application Routes (Protected)
| Route | File | Description | Status |
|-------|------|-------------|--------|
| `/dashboard` | `src/app/(main)/dashboard/page.tsx` | Main dashboard with tool cards | ✅ Working |
| `/text-to-speech` | `src/app/(main)/text-to-speech/page.tsx` | Convert text to speech | ✅ Working |
| `/reading-assistant` | `src/app/(main)/reading-assistant/page.tsx` | AI text summarization | ✅ Working |
| `/writing-assistant` | `src/app/(main)/writing-assistant/page.tsx` | AI writing enhancement | ✅ Working |
| `/chat-assistant` | `src/app/(main)/chat-assistant/page.tsx` | RAG academic chatbot | ✅ Working |
| `/flashcards` | `src/app/(main)/flashcards/page.tsx` | Flashcard study sets | ✅ Working |
| `/quizzes` | `src/app/(main)/quizzes/page.tsx` | Quiz generator & taker | ✅ Working |
| `/materials` | *(Coming soon)* | Course materials library | 🚧 Planned |

### Error Pages
| Route | File | Description | Status |
|-------|------|-------------|--------|
| `*` | `src/app/not-found.tsx` | 404 Not Found page | ✅ Working |
| `*` | `src/app/error.tsx` | General error boundary | ✅ Working |
| `*` | `src/app/global-error.tsx` | Global error handler | ✅ Working |

---

## 🔌 API Routes

### Authentication API
| Method | Route | File | Description | Mock Support |
|--------|-------|------|-------------|--------------|
| GET | `/api/auth/me` | `src/app/api/auth/me/route.ts` | Get current user | ✅ Yes |
| POST | `/api/auth/logout` | `src/app/api/auth/logout/route.ts` | User logout | ✅ Yes |

### AI Services API
| Method | Route | File | Description | Mock Support |
|--------|-------|------|-------------|--------------|
| POST | `/api/ai` | `src/app/api/ai/route.ts` | Generate AI content | ✅ Yes |
| GET | `/api/ai` | `src/app/api/ai/route.ts` | List AI models | ✅ Yes |

### Quiz API
| Method | Route | File | Description | Mock Support |
|--------|-------|------|-------------|--------------|
| GET | `/api/quiz` | `src/app/api/quiz/route.ts` | List all quizzes | ✅ Yes |
| POST | `/api/quiz` | `src/app/api/quiz/route.ts` | Create/submit quiz | ✅ Yes |

### Flashcards API
| Method | Route | File | Description | Mock Support |
|--------|-------|------|-------------|--------------|
| GET | `/api/flashcards` | `src/app/api/flashcards/route.ts` | List study sets | ✅ Yes |
| POST | `/api/flashcards` | `src/app/api/flashcards/route.ts` | Create/generate cards | ✅ Yes |

### Materials API
| Method | Route | File | Description | Mock Support |
|--------|-------|------|-------------|--------------|
| GET | `/api/materials` | `src/app/api/materials/route.ts` | List materials | ✅ Yes |
| POST | `/api/materials` | `src/app/api/materials/route.ts` | Upload material | ✅ Yes |
| DELETE | `/api/materials` | `src/app/api/materials/route.ts` | Delete material | ✅ Yes |

---

## 🧪 Mock API Mode

### Enabling Mock Mode

Mock mode is **currently enabled** in `.env.local`:

```env
NEXT_PUBLIC_USE_MOCK_API=true
NEXT_PUBLIC_MOCK_MODE=true
```

When mock mode is enabled:
- ✅ All API calls return mock data
- ✅ No backend connection required
- ✅ Perfect for frontend development
- ✅ Fast response times

### Disabling Mock Mode (Connect to Real Backend)

To use real backend services:

1. Update `.env.local`:
```env
NEXT_PUBLIC_USE_MOCK_API=false
NEXT_PUBLIC_API_GATEWAY_URL=http://your-backend-url:8080
NEXT_PUBLIC_AI_PROXY_URL=http://your-ai-service:8000
```

2. Restart the development server:
```bash
npm run dev
```

### Mock Data Available

The mock API provides:
- **User**: Mock authenticated user (Alex Johnson)
- **Quizzes**: 2 sample quizzes with questions
- **Study Sets**: 2 sets with flashcards (Biology, History)
- **Materials**: 3 sample course materials
- **AI Responses**: Generated responses for all AI types

---

## 📊 Route Group Structure

```
src/app/
├── (auth)/                    # Auth route group (no sidebar)
│   ├── layout.tsx
│   ├── login/
│   │   └── page.tsx
│   └── register/
│       └── page.tsx
├── (main)/                    # Main app route group (with sidebar)
│   ├── layout.tsx
│   ├── _components/
│   │   └── Sidebar.tsx        # Green sidebar component
│   ├── dashboard/
│   │   └── page.tsx           # Figma-style dashboard
│   ├── text-to-speech/
│   │   └── page.tsx
│   ├── reading-assistant/
│   │   └── page.tsx
│   ├── writing-assistant/
│   │   └── page.tsx
│   ├── chat-assistant/
│   │   └── page.tsx
│   ├── flashcards/
│   │   └── page.tsx
│   └── quizzes/
│       └── page.tsx
├── api/                       # API routes
│   ├── ai/
│   ├── auth/
│   ├── quiz/
│   ├── flashcards/
│   └── materials/
├── page.tsx                   # Landing page
├── layout.tsx                 # Root layout
├── error.tsx                  # Error boundary
├── not-found.tsx              # 404 page
└── globals.css                # Global styles
```

---

## 🚀 Quick Start Commands

```bash
# Install dependencies
npm install

# Run with mock API (default)
npm run dev

# Build for production
npm run build

# Start production server
npm start
```

---

## 📝 Environment Variables

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `NEXT_PUBLIC_USE_MOCK_API` | No | `true` | Enable mock API mode |
| `NEXT_PUBLIC_MOCK_MODE` | No | `true` | Alternative mock flag |
| `NEXT_PUBLIC_API_GATEWAY_URL` | Yes* | `http://localhost:8080` | Backend API URL |
| `NEXT_PUBLIC_AI_PROXY_URL` | Yes* | `http://localhost:8000` | AI service URL |

*Required when mock mode is disabled
