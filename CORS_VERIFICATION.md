# CORS Configuration Verification Guide

This document provides instructions for verifying that the backend API Gateway has proper CORS configuration to allow the frontend to communicate with backend services.

## Requirements (23.1 - 23.6)

The API Gateway must be configured with the following CORS settings:

### 1. Allowed Origins (Requirement 23.1)

The `ALLOWED_ORIGINS` environment variable on the API Gateway must include:

- **Development**: `http://localhost:3000`
- **Production**: Your production domain (e.g., `https://app.lexiassist.com`)

**Backend Configuration Example:**
```bash
# In API Gateway .env file
ALLOWED_ORIGINS=http://localhost:3000,https://app.lexiassist.com
```

### 2. CORS Headers (Requirement 23.2)

The API Gateway must respond to preflight OPTIONS requests with these headers:

- `Access-Control-Allow-Origin`: The requesting origin (from ALLOWED_ORIGINS)
- `Access-Control-Allow-Methods`: GET, POST, PUT, PATCH, DELETE, OPTIONS
- `Access-Control-Allow-Headers`: Content-Type, Authorization, X-User-ID, X-Correlation-ID
- `Access-Control-Allow-Credentials`: true

### 3. Allowed HTTP Methods (Requirement 23.3)

The following HTTP methods must be allowed:
- GET
- POST
- PUT
- PATCH
- DELETE
- OPTIONS (for preflight requests)

### 4. Allowed Headers (Requirement 23.4, 23.5)

The following request headers must be allowed:
- `Content-Type` - For JSON payloads
- `Authorization` - For JWT Bearer tokens
- `X-User-ID` - For user identification
- `X-Correlation-ID` - For request tracing

### 5. Credentials Support (Requirement 23.6)

The API Gateway must set `Access-Control-Allow-Credentials: true` to support:
- Cookie-based sessions (if implemented)
- Authorization headers with credentials

## Verification Steps

### Manual Verification with cURL

Test the CORS configuration using cURL to simulate browser preflight requests:

#### 1. Test Preflight Request (OPTIONS)

```bash
curl -X OPTIONS http://localhost:8080/api/v1/auth/login \
  -H "Origin: http://localhost:3000" \
  -H "Access-Control-Request-Method: POST" \
  -H "Access-Control-Request-Headers: Content-Type, Authorization" \
  -v
```

**Expected Response Headers:**
```
Access-Control-Allow-Origin: http://localhost:3000
Access-Control-Allow-Methods: GET, POST, PUT, PATCH, DELETE, OPTIONS
Access-Control-Allow-Headers: Content-Type, Authorization, X-User-ID, X-Correlation-ID
Access-Control-Allow-Credentials: true
```

#### 2. Test Actual Request with CORS Headers

```bash
curl -X POST http://localhost:8080/api/v1/auth/login \
  -H "Origin: http://localhost:3000" \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}' \
  -v
```

**Expected Response Headers:**
```
Access-Control-Allow-Origin: http://localhost:3000
Access-Control-Allow-Credentials: true
```

### Browser DevTools Verification

