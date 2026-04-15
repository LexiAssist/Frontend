# Security Audit Checklist - Task 25.3

## Overview
This checklist covers all security aspects of the frontend-backend integration, including CORS, CSP, input sanitization, token management, and sensitive data protection.

## 1. CORS Configuration Verification

### 1.1 Preflight Requests
- [ ] **Test OPTIONS request to API Gateway**
  ```bash
  curl -X OPTIONS http://localhost:8080/api/v1/users/me \
    -H "Origin: http://localhost:3000" \
    -H "Access-Control-Request-Method: GET" \
    -H "Access-Control-Request-Headers: Authorization" \
    -v
  ```
  **Expected Response Headers:**
  - `Access-Control-Allow-Origin: http://localhost:3000`
  - `Access-Control-Allow-Methods: GET, POST, PUT, PATCH, DELETE, OPTIONS`
  - `Access-Control-Allow-Headers: Content-Type, Authorization, X-User-ID, X-Correlation-ID`
  - `Access-Control-Allow-Credentials: true`

### 1.2 Actual Request CORS Headers
- [ ] **Test GET request with credentials**
  ```bash
  curl http://localhost:8080/api/v1/users/me \
    -H "Origin: http://localhost:3000" \
    -H "Authorization: Bearer <token>" \
    -v
  ```
  **Expected Response Headers:**
  - `Access-Control-Allow-Origin: http://localhost:3000`
  - `Access-Control-Allow-Credentials: true`

### 1.3 Cross-Origin Request from Frontend
- [ ] Open browser DevTools > Network tab
- [ ] Make API request from frontend
- [ ] Verify CORS headers in response
- [ ] Verify no CORS errors in console

### 1.4 CORS Configuration in API Gateway
- [ ] Verify `ALLOWED_ORIGINS` environment variable includes frontend URL
- [ ] Verify allowed methods include: GET, POST, PUT, PATCH, DELETE, OPTIONS
- [ ] Verify allowed headers include: Content-Type, Authorization, X-User-ID, X-Correlation-ID
- [ ] Verify credentials are allowed

**Status:** ⬜ Pass ⬜ Fail
**Notes:** ___________

---

## 2. Content Security Policy (CSP) Headers

### 2.1 CSP Header Verification
- [ ] **Check CSP header in response**
  ```bash
  curl -I http://localhost:3000/dashboard
  ```
  **Expected Header:**
  ```
  Content-Security-Policy: default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob: https:; font-src 'self' data:; connect-src 'self' https://*.lexiassist.com wss://*.lexiassist.com; media-src 'self' blob:; object-src 'none'; base-uri 'self'; form-action 'self'; frame-ancestors 'none'; upgrade-insecure-requests
  ```

### 2.2 CSP Directive Testing

#### 2.2.1 script-src
- [ ] **Test inline script blocking (if strict CSP)**
  - Add `<script>alert('test')</script>` to page
  - Expected: Blocked by CSP (check console)
  - Note: In production, inline scripts should be blocked or use nonce

#### 2.2.2 style-src
- [ ] **Test inline styles**
  - Verify inline styles work (needed for Next.js)
  - Check for CSP violations in console

#### 2.2.3 img-src
- [ ] **Test image loading**
  - Load image from same origin: ✅ Should work
  - Load image from data URI: ✅ Should work
  - Load image from blob: ✅ Should work
  - Load image from HTTPS: ✅ Should work

