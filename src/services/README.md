# HTTP Client Documentation

## Overview

The HTTP client provides a robust, fetch-based API client for communicating with the backend services. It implements automatic token refresh, retry logic with exponential backoff, and comprehensive error handling.

## Architecture

### Core Components

1. **APIClient Class** (`http.ts`)
   - Base HTTP client using native fetch API
   - Automatic JWT token injection
   - Token expiry detection and refresh
   - Request queuing during token refresh
   - Retry logic with exponential backoff
   - Configurable timeouts

2. **Convenience Methods**
   - `http.get()`, `http.post()`, `http.put()`, `http.delete()`
   - Automatically unwrap `ApiResponse<T>` envelope
   - Type-safe responses

3. **AI Client**
   - Extended timeout (5 minutes) for AI operations
   - Separate instance for AI service endpoints

## Usage

### Basic Requests

```typescript
import { http } from '@/services/http';

// GET request
const user = await http.get<User>('/users/me');

// POST request
const course = await http.post<Course>('/courses', {
  name: 'Introduction to TypeScript',
  description: 'Learn TypeScript basics'
});

// PUT request
const updated = await http.put<User>('/users/me', {
  first_name: 'John',
  last_name: 'Doe'
});

// DELETE request
await http.delete('/courses/123');
```

### AI Requests with Extended Timeout

```typescript
import { aiHttp } from '@/services/http';

// AI chat with 5-minute timeout
const response = await aiHttp.post<ChatResponse>('/ai/chat', {
  query: 'Explain quantum computing',
  user_id: userId
});

// File upload with progress tracking
const formData = new FormData();
formData.append('file', file);
formData.append('user_id', userId);

const result = await aiHttp.uploadFormData<FlashcardsResponse>(
  '/study/flashcards',
  formData,
  (progress) => console.log(`Upload: ${progress}%`)
);
```

### Custom Options

```typescript
import { apiClient } from '@/services/http';

// Custom timeout (10 seconds)
const data = await apiClient.get('/slow-endpoint', {
  timeout: 10000
});

// Disable retries
const data = await apiClient.post('/critical-operation', payload, {
  retries: 0
});

// Custom retry delay
const data = await apiClient.get('/flaky-endpoint', {
  retries: 5,
  retryDelay: 2000 // Start with 2s, then 4s, 8s, 16s, 32s
});
```

## Features

### 1. Automatic Token Refresh

The client automatically detects when tokens are expired or expiring soon (within 5 minutes) and refreshes them before making requests.

```typescript
// Token refresh happens automatically
const data = await http.get<User>('/users/me');
// If token is expired, it will:
// 1. Refresh the token
// 2. Update auth store
// 3. Retry the original request
```

### 2. Request Queuing

When a token refresh is in progress, subsequent requests are queued and wait for the refresh to complete.

```typescript
// Multiple simultaneous requests during token refresh
const [user, courses, quizzes] = await Promise.all([
  http.get<User>('/users/me'),
  http.get<Course[]>('/courses'),
  http.get<Quiz[]>('/quizzes')
]);
// All requests wait for token refresh, then proceed with new token
```

### 3. Retry Logic with Exponential Backoff

Network errors and 5xx server errors are automatically retried with exponential backoff.

```typescript
// Automatic retry on network errors
// Attempt 1: immediate
// Attempt 2: wait 1s
// Attempt 3: wait 2s
// Attempt 4: wait 4s (max 3 retries by default)
const data = await http.get<Data>('/unreliable-endpoint');
```

### 4. Error Handling

The client provides clear error messages for different HTTP status codes:

- **401 Unauthorized**: Triggers automatic token refresh
- **4xx Client Errors**: No retry, immediate error
- **5xx Server Errors**: Retry with exponential backoff
- **Network Errors**: Retry with exponential backoff
- **Timeout**: Clear timeout error message

### 5. File Upload with Progress

```typescript
import { apiClient } from '@/services/http';

const formData = new FormData();
formData.append('file', file);

const result = await apiClient.uploadFormData<Material>(
  '/materials/upload',
  formData,
  (progress) => {
    console.log(`Upload progress: ${progress}%`);
    updateProgressBar(progress);
  }
);
```

## Configuration

### Environment Variables

```env
# Backend API Gateway URL
NEXT_PUBLIC_API_GATEWAY_URL=http://localhost:8080

# AI Service URL
NEXT_PUBLIC_AI_PROXY_URL=http://localhost:8000
```

### Timeouts

- **Default**: 30 seconds for regular requests
- **AI Operations**: 5 minutes (300 seconds)
- **Custom**: Can be overridden per request

