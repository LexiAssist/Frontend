# LEXIASSIST PRODUCTION AUDIT REPORT
## Status: BUILD FAILURE - NOT DEPLOYABLE

**Audited by:** Staff Engineer (Mentor Review)  
**Date:** 2026-05-08  
**Application:** LexiAssist Frontend (Next.js 16.1.6 + React 19.2.3 + TypeScript 5.x)  
**Result:** CRITICAL. This codebase is not production-ready. It fails build, fails type-check, and contains 178 ESLint errors across 84+ files. The architecture is leaking concerns, TypeScript is effectively disabled via `any`, and React 19 purity rules are being violated in multiple locations.

---

## 1. BUILD & TYPE SYSTEM FAILURES (CRITICAL)

### 1.1 TypeScript Compilation: FAILED
```
.next/types/validator.ts: Type '"/forgot-password"' does not satisfy constraint '"/"'.
```
**Root Cause:** Your `app` directory structure contains route groups and parallel routes that are confusing Next.js 16's built-in type validator. The generated `validator.ts` is inferring a constrained route type that only accepts `"/"`, which means you likely have a malformed route group (e.g., `(main)`) or a conflicting `page.tsx`/`layout.tsx` type export somewhere that is pinning the route segment type incorrectly.

**Why this breaks scaling:** When Next.js generates types, it builds a union of all valid routes. If one route segment is incorrectly typed, it poisons the entire router's type safety. Every `Link` component, every `useRouter` call, and every server action that references routes becomes a type error. Your entire routing layer is untyped.

### 1.2 Production Build: FAILED
```
Error occurred prerendering page "/sitemap.xml"
Error: NEXT_PUBLIC_APP_URL is required to generate sitemap
```
**Root Cause:** The sitemap route is throwing at build time because `NEXT_PUBLIC_APP_URL` is missing from the build environment. This is a hard crash during static generation.

**Why this is unacceptable:** A production build must be deterministic and environment-agnostic for static assets. The sitemap should gracefully degrade or use a build-time fallback. Crashing the entire build because one env var is missing is fragile pipeline design.

### 1.3 ESLint: 178 ERRORS, 86 WARNINGS
| Category | Count | Severity |
|----------|-------|----------|
| `@typescript-eslint/no-explicit-any` | ~120 | ERROR |
| `react-hooks/set-state-in-effect` | 4 | ERROR |
| `react-hooks/purity` | 2 | ERROR |
| `react-hooks/exhaustive-deps` | 4 | WARNING |
| `@typescript-eslint/no-unused-vars` | ~70 | WARNING/ERROR |
| `react/no-unescaped-entities` | 4 | ERROR |

**Verdict:** Your CI pipeline would reject this immediately. No deploy.

---

## 2. TYPE SYSTEM SABOTAGE: THE `any` EPIDEMIC

You have **explicit `any` types in 47+ locations**. This is not "loose typing." This is TypeScript being disabled.

### Worst Offenders:
- `src/services/api.ts` (4 instances) - Your entire API boundary is untyped
- `src/hooks/useAuth.ts` (10 instances) - Authentication errors are `any`
- `src/hooks/useNotifications.ts` (6 instances) 
- `src/hooks/useQuizzes.ts` (5 instances)
- `src/hooks/useAnalytics.ts` (3 instances)
- `src/app/api/**/route.ts` (25+ instances across API routes) - Server-side error handling is `any`
- `src/types/global.d.ts` (11 instances) - Your global type declarations use `any`

### The Architectural Damage:
When you type `catch (error: any)`, you lose:
1. **Exhaustive error handling** - You can't discriminate between Axios timeout, HTTP 400, 401, 500, or network failure
2. **IDE autocomplete** - No intellisense on error properties
3. **Refactoring safety** - Change an error shape and nothing breaks at compile time
4. **Runtime type guards** - You're assuming `error.message` exists. It might not.