#### 2.2.4 connect-src
- [ ] **Test API connections**
  - API Gateway (localhost:8080): ✅ Should work
  - WebSocket (ws://localhost:8080): ✅ Should work
  - External API (unauthorized): ❌ Should be blocked

#### 2.2.5 frame-ancestors
- [ ] **Test iframe embedding**
  - Try to embed app in iframe
  - Expected: Blocked by `frame-ancestors 'none'`

### 2.3 CSP Violation Reporting
- [ ] Open browser DevTools > Console
- [ ] Navigate through all pages
- [ ] Check for CSP violation warnings
- [ ] Document any violations

**Status:** ⬜ Pass ⬜ Fail
**Notes:** ___________

---

## 3. Input Sanitization

### 3.1 XSS Prevention

#### 3.1.1 Text Input Fields
- [ ] **Test XSS in login form**
  - Email: `<script>alert('XSS')</script>`
  - Expected: Script not executed, input sanitized

- [ ] **Test XSS in course name**
  - Name: `<img src=x onerror=alert('XSS')>`
  - Expected: Script not executed, HTML escaped

- [ ] **Test XSS in material title**
  - Title: `<svg onload=alert('XSS')>`
  - Expected: Script not executed, HTML escaped

#### 3.1.2 Rich Text / Markdown
- [ ] **Test XSS in notes/markdown**
  - Content: `[Click me](javascript:alert('XSS'))`
  - Expected: JavaScript URL blocked or sanitized

- [ ] **Test HTML injection in markdown**
  - Content: `<iframe src="http://evil.com"></iframe>`
  - Expected: Iframe removed or sanitized

#### 3.1.3 URL Parameters
- [ ] **Test XSS in URL parameters**
  - URL: `/dashboard?name=<script>alert('XSS')</script>`
  - Expected: Script not executed

### 3.2 SQL Injection Prevention
- [ ] **Test SQL injection in search**
  - Search: `' OR '1'='1`
  - Expected: Treated as literal string, no SQL execution

- [ ] **Test SQL injection in filters**
  - Filter: `1; DROP TABLE users;--`
  - Expected: Treated as literal string, no SQL execution

### 3.3 File Upload Validation

#### 3.3.1 File Type Validation
- [ ] **Test allowed file types**
  - PDF: ✅ Should be accepted
  - DOCX: ✅ Should be accepted
  - TXT: ✅ Should be accepted
  - MD: ✅ Should be accepted

- [ ] **Test disallowed file types**
  - EXE: ❌ Should be rejected
  - JS: ❌ Should be rejected
  - HTML: ❌ Should be rejected
  - PHP: ❌ Should be rejected

#### 3.3.2 File Size Validation
- [ ] **Test file size limits**
  - File < 50MB: ✅ Should be accepted
  - File > 50MB: ❌ Should be rejected with error message

#### 3.3.3 File Content Validation
- [ ] **Test file with malicious content**
  - Upload PDF with embedded JavaScript
  - Expected: File accepted but JavaScript not executed when viewed

### 3.4 DOMPurify Implementation
- [ ] Verify DOMPurify is installed: `npm list isomorphic-dompurify`
- [ ] Check sanitization in `src/lib/sanitize.ts`
- [ ] Verify sanitization is used before rendering user content

**Status:** ⬜ Pass ⬜ Fail
**Notes:** ___________

---

## 4. Token Refresh and Session Management

### 4.1 Token Storage
- [ ] **Check token storage location**
  - Open DevTools > Application > Local Storage
  - Verify tokens stored under `lexi-auth-storage` key
  - Verify tokens are not in cookies (unless using httpOnly cookies)

### 4.2 Token Expiry and Refresh

#### 4.2.1 Automatic Token Refresh
- [ ] **Test token refresh before expiry**
  - Login and wait until token expires in 5 minutes
  - Make API request
  - Expected: Token automatically refreshed, request succeeds
  - Verify in Network tab: Two requests (refresh + original)

#### 4.2.2 Token Refresh on 401
- [ ] **Test token refresh on 401 response**
  - Manually expire token in localStorage
  - Make API request
  - Expected: 401 response triggers refresh, request retried

#### 4.2.3 Request Queuing During Refresh
- [ ] **Test multiple simultaneous requests during refresh**
  - Make 3 API requests simultaneously when token is expired
  - Expected: Only one refresh request, all 3 requests queued and retried

### 4.3 Session Management

#### 4.3.1 Active Sessions List
- [ ] Navigate to Settings > Sessions
- [ ] Verify list of active sessions displayed
- [ ] Verify current session marked with "This device"
- [ ] Verify session details: device, browser, IP, location, last active

#### 4.3.2 Session Revocation
- [ ] **Test single session revocation**
  - Click "Revoke" on a session
  - Expected: Session removed from list
  - Verify revoked session cannot make API requests

- [ ] **Test logout all devices**
  - Click "Logout All Devices"
  - Expected: All sessions revoked, redirected to login

### 4.4 Logout Functionality

#### 4.4.1 Single Device Logout
- [ ] Click "Logout" button
- [ ] Verify redirect to login page
- [ ] Verify tokens cleared from localStorage
- [ ] Try to access protected route
- [ ] Expected: Redirect to login

#### 4.4.2 Logout API Call
- [ ] Open DevTools > Network tab
- [ ] Click "Logout"
- [ ] Verify POST request to `/api/v1/auth/logout`
- [ ] Verify request includes access token
- [ ] Verify local state cleared even if request fails

**Status:** ⬜ Pass ⬜ Fail
**Notes:** ___________

---

## 5. Sensitive Data Protection

### 5.1 Token Exposure Prevention

#### 5.1.1 URL Parameters
- [ ] **Check for tokens in URLs**
  - Navigate through all pages
  - Check browser address bar
  - Expected: No tokens in URL parameters

#### 5.1.2 Console Logs
- [ ] **Check for tokens in console (Production Build)**
  - Build production version: `npm run build && npm start`
  - Open DevTools > Console
  - Navigate through app
  - Expected: No tokens logged in console

#### 5.1.3 Network Requests
- [ ] **Check for tokens in request URLs**
  - Open DevTools > Network tab
  - Make API requests
  - Expected: Tokens only in Authorization header, not in URL

### 5.2 Client Bundle Analysis

#### 5.2.1 API Keys and Secrets
- [ ] **Check for exposed secrets in bundle**
  - Build production version
  - Search bundle for sensitive strings:
    ```bash
    cd Frontend/.next
    grep -r "API_KEY" .
    grep -r "SECRET" .
    grep -r "PASSWORD" .
    ```
  - Expected: No API keys or secrets in client bundle

#### 5.2.2 Environment Variables
- [ ] **Verify only NEXT_PUBLIC_* variables in client bundle**
  - Check `.env.production`
  - Verify only variables prefixed with `NEXT_PUBLIC_` are exposed
  - Verify `DATABASE_URL` not in client bundle

### 5.3 Source Maps in Production
- [ ] **Check source maps in production**
  - Build production version
  - Check for `.map` files in `.next` directory
  - Expected: Source maps disabled or not served in production

### 5.4 Error Messages
- [ ] **Check error messages for information disclosure**
  - Trigger various errors (404, 500, validation)
  - Verify error messages don't expose:
    - Stack traces
    - Database queries
    - Internal paths
    - Sensitive configuration

**Status:** ⬜ Pass ⬜ Fail
**Notes:** ___________

---

## 6. HTTPS and Secure Communication

### 6.1 Production HTTPS Configuration
- [ ] **Verify HTTPS in production environment**
  - Check `.env.production`
  - Verify `NEXT_PUBLIC_API_GATEWAY_URL` uses `https://`
  - Verify `NEXT_PUBLIC_WS_URL` uses `wss://`

### 6.2 Mixed Content Prevention
- [ ] **Check for mixed content warnings**
  - Open DevTools > Console
  - Navigate through app
  - Expected: No mixed content warnings (HTTP resources on HTTPS page)

### 6.3 Secure WebSocket Connection
- [ ] **Verify WebSocket uses WSS in production**
  - Check WebSocket connection in Network tab
  - Expected: `wss://` protocol in production

**Status:** ⬜ Pass ⬜ Fail
**Notes:** ___________

---

## 7. Additional Security Headers

### 7.1 Security Headers Verification
- [ ] **Check security headers in response**
  ```bash
  curl -I http://localhost:3000/
  ```
  **Expected Headers:**
  - `X-Frame-Options: DENY`
  - `X-Content-Type-Options: nosniff`
  - `Referrer-Policy: strict-origin-when-cross-origin`
  - `X-XSS-Protection: 1; mode=block`
  - `Permissions-Policy: camera=(), microphone=(self), geolocation=()`

### 7.2 Cookie Security (if using cookies)
- [ ] **Check cookie attributes**
  - Open DevTools > Application > Cookies
  - Verify cookies have:
    - `Secure` flag (HTTPS only)
    - `HttpOnly` flag (not accessible via JavaScript)
    - `SameSite=Strict` or `SameSite=Lax`

**Status:** ⬜ Pass ⬜ Fail
**Notes:** ___________

---

## 8. Dependency Security

### 8.1 Vulnerable Dependencies
- [ ] **Run npm audit**
  ```bash
  cd Frontend
  npm audit
  ```
  - Expected: No high or critical vulnerabilities
  - Document any vulnerabilities found
  - Plan remediation for vulnerabilities

### 8.2 Outdated Dependencies
- [ ] **Check for outdated packages**
  ```bash
  npm outdated
  ```
  - Review outdated packages
  - Update packages with security fixes

**Status:** ⬜ Pass ⬜ Fail
**Notes:** ___________

---

## 9. Rate Limiting and Abuse Prevention

### 9.1 API Rate Limiting
- [ ] **Test rate limiting on API Gateway**
  - Make rapid API requests (> 100 in 1 minute)
  - Expected: 429 Too Many Requests response
  - Verify error message includes retry-after time

### 9.2 Login Attempt Limiting
- [ ] **Test login rate limiting**
  - Make 5+ failed login attempts
  - Expected: Account locked or rate limited
  - Verify error message displayed

**Status:** ⬜ Pass ⬜ Fail
**Notes:** ___________

---

## 10. Security Testing Tools

### 10.1 OWASP ZAP Scan
- [ ] Run OWASP ZAP automated scan
- [ ] Review findings
- [ ] Document vulnerabilities
- [ ] Plan remediation

### 10.2 Browser Security Audit
- [ ] Run Chrome DevTools Security audit
- [ ] Review security issues
- [ ] Fix any issues found

**Status:** ⬜ Pass ⬜ Fail
**Notes:** ___________

---

## Summary

### Critical Issues (Must Fix Before Production)
1. 
2. 
3. 

### High Priority Issues
1. 
2. 
3. 

### Medium Priority Issues
1. 
2. 
3. 

### Low Priority Issues
1. 
2. 
3. 

### Recommendations
1. 
2. 
3. 

### Sign-off
- [ ] All critical issues resolved
- [ ] All high priority issues resolved or documented
- [ ] CORS properly configured
- [ ] CSP headers implemented
- [ ] Input sanitization working
- [ ] Token management secure
- [ ] No sensitive data exposed
- [ ] Security headers present
- [ ] No vulnerable dependencies
- [ ] Ready for production deployment

**Auditor:** ___________
**Date:** ___________
**Signature:** ___________
