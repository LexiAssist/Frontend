# Input Sanitization Implementation Guide

This guide demonstrates how to use the sanitization utilities to protect against XSS attacks in the LexiAssist frontend.

## Overview

The `src/lib/sanitize.ts` module provides functions to sanitize user-generated content before rendering or processing. This prevents Cross-Site Scripting (XSS) attacks.

## Available Functions

### 1. sanitizeHTML(dirty: string): string

Sanitizes HTML content to allow only safe tags and attributes.

**Use when:**
- Rendering user-generated HTML content
- Displaying rich text from external sources
- Rendering markdown that may contain HTML

**Example:**
```typescript
import { sanitizeHTML } from '@/lib/sanitize';

// In a component
function CommentDisplay({ comment }: { comment: string }) {
  const safeHTML = sanitizeHTML(comment);
  
  return (
    <div dangerouslySetInnerHTML={{ __html: safeHTML }} />
  );
}
```

**Allowed tags:**
- Text formatting: `<b>`, `<i>`, `<em>`, `<strong>`
- Links: `<a>` (with href, target, rel attributes)
- Structure: `<p>`, `<br>`, `<ul>`, `<ol>`, `<li>`
- Code: `<code>`, `<pre>`, `<blockquote>`

**Blocked:**
- Scripts: `<script>`, `<iframe>`, `<object>`
- Event handlers: `onclick`, `onerror`, etc.
- Dangerous protocols: `javascript:`, `data:`

### 2. sanitizeInput(input: string): string

Sanitizes plain text input by removing dangerous characters.

**Use when:**
- Processing form inputs
- Handling search queries
- Storing user-provided text

**Example:**
```typescript
import { sanitizeInput } from '@/lib/sanitize';

function SearchBar() {
  const [query, setQuery] = useState('');
  
  const handleSearch = () => {
    const safeQuery = sanitizeInput(query);
    // Use safeQuery for API call
    searchAPI(safeQuery);
  };
  
  return (
    <input
      value={query}
      onChange={(e) => setQuery(e.target.value)}
      onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
    />
  );
}
```

### 3. validateFile(file: File, options?: FileValidationOptions): FileValidationResult

Validates file uploads for type, size, and extension.

**Use when:**
- Handling file uploads
- Validating material uploads
- Processing document uploads

**Example:**
```typescript
import { validateFile } from '@/lib/sanitize';

function MaterialUpload() {
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    const validation = validateFile(file, {
      maxSizeBytes: 50 * 1024 * 1024, // 50MB
      allowedTypes: ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
      allowedExtensions: ['.pdf', '.docx'],
    });
    
    if (!validation.valid) {
      toast.error(validation.error);
      return;
    }
    
    // Proceed with upload
    uploadFile(file);
  };
  
  return (
    <input
      type="file"
      accept=".pdf,.docx"
      onChange={handleFileSelect}
    />
  );
}
```

### 4. sanitizeURL(url: string): string

Sanitizes URLs to prevent dangerous protocols.

**Use when:**
- Rendering user-provided links
- Processing redirect URLs
- Handling external URLs

**Example:**
```typescript
import { sanitizeURL } from '@/lib/sanitize';

function ExternalLink({ href, children }: { href: string; children: React.ReactNode }) {
  const safeURL = sanitizeURL(href);
  
  if (!safeURL) {
    return <span>{children}</span>; // Don't render link if URL is invalid
  }
  
  return (
    <a href={safeURL} target="_blank" rel="noopener noreferrer">
      {children}
    </a>
  );
}
```

### 5. sanitizeMarkdown(markdown: string): string

Sanitizes markdown content while preserving formatting.

**Use when:**
- Rendering AI-generated notes
- Displaying flashcard content
- Showing quiz explanations

**Example:**
```typescript
import { sanitizeMarkdown } from '@/lib/sanitize';
import ReactMarkdown from 'react-markdown';

function NotesDisplay({ notes }: { notes: string }) {
  const safeMarkdown = sanitizeMarkdown(notes);
  
  return (
    <ReactMarkdown>{safeMarkdown}</ReactMarkdown>
  );
}
```

## Integration Examples

### Example 1: Chat Assistant Messages

```typescript
// src/app/(main)/chat-assistant/page.tsx
import { sanitizeHTML } from '@/lib/sanitize';

function ChatMessage({ message }: { message: ChatMessage }) {
  const safeContent = sanitizeHTML(message.content);
  
  return (
    <div className={message.role === 'user' ? 'user-message' : 'assistant-message'}>
      <div dangerouslySetInnerHTML={{ __html: safeContent }} />
    </div>
  );
}
```

### Example 2: Flashcard Content

```typescript
// src/app/(main)/flashcards/page.tsx
import { sanitizeMarkdown } from '@/lib/sanitize';

function FlashcardDisplay({ card }: { card: Flashcard }) {
  const safeFront = sanitizeMarkdown(card.front);
  const safeBack = sanitizeMarkdown(card.back);
  
  return (
    <div className="flashcard">
      <div className="front">
        <ReactMarkdown>{safeFront}</ReactMarkdown>
      </div>
      <div className="back">
        <ReactMarkdown>{safeBack}</ReactMarkdown>
      </div>
    </div>
  );
}
```

### Example 3: Material Upload

```typescript
// src/app/(main)/materials/page.tsx
import { validateFile } from '@/lib/sanitize';
import { toast } from 'react-hot-toast';

function MaterialUploadForm() {
  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    // Validate file
    const validation = validateFile(file);
    if (!validation.valid) {
      toast.error(validation.error);
      return;
    }
    
    // Create FormData
    const formData = new FormData();
    formData.append('file', file);
    formData.append('title', file.name);
    
    try {
      // Upload to backend
      await uploadMaterial(formData);
      toast.success('Material uploaded successfully');
    } catch (error) {
      toast.error('Upload failed');
    }
  };
  
  return (
    <input
      type="file"
      accept=".pdf,.docx,.txt,.md"
      onChange={handleUpload}
    />
  );
}
```

