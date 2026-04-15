# Lighthouse Audit Guide

## Overview
This guide provides instructions for running Lighthouse audits on the LexiAssist frontend to ensure performance, accessibility, best practices, and SEO compliance.

## Prerequisites
- Chrome browser installed
- Production build of the frontend
- Backend services running (for full functionality testing)

## Running Lighthouse Audit

### Method 1: Chrome DevTools (Recommended)

1. **Build Production Version**
   ```bash
   cd Frontend
   npm run build
   npm start
   ```

2. **Open Chrome DevTools**
   - Navigate to http://localhost:3000
   - Press F12 or right-click > Inspect
   - Click on "Lighthouse" tab

3. **Configure Audit**
   - Select categories:
     - ✅ Performance
     - ✅ Accessibility
     - ✅ Best Practices
     - ✅ SEO
   - Device: Desktop (or Mobile for mobile testing)
   - Click "Analyze page load"

4. **Review Results**
   - Wait for audit to complete (1-2 minutes)
   - Review scores and recommendations
   - Export report (optional)

### Method 2: Lighthouse CLI

1. **Install Lighthouse CLI**
   ```bash
   npm install -g lighthouse
   ```

2. **Run Audit**
   ```bash
   lighthouse http://localhost:3000 --output html --output-path ./lighthouse-report.html --view
   ```

3. **Run Audit for Multiple Pages**
   ```bash
   # Dashboard
   lighthouse http://localhost:3000/dashboard --output html --output-path ./reports/dashboard.html

   # Materials
   lighthouse http://localhost:3000/materials --output html --output-path ./reports/materials.html

   # Quizzes
   lighthouse http://localhost:3000/quizzes --output html --output-path ./reports/quizzes.html

   # Flashcards
   lighthouse http://localhost:3000/flashcards --output html --output-path ./reports/flashcards.html
   ```

## Target Scores

### Performance (Target: > 90)
- First Contentful Paint (FCP): < 1.8s
- Largest Contentful Paint (LCP): < 2.5s
- Total Blocking Time (TBT): < 200ms
- Cumulative Layout Shift (CLS): < 0.1
- Speed Index: < 3.4s

### Accessibility (Target: > 90)
- Color contrast: WCAG AA (4.5:1 for normal text)
- ARIA attributes: Properly used
- Form labels: All inputs have labels
- Alt text: All images have descriptive alt text
- Keyboard navigation: All interactive elements accessible

### Best Practices (Target: > 90)
- HTTPS: Used in production
- No browser errors: Console clean
- Images: Proper aspect ratios
- Security: No vulnerable libraries

### SEO (Target: > 90)
- Meta descriptions: Present on all pages
- Title tags: Descriptive and unique
- Viewport meta tag: Present
- Robots.txt: Properly configured
- Sitemap: Available

## Common Issues and Fixes

### Performance Issues

#### Issue: Large JavaScript Bundle
**Fix:**
- Implement code splitting
- Use dynamic imports for heavy components
- Remove unused dependencies

```typescript
// Before
import HeavyComponent from './HeavyComponent';

// After
const HeavyComponent = dynamic(() => import('./HeavyComponent'), {
  loading: () => <LoadingSpinner />,
});
```

#### Issue: Unoptimized Images
**Fix:**
- Use Next.js Image component
- Serve images in WebP format
- Implement lazy loading

```typescript
// Before
<img src="/image.png" alt="Description" />

// After
<Image 
  src="/image.png" 
  alt="Description" 
  width={500} 
  height={300}
  loading="lazy"
/>
```

#### Issue: Render-Blocking Resources
**Fix:**
- Defer non-critical CSS
- Inline critical CSS
- Use font-display: swap for fonts

```typescript
// next.config.ts
export default {
  optimizeFonts: true,
  // ... other config
};
```

### Accessibility Issues

#### Issue: Missing Alt Text
**Fix:**
- Add descriptive alt text to all images
- Use empty alt="" for decorative images

```typescript
// Before
<img src="/icon.svg" />

// After
<img src="/icon.svg" alt="Settings icon" />
```

