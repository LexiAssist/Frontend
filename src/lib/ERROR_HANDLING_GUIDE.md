# Error Handling and User Feedback Guide

This guide explains how to implement error handling, loading states, and user feedback in the LexiAssist frontend application.

## Table of Contents

1. [Error Handling](#error-handling)
2. [Loading States](#loading-states)
3. [Toast Notifications](#toast-notifications)
4. [Progress Indicators](#progress-indicators)
5. [Best Practices](#best-practices)

---

## Error Handling

### Centralized Error Handler

The `errorHandler.ts` module provides utilities for handling API errors consistently across the application.

#### Basic Usage

```typescript
import { handleAPIError, getUserFriendlyMessage } from '@/lib/errorHandler';

try {
  await apiClient.get('/api/v1/users/me');
} catch (error) {
  const apiError = handleAPIError(error);
  console.error(apiError.message); // User-friendly message
}
```

#### HTTP Status Code Mapping

The error handler automatically maps HTTP status codes to user-friendly messages:

- **400**: "Please check your input and try again"
- **401**: "Your session has expired. Please log in again"
- **403**: "You don't have permission to perform this action"
- **404**: "The requested resource was not found"
- **429**: "Too many requests. Please try again in X seconds"
- **500/503**: "Server error. Please try again later"
- **Network Error**: "Network error. Please check your connection"
- **Timeout**: "Request timed out. Please try again"

#### Field-Specific Validation Errors

Extract field-specific errors for form validation:

```typescript
import { extractFieldErrors } from '@/lib/errorHandler';

try {
  await apiClient.post('/api/v1/auth/register', formData);
} catch (error) {
  const apiError = handleAPIError(error);
  const fieldErrors = extractFieldErrors(apiError);
  
  if (fieldErrors) {
    // Display field-specific errors
    setErrors(fieldErrors);
  }
}
```

### Error Boundary Component

Wrap components with `ErrorBoundary` to catch React errors:

```typescript
import { ErrorBoundary } from '@/components/ErrorBoundary';

export default function MyPage() {
  return (
    <ErrorBoundary>
      <MyComponent />
    </ErrorBoundary>
  );
}
```

#### Custom Fallback UI

```typescript
<ErrorBoundary
  fallback={
    <div>
      <h2>Oops! Something went wrong</h2>
      <button onClick={() => window.location.reload()}>Reload</button>
    </div>
  }
>
  <MyComponent />
</ErrorBoundary>
```

### useErrorHandler Hook

The `useErrorHandler` hook provides a convenient way to handle errors with toast notifications:

```typescript
import { useErrorHandler } from '@/hooks/useErrorHandler';

function MyComponent() {
  const { handleError, canRetry } = useErrorHandler({
    showToast: true,
    onRetry: () => refetch(),
  });

  const fetchData = async () => {
    try {
      const data = await apiClient.get('/api/v1/data');
      return data;
    } catch (error) {
      handleError(error); // Automatically shows toast
    }
  };
}
```

---

## Loading States

### LoadingState Component

The `LoadingState` component provides multiple variants for different loading scenarios:

#### Spinner Variant

```typescript
import { LoadingState } from '@/components/LoadingState';

<LoadingState 
  variant="spinner" 
  message="Loading data..." 
/>
```

#### Skeleton Variant

```typescript
<LoadingState 
  variant="skeleton" 
  rows={3} 
/>
```

#### Long-Running Operations

For operations that may take more than 10 seconds:

```typescript
<LoadingState 
  variant="spinner" 
  message="Processing your request..."
  showLongRunningMessage
  longRunningThreshold={10000}
/>
```

### AI Loading States

For AI operations with descriptive messages:

```typescript
import { AILoadingState } from '@/components/LoadingState';

<AILoadingState operation="flashcards" />
<AILoadingState operation="quiz" />
<AILoadingState operation="notes" />
<AILoadingState operation="summary" />
```

### Full Page Loading

```typescript
import { FullPageLoading } from '@/components/LoadingState';

<FullPageLoading message="Loading application..." />
```

### useLoadingState Hook

Manage loading states with automatic error handling:

```typescript
import { useLoadingState } from '@/hooks/useLoadingState';

function MyComponent() {
  const { isLoading, error, execute } = useLoadingState({
    showSuccessToast: true,
    successMessage: 'Data saved successfully!',
  });

  const saveData = async () => {
    await execute(async () => {
      return await apiClient.post('/api/v1/data', formData);
    });
  };

  return (
    <div>
      <Button onClick={saveData} isLoading={isLoading} disabled={isLoading}>
        Save
      </Button>
      {error && <p className="text-red-600">{error.message}</p>}
    </div>
  );
}
```

---

## Toast Notifications

### Basic Usage

```typescript
import { Toast } from '@/components/Toast';

// Success toast
Toast.success('Operation completed successfully!');

// Error toast
Toast.error('Something went wrong!');

// Warning toast
Toast.warning('Please review your input');

// Info toast
Toast.info('New feature available');
```

### Custom Duration

```typescript
Toast.success('Saved!', { duration: 2000 }); // 2 seconds
Toast.error('Error occurred', { duration: 5000 }); // 5 seconds
```

### Promise Toast

Show loading, success, and error states for async operations:

```typescript
const promise = apiClient.post('/api/v1/data', formData);

Toast.promise(promise, {
  loading: 'Saving data...',
  success: 'Data saved successfully!',
  error: 'Failed to save data',
});
```

### Manual Dismissal

```typescript
const toastId = Toast.info('Processing...');

// Later, dismiss the toast
Toast.dismiss(toastId);

// Or dismiss all toasts
Toast.dismiss();
```

---

## Progress Indicators

### Progress Bar

For file uploads and long-running operations:

```typescript
import { ProgressBar } from '@/components/LoadingState';

<ProgressBar 
  progress={uploadProgress} 
  label="Uploading file..." 
  showPercentage 
/>
```

### useUploadProgress Hook

Manage file upload progress:

```typescript
import { useUploadProgress } from '@/hooks/useLoadingState';

function FileUpload() {
  const { 
    progress, 
    isUploading, 
    startUpload, 
    updateProgress, 
    completeUpload, 
    failUpload 
  } = useUploadProgress();

  const handleUpload = async (file: File) => {
    startUpload();
    
    try {
      await apiClient.uploadFormData(
        '/api/v1/materials',
        formData,
        (progress) => updateProgress(progress)
      );
      completeUpload();
      Toast.success('File uploaded successfully!');
    } catch (error) {
      failUpload(error);
    }
  };

  return (
    <div>
      <ProgressBar progress={progress} label="Uploading..." />
      <Button onClick={() => handleUpload(file)} disabled={isUploading}>
        Upload
      </Button>
    </div>
  );
}
```

### Button Loading States

Buttons automatically support loading states:

```typescript
import { Button } from '@/components/ui/button';

<Button isLoading={isLoading} disabled={isLoading}>
  {isLoading ? 'Saving...' : 'Save'}
</Button>
```

---

## Best Practices

### 1. Always Handle Errors

Never leave API calls without error handling:

```typescript
// ❌ Bad
const data = await apiClient.get('/api/v1/data');

// ✅ Good
try {
  const data = await apiClient.get('/api/v1/data');
} catch (error) {
  handleError(error);
}
```

### 2. Show Loading States

Always show loading indicators during async operations:

```typescript
// ❌ Bad
const handleSubmit = async () => {
  await apiClient.post('/api/v1/data', formData);
};

// ✅ Good
const handleSubmit = async () => {
  setIsLoading(true);
  try {
    await apiClient.post('/api/v1/data', formData);
    Toast.success('Saved!');
  } catch (error) {
    handleError(error);
  } finally {
    setIsLoading(false);
  }
};
```

### 3. Disable Buttons During Loading

Prevent duplicate submissions:

```typescript
<Button 
  onClick={handleSubmit} 
  isLoading={isLoading} 
  disabled={isLoading}
>
  Submit
</Button>
```

### 4. Use Appropriate Loading Variants

- **Spinner**: For general loading states
- **Skeleton**: For content that's being loaded (lists, cards)
- **Progress Bar**: For file uploads and operations with measurable progress
- **AI Loading**: For AI operations with descriptive messages

### 5. Provide Context for Long Operations

For operations that may take more than 10 seconds:

```typescript
<LoadingState 
  message="Generating flashcards..."
  showLongRunningMessage
  longRunningThreshold={10000}
/>
```

### 6. Use Toast Notifications Appropriately

- **Success**: Confirm successful operations
- **Error**: Alert users to failures
- **Warning**: Caution about potential issues
- **Info**: Provide helpful information

### 7. Handle Network Errors Gracefully

Provide retry functionality for network errors:

```typescript
const { handleError, canRetry } = useErrorHandler({
  showToast: true,
  onRetry: () => refetch(),
});

try {
  await fetchData();
} catch (error) {
  const apiError = handleError(error);
  if (canRetry(apiError)) {
    // Show retry button
  }
}
```

### 8. Wrap Critical Components with Error Boundaries

```typescript
<ErrorBoundary>
  <CriticalComponent />
</ErrorBoundary>
```

### 9. Log Errors for Debugging

The error handler automatically logs errors, but you can add custom logging:

```typescript
try {
  await apiClient.post('/api/v1/data', formData);
} catch (error) {
  const apiError = handleError(error);
  console.error('Failed to save data:', apiError);
  // Send to error tracking service
}
```

### 10. Test Error Scenarios

Always test error scenarios:

- Network failures
- Timeout errors
- Validation errors
- Server errors
- Rate limiting

---

## Requirements Coverage

This implementation covers the following requirements:

- **21.1**: Handle 400 (validation errors)
- **21.2**: Handle 401 (authentication errors)
- **21.3**: Handle 403 (permission errors)
- **21.4**: Handle 404 (not found errors)
- **21.5**: Handle 429 (rate limit errors)
- **21.6**: Handle 500/503 (server errors)
- **21.7**: Handle network errors with retry button
- **22.1**: Display loading spinner during API requests
- **22.2**: Display loading states during API requests
- **22.3**: Show progress bar for file uploads
- **22.4**: Display descriptive loading text for AI operations
- **22.5**: Disable form buttons during submission
- **22.6**: Show additional context for long-running operations (>10s)

---

## Example Component

See `Frontend/src/components/examples/ErrorHandlingExample.tsx` for a complete example demonstrating all error handling and loading state patterns.