### Example 4: User Profile Update

```typescript
// src/app/(main)/settings/page.tsx
import { sanitizeInput } from '@/lib/sanitize';

function ProfileForm() {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    school: '',
    department: '',
  });
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Sanitize all inputs
    const sanitizedData = {
      firstName: sanitizeInput(formData.firstName),
      lastName: sanitizeInput(formData.lastName),
      school: sanitizeInput(formData.school),
      department: sanitizeInput(formData.department),
    };
    
    try {
      await updateProfile(sanitizedData);
      toast.success('Profile updated');
    } catch (error) {
      toast.error('Update failed');
    }
  };
  
  return (
    <form onSubmit={handleSubmit}>
      <input
        value={formData.firstName}
        onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
        placeholder="First Name"
      />
      {/* Other fields... */}
      <button type="submit">Save</button>
    </form>
  );
}
```

### Example 5: Quiz Question Display

```typescript
// src/app/(main)/quizzes/page.tsx
import { sanitizeHTML } from '@/lib/sanitize';

function QuizQuestion({ question }: { question: QuizQuestion }) {
  const safeQuestionText = sanitizeHTML(question.question_text);
  const safeExplanation = sanitizeHTML(question.explanation || '');
  
  return (
    <div className="quiz-question">
      <div dangerouslySetInnerHTML={{ __html: safeQuestionText }} />
      
      {question.options?.map((option) => (
        <div key={option.id}>
          <input type="radio" name="answer" value={option.id} />
          <label dangerouslySetInnerHTML={{ __html: sanitizeHTML(option.text) }} />
        </div>
      ))}
      
      {safeExplanation && (
        <div className="explanation">
          <div dangerouslySetInnerHTML={{ __html: safeExplanation }} />
        </div>
      )}
    </div>
  );
}
```

## Best Practices

### 1. Always Sanitize User Input

```typescript
// ❌ BAD - Direct rendering without sanitization
<div dangerouslySetInnerHTML={{ __html: userInput }} />

// ✅ GOOD - Sanitize before rendering
<div dangerouslySetInnerHTML={{ __html: sanitizeHTML(userInput) }} />
```

### 2. Validate Files Before Upload

```typescript
// ❌ BAD - Upload without validation
const handleUpload = (file: File) => {
  uploadToServer(file);
};

// ✅ GOOD - Validate before upload
const handleUpload = (file: File) => {
  const validation = validateFile(file);
  if (!validation.valid) {
    toast.error(validation.error);
    return;
  }
  uploadToServer(file);
};
```

### 3. Sanitize URLs Before Rendering

```typescript
// ❌ BAD - Direct URL rendering
<a href={userProvidedURL}>Link</a>

// ✅ GOOD - Sanitize URL first
const safeURL = sanitizeURL(userProvidedURL);
if (safeURL) {
  <a href={safeURL} rel="noopener noreferrer">Link</a>
}
```

### 4. Use React's Built-in Protection

```typescript
// ✅ GOOD - React automatically escapes text content
<div>{userInput}</div>

// ⚠️ CAUTION - Only use dangerouslySetInnerHTML when necessary
<div dangerouslySetInnerHTML={{ __html: sanitizeHTML(userInput) }} />
```

### 5. Sanitize on Both Client and Server

```typescript
// Client-side sanitization
const safeInput = sanitizeInput(userInput);

// Server-side validation (in API route)
export async function POST(req: Request) {
  const { input } = await req.json();
  const safeInput = sanitizeInput(input);
  // Process safeInput
}
```

## Testing Sanitization

### Unit Tests

```typescript
// src/lib/__tests__/sanitize.test.ts
import { sanitizeHTML, sanitizeInput } from '../sanitize';

describe('sanitizeHTML', () => {
  it('should remove script tags', () => {
    const input = '<p>Hello</p><script>alert("XSS")</script>';
    const result = sanitizeHTML(input);
    expect(result).not.toContain('<script>');
  });
  
  it('should allow safe HTML', () => {
    const input = '<p>Hello <strong>world</strong></p>';
    const result = sanitizeHTML(input);
    expect(result).toContain('<p>');
    expect(result).toContain('<strong>');
  });
});
```

### Manual Testing

1. Try entering `<script>alert('XSS')</script>` in a text field
2. Verify the script is not executed
3. Check that the sanitized output doesn't contain the script tag

## Security Checklist

- [ ] All user-generated HTML is sanitized with `sanitizeHTML()`
- [ ] All form inputs are sanitized with `sanitizeInput()`
- [ ] All file uploads are validated with `validateFile()`
- [ ] All user-provided URLs are sanitized with `sanitizeURL()`
- [ ] All markdown content is sanitized with `sanitizeMarkdown()`
- [ ] `dangerouslySetInnerHTML` is only used with sanitized content
- [ ] File upload size limits are enforced
- [ ] File upload type restrictions are enforced
- [ ] External links have `rel="noopener noreferrer"`
- [ ] CSP headers are configured in `next.config.ts`

## References

- [OWASP XSS Prevention Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Cross_Site_Scripting_Prevention_Cheat_Sheet.html)
- [DOMPurify Documentation](https://github.com/cure53/DOMPurify)
- [React Security Best Practices](https://react.dev/learn/writing-markup-with-jsx#the-rules-of-jsx)
- Requirements: 23.1 (Security Implementation)
