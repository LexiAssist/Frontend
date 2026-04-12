# Manual Testing Guide - Frontend-Backend Integration

## Prerequisites Setup

### 1. Start Backend Services

```bash
# Terminal 1: Start PostgreSQL (if not running as service)
# Ensure PostgreSQL is running on port 5432

# Terminal 2: Start Redis (if not running as service)
# Ensure Redis is running on port 6379

# Terminal 3: Start MinIO (if not running as service)
# Ensure MinIO is running with proper configuration

# Terminal 4: Start User Service
cd user-service
go run main.go

# Terminal 5: Start Content Service
cd content-service
go run main.go

# Terminal 6: Start Analytics Service
cd analytics-service
go run main.go

# Terminal 7: Start Sync Service
cd sync-service
go run main.go

# Terminal 8: Start API Gateway
cd api-gateway
go run main.go

# Terminal 9: Start Python AI Service
cd ai-service
python main.py

# Terminal 10: Start Frontend
cd Frontend
npm run dev
```

### 2. Verify Services are Running

Open browser and check:
- Frontend: http://localhost:3000
- API Gateway: http://localhost:8080/health
- User Service: http://localhost:8081/health
- Content Service: http://localhost:8082/health
- Analytics Service: http://localhost:8083/health
- Sync Service: http://localhost:8085/health
- AI Service: http://localhost:8000/health

## Test Scenarios

### Scenario 1: Complete User Journey

#### Step 1: Registration
1. Navigate to http://localhost:3000/register
2. Fill in registration form:
   - Email: test@example.com
   - Password: TestPassword123!
   - First Name: Test
   - Last Name: User
   - School: Test University
   - Department: Computer Science
   - Academic Level: Undergraduate
3. Click "Register"
4. **Expected**: Redirect to email verification page
5. **Verify**: Check console for verification code (in development)

#### Step 2: Email Verification
1. Enter the 6-digit verification code
2. Click "Verify Email"
3. **Expected**: Success message and redirect to login page

#### Step 3: Login
1. Enter email: test@example.com
2. Enter password: TestPassword123!
3. Click "Login"
4. **Expected**: Redirect to dashboard
5. **Verify**: 
   - Access token stored in localStorage
   - User data displayed in UI
   - Sidebar navigation visible

#### Step 4: Create Course
1. Navigate to Materials page
2. Click "Create Course"
3. Fill in course details:
   - Name: Introduction to Computer Science
   - Description: CS101 course materials
   - Color: Blue
   - Semester: Fall
   - Year: 2024
4. Click "Save"
5. **Expected**: Course appears in course list

#### Step 5: Upload Material
1. Click on the created course
2. Click "Upload Material"
3. Select a PDF file (< 50MB)
4. Enter title: "Lecture 1 Notes"
5. Click "Upload"
6. **Expected**: 
   - Progress bar shows upload progress
   - Material appears in materials list
   - File uploaded to MinIO storage

#### Step 6: Generate Flashcards
1. Navigate to Flashcards page
2. Click "Generate Flashcards"
3. Select the uploaded material
4. Set number of cards: 10
5. Click "Generate"
6. **Expected**:
   - Loading indicator with "Generating flashcards..." message
   - Generated flashcards displayed with flip animation
   - Option to save deck

#### Step 7: Generate Quiz
1. Navigate to Quizzes page
2. Click "Generate Quiz"
3. Select material or enter content
4. Click "Generate"
5. **Expected**: Quiz questions displayed

#### Step 8: Take Quiz
1. Click "Start Quiz" on generated quiz
2. Answer all questions
3. Click "Submit Quiz"
4. **Expected**: 
   - Score displayed
   - Correct answers shown
   - Explanations provided

#### Step 9: Use Writing Assistant
1. Navigate to Writing Assistant page
2. Click "Start Recording"
3. Speak for 10-15 seconds
4. Click "Stop Recording"
5. **Expected**: Audio transcribed to text
6. Click "Generate Notes"
7. **Expected**: Structured notes displayed in markdown format

