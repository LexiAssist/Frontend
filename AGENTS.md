# LexiAssist Frontend — Agent Guide

This document contains project-specific context for AI coding agents working on the LexiAssist frontend. Read this first before making any changes.

---

## Project Overview

LexiAssist Frontend is the Next.js-based web application for LexiAssist — an AI-powered learning platform designed to make reading, studying, and writing easier for students who learn differently. It serves as the user-facing interface that communicates with a Go-based backend API gateway.

Key facts:
- **Repository**: `lexiassist-frontend`
- **Framework**: Next.js 16 with App Router
- **Language**: TypeScript 5
- **Styling**: Tailwind CSS 4 with PostCSS
- **UI Components**: Radix UI primitives + custom shadcn/ui-style components
- **State**: Zustand (auth) + TanStack Query (server state)
- **Forms**: React Hook Form + Zod
- **Build Target**: Node.js 20, standalone output for Docker

---

## Technology Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 16.1.6 (App Router) |
| Language | TypeScript 5 |
| React | 19.2.3 (with React Compiler enabled) |
| Styling | Tailwind CSS 4.0 |
| UI Primitives | Radix UI (extensive set: dialog, dropdown, select, tabs, etc.) |
| Animation | Framer Motion |
| Icons | Lucide React |
| State (Client) | Zustand 5 (with persist middleware) |
| State (Server) | TanStack Query (React Query) 5 |
| Forms | React Hook Form + Zod 4 |
| HTTP Client | Native `fetch` API (custom wrapper with token refresh) |
| WebSocket | Custom WebSocket client (`src/services/websocket.ts`) |
| Testing | Vitest 4 + React Testing Library + jsdom |
| Linting | ESLint 9 with `eslint-config-next` |
| Database ORM | Prisma 6 (minimal use — waitlist only) |
| Mail | Nodemailer (server-side) |

---

## Build and Development Commands

All commands use `npm`:

```bash
# Development server (Turbopack by default in Next.js 16)
npm run dev

# Production build
npm run build

# Start production server (requires build first)
npm run start

# Type checking (no emit)
npm run type-check

# Linting
npm run lint

# Testing
npm run test          # Run vitest in watch mode
npm run test:run      # Run vitest once (CI)
npm run test:unit     # Unit tests: src/lib + src/services
npm run test:integration  # Integration tests: src/app

# Database (Prisma)
npm run db:generate   # Generate Prisma client
npm run db:push       # Push schema changes
npm run db:studio     # Open Prisma Studio
npm run db:migrate    # Run migrations in dev
```

---

## Environment Variables

Create `.env.local` in the project root. All `NEXT_PUBLIC_*` variables are required at build time and exposed to the client. Server-only variables are never exposed.

| Variable | Scope | Required | Description |
|----------|-------|----------|-------------|
| `NEXT_PUBLIC_API_GATEWAY_URL` | Public | Yes | Backend API base URL (e.g., `http://localhost:8080`) |
| `NEXT_PUBLIC_AI_PROXY_URL` | Public | Yes | AI service proxy URL (often same as gateway) |
| `NEXT_PUBLIC_WS_URL` | Public | Yes | WebSocket URL for real-time sync (e.g., `ws://localhost:8080/api/v1/sync`) |
| `NEXT_PUBLIC_INGESTION_URL` | Public | Yes | Document ingestion service URL |
| `NEXT_PUBLIC_USE_MOCK_API` | Public | No | Set to `true` to use mock data instead of real backend |
| `NEXT_PUBLIC_MOCK_MODE` | Public | No | Alias for `NEXT_PUBLIC_USE_MOCK_API` |
| `DATABASE_URL` | Server | No | PostgreSQL connection string (only for Prisma/waitlist) |
| `NODE_ENV` | Server | Auto | `development` / `production` / `test` |

Validation: All public variables are validated at runtime using Zod in `src/env.ts`. The app will throw on startup if required variables are missing or malformed.

---

## Project Structure