1. Open the frontend application in your browser (http://localhost:3000)
2. Open Browser DevTools (F12)
3. Go to the Network tab
4. Perform an action that makes an API request (e.g., login)
5. Check the request headers and response headers

**Look for:**
- Request has `Origin: http://localhost:3000` header
- Response has `Access-Control-Allow-Origin: http://localhost:3000` header
- No CORS errors in the Console tab

### Automated Verification Script

Create a Node.js script to test CORS configuration:

```javascript
// verify-cors.js
const fetch = require('node-fetch');

const API_GATEWAY_URL = process.env.NEXT_PUBLIC_API_GATEWAY_URL || 'http://localhost:8080';
const FRONTEND_ORIGIN = 'http://localhost:3000';

async function verifyCORS() {
  console.log('Testing CORS configuration...\n');
  
  try {
    // Test preflight request
    const preflightResponse = await fetch(`${API_GATEWAY_URL}/api/v1/auth/login`, {
      method: 'OPTIONS',
      headers: {
        'Origin': FRONTEND_ORIGIN,
        'Access-Control-Request-Method': 'POST',
        'Access-Control-Request-Headers': 'Content-Type, Authorization',
      },
    });
    
    console.log('Preflight Response Status:', preflightResponse.status);
    console.log('Preflight Response Headers:');
    console.log('  Access-Control-Allow-Origin:', preflightResponse.headers.get('Access-Control-Allow-Origin'));
    console.log('  Access-Control-Allow-Methods:', preflightResponse.headers.get('Access-Control-Allow-Methods'));
    console.log('  Access-Control-Allow-Headers:', preflightResponse.headers.get('Access-Control-Allow-Headers'));
    console.log('  Access-Control-Allow-Credentials:', preflightResponse.headers.get('Access-Control-Allow-Credentials'));
    
    // Verify expected values
    const allowOrigin = preflightResponse.headers.get('Access-Control-Allow-Origin');
    const allowMethods = preflightResponse.headers.get('Access-Control-Allow-Methods');
    const allowHeaders = preflightResponse.headers.get('Access-Control-Allow-Headers');
    const allowCredentials = preflightResponse.headers.get('Access-Control-Allow-Credentials');
    
    console.log('\nVerification Results:');
    console.log('✓ Origin allowed:', allowOrigin === FRONTEND_ORIGIN || allowOrigin === '*');
    console.log('✓ Methods include POST:', allowMethods?.includes('POST'));
    console.log('✓ Headers include Content-Type:', allowHeaders?.includes('Content-Type'));
    console.log('✓ Headers include Authorization:', allowHeaders?.includes('Authorization'));
    console.log('✓ Credentials allowed:', allowCredentials === 'true');
    
  } catch (error) {
    console.error('CORS verification failed:', error.message);
  }
}

verifyCORS();
```

Run the script:
```bash
node verify-cors.js
```

## Common CORS Issues and Solutions

### Issue 1: "No 'Access-Control-Allow-Origin' header is present"

**Cause:** API Gateway is not configured to allow the frontend origin.

**Solution:** Add the frontend origin to `ALLOWED_ORIGINS` environment variable in the API Gateway.

### Issue 2: "CORS policy: Request header field authorization is not allowed"

**Cause:** The `Authorization` header is not in the allowed headers list.

**Solution:** Ensure `Access-Control-Allow-Headers` includes `Authorization`.

### Issue 3: "CORS policy: The value of the 'Access-Control-Allow-Credentials' header is ''"

**Cause:** The API Gateway is not setting `Access-Control-Allow-Credentials: true`.

**Solution:** Configure the API Gateway to set this header for all CORS responses.

### Issue 4: Preflight requests failing with 404

**Cause:** API Gateway is not handling OPTIONS requests.

**Solution:** Add OPTIONS method handler to all routes in the API Gateway.

## Backend Implementation Reference

The API Gateway should implement CORS middleware similar to this:

```go
// Example Go CORS middleware
func CORSMiddleware(allowedOrigins []string) gin.HandlerFunc {
    return func(c *gin.Context) {
        origin := c.Request.Header.Get("Origin")
        
        // Check if origin is allowed
        allowed := false
        for _, allowedOrigin := range allowedOrigins {
            if origin == allowedOrigin {
                allowed = true
                break
            }
        }
        
        if allowed {
            c.Writer.Header().Set("Access-Control-Allow-Origin", origin)
            c.Writer.Header().Set("Access-Control-Allow-Credentials", "true")
            c.Writer.Header().Set("Access-Control-Allow-Methods", "GET, POST, PUT, PATCH, DELETE, OPTIONS")
            c.Writer.Header().Set("Access-Control-Allow-Headers", "Content-Type, Authorization, X-User-ID, X-Correlation-ID")
            c.Writer.Header().Set("Access-Control-Max-Age", "86400") // 24 hours
        }
        
        // Handle preflight requests
        if c.Request.Method == "OPTIONS" {
            c.AbortWithStatus(204)
            return
        }
        
        c.Next()
    }
}
```

## Testing Checklist

- [ ] Preflight OPTIONS request returns 204 status
- [ ] Preflight response includes all required CORS headers
- [ ] Actual requests include `Access-Control-Allow-Origin` header
- [ ] Frontend can successfully make authenticated requests
- [ ] No CORS errors appear in browser console
- [ ] File uploads work correctly
- [ ] WebSocket connections establish successfully
- [ ] All HTTP methods (GET, POST, PUT, PATCH, DELETE) work

## Production Deployment Notes

When deploying to production:

1. Update `ALLOWED_ORIGINS` to include production domain
2. Remove `http://localhost:3000` from production ALLOWED_ORIGINS
3. Ensure HTTPS is enforced (no HTTP origins in production)
4. Test CORS configuration in staging environment before production
5. Monitor CORS errors in production logs

## References

- [MDN CORS Documentation](https://developer.mozilla.org/en-US/docs/Web/HTTP/CORS)
- [W3C CORS Specification](https://www.w3.org/TR/cors/)
- Requirements: 23.1, 23.2, 23.3, 23.4, 23.5, 23.6
