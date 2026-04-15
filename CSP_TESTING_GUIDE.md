# Content Security Policy (CSP) Testing Guide

This document provides instructions for testing the Content Security Policy implementation in the LexiAssist frontend.

## Overview

Content Security Policy (CSP) is a security feature that helps prevent Cross-Site Scripting (XSS) attacks by controlling which resources can be loaded and executed on the page.

## CSP Configuration

The CSP headers are configured in `next.config.ts` with different policies for development and production:

### Development CSP
- Allows `unsafe-eval` for Next.js hot module replacement
- Allows `unsafe-inline` for inline scripts and styles
- Allows connections to localhost on any port
- Allows WebSocket connections to localhost

### Production CSP
- Stricter policy without `unsafe-eval`
- Only allows `unsafe-inline` for Next.js inline scripts
- Restricts connections to production domains
- Enforces HTTPS with `upgrade-insecure-requests`

## Testing CSP in Development

### 1. Start the Development Server

```bash
cd Frontend
npm run dev
```

### 2. Check CSP Headers in Browser

1. Open http://localhost:3000 in your browser
2. Open DevTools (F12)
3. Go to the Network tab
4. Refresh the page
5. Click on the first request (localhost)
6. Go to the Headers tab
7. Look for `Content-Security-Policy` in Response Headers

**Expected CSP Header (Development):**
```
default-src 'self'; script-src 'self' 'unsafe-eval' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob: https:; font-src 'self' data:; connect-src 'self' http://localhost:* ws://localhost:* wss://localhost:*; media-src 'self' blob:; object-src 'none'; base-uri 'self'; form-action 'self'; frame-ancestors 'none'; upgrade-insecure-requests
```

### 3. Verify CSP is Working

#### Test 1: Inline Script Execution
CSP should allow inline scripts in development:

```html
<!-- This should work in development -->
<button onclick="alert('test')">Click me</button>
```

#### Test 2: External Script Loading
CSP should block external scripts from unauthorized domains:

```html
<!-- This should be blocked -->
<script src="https://evil.com/malicious.js"></script>
```

Check the Console tab for CSP violation errors:
```
Refused to load the script 'https://evil.com/malicious.js' because it violates the following Content Security Policy directive: "script-src 'self' 'unsafe-eval' 'unsafe-inline'"
```

#### Test 3: API Connections
CSP should allow connections to localhost:

```javascript
// This should work
fetch('http://localhost:8080/api/v1/auth/login')
```

#### Test 4: WebSocket Connections
CSP should allow WebSocket connections to localhost:

```javascript
// This should work
const ws = new WebSocket('ws://localhost:8085/api/v1/ws');
```

### 4. Monitor CSP Violations

Open the Console tab in DevTools and look for CSP violation messages. Any blocked resources will appear as errors:

```
Refused to execute inline script because it violates the following Content Security Policy directive: ...
```

## Testing CSP in Production

### 1. Build for Production

```bash
cd Frontend
npm run build
npm start
```

### 2. Check Production CSP Headers

Follow the same steps as development testing, but verify the stricter production CSP:

**Expected CSP Header (Production):**
```
default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob: https:; font-src 'self' data:; connect-src 'self' https://*.lexiassist.com wss://*.lexiassist.com; media-src 'self' blob:; object-src 'none'; base-uri 'self'; form-action 'self'; frame-ancestors 'none'; upgrade-insecure-requests
```

### 3. Verify Production Restrictions

#### Test 1: No unsafe-eval
Production CSP should NOT include `unsafe-eval`:

```javascript
// This should be blocked in production
eval('alert("test")');
```

#### Test 2: Domain Restrictions
Production CSP should only allow connections to production domains:

```javascript
// This should be blocked in production
fetch('http://localhost:8080/api/v1/auth/login')
```

## Additional Security Headers

The configuration also includes other security headers:

### X-Frame-Options
Prevents the page from being embedded in iframes:
```
X-Frame-Options: DENY
```

### X-Content-Type-Options
Prevents MIME type sniffing:
```
X-Content-Type-Options: nosniff
```

### Referrer-Policy
Controls referrer information:
```
Referrer-Policy: strict-origin-when-cross-origin
```