```
lexiassist-frontend/
├── src/
│   ├── app/                     # Next.js App Router
│   │   ├── (auth)/              # Auth layout group (login, register, forgot-password, etc.)
│   │   ├── (main)/              # Protected layout group (dashboard, features)
│   │   │   ├── _components/     # Layout-level components (Sidebar)
│   │   │   ├── dashboard/
│   │   │   ├── chat-assistant/
│   │   │   ├── quizzes/
│   │   │   ├── flashcards/
│   │   │   ├── reading-assistant/
│   │   │   ├── writing-assistant/
│   │   │   ├── text-to-speech/
│   │   │   ├── materials/
│   │   │   ├── goals/
│   │   │   └── settings/
│   │   ├── api/                 # Next.js API routes (proxies to backend)
│   │   ├── waitlist/            # Public waitlist page
│   │   ├── page.tsx             # Landing page (public)
│   │   ├── layout.tsx           # Root layout
│   │   ├── globals.css          # Global styles + CSS variables
│   │   ├── error.tsx            # Error boundary
│   │   └── not-found.tsx        # 404 page
│   ├── components/
│   │   ├── ui/                  # shadcn/ui components (Button, Card, Dialog, etc.)
│   │   ├── auth/                # Auth-specific components
│   │   ├── chat/                # Chat assistant components
│   │   ├── landing/             # Landing page sections
│   │   ├── providers/           # Context providers (QueryProvider, ThemeProvider, TokenRefreshProvider)
│   │   └── [feature]/           # Feature-specific components
│   ├── hooks/                   # Custom React hooks
│   │   ├── useAuth.ts           # Auth mutations/queries
│   │   ├── useCourses.ts
│   │   ├── useQuizzes.ts
│   │   ├── useFlashcards.ts
│   │   ├── useAI.ts
│   │   ├── useAnalytics.ts
│   │   └── useSync.ts
│   ├── services/                # API service layer
│   │   ├── http.ts              # HTTP client (fetch wrapper with token refresh)
│   │   ├── api.ts               # Typed API functions
│   │   ├── tokenManager.ts      # Singleton token refresh manager
│   │   ├── websocket.ts         # WebSocket client
│   │   └── mockApi.ts           # Mock data for development
│   ├── store/
│   │   └── authStore.ts         # Zustand auth store (persisted to localStorage)
│   ├── types/
│   │   ├── index.ts             # Shared TypeScript types (User, Course, Quiz, etc.)
│   │   ├── errors.ts            # Error type definitions
│   │   └── global.d.ts          # Global type declarations
│   ├── lib/                     # Utilities
│   │   ├── utils.ts             # cn(), formatDate(), debounce(), etc.
│   │   ├── errorHandler.ts      # APIError class, user-friendly error messages
│   │   ├── sanitize.ts          # HTML sanitization helpers
│   │   ├── db.ts                # Prisma client singleton
│   │   ├── mailer.ts            # Server-side email helper
│   │   └── mockApi.ts           # Mock API utilities
│   └── env.ts                   # Environment variable validation (Zod schema)
├── prisma/
│   └── schema.prisma            # Database schema (WaitlistEntry only)
├── public/                      # Static assets
│   ├── images/
│   ├── landing/
│   └── icon/                    # 798 SVG icons
├── __tests__/                   # Test utilities
│   └── test-utils.ts            # QueryClient test helpers
├── vitest.setup.ts              # Vitest setup: mocks for Next.js, env, browser APIs
├── middleware.ts                # Next.js middleware: route protection + AI proxy headers
├── next.config.ts               # Next.js config: rewrites, CSP headers, standalone output
└── package.json
```

### Path Aliases

The `tsconfig.json` defines `@/*` → `./src/*`. Always use aliases for internal imports:

```typescript
import { Button } from '@/components/ui/Button';
import { useAuthStore } from '@/store/authStore';
import { env } from '@/env';
```

---

## Authentication Architecture

Auth is **client-side first** because JWT tokens are stored in `localStorage` via Zustand persist, which is inaccessible to Next.js middleware.

### Token Storage
- **Access token**: **Memory only** (Zustand state, excluded from persist). On page reload, `initializeAuth()` uses the persisted refreshToken to acquire a new accessToken automatically.
- **Refresh token**: `localStorage` (via Zustand persist). **Requires backend httpOnly cookie support for true security.** See migration note below.
- **User**: `localStorage` (via Zustand persist). Includes `id` required for AI endpoints.

