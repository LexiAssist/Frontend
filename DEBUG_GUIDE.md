# Frontend Loading Issue - Debug Guide

## Quick Checks

### 1. Check Auth State (Browser Console)
```javascript
// Check if user is logged in
const token = localStorage.getItem('access_token');
console.log('Token exists:', !!token);
console.log('Token:', token?.substring(0, 20) + '...');

// Check auth store state
import('@/store/authStore').then(m => {
  console.log('Auth State:', m.useAuthStore.getState());
});
```

### 2. Check User API
```javascript
// Test getting current user
fetch('/api/v1/users/me', {
  headers: {
    'Authorization': `Bearer ${localStorage.getItem('access_token')}`
  }
})
.then(r => {
  console.log('Status:', r.status);
  if (!r.ok) throw new Error(`HTTP ${r.status}`);
  return r.json();
})
.then(data => console.log('User:', data))
.catch(e => console.error('Error:', e));
```

### 3. Check Study Stats API
```javascript
fetch('/api/v1/analytics/study-stats', {
  headers: {
    'Authorization': `Bearer ${localStorage.getItem('access_token')}`
  }
})
.then(r => {
  console.log('Stats Status:', r.status);
  return r.json();
})
.then(data => console.log('Stats:', data))
.catch(e => console.error('Stats Error:', e));
```

## Common Issues

### Issue 1: No Auth Token
**Symptom:** User not logged in, stuck on loading

**Fix:** 
1. Navigate to `/login`
2. Log in with credentials
3. Or register at `/register`

### Issue 2: Invalid/Expired Token
**Symptom:** APIs return 401 errors

**Fix:**
```javascript
// Clear token and re-login
localStorage.removeItem('access_token');
localStorage.removeItem('refresh_token');
window.location.href = '/login';
```

### Issue 3: CORS Errors
**Symptom:** Network errors, CORS messages in console

**Fix:** Check Gateway CORS settings in `services/gateway/internal/config/config.go` or `.env`

### Issue 4: Backend Service Down
**Symptom:** 502/503 errors

**Fix:** Check Docker containers:
```bash
docker ps
docker logs lexiassist-gateway
docker logs lexiassist-user-service
```

## Debug Steps

### Step 1: Check Console Errors
Open DevTools (F12) → Console tab. Look for:
- Red error messages
- Failed fetch requests
- React errors

### Step 2: Check Network Tab
Open DevTools → Network tab:
1. Refresh page
2. Look for failed requests (red)
3. Check response status codes

### Step 3: Check React Query Devtools
If enabled, check the React Query tab for:
- Query states (loading, error, success)
- Cached data
- Failed queries

## Quick Fix Commands

### Reset Everything
```javascript
// Clear all storage
localStorage.clear();
sessionStorage.clear();

// Reload
window.location.reload();
```

### Force Logout
```javascript
localStorage.removeItem('access_token');
localStorage.removeItem('refresh_token');
localStorage.removeItem('user');
window.location.href = '/login';
```

### Test All APIs
```javascript
const token = localStorage.getItem('access_token');
const headers = { 'Authorization': `Bearer ${token}` };

const apis = [
  { name: 'Health', url: '/health', auth: false },
  { name: 'User', url: '/api/v1/users/me', auth: true },
  { name: 'Stats', url: '/api/v1/analytics/study-stats', auth: true },
  { name: 'Goals', url: '/api/v1/analytics/goals', auth: true },
  { name: 'Courses', url: '/api/v1/courses', auth: true },
  { name: 'Quizzes', url: '/api/v1/quizzes', auth: true },
  { name: 'Materials', url: '/api/v1/materials', auth: true },
];

apis.forEach(api => {
  fetch(api.url, api.auth ? { headers } : {})
    .then(r => console.log(`${api.name}: ${r.status}`))
    .catch(e => console.error(`${api.name}: ${e.message}`));
});
```

## Next Steps

If still stuck:
1. Clear browser cache and cookies
2. Try incognito/private window
3. Check if backend services are healthy: `docker ps`
4. Check specific service logs: `docker logs <container-name>`