#### Issue: Low Color Contrast
**Fix:**
- Increase contrast ratio to at least 4.5:1
- Use color contrast checker tools

```css
/* Before */
.text { color: #999; background: #fff; } /* 2.8:1 */

/* After */
.text { color: #666; background: #fff; } /* 5.7:1 */
```

#### Issue: Missing Form Labels
**Fix:**
- Associate labels with inputs
- Use aria-label for icon buttons

```typescript
// Before
<input type="text" placeholder="Email" />

// After
<label htmlFor="email">Email</label>
<input id="email" type="text" placeholder="Email" />
```

### Best Practices Issues

#### Issue: Console Errors
**Fix:**
- Fix all JavaScript errors
- Remove console.log statements in production

```typescript
// Use environment-aware logging
if (process.env.NODE_ENV === 'development') {
  console.log('Debug info');
}
```

#### Issue: Mixed Content (HTTP/HTTPS)
**Fix:**
- Use HTTPS for all resources
- Update URLs to use relative paths or HTTPS

```typescript
// Before
<script src="http://example.com/script.js"></script>

// After
<script src="https://example.com/script.js"></script>
```

### SEO Issues

#### Issue: Missing Meta Description
**Fix:**
- Add meta description to all pages

```typescript
// app/layout.tsx or page.tsx
export const metadata = {
  title: 'LexiAssist - AI-Powered Learning Platform',
  description: 'Enhance your learning with AI-powered tools for reading, writing, and studying.',
};
```

#### Issue: Missing Title Tag
**Fix:**
- Add unique title to each page

```typescript
// app/dashboard/page.tsx
export const metadata = {
  title: 'Dashboard | LexiAssist',
};
```

## Audit Checklist

### Pre-Audit Checklist
- [ ] Production build created (`npm run build`)
- [ ] Production server running (`npm start`)
- [ ] Backend services running (for full functionality)
- [ ] Test user account created
- [ ] Sample data available (courses, materials, quizzes)

### Pages to Audit
- [ ] Landing page (/)
- [ ] Login page (/login)
- [ ] Register page (/register)
- [ ] Dashboard (/dashboard)
- [ ] Materials page (/materials)
- [ ] Quizzes page (/quizzes)
- [ ] Flashcards page (/flashcards)
- [ ] Text-to-Speech page (/text-to-speech)
- [ ] Reading Assistant page (/reading-assistant)
- [ ] Writing Assistant page (/writing-assistant)
- [ ] Chat Assistant page (/chat-assistant)
- [ ] Goals page (/goals)
- [ ] Settings page (/settings)

### Post-Audit Actions
- [ ] Document all scores
- [ ] Create issues for scores < 90
- [ ] Prioritize fixes (critical > high > medium > low)
- [ ] Implement fixes
- [ ] Re-run audit to verify improvements
- [ ] Document final scores

## Audit Report Template

### Audit Date: ___________
### Auditor: ___________
### Build Version: ___________

| Page | Performance | Accessibility | Best Practices | SEO | Notes |
|------|-------------|---------------|----------------|-----|-------|
| Landing | ___ | ___ | ___ | ___ | |
| Login | ___ | ___ | ___ | ___ | |
| Register | ___ | ___ | ___ | ___ | |
| Dashboard | ___ | ___ | ___ | ___ | |
| Materials | ___ | ___ | ___ | ___ | |
| Quizzes | ___ | ___ | ___ | ___ | |
| Flashcards | ___ | ___ | ___ | ___ | |
| Text-to-Speech | ___ | ___ | ___ | ___ | |
| Reading Assistant | ___ | ___ | ___ | ___ | |
| Writing Assistant | ___ | ___ | ___ | ___ | |
| Chat Assistant | ___ | ___ | ___ | ___ | |
| Goals | ___ | ___ | ___ | ___ | |
| Settings | ___ | ___ | ___ | ___ | |

### Critical Issues (Score < 50)
1. 
2. 
3. 

### High Priority Issues (Score 50-70)
1. 
2. 
3. 

### Medium Priority Issues (Score 70-90)
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
- [ ] All pages meet target scores (> 90)
- [ ] Ready for production deployment
