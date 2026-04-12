# Testing Quick Start Guide

## Overview
This quick start guide helps you begin testing the LexiAssist frontend-backend integration immediately.

## Prerequisites Checklist

### Backend Services
```bash
# Check if services are running
curl http://localhost:8080/health  # API Gateway
curl http://localhost:8081/health  # User Service
curl http://localhost:8082/health  # Content Service
curl http://localhost:8083/health  # Analytics Service
curl http://localhost:8085/health  # Sync Service
curl http://localhost:8000/health  # AI Service
```

### Frontend Setup
```bash
cd Frontend
npm install
npm run dev  # Development mode
# OR
npm run build && npm start  # Production mode
```

## Quick Test Scenarios (15 minutes)

### 1. Authentication Flow (3 minutes)
1. Navigate to http://localhost:3000/register
2. Register new account
3. Verify email (check console for code in dev mode)
4. Login with credentials
5. Verify redirect to dashboard
6. Logout

**Expected:** All steps succeed without errors

### 2. File Upload (2 minutes)
1. Navigate to Materials page
2. Create a course
3. Upload a PDF file (< 50MB)
4. Verify upload progress bar
5. Verify file appears in materials list

**Expected:** File uploads successfully to MinIO

### 3. AI Feature Test (3 minutes)
1. Navigate to Text-to-Speech page
2. Enter text: "Hello, this is a test"
3. Select language: English
4. Click "Generate Audio"
5. Play audio

**Expected:** Audio generates and plays

### 4. WebSocket Sync (2 minutes)
1. Open two browser windows
2. Login to same account in both
3. Create a course in window 1
4. Verify course appears in window 2 without refresh

**Expected:** Real-time sync works

### 5. Error Handling (2 minutes)
1. Try to login with wrong password
2. Try to upload file > 50MB
3. Try to upload .exe file

**Expected:** User-friendly error messages displayed

### 6. Keyboard Navigation (3 minutes)
1. Navigate to login page
2. Use only Tab key to move through form
3. Press Enter to submit
4. Verify focus visible on all elements

**Expected:** All interactive elements accessible via keyboard

## Quick Security Check (5 minutes)

### 1. Check CSP Headers
```bash
# Open browser DevTools > Network tab
# Refresh page
# Click first request
# Check Response Headers for Content-Security-Policy
```

### 2. Test XSS Prevention
```javascript
// Try entering in a text field:
<script>alert('XSS')</script>

// Expected: Script not executed, content sanitized
```

### 3. Check CORS
```bash
# Open browser DevTools > Network tab
# Make API request
# Check for Access-Control-Allow-Origin header
```

## Quick Performance Check (5 minutes)

### 1. Run Lighthouse Audit
1. Open Chrome DevTools (F12)
2. Click "Lighthouse" tab
3. Select all categories
4. Click "Analyze page load"
5. Wait for results

**Target Scores:**
- Performance: > 90
- Accessibility: > 90
- Best Practices: > 90
- SEO: > 90

## Comprehensive Testing (Full Day)

For comprehensive testing, follow these guides in order:

### Day 1: Integration Testing
📖 **Guide:** `MANUAL_TESTING_GUIDE.md`
- Complete user journey (2-3 hours)
- All AI features (2-3 hours)
- Error handling (1 hour)
- WebSocket sync (1 hour)

### Day 2: Performance & Accessibility
📖 **Guides:** `LIGHTHOUSE_AUDIT_GUIDE.md` + `ACCESSIBILITY_TESTING_GUIDE.md`
- Lighthouse audits (2 hours)
- Keyboard navigation (2 hours)
- Screen reader testing (2 hours)
- Color contrast (1 hour)

### Day 3: Security & Browser Compatibility
📖 **Guides:** `SECURITY_AUDIT_CHECKLIST.md` + `BROWSER_COMPATIBILITY_GUIDE.md`
- Security audit (3 hours)
- Browser testing (3 hours)
- Mobile testing (2 hours)

## Documentation Index

