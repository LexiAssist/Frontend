# Integration Test Plan - Task 25

## Overview
This document outlines the manual integration testing plan for the frontend-backend integration. Since no automated testing framework (Playwright/Cypress) is currently installed, we'll perform manual verification of all features.

## Prerequisites
- Backend services running (API Gateway on port 8080, User Service on 8081, Content Service on 8082, Analytics Service on 8083, Sync Service on 8085)
- Python AI Service running on port 8000
- PostgreSQL database running on port 5432
- Redis running on port 6379
- MinIO storage running
- Frontend running on port 3000

## Test Execution Status

### 25.1 End-to-end Integration Verification

#### Authentication Flow
- [ ] User registration with email verification
- [ ] Email verification code submission
- [ ] Login with valid credentials
- [ ] Token refresh mechanism
- [ ] Logout functionality
- [ ] Password reset flow

#### Course and Material Management
- [ ] Create new course
- [ ] List user courses
- [ ] Update course details
- [ ] Delete course
- [ ] Upload material with presigned URL
- [ ] List materials with pagination
- [ ] Delete material

#### AI Features - Flashcards
- [ ] Generate flashcards from uploaded material
- [ ] Display generated flashcards with flip animation
- [ ] Save flashcard deck
- [ ] List saved flashcard decks

#### AI Features - Quizzes
- [ ] Generate quiz from content
- [ ] Start quiz attempt
- [ ] Answer quiz questions
- [ ] Submit quiz and view results
- [ ] List available quizzes

#### AI Features - Writing Assistant
- [ ] Record audio
- [ ] Transcribe audio to text
- [ ] Generate structured notes from transcription
- [ ] Download notes (PDF/markdown)
- [ ] View note history

#### AI Features - Reading Assistant
- [ ] Upload document for analysis
- [ ] View summary with vocabulary terms
- [ ] Play TTS audio of summary
- [ ] View reading session history

#### AI Features - Chat Assistant
- [ ] Send chat message
- [ ] Receive AI response
- [ ] View conversation history
- [ ] Start new conversation
- [ ] View source citations

#### AI Features - Text-to-Speech
- [ ] Enter text for TTS
- [ ] Select language
- [ ] Generate audio
- [ ] Play/pause/stop audio
- [ ] Adjust volume and speed
- [ ] Download audio file

#### Analytics and Goals
- [ ] View study statistics on dashboard
- [ ] View study streak
- [ ] View topic mastery
- [ ] Create learning goal
- [ ] Mark goal as complete
- [ ] View goal progress

#### WebSocket Real-Time Sync
- [ ] Establish WebSocket connection on login
- [ ] Receive sync events for course creation
- [ ] Receive sync events for material upload
- [ ] Receive sync events for quiz completion
- [ ] Receive sync events for goal updates
- [ ] Reconnection after connection loss
- [ ] Graceful disconnect on logout

#### File Upload to MinIO
- [ ] Upload PDF file
- [ ] Upload DOCX file
- [ ] Upload TXT file
- [ ] Upload MD file
- [ ] Verify file size validation (max 50MB)
- [ ] Verify file type validation
- [ ] View upload progress

### 25.2 Performance and Accessibility Audit

#### Lighthouse Audit
- [ ] Run Lighthouse audit on production build
- [ ] Performance score > 90
- [ ] Accessibility score > 90
- [ ] Best Practices score > 90
- [ ] SEO score > 90
- [ ] Address any critical issues

#### Keyboard Navigation
- [ ] Tab through all interactive elements on login page
- [ ] Tab through all interactive elements on dashboard
- [ ] Tab through all interactive elements on materials page
- [ ] Tab through all interactive elements on quizzes page
- [ ] Tab through all interactive elements on flashcards page
- [ ] Tab through all interactive elements on settings page
- [ ] Enter key activates buttons
- [ ] Escape key closes modals/dialogs
- [ ] Focus visible on all interactive elements

#### Screen Reader Compatibility
- [ ] Test with NVDA (Windows) or VoiceOver (Mac)
- [ ] All images have alt text
- [ ] All buttons have descriptive labels
- [ ] Form fields have associated labels
- [ ] Error messages are announced
- [ ] Loading states are announced
- [ ] Success messages are announced

#### Browser Compatibility
- [ ] Test on Chrome (latest)
- [ ] Test on Firefox (latest)
- [ ] Test on Safari (latest)
- [ ] Test on Edge (latest)
- [ ] Verify consistent behavior across browsers
- [ ] Verify consistent styling across browsers

### 25.3 Security Audit

#### CORS Configuration
- [ ] Verify preflight OPTIONS requests succeed
- [ ] Verify Access-Control-Allow-Origin header
- [ ] Verify Access-Control-Allow-Methods header
- [ ] Verify Access-Control-Allow-Headers header
- [ ] Verify Access-Control-Allow-Credentials header
- [ ] Test cross-origin requests from frontend

#### CSP Headers
- [ ] Verify Content-Security-Policy header in response
- [ ] Verify script-src directive
- [ ] Verify style-src directive
- [ ] Verify img-src directive
- [ ] Verify connect-src directive
- [ ] Test that inline scripts are blocked (if configured)
- [ ] Test that external scripts from unauthorized domains are blocked

#### Input Sanitization
- [ ] Test XSS prevention in text inputs
- [ ] Test XSS prevention in rich text editors
- [ ] Test SQL injection prevention in search fields
- [ ] Verify file upload validation (type, size, extension)
- [ ] Test HTML sanitization in user-generated content
- [ ] Verify no script execution in markdown rendering

#### Token Refresh and Session Management
- [ ] Verify token refresh before expiry (5 min threshold)
- [ ] Verify automatic retry of original request after refresh
- [ ] Verify request queuing during token refresh
- [ ] Verify logout clears all tokens
- [ ] Verify logout-all revokes all sessions
- [ ] Verify session list shows active devices
- [ ] Verify session revocation works

#### Sensitive Data Protection
- [ ] Verify no tokens in URL parameters
- [ ] Verify no tokens in console logs (production build)
- [ ] Verify no sensitive data in client bundles
- [ ] Verify no API keys exposed in client code
- [ ] Verify secure token storage (localStorage with encryption consideration)
- [ ] Verify HTTPS in production (check .env.production)

## Test Results Summary

### Issues Found
(To be filled during testing)

### Recommendations
(To be filled during testing)

### Sign-off
- [ ] All critical issues resolved
- [ ] All high-priority issues resolved or documented
- [ ] Performance meets requirements
- [ ] Accessibility meets WCAG AA standards
- [ ] Security audit passed
- [ ] Ready for production deployment