### X-XSS-Protection
Enables browser XSS protection:
```
X-XSS-Protection: 1; mode=block
```

### Permissions-Policy
Controls browser features:
```
Permissions-Policy: camera=(), microphone=(self), geolocation=()
```

## Automated Testing Script

Create a Node.js script to verify CSP headers:

```javascript
// test-csp.js
const http = require('http');

function testCSP(port = 3000) {
  const options = {
    hostname: 'localhost',
    port: port,
    path: '/',
    method: 'GET',
  };

  const req = http.request(options, (res) => {
    console.log('Testing CSP Headers...\n');
    console.log('Status Code:', res.statusCode);
    console.log('\nSecurity Headers:');
    console.log('  Content-Security-Policy:', res.headers['content-security-policy']);
    console.log('  X-Frame-Options:', res.headers['x-frame-options']);
    console.log('  X-Content-Type-Options:', res.headers['x-content-type-options']);
    console.log('  Referrer-Policy:', res.headers['referrer-policy']);
    console.log('  X-XSS-Protection:', res.headers['x-xss-protection']);
    console.log('  Permissions-Policy:', res.headers['permissions-policy']);
    
    // Verify CSP is present
    if (res.headers['content-security-policy']) {
      console.log('\n✓ CSP header is present');
      
      const csp = res.headers['content-security-policy'];
      
      // Check for required directives
      const requiredDirectives = [
        'default-src',
        'script-src',
        'style-src',
        'img-src',
        'connect-src',
        'object-src',
        'base-uri',
        'form-action',
        'frame-ancestors',
      ];
      
      console.log('\nCSP Directives:');
      requiredDirectives.forEach(directive => {
        if (csp.includes(directive)) {
          console.log(`  ✓ ${directive}`);
        } else {
          console.log(`  ✗ ${directive} (missing)`);
        }
      });
    } else {
      console.log('\n✗ CSP header is missing');
    }
  });

  req.on('error', (e) => {
    console.error(`Error: ${e.message}`);
  });

  req.end();
}

testCSP();
```

Run the script:
```bash
node test-csp.js
```

## Common CSP Issues and Solutions

### Issue 1: "Refused to execute inline script"

**Cause:** Inline scripts are blocked by CSP.

**Solution:** 
- Use external script files instead of inline scripts
- Or add `'unsafe-inline'` to script-src (less secure)

### Issue 2: "Refused to load the stylesheet"

**Cause:** External stylesheets from unauthorized domains.

**Solution:**
- Host stylesheets on your domain
- Or add the domain to style-src directive

### Issue 3: "Refused to connect to"

**Cause:** API endpoint not in connect-src whitelist.

**Solution:**
- Add the API domain to connect-src directive
- Verify the domain matches exactly (including protocol)

### Issue 4: Next.js hot reload not working

**Cause:** CSP blocking WebSocket connections.

**Solution:**
- Ensure `ws://localhost:*` is in connect-src for development
- Check that `unsafe-eval` is present in development script-src

## CSP Reporting (Future Enhancement)

To monitor CSP violations in production, you can add a report-uri directive:

```typescript
// In next.config.ts
"report-uri /api/csp-report"
```

Then create an API endpoint to log violations:

```typescript
// pages/api/csp-report.ts
export default function handler(req, res) {
  console.log('CSP Violation:', req.body);
  res.status(204).end();
}
```

## Testing Checklist

- [ ] CSP header is present in response
- [ ] All required directives are configured
- [ ] Development mode allows hot reload
- [ ] Production mode has stricter policy
- [ ] External scripts from unauthorized domains are blocked
- [ ] API connections to backend work correctly
- [ ] WebSocket connections work correctly
- [ ] No CSP violations in normal operation
- [ ] Images load correctly
- [ ] Fonts load correctly
- [ ] Inline styles work (for Next.js)

## References

- [MDN CSP Documentation](https://developer.mozilla.org/en-US/docs/Web/HTTP/CSP)
- [CSP Evaluator](https://csp-evaluator.withgoogle.com/)
- [Content Security Policy Reference](https://content-security-policy.com/)
- Requirements: 23.1 (Security Implementation)