### Flow
1. **Middleware** (`middleware.ts`) marks protected routes but cannot validate tokens server-side.
2. **Main layout** (`src/app/(main)/layout.tsx`) checks `isAuthenticated` client-side and redirects to `/login?redirect=...` if not authenticated.
3. **TokenRefreshProvider** initializes proactive token refresh on app mount.
4. **TokenManager** (singleton) handles:
   - Proactive refresh 2 minutes before expiry
   - Request deduplication (only one refresh at a time)
   - Queueing API requests during refresh
   - 401 retry with fresh token (once)

### Emergency Logout
A global `window.clearAuth()` function is available for emergency auth clearing (attached in `authStore.ts`). There is also `public/emergency-logout.html` for catastrophic failure scenarios.

---

## API Integration Patterns

### HTTP Client (`src/services/http.ts`)

Uses native `fetch` (not Axios). Two clients are exported:

- `apiClient` / `http.*` — Standard 30s timeout for regular API calls
- `aiClient` / `aiHttp.*` — 5-minute timeout for AI endpoints

All methods unwrap the `ApiResponse<T>` wrapper to return `.data` directly.

```typescript
import { http, aiHttp } from '@/services/http';

// Regular API
const courses = await http.get<Course[]>('/courses');

// AI endpoint (long timeout)
const result = await aiHttp.post<AIResponse>('/ai/chat', { message });
```

### API Routes (`src/app/api/`)

Next.js API routes proxy unmatched paths to the Go backend. The `next.config.ts` configures rewrites:

```
/api/v1/*  →  {NEXT_PUBLIC_API_GATEWAY_URL}/api/v1/*
/health     →  {NEXT_PUBLIC_API_GATEWAY_URL}/health
```

Some routes have dedicated Next.js handlers for server-side logic (e.g., waitlist with Prisma, AI proxy with custom headers).

### Rate Limits
- Standard endpoints: 100 req/min
- AI endpoints: 20 req/min
- On `429`, check `Retry-After` header (or `X-RateLimit-Reset`) and show wait state

---

## Styling Conventions

### Tailwind CSS 4

Uses `@tailwindcss/postcss` plugin. No `tailwind.config.ts` file — theming is done via CSS variables in `src/app/globals.css`.

### Color Palette

The project uses a custom green primary palette:

| Token | Value | Usage |
|-------|-------|-------|
| `--primary-500` | `#3c8350` | Primary brand color |
| `--primary-600` | `#377749` | Hover state |
| `--primary-50` | `#ecf3ee` | Light backgrounds |
| `--bg-page` | `#F8FAF9` | Page background |

shadcn/ui CSS variables are mapped to this palette (`--primary: 130 35% 35%`).

### Utility Function

Always use `cn()` from `@/lib/utils` for conditional class merging:

```tsx
import { cn } from '@/lib/utils';

className={cn(
  'base-class',
  isActive && 'active-class',
  className
)}
```

### Responsive Breakpoints

Mobile-first approach. Key breakpoints:
- `sm:` — 640px
- `md:` — 768px
- `lg:` — 1024px
- `xl:` — 1280px

The main layout sidebar is hidden on mobile (`lg:` breakpoint) and replaced with a bottom navigation.

### Safe Areas

iOS safe area insets are supported:
```css
padding-top: env(safe-area-inset-top);
padding-bottom: env(safe-area-inset-bottom);
```

---

## Component Conventions

### UI Components (`src/components/ui/`)

Built on Radix UI primitives with Tailwind. Key patterns:
- Components use `forwardRef` where appropriate
- Variants use `class-variance-authority` (CVA) in some components
- Props extend the underlying Radix primitive types
- All components are exported from `src/components/ui/index.ts`

### Feature Components

Feature-specific components live in `src/components/[feature]/` or co-located in `src/app/(main)/[feature]/`.

### Custom Hooks

All data fetching goes through custom hooks in `src/hooks/` that wrap TanStack Query:

```typescript
// Pattern: useFeature.ts
export function useCourses() {
  return useQuery({
    queryKey: ['courses'],
    queryFn: () => courseApi.getAll(),
  });
}
```

---

## Testing Strategy