**React 19 Specific:** React 19 has stricter purity rules. `Date.now()` and `Math.random()` inside component render or `useMemo` without dependencies now trigger ESLint errors (`react-hooks/purity`). You have both:
- `src/app/(main)/quizzes/page.tsx:277` - `Date.now()` in `useState` initializer
- `src/components/ui/sidebar.tsx:610` - `Math.random()` in `useMemo`

**Why this is bad:** React 19's compiler (which you've enabled with `reactCompiler: true`) assumes components are pure. Impure functions in render produce unstable results across re-renders, breaking memoization and potentially causing infinite render loops when the compiler optimizes your code.

---

## 3. REACT LIFECYCLE VIOLATIONS: SETSTATE IN EFFECT BODIES

You have **4 instances** of synchronous `setState` calls inside `useEffect` bodies. This is a cascading render anti-pattern.

### Locations:
1. `src/app/(main)/layout.tsx:26` - `setIsChecking(false)` in auth check effect
2. `src/app/(main)/settings/page.tsx:301` - `setSettings(...)` when notificationSettings changes
3. `src/hooks/useMockMode.ts:27` - `setIsMockModeEnabled(...)` reading localStorage
4. `src/hooks/useSync.ts:76` - `setIsConnected(false)` in WebSocket effect

### The Native Thread / React Mechanic:
React effects run **after** commit. When you call `setState` synchronously inside an effect, React must:
1. Finish the current render pass
2. Run the effect
3. Detect state change
4. Queue another render
5. Re-run the component

This is not "two renders." It's a **cascading render chain**. In concurrent mode (React 18+), this can trigger priority inversions where React interrupts higher-priority updates to handle your low-priority state sync. On mobile WebViews (which React Native uses), this manifests as janky transitions and dropped frames.

### The Fix Pattern:
Use **derived state** or **event handlers** instead:
```typescript
// BAD - causes cascading render
useEffect(() => {
  if (notificationSettings) {
    setSettings(notificationSettings); // Triggers second render
  }
}, [notificationSettings]);

// GOOD - derive at render time
const settings = useMemo(() => ({
  emailNotifications: notificationSettings?.emailNotifications ?? true,
  // ...
}), [notificationSettings]);

// Or use a layout effect if you MUST sync (rare)
useLayoutEffect(() => {
  // Only for DOM measurements that must be sync
}, []);
```

---

## 4. SEPARATION OF CONCERNS: ARCHITECTURE IS LEAKING

### 4.1 Service Layer Imports Store
`src/services/api.ts` imports `useAuthStore` (a Zustand hook) and `wsClient`.

**Violation:** Service functions are no longer pure HTTP clients. They have a hard dependency on your global state implementation. This means:
- You can't test API functions in isolation without mocking Zustand
- You can't reuse the API layer in a different context (e.g., SSR without a store)
- Circular dependencies are likely (store -> api -> store)

**Correct Architecture:**
```typescript
// services/api.ts - PURE, no store imports
export async function fetchWithAuth(
  url: string, 
  options?: RequestInit,
  getToken?: () => Promise<string | null>  // Injected dependency
): Promise<Response> { ... }

// hooks/useAuth.ts - COMPOSITION layer
import { fetchWithAuth } from '@/services/api';
import { useAuthStore } from '@/store/authStore';

export function useApiClient() {
  const token = useAuthStore(s => s.token);
  return {
    fetch: (url: string, opts?: RequestInit) => 
      fetchWithAuth(url, opts, () => token)
  };
}
```

### 4.2 Mock API Lives in `lib/`
`src/lib/mockApi.ts` is a UI-level mock. It should be in `src/services/` or `src/mocks/` and injected via MSW (Mock Service Worker) or at the service boundary, not imported directly by components.

### 4.3 Hooks Do Error Parsing (Badly)
Every hook (`useAuth.ts`, `useQuizzes.ts`, `useNotifications.ts`, etc.) has identical `onError: (error: any) => { showToast(error.message || 'Failed'); }` patterns.