#### Step 10: Use Reading Assistant
1. Navigate to Reading Assistant page
2. Upload a document (PDF/DOCX/TXT)
3. Select summary type: "Concise"
4. Select voice for TTS
5. Click "Analyze"
6. **Expected**:
   - Summary displayed
   - Vocabulary terms listed
   - Audio player with TTS audio

#### Step 11: Use Chat Assistant
1. Navigate to Chat Assistant page
2. Type a question: "What is machine learning?"
3. Click "Send"
4. **Expected**: AI response displayed in chat interface

#### Step 12: Use Text-to-Speech
1. Navigate to Text-to-Speech page
2. Enter text: "Hello, this is a test of the text-to-speech feature."
3. Select language: English
4. Click "Generate Audio"
5. **Expected**: Audio player with generated speech
6. Test playback controls (play, pause, volume, speed)

#### Step 13: View Analytics
1. Navigate to Dashboard
2. **Expected**: 
   - Study streak displayed
   - Total study days shown
   - Total study minutes shown
   - Quizzes completed count
   - Topic mastery chart/list

#### Step 14: Create Learning Goal
1. Navigate to Goals page
2. Click "Create Goal"
3. Fill in goal details:
   - Title: Complete 10 quizzes
   - Description: Finish 10 quizzes by end of month
   - Target Date: (select future date)
   - Goal Type: quiz_score
   - Target Value: 10
4. Click "Save"
5. **Expected**: Goal appears in goals list with progress indicator

#### Step 15: Test WebSocket Sync
1. Open two browser windows/tabs
2. Login to same account in both
3. In window 1: Create a new course
4. **Expected**: Course appears in window 2 without refresh
5. In window 2: Upload a material
6. **Expected**: Material appears in window 1 without refresh

#### Step 16: Test Token Refresh
1. Wait for token to expire (or manually set short expiry in backend)
2. Make an API request (e.g., navigate to a new page)
3. **Expected**: 
   - Token automatically refreshed
   - Original request succeeds
   - No redirect to login

#### Step 17: Test Session Management
1. Navigate to Settings > Sessions
2. **Expected**: List of active sessions displayed
3. Current session marked with "This device"
4. Click "Revoke" on another session
5. **Expected**: Session removed from list

#### Step 18: Logout
1. Click "Logout" button
2. **Expected**:
   - Redirect to login page
   - Tokens cleared from localStorage
   - Cannot access protected routes

### Scenario 2: Error Handling Tests

#### Test 1: Invalid Login
1. Navigate to login page
2. Enter invalid credentials
3. **Expected**: "Invalid email or password" error message

#### Test 2: File Upload Validation
1. Try to upload file > 50MB
2. **Expected**: "File size exceeds 50MB limit" error
3. Try to upload unsupported file type (e.g., .exe)
4. **Expected**: "Unsupported file type" error

#### Test 3: Network Error Handling
1. Stop backend services
2. Try to make an API request
3. **Expected**: "Network error. Please check your connection" with retry button

#### Test 4: Timeout Handling
1. Upload very large file or request AI generation
2. If operation takes > 5 minutes
3. **Expected**: Timeout error with user-friendly message

### Scenario 3: Performance Tests

#### Test 1: Page Load Time
1. Open browser DevTools > Network tab
2. Navigate to dashboard
3. **Expected**: Page loads in < 3 seconds

#### Test 2: File Upload Speed
1. Upload 10MB file
2. Monitor upload progress
3. **Expected**: Smooth progress bar, no freezing

#### Test 3: Large List Rendering
1. Create 50+ materials
2. Navigate to materials page
3. **Expected**: 
   - Pagination or infinite scroll works
   - No lag in scrolling
   - Smooth rendering

### Scenario 4: Accessibility Tests