### Test Runner: Vitest

Configuration is in `vitest.setup.ts` (mocks) and inferred from `package.json` scripts.

### Mock Setup (`vitest.setup.ts`)

The setup file mocks:
- `@/env` — Returns test-safe environment variables
- `next/image` → `<img>`
- `next/link` → `<a>`
- `next/navigation` — Returns mocked router functions
- `next/font/google` — Returns mock font objects
- Browser APIs: `IntersectionObserver`, `matchMedia`, `scrollTo`

### Test Utilities (`src/__tests__/test-utils.ts`)

Provides `createTestQueryClient()`, `createQueryWrapper()`, and `setupQueryTest()` for consistent React Query testing.

### Test Organization

```
src/lib/__tests__/          # Unit tests for utilities
src/services/__tests__/     # Unit tests for HTTP client
src/app/(main)/[feature]/__tests__/  # Integration tests per feature
```

### Writing Tests

```typescript
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { setupQueryTest } from '@/__tests__/test-utils';

describe('Feature', () => {
  it('should render', () => {
    const { wrapper } = setupQueryTest();
    render(<MyComponent />, { wrapper });
    expect(screen.getByText('Hello')).toBeInTheDocument();
  });
});
```

### Running Tests

```bash
npm run test:unit        # Fast: src/lib + src/services
npm run test:integration # Slower: src/app (render tests)
npm run test:run         # All tests, CI mode
```

---

## Security Considerations

### Content Security Policy

`next.config.ts` sets strict CSP headers. Development allows `'unsafe-eval'` (required by React dev). Production is stricter:

```
default-src 'self'
script-src 'self' 'unsafe-inline'
style-src 'self' 'unsafe-inline'
img-src 'self' data: blob: https:
connect-src 'self' https://*.lexiassist.com wss://*.lexiassist.com
frame-ancestors 'none'
```

### Security Headers

All routes get:
- `X-Frame-Options: DENY`
- `X-Content-Type-Options: nosniff`
- `Referrer-Policy: strict-origin-when-cross-origin`
- `X-XSS-Protection: 1; mode=block`
- `Permissions-Policy: camera=(), microphone=(self), geolocation=()`
- `Strict-Transport-Security` (production only)

### Authentication Security

- **Access token**: Memory-only (not persisted). Survives only for the current session. Prevents token theft from closed tabs or localStorage-scanning browser extensions.
- **Refresh token**: Persisted in `localStorage`. This is a pragmatic fallback — true security requires backend httpOnly cookie support, which the current backend does not yet provide. Once the backend sets `refresh_token` as an httpOnly cookie, remove it from Zustand `partialize`.
- Automatic token refresh happens proactively 2 minutes before expiry
- On 401, the app attempts one silent refresh before redirecting to login
- `logout()` disconnects WebSocket first, then clears state, then calls API with 2s timeout

### Backend Migration: httpOnly Refresh Token

When the backend supports httpOnly cookies:
1. Remove `refreshToken` from `partialize` in `src/store/authStore.ts`
2. Update `refreshAccessToken()` to not send the token in the request body
3. The browser will automatically include the httpOnly cookie on `/auth/refresh` requests

### File Uploads

- Allowed types: `.pdf`, `.txt`, `.docx`
- Uploads use `FormData` via `XMLHttpRequest` for progress tracking
- Never set `Content-Type` manually on multipart requests

### Input Sanitization

HTML content from AI responses is sanitized using `isomorphic-dompurify` before rendering.

---

## Error Handling

### APIError Class (`src/lib/errorHandler.ts`)

```typescript
class APIError extends Error {
  statusCode?: number;
  code?: string;
  errors?: Record<string, string[]>;
  retryAfter?: number;
}
```

### Patterns

1. **HTTP client** throws `APIError` with user-friendly messages mapped from status codes
2. **Hooks** can re-throw errors for components to handle
3. **Components** display toast notifications via `sonner` or inline error states
4. **Error boundaries** (`error.tsx`, `global-error.tsx`) catch React rendering errors

### Status Code Messages