### Testing Guides
1. **INTEGRATION_TEST_PLAN.md** - Master test plan with tracking
2. **MANUAL_TESTING_GUIDE.md** - Detailed test scenarios
3. **LIGHTHOUSE_AUDIT_GUIDE.md** - Performance audit
4. **ACCESSIBILITY_TESTING_GUIDE.md** - WCAG AA compliance
5. **BROWSER_COMPATIBILITY_GUIDE.md** - Cross-browser testing
6. **SECURITY_AUDIT_CHECKLIST.md** - Security verification

### Implementation Guides
7. **CORS_VERIFICATION.md** - CORS configuration
8. **CSP_TESTING_GUIDE.md** - CSP implementation
9. **INPUT_SANITIZATION_GUIDE.md** - Input sanitization
10. **SECURITY_IMPLEMENTATION_SUMMARY.md** - Security overview

### Summary
11. **TASK_25_COMPLETION_SUMMARY.md** - Task 25 overview
12. **TESTING_QUICK_START.md** - This file

## Common Issues & Solutions

### Issue: Backend not responding
**Solution:** Ensure all backend services are running
```bash
# Check service status
ps aux | grep "go run"
ps aux | grep "python"
```

### Issue: CORS errors in console
**Solution:** Verify backend CORS configuration
📖 See: `CORS_VERIFICATION.md`

### Issue: CSP violations
**Solution:** Check CSP configuration in next.config.ts
📖 See: `CSP_TESTING_GUIDE.md`

### Issue: File upload fails
**Solution:** Check MinIO is running and configured
```bash
# Check MinIO status
curl http://localhost:9000/minio/health/live
```

### Issue: WebSocket connection fails
**Solution:** Check Sync Service is running on port 8085
```bash
curl http://localhost:8085/health
```

## Test Results Tracking

### Quick Test Results
- [ ] Authentication flow
- [ ] File upload
- [ ] AI feature
- [ ] WebSocket sync
- [ ] Error handling
- [ ] Keyboard navigation

### Comprehensive Test Results
- [ ] Integration testing complete
- [ ] Performance audit complete
- [ ] Accessibility audit complete
- [ ] Security audit complete
- [ ] Browser compatibility complete

### Issues Found
1. ___________
2. ___________
3. ___________

## Next Steps After Testing

### If All Tests Pass ✅
1. Review `TASK_25_COMPLETION_SUMMARY.md`
2. Complete sign-off checklist
3. Prepare for production deployment

### If Issues Found ❌
1. Document issues in `INTEGRATION_TEST_PLAN.md`
2. Prioritize: Critical > High > Medium > Low
3. Fix critical and high priority issues
4. Re-test affected areas
5. Repeat until all tests pass

## Getting Help

### Documentation
- All guides are in the `Frontend/` directory
- Each guide has detailed instructions and examples
- Check "Common Issues" sections in each guide

### Backend Team
- For CORS issues: Share `CORS_VERIFICATION.md`
- For API issues: Check backend logs
- For WebSocket issues: Check Sync Service logs

### Frontend Team
- For UI issues: Check browser console
- For performance issues: Run Lighthouse audit
- For accessibility issues: Use axe DevTools

## Quick Commands Reference

```bash
# Start frontend dev
cd Frontend && npm run dev

# Build production
cd Frontend && npm run build && npm start

# Check backend health
curl http://localhost:8080/health

# Test CORS
curl -X OPTIONS http://localhost:8080/api/v1/auth/login \
  -H "Origin: http://localhost:3000" \
  -H "Access-Control-Request-Method: POST" \
  -v

# Run Lighthouse CLI
lighthouse http://localhost:3000 --view

# Check npm dependencies
cd Frontend && npm audit
```

## Success Criteria Summary

✅ **Integration:** All features work with real backend
✅ **Performance:** Lighthouse score > 90
✅ **Accessibility:** WCAG AA compliant, score > 90
✅ **Security:** CORS, CSP, input sanitization verified
✅ **Compatibility:** Works on Chrome, Firefox, Safari, Edge
✅ **Mobile:** Works on mobile browsers

## Ready to Start?

1. ✅ Verify prerequisites (backend services running)
2. ✅ Start frontend (`npm run dev`)
3. ✅ Run quick test scenarios (15 minutes)
4. ✅ If quick tests pass, proceed to comprehensive testing
5. ✅ Follow guides in order
6. ✅ Document results
7. ✅ Fix issues
8. ✅ Complete sign-off

**Good luck with testing! 🚀**