#### Test 1: Keyboard Navigation
1. Use only Tab key to navigate through login page
2. **Expected**: All interactive elements focusable
3. Press Enter on focused button
4. **Expected**: Button action triggered

#### Test 2: Screen Reader Test
1. Enable screen reader (NVDA/VoiceOver)
2. Navigate through dashboard
3. **Expected**: 
   - All content announced
   - Button labels clear
   - Form fields have labels
   - Error messages announced

#### Test 3: Color Contrast
1. Use browser DevTools > Lighthouse > Accessibility
2. **Expected**: No color contrast issues

### Scenario 5: Security Tests

#### Test 1: XSS Prevention
1. Try to enter `<script>alert('XSS')</script>` in text input
2. **Expected**: Script not executed, content sanitized

#### Test 2: CORS Verification
1. Open browser DevTools > Network tab
2. Make API request
3. Check response headers
4. **Expected**: 
   - Access-Control-Allow-Origin present
   - Access-Control-Allow-Methods present
   - Access-Control-Allow-Headers present

#### Test 3: CSP Verification
1. Open browser DevTools > Console
2. Check for CSP violations
3. **Expected**: No CSP violations in production build

#### Test 4: Token Security
1. Open browser DevTools > Application > Local Storage
2. Check stored tokens
3. **Expected**: Tokens stored securely
4. Open DevTools > Console
5. **Expected**: No tokens logged in production build

## Browser Compatibility Testing

### Chrome
- [ ] All features work
- [ ] No console errors
- [ ] Styling correct

### Firefox
- [ ] All features work
- [ ] No console errors
- [ ] Styling correct

### Safari
- [ ] All features work
- [ ] No console errors
- [ ] Styling correct

### Edge
- [ ] All features work
- [ ] No console errors
- [ ] Styling correct

## Lighthouse Audit

### Run Audit
1. Build production version: `npm run build`
2. Start production server: `npm start`
3. Open Chrome DevTools > Lighthouse
4. Run audit for:
   - Performance
   - Accessibility
   - Best Practices
   - SEO

### Expected Scores
- Performance: > 90
- Accessibility: > 90
- Best Practices: > 90
- SEO: > 90

## Test Results Template

### Test Date: ___________
### Tester: ___________

| Test Scenario | Status | Notes |
|--------------|--------|-------|
| Registration | ⬜ Pass ⬜ Fail | |
| Email Verification | ⬜ Pass ⬜ Fail | |
| Login | ⬜ Pass ⬜ Fail | |
| Create Course | ⬜ Pass ⬜ Fail | |
| Upload Material | ⬜ Pass ⬜ Fail | |
| Generate Flashcards | ⬜ Pass ⬜ Fail | |
| Generate Quiz | ⬜ Pass ⬜ Fail | |
| Take Quiz | ⬜ Pass ⬜ Fail | |
| Writing Assistant | ⬜ Pass ⬜ Fail | |
| Reading Assistant | ⬜ Pass ⬜ Fail | |
| Chat Assistant | ⬜ Pass ⬜ Fail | |
| Text-to-Speech | ⬜ Pass ⬜ Fail | |
| View Analytics | ⬜ Pass ⬜ Fail | |
| Create Goal | ⬜ Pass ⬜ Fail | |
| WebSocket Sync | ⬜ Pass ⬜ Fail | |
| Token Refresh | ⬜ Pass ⬜ Fail | |
| Session Management | ⬜ Pass ⬜ Fail | |
| Logout | ⬜ Pass ⬜ Fail | |
| Error Handling | ⬜ Pass ⬜ Fail | |
| Performance | ⬜ Pass ⬜ Fail | |
| Accessibility | ⬜ Pass ⬜ Fail | |
| Security | ⬜ Pass ⬜ Fail | |
| Browser Compatibility | ⬜ Pass ⬜ Fail | |

### Issues Found
1. 
2. 
3. 

### Recommendations
1. 
2. 
3. 