Common mappings:
- `400` → "Invalid request. Please check your input."
- `401` → "Session expired. Please log in again."
- `403` → "You don't have permission to do this."
- `404` → "Resource not found."
- `429` → "Too many requests. Please wait X seconds."
- `500` → "Something went wrong. Please try again later."
- Network errors → "Network error. Please check your connection."

---

## Deployment

### Docker

Multi-stage Dockerfile:
1. `deps` — Install production dependencies
2. `builder` — Full build with `output: 'standalone'`
3. `runner` — Minimal image with non-root user (`nextjs:nodejs`)

Build:
```bash
docker build -t lexiassist-frontend .
docker run -p 3000:3000 -e NEXT_PUBLIC_API_GATEWAY_URL=... lexiassist-frontend
```

### Docker Compose

`docker-compose.yml` includes the frontend service and commented templates for the Go backend and PostgreSQL database.

### CI/CD (GitHub Actions)

`.github/workflows/CI.yml` runs on every push/PR:
1. Checkout
2. Setup Node.js 20
3. `npm ci`
4. `npm run type-check`
5. `npm run test:run`
6. `npm run build`

Required secrets:
- `NEXT_PUBLIC_API_GATEWAY_URL`
- `NEXT_PUBLIC_APP_URL` (defaults to `https://lexiassist.com`)

### Environment-Specific Build Behavior

- `NODE_ENV === 'production'` → Standalone output (self-contained Node.js server)
- `NODE_ENV === 'development'` → Standard Next.js dev server with Turbopack
- `NEXT_PUBLIC_MOCK_MODE=false` is enforced in Docker builds

---

## Data Types and Backend Alignment

The frontend types in `src/types/index.ts` mirror the Go backend with some frontend aliases:

- Backend `first_name` / `last_name` → Frontend also accepts `name` (computed field)
- Backend `created_at` / `updated_at` → Frontend aliases: `createdAt` / `updatedAt`
- Backend `academic_level` → Frontend alias: `level`
- User role: `'student' | 'instructor' | 'admin'`
- Quiz difficulty: `'easy' | 'medium' | 'hard'`
- Material processing status: `'pending' | 'processing' | 'completed' | 'failed'`

Always maintain type alignment with the backend API contract.

---

## WebSocket and Real-Time Sync

- WebSocket URL: `NEXT_PUBLIC_WS_URL`
- Client: `src/services/websocket.ts`
- Context provider: `src/components/SyncProvider.tsx`
- WebSocket disconnects on logout to prevent auth errors
- Reconnection logic is handled in the WebSocket client

---

## Prisma / Database

Prisma is used minimally. The only model is `WaitlistEntry` for the public waitlist page:

```prisma
model WaitlistEntry {
  id    String @id @default(cuid())
  name  String
  email String @unique
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}
```

The main application data lives in the Go backend's PostgreSQL database. Prisma is not used for primary app data.

---

## Common Gotchas

1. **Token storage**: Access token is memory-only (not in localStorage). Refresh token is in localStorage until backend supports httpOnly cookies. Middleware cannot read either. All auth redirects happen client-side in `(main)/layout.tsx`.
2. **AI endpoints return streams**: `/writing/transcribe` returns a `ReadableStream`, not JSON. Do not call `.json()` on it.
3. **Markdown from AI**: `structured_notes` and `summary` fields contain markdown. Use a markdown renderer (e.g., `react-markdown`).
4. **Multipart uploads**: Never set `Content-Type` header manually. Let the browser set the boundary.
5. **Mock mode**: Setting `NEXT_PUBLIC_USE_MOCK_API=true` bypasses the real backend entirely. Ensure it is `false` for production builds.
6. **Turbopack root**: `next.config.ts` sets `turbopack.root: __dirname`. Do not modify this without testing.
7. **React Compiler**: Enabled in `next.config.ts` (`reactCompiler: true`). The Babel plugin `babel-plugin-react-compiler` is installed for this.

---

## Useful References

- `README.md` — Human-facing project docs with feature list and quick start
- `LexiAssist_Frontend_Integration.md` — Backend API integration guide (endpoints, request/response shapes)
- `next.config.ts` — All build-time configuration, rewrites, CSP, image domains
- `src/env.ts` — Environment variable schema and validation
- `vitest.setup.ts` — Test mocks and global setup
