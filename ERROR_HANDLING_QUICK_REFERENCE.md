# Error Handling & Loading States - Quick Reference

## 🚀 Quick Start

### 1. Handle API Errors with Toast

```typescript
import { useErrorHandler } from '@/hooks/useErrorHandler';

const { handleError } = useErrorHandler({ showToast: true });

try {
  await apiClient.get('/api/v1/data');
} catch (error) {
  handleError(error); // Shows toast automatically
}
```

### 2. Loading State with Auto Error Handling

```typescript
import { useLoadingState } from '@/hooks/useLoadingState';

const { isLoading, execute } = useLoadingState({
  showSuccessToast: true,
  successMessage: 'Saved!',
});

<Button onClick={() => execute(async () => await saveData())} isLoading={isLoading}>
  Save
</Button>
```

### 3. File Upload with Progress

```typescript
import { useUploadProgress } from '@/hooks/useLoadingState';
import { ProgressBar } from '@/components/LoadingState';

const { progress, startUpload, updateProgress, completeUpload } = useUploadProgress();

<ProgressBar progress={progress} label="Uploading..." />
```

### 4. Toast Notifications

```typescript
import { Toast } from '@/components/Toast';

Toast.success('Success!');
Toast.error('Error!');
Toast.warning('Warning!');
Toast.info('Info!');
```

### 5. Loading States

```typescript
import { LoadingState, AILoadingState } from '@/components/LoadingState';

// Spinner
<LoadingState variant="spinner" message="Loading..." />

// Skeleton
<LoadingState variant="skeleton" rows={3} />

// AI operations
<AILoadingState operation="flashcards" />
```

---

## 📦 Import Paths

```typescript
// Error handling
import { handleAPIError, APIError } from '@/lib/errorHandler';
import { useErrorHandler } from '@/hooks/useErrorHandler';

// Loading states
import { useLoadingState, useUploadProgress } from '@/hooks/useLoadingState';
import { LoadingState, ProgressBar, AILoadingState } from '@/components/LoadingState';

// Toast notifications
import { Toast } from '@/components/Toast';

// Error boundary
import { ErrorBoundary } from '@/components/ErrorBoundary';
```

---

## 🎯 Common Patterns

### Pattern 1: Form Submission

```typescript
const { isLoading, execute } = useLoadingState({
  showSuccessToast: true,
  successMessage: 'Form submitted!',
});

const handleSubmit = async (data: FormData) => {
  await execute(async () => {
    return await apiClient.post('/api/v1/submit', data);
  });
};

<Button onClick={handleSubmit} isLoading={isLoading} disabled={isLoading}>
  Submit
</Button>
```

### Pattern 2: File Upload

```typescript
const { progress, isUploading, startUpload, updateProgress, completeUpload, failUpload } = useUploadProgress();

const handleUpload = async (file: File) => {
  startUpload();
  try {
    await apiClient.uploadFormData('/api/v1/upload', formData, updateProgress);
    completeUpload();
    Toast.success('Uploaded!');
  } catch (error) {
    failUpload(error);
  }
};

{isUploading && <ProgressBar progress={progress} label="Uploading..." />}
```

### Pattern 3: AI Operation

```typescript
const [isGenerating, setIsGenerating] = useState(false);

const generateFlashcards = async () => {
  setIsGenerating(true);
  try {
    const result = await aiClient.post('/api/v1/flashcards', data);
    Toast.success('Flashcards generated!');
  } catch (error) {
    handleError(error);
  } finally {
    setIsGenerating(false);
  }
};

{isGenerating && <AILoadingState operation="flashcards" />}
```

### Pattern 4: Promise Toast

```typescript
const promise = apiClient.post('/api/v1/data', formData);

Toast.promise(promise, {
  loading: 'Saving...',
  success: 'Saved!',
  error: 'Failed to save',
});
```

### Pattern 5: Error Boundary

```typescript
<ErrorBoundary>
  <CriticalComponent />
</ErrorBoundary>
```

---

## 🎨 Loading State Variants

| Variant | Use Case | Example |
|---------|----------|---------|
| `spinner` | General loading | `<LoadingState variant="spinner" />` |
| `skeleton` | Content loading | `<LoadingState variant="skeleton" rows={3} />` |
| `pulse` | Minimal loading | `<LoadingState variant="pulse" />` |
| AI Loading | AI operations | `<AILoadingState operation="flashcards" />` |
| Progress Bar | File uploads | `<ProgressBar progress={50} />` |
| Full Page | Initial load | `<FullPageLoading />` |

---

## 🔔 Toast Types

| Type | Method | Duration | Use Case |
|------|--------|----------|----------|
| Success | `Toast.success()` | 3s | Successful operations |
| Error | `Toast.error()` | 4s | Failed operations |
| Warning | `Toast.warning()` | 4s | Warnings |
| Info | `Toast.info()` | 4s | Information |

---

## ⚠️ Error Status Codes

| Code | Message | Action |
|------|---------|--------|
| 400 | "Please check your input" | Show validation errors |
| 401 | "Session expired" | Redirect to login |
| 403 | "No permission" | Show error message |
| 404 | "Not found" | Show error message |
| 429 | "Too many requests" | Show retry time |
| 500 | "Server error" | Show error + retry |
| Network | "Network error" | Show error + retry |

---

## 📚 Full Documentation

See `Frontend/src/lib/ERROR_HANDLING_GUIDE.md` for complete documentation.

---

## ✅ Checklist

- [ ] Import error handling hooks
- [ ] Wrap API calls with try-catch
- [ ] Show loading states during operations
- [ ] Display toast notifications for feedback
- [ ] Disable buttons during loading
- [ ] Show progress for file uploads
- [ ] Use AI loading states for AI operations
- [ ] Wrap critical components with ErrorBoundary
- [ ] Handle network errors with retry
- [ ] Test error scenarios