### Retry Configuration

- **Max Retries**: 3 (default)
- **Initial Delay**: 1 second
- **Backoff**: Exponential (2x each retry)
- **Retry Conditions**: Network errors, 5xx errors, 401 (once)

## Integration with Auth Store

The HTTP client integrates seamlessly with the Zustand auth store:

```typescript
// Auth store provides:
// - accessToken: Current JWT token
// - refreshToken: Token for refreshing access token
// - tokenExpiresAt: Token expiry timestamp
// - refreshAccessToken(): Function to refresh tokens
// - isTokenExpired(): Check if token needs refresh

// HTTP client uses these automatically
const { accessToken, isTokenExpired, refreshAccessToken } = useAuthStore.getState();
```

## API Response Format

The backend returns responses in this format:

```typescript
interface ApiResponse<T> {
  data: T;
  message?: string;
  success: boolean;
}
```

The `http` convenience methods automatically unwrap the `data` field:

```typescript
// Backend returns: { data: { id: '1', name: 'Course' }, success: true }
// http.get returns: { id: '1', name: 'Course' }
const course = await http.get<Course>('/courses/1');
```

## Error Response Format

```typescript
interface ApiError {
  message: string;
  code?: string;
  errors?: Record<string, string[]>;
}
```

## Best Practices

### 1. Use Type Parameters

Always specify the expected response type:

```typescript
// Good
const user = await http.get<User>('/users/me');

// Bad
const user = await http.get('/users/me'); // Type is 'any'
```

### 2. Handle Errors

```typescript
try {
  const data = await http.post<Course>('/courses', courseData);
  showSuccess('Course created successfully');
} catch (error) {
  if (error instanceof Error) {
    showError(error.message);
  }
}
```

### 3. Use AI Client for Long Operations

```typescript
// Use aiHttp for operations that may take longer than 30s
const flashcards = await aiHttp.post<FlashcardsResponse>(
  '/study/flashcards',
  formData
);
```

### 4. Leverage Request Queuing

```typescript
// Make multiple requests without worrying about token refresh
const [user, courses, analytics] = await Promise.all([
  http.get<User>('/users/me'),
  http.get<Course[]>('/courses'),
  http.get<Analytics>('/analytics/stats')
]);
```

## Testing

See `__tests__/http.test.ts` for test examples.

### Integration Test Scenarios

1. **Token Refresh Flow**: Verify automatic token refresh on expired token
2. **Retry Logic**: Test exponential backoff on network errors
3. **Timeout Handling**: Verify timeout errors for slow endpoints
4. **Error Handling**: Test 401, 4xx, 5xx error responses
5. **Request Queuing**: Verify multiple requests wait for token refresh
6. **File Upload**: Test FormData upload with progress tracking

## Migration from Axios

The new fetch-based client replaces the previous Axios implementation:

### Before (Axios)

```typescript
import { httpClient } from '@/services/http';

const response = await httpClient.get('/users/me');
const user = response.data.data;
```

### After (Fetch)

```typescript
import { http } from '@/services/http';

const user = await http.get<User>('/users/me');
```

### Key Differences

1. **No response wrapper**: `http.get()` returns data directly
2. **Type safety**: Generic type parameter for response type
3. **Native fetch**: No external dependencies
4. **Better Next.js compatibility**: Avoids Axios network errors

## Troubleshooting

### Token Refresh Loop

If you see infinite token refresh attempts:

1. Check that auth endpoints are excluded from token refresh
2. Verify `tokenExpiresAt` is set correctly in auth store
3. Check backend token expiry time matches frontend

### Request Timeout

If requests timeout frequently:

1. Increase timeout for specific endpoints
2. Use `aiHttp` for long-running operations
3. Check network connectivity
4. Verify backend service is responding

### CORS Errors

If you see CORS errors:

1. Verify `NEXT_PUBLIC_API_GATEWAY_URL` is correct
2. Check API Gateway CORS configuration
3. Ensure credentials are included if needed

## Requirements Validation

This implementation satisfies the following requirements:

- ✅ **Requirement 2.1**: Uses native fetch API
- ✅ **Requirement 2.2**: Base URL from environment variable
- ✅ **Requirement 2.3**: Content-Type and Authorization headers
- ✅ **Requirement 2.4**: Configurable timeouts (30s default, 5min for AI)
- ✅ **Requirement 2.5**: Retry logic with exponential backoff (max 3 retries)
- ✅ **Requirement 2.6**: No retry for 4xx errors except 401
- ✅ **Requirement 2.7**: Automatic token refresh and request queuing