**Violation:** Error classification belongs in the **service layer**. The UI should receive a typed, discriminated union:
```typescript
type ApiError = 
  | { type: 'network'; message: string; retryable: true }
  | { type: 'validation'; message: string; fields: Record<string, string[]> }
  | { type: 'auth'; message: string; action: 'login' | 'refresh' }
  | { type: 'server'; message: string; status: number; retryable: boolean };
```

---

## 5. DEFENSIVE PROGRAMMING: COMPLETELY ABSENT

### 5.1 Error Objects Are Never Parsed
Example from `src/services/api.ts`:
```typescript
try {
  // ... API call
} catch (e) {
  // e is any. No instanceof checks. No Axios error discrimination.
}
```

**What happens in production:**
- Axios timeout throws an `AxiosError` with `code: 'ECONNABORTED'`. Your code shows `undefined` because `e.message` doesn't exist on the shape you assumed.
- A 500 error from your Go backend returns HTML (e.g., nginx error page). `response.json()` throws, and your `catch` receives a SyntaxError, not an HTTP error.
- Network offline throws a generic `TypeError: fetch failed`. Your toast shows `[object Object]` or `undefined`.

### 5.2 No Input Sanitization at API Boundaries
I see `isomorphic-dompurify` in dependencies, but no evidence it's systematically applied to user-generated content before rendering.

### 5.3 Prisma in Frontend
You have `@prisma/client` and `pg` in **dependencies**, and `src/lib/db.ts` instantiates a Prisma client. This is a Next.js app, so `db.ts` is likely used in API routes, but having Prisma in the frontend dependency tree is a supply chain risk and bloats the bundle.

---

## 6. ENVIRONMENT & CONFIGURATION ISSUES

### 6.1 next.config.ts Rewrites Throw at Build Time
```typescript
async rewrites() {
  const apiUrl = process.env.NEXT_PUBLIC_API_GATEWAY_URL;
  if (!apiUrl) {
    throw new Error('NEXT_PUBLIC_API_GATEWAY_URL is required but not set');
  }
  // ...
}
```

**Problem:** `NEXT_PUBLIC_` vars are inlined at build time. If this is missing, the build crashes. However, `next.config.ts` rewrites run at build time for static generation, but this is also evaluated at runtime. For a Docker deployment, you might want runtime config, but Next.js rewrites are build-time only.

### 6.2 CSP `unsafe-inline` in Production
Your production CSP includes `script-src 'self' 'unsafe-inline'`. This defeats XSS protection. Next.js 16 requires `unsafe-inline` for its inline scripts unless you use a nonce or hash-based CSP. You should be generating nonces in middleware.

### 6.3 Missing `images.remotePatterns` Validation
The `images.remotePatterns` IIFE silently swallows invalid URLs with `catch { /* ignore */ }`. A malformed `NEXT_PUBLIC_CDN_URL` fails silently, breaking all image loading with no build-time warning.

---

## 7. COMPONENT & UI ANTI-PATTERNS

### 7.1 Unused Imports Everywhere
70+ instances of unused imports. This bloats bundle size (tree-shaking helps, but not in dev) and signals poor code hygiene. Examples:
- `LoadingState` imported but never used in dashboard, flashcards
- `useCallback` imported but never used in quizzes, writing-assistant
- Icon imports (`Trophy`, `Clock`, `BookOpen`, `Flame`) unused in GoalsManager

### 7.2 Inline Styles / Hardcoded Values
While not as prevalent as other issues, the `Card.tsx` component declares an empty interface:
```typescript
interface CardProps extends React.HTMLAttributes<HTMLDivElement> {}
```
This is flagged by ESLint (`no-empty-object-type`). Just use `React.HTMLAttributes<HTMLDivElement>` directly or add actual props.

---

## 8. TESTING GAPS

### 8.1 Test Coverage is Superficial
107 tests pass, but they are mostly unit tests for `src/lib` and `src/services`. 

**Missing:**
- No integration tests for the failed build paths (sitemap, rewrites)
- No tests verifying React 19 purity compliance
- No error boundary tests for the `any`-typed error paths
- No visual regression or accessibility tests (you have guides but no automated checks)

### 8.2 Tests Use `any` Extensively
`src/app/(main)/settings/__tests__/session-management.test.tsx` has 20+ instances of `any` in test data. Tests should be the **most strictly typed** code in your codebase because they validate contracts.

---

## 9. IMMEDIATE ACTION PLAN (Priority Order)

### P0 - Block Build/Deploy
1. **Fix route type poisoning:** Audit `app` directory for route group conflicts. Check `(main)/layout.tsx` for conflicting type exports.
2. **Fix sitemap env dependency:** Make `NEXT_PUBLIC_APP_URL` optional with fallback, or skip sitemap generation when missing.
3. **Eliminate all `any` from API boundaries:** Create strict error types in `src/types/errors.ts`.
4. **Fix setState-in-effect violations:** Convert to derived state or event-driven updates.
5. **Fix React 19 purity violations:** Move `Date.now()` and `Math.random()` to event handlers or `useEffect`.

### P1 - Architecture
6. **Decouple services from stores:** Inject token provider as a function argument. Remove all store imports from `src/services/`.
7. **Centralize error parsing:** Create `parseApiError(error: unknown): ApiError` in `src/services/errorParser.ts`. Use it in every hook.
8. **Move mock API to MSW or service layer:** Remove `src/lib/mockApi.ts` from UI imports.

### P2 - Type Safety & Quality
9. **Enable `no-explicit-any` as error** in ESLint (already is, but you ignore it). Run automated codemod to replace with `unknown` + type guards.
10. **Clean unused imports:** Run `eslint --fix` for `@typescript-eslint/no-unused-vars`.
11. **Add strict null checks review:** Verify all `??` fallbacks are logically sound.

### P3 - Production Hardening
12. **Implement nonce-based CSP** in `middleware.ts` to remove `unsafe-inline`.
13. **Add build-time env validation** with `envalid` or `zod` for required variables.
14. **Separate Prisma to backend-only** - remove from frontend deps if possible, or ensure it's tree-shaken from client bundle.
15. **Add pre-deployment checks to CI:** `type-check`, `lint`, `build`, `test:run` must all pass before Docker build.

---

## 10. FILES REQUIRING IMMEDIATE REWRITE

| File | Issues | Action |
|------|--------|--------|
| `src/services/api.ts` | `any` types, imports store | Decouple, type errors |
| `src/hooks/useAuth.ts` | 10x `any`, unused `router` | Strict error typing |
| `src/hooks/useSync.ts` | setState in effect | Refactor to event-driven |
| `src/app/(main)/layout.tsx` | setState in effect | Use derived state |
| `src/app/(main)/quizzes/page.tsx` | `Date.now()` in render, `any` | Move to effect, type errors |
| `src/components/ui/sidebar.tsx` | `Math.random()` in render | Move to mount effect |
| `src/app/api/**/route.ts` | `catch (error: any)` everywhere | Implement error parser |
| `src/types/global.d.ts` | `any` in Web Speech API types | Use proper event handler types |

---

## CONCLUSION

Marvellous, this codebase has **fundamental structural problems** that make it unfit for production deployment. The build is broken, TypeScript is disabled via `any`, React 19 purity rules are violated, and architectural boundaries are leaking.

**The good news:** The issues are systematic, not architectural. You don't need to rewrite the app. You need a strict enforcement pass:
1. Fix the build blockers (types, env, sitemap)
2. Run a codemod to replace `any` with `unknown` + type guards
3. Refactor the 4 setState-in-effect violations
4. Decouple services from stores via dependency injection
5. Centralize error parsing

**Time estimate:** 2-3 days of focused refactoring.

Do not deploy. Do not merge to main. Fix P0 items first.
