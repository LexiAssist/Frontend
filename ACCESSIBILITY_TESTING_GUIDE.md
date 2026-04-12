# Accessibility Testing Guide - WCAG AA Compliance

## Overview
This guide provides comprehensive instructions for testing accessibility compliance according to WCAG 2.1 Level AA standards.

## Testing Tools

### Required Tools
1. **Screen Readers**
   - Windows: NVDA (free) - https://www.nvaccess.org/download/
   - Mac: VoiceOver (built-in)
   - Chrome Extension: ChromeVox

2. **Browser Extensions**
   - axe DevTools (Chrome/Firefox)
   - WAVE (Web Accessibility Evaluation Tool)
   - Lighthouse (Chrome DevTools)

3. **Color Contrast Checkers**
   - WebAIM Contrast Checker - https://webaim.org/resources/contrastchecker/
   - Chrome DevTools Color Picker

4. **Keyboard Testing**
   - No additional tools needed - use keyboard only

## 1. Keyboard Navigation Testing

### 1.1 Tab Navigation
- [ ] **Test Tab key navigation on all pages**
  - Press Tab repeatedly
  - Expected: Focus moves through all interactive elements in logical order
  - Verify focus visible (outline or highlight)

### 1.2 Interactive Elements
- [ ] **Buttons**
  - Tab to button
  - Press Enter or Space
  - Expected: Button action triggered

- [ ] **Links**
  - Tab to link
  - Press Enter
  - Expected: Navigation occurs

- [ ] **Form Inputs**
  - Tab to input field
  - Type text
  - Expected: Text entered in focused field

- [ ] **Dropdowns/Selects**
  - Tab to dropdown
  - Press Space or Enter to open
  - Use Arrow keys to navigate options
  - Press Enter to select
  - Expected: Dropdown works without mouse

- [ ] **Checkboxes/Radio Buttons**
  - Tab to checkbox/radio
  - Press Space to toggle
  - Expected: State changes

### 1.3 Modal/Dialog Navigation
- [ ] **Open modal**
  - Tab to "Open Modal" button
  - Press Enter
  - Expected: Modal opens, focus moves to modal

- [ ] **Navigate within modal**
  - Tab through modal elements
  - Expected: Focus trapped within modal

- [ ] **Close modal**
  - Press Escape key
  - Expected: Modal closes, focus returns to trigger button

### 1.4 Skip Links
- [ ] **Test skip navigation link**
  - Press Tab on page load
  - Expected: "Skip to main content" link appears
  - Press Enter
  - Expected: Focus moves to main content

### 1.5 Keyboard Shortcuts
- [ ] Document all keyboard shortcuts
- [ ] Test each shortcut
- [ ] Verify shortcuts don't conflict with browser/screen reader shortcuts

**Pages to Test:**
- [ ] Login page
- [ ] Register page
- [ ] Dashboard
- [ ] Materials page
- [ ] Quizzes page
- [ ] Flashcards page
- [ ] Settings page
- [ ] All AI assistant pages

**Status:** ⬜ Pass ⬜ Fail
**Notes:** ___________

---

## 2. Screen Reader Testing

### 2.1 NVDA Setup (Windows)
1. Download and install NVDA
2. Start NVDA (Ctrl + Alt + N)
3. Open browser
4. Navigate to http://localhost:3000

### 2.2 VoiceOver Setup (Mac)
1. Enable VoiceOver (Cmd + F5)
2. Open Safari or Chrome
3. Navigate to http://localhost:3000

### 2.3 Screen Reader Tests

#### 2.3.1 Page Structure
- [ ] **Headings**
  - Navigate by headings (H key in NVDA)
  - Expected: All headings announced with level (h1, h2, etc.)
  - Verify heading hierarchy is logical (h1 → h2 → h3)

- [ ] **Landmarks**
  - Navigate by landmarks (D key in NVDA)
  - Expected: Main, navigation, footer, etc. announced
  - Verify all major sections have landmarks

- [ ] **Lists**
  - Navigate to lists
  - Expected: "List with X items" announced
  - Each list item announced

#### 2.3.2 Interactive Elements
- [ ] **Buttons**
  - Navigate to button
  - Expected: "Button, [button text]" announced
  - Verify button purpose is clear

- [ ] **Links**
  - Navigate to link
  - Expected: "Link, [link text]" announced
  - Verify link destination is clear

- [ ] **Form Fields**
  - Navigate to input field
  - Expected: Label announced before input
  - Expected: Field type announced (edit, combo box, etc.)
  - Expected: Required status announced

#### 2.3.3 Images
- [ ] **Informative Images**
  - Navigate to image
  - Expected: Alt text announced
  - Verify alt text is descriptive

- [ ] **Decorative Images**
  - Navigate to decorative image
  - Expected: Image skipped or announced as decorative

- [ ] **Icons**
  - Navigate to icon button
  - Expected: Icon purpose announced via aria-label

#### 2.3.4 Dynamic Content
- [ ] **Loading States**
  - Trigger loading state
  - Expected: "Loading" or "Busy" announced
  - Expected: Completion announced

- [ ] **Error Messages**
  - Trigger validation error
  - Expected: Error message announced immediately
  - Expected: Focus moved to error or error linked to field

- [ ] **Success Messages**
  - Trigger success action
  - Expected: Success message announced

- [ ] **Live Regions**
  - Test notifications/toasts
  - Expected: Content announced without focus change

#### 2.3.5 Forms
- [ ] **Form Labels**
  - Navigate to each form field
  - Expected: Label announced before field
  - Verify label is descriptive

- [ ] **Required Fields**
  - Navigate to required field
  - Expected: "Required" announced

- [ ] **Field Instructions**
  - Navigate to field with instructions
  - Expected: Instructions announced

- [ ] **Error Validation**
  - Submit form with errors
  - Expected: Error summary announced
  - Expected: Focus moved to first error
  - Expected: Each error announced when field focused

**Pages to Test:**
- [ ] Login form
- [ ] Registration form
- [ ] Course creation form
- [ ] Material upload form
- [ ] Quiz taking interface
- [ ] Settings forms

**Status:** ⬜ Pass ⬜ Fail
**Notes:** ___________

---

## 3. Color Contrast Testing

### 3.1 Text Contrast
- [ ] **Normal Text (< 18pt or < 14pt bold)**
  - Minimum ratio: 4.5:1
  - Test all text colors against backgrounds
  - Use WebAIM Contrast Checker

- [ ] **Large Text (≥ 18pt or ≥ 14pt bold)**
  - Minimum ratio: 3:1
  - Test all large text colors

### 3.2 UI Component Contrast
- [ ] **Buttons**
  - Button text: 4.5:1
  - Button border: 3:1 (if needed for identification)

- [ ] **Form Inputs**
  - Input text: 4.5:1
  - Input border: 3:1
  - Placeholder text: 4.5:1

- [ ] **Icons**
  - Icon color: 3:1 (if icon conveys information)

### 3.3 Focus Indicators
- [ ] **Focus Outline**
  - Minimum ratio: 3:1 against background
  - Test all focusable elements

### 3.4 Testing Process
1. Open Chrome DevTools
2. Inspect element
3. Click color swatch in Styles panel
4. View contrast ratio
5. Adjust if ratio is insufficient

**Elements to Test:**
- [ ] Body text
- [ ] Headings
- [ ] Links (normal and hover)
- [ ] Buttons (normal, hover, active, disabled)
- [ ] Form inputs
- [ ] Error messages
- [ ] Success messages
- [ ] Navigation items
- [ ] Footer text

**Status:** ⬜ Pass ⬜ Fail
**Notes:** ___________

---

## 4. Semantic HTML Testing

### 4.1 HTML Structure
- [ ] **Proper Element Usage**
  - Buttons: `<button>` not `<div onclick>`
  - Links: `<a href>` not `<span onclick>`
  - Inputs: `<input>` with proper type
  - Headings: `<h1>` to `<h6>` in order

### 4.2 Landmarks
- [ ] **Required Landmarks**
  - `<header>` or `role="banner"`
  - `<nav>` or `role="navigation"`
  - `<main>` or `role="main"`
  - `<footer>` or `role="contentinfo"`

### 4.3 Lists
- [ ] **Proper List Markup**
  - Navigation: `<ul>` or `<ol>`
  - List items: `<li>`
  - Definition lists: `<dl>`, `<dt>`, `<dd>`

### 4.4 Tables
- [ ] **Data Tables**
  - Use `<table>` for tabular data
  - Include `<thead>`, `<tbody>`
  - Use `<th>` for headers with `scope` attribute
  - Include `<caption>` or `aria-label`

**Status:** ⬜ Pass ⬜ Fail
**Notes:** ___________

---

## 5. ARIA Testing

### 5.1 ARIA Labels
- [ ] **Buttons without visible text**
  - Icon buttons have `aria-label`
  - Example: `<button aria-label="Close">×</button>`

- [ ] **Form inputs without visible labels**
  - Inputs have `aria-label` or `aria-labelledby`
  - Example: `<input aria-label="Search" />`

### 5.2 ARIA Roles
- [ ] **Custom components**
  - Tabs: `role="tablist"`, `role="tab"`, `role="tabpanel"`
  - Dialogs: `role="dialog"`, `aria-modal="true"`
  - Alerts: `role="alert"` or `role="status"`

### 5.3 ARIA States
- [ ] **Dynamic states**
  - Expanded/collapsed: `aria-expanded`
  - Selected: `aria-selected`
  - Checked: `aria-checked`
  - Disabled: `aria-disabled`
  - Hidden: `aria-hidden`

### 5.4 ARIA Live Regions
- [ ] **Dynamic content**
  - Notifications: `aria-live="polite"`
  - Urgent alerts: `aria-live="assertive"`
  - Loading states: `aria-busy="true"`

### 5.5 ARIA Validation
- [ ] Run axe DevTools
- [ ] Check for ARIA errors
- [ ] Fix invalid ARIA usage

**Status:** ⬜ Pass ⬜ Fail
**Notes:** ___________

---

## 6. Form Accessibility

### 6.1 Labels
- [ ] **All inputs have labels**
  - Use `<label for="id">` or `aria-label`
  - Label text is descriptive

### 6.2 Required Fields
- [ ] **Required indication**
  - Visual indicator (asterisk)
  - `required` attribute or `aria-required="true"`
  - Announced by screen reader

### 6.3 Error Handling
- [ ] **Error identification**
  - Errors clearly identified
  - Error messages descriptive
  - Errors associated with fields (`aria-describedby`)

- [ ] **Error announcement**
  - Errors announced by screen reader
  - Focus moved to first error or error summary

### 6.4 Instructions
- [ ] **Field instructions**
  - Instructions provided before field
  - Instructions associated with field (`aria-describedby`)

**Status:** ⬜ Pass ⬜ Fail
**Notes:** ___________

---

## 7. Media Accessibility

### 7.1 Images
- [ ] **Alt text**
  - All images have alt attribute
  - Alt text is descriptive
  - Decorative images have empty alt (`alt=""`)

### 7.2 Audio
- [ ] **Transcripts**
  - Audio content has text transcript
  - Transcript is accessible

### 7.3 Video
- [ ] **Captions**
  - Videos have captions
  - Captions are accurate

- [ ] **Audio descriptions**
  - Videos have audio descriptions (if needed)

**Status:** ⬜ Pass ⬜ Fail
**Notes:** ___________

---

## 8. Automated Testing

### 8.1 axe DevTools
1. Install axe DevTools extension
2. Open DevTools > axe DevTools tab
3. Click "Scan ALL of my page"
4. Review issues
5. Fix critical and serious issues

### 8.2 WAVE
1. Install WAVE extension
2. Click WAVE icon
3. Review errors and alerts
4. Fix all errors

### 8.3 Lighthouse
1. Open DevTools > Lighthouse
2. Select "Accessibility" category
3. Run audit
4. Review issues
5. Target score: > 90

**Status:** ⬜ Pass ⬜ Fail
**Notes:** ___________

---

## 9. Browser Compatibility

### 9.1 Screen Reader + Browser Combinations
- [ ] NVDA + Firefox
- [ ] NVDA + Chrome
- [ ] JAWS + Chrome (if available)
- [ ] VoiceOver + Safari
- [ ] VoiceOver + Chrome

**Status:** ⬜ Pass ⬜ Fail
**Notes:** ___________

---

## 10. Mobile Accessibility

### 10.1 Touch Targets
- [ ] **Minimum size: 44x44 pixels**
  - All buttons and links meet minimum size
  - Adequate spacing between targets

### 10.2 Mobile Screen Readers
- [ ] **iOS VoiceOver**
  - Test on iPhone/iPad
  - Verify all content accessible

- [ ] **Android TalkBack**
  - Test on Android device
  - Verify all content accessible

**Status:** ⬜ Pass ⬜ Fail
**Notes:** ___________

---

## Accessibility Checklist Summary

### Critical Issues (WCAG A)
- [ ] All images have alt text
- [ ] All form inputs have labels
- [ ] Keyboard navigation works
- [ ] No keyboard traps
- [ ] Color not sole means of conveying information

### Important Issues (WCAG AA)
- [ ] Color contrast meets 4.5:1 (normal text) or 3:1 (large text)
- [ ] Focus visible on all interactive elements
- [ ] Headings in logical order
- [ ] Skip navigation link present
- [ ] Error messages descriptive and associated with fields

### Best Practices (WCAG AAA)
- [ ] Color contrast meets 7:1 (normal text) or 4.5:1 (large text)
- [ ] Captions for all audio/video
- [ ] Sign language interpretation for videos

---

## Test Results Template

### Test Date: ___________
### Tester: ___________
### Tools Used: ___________

| Test Category | Score | Issues Found | Status |
|--------------|-------|--------------|--------|
| Keyboard Navigation | ___/100 | ___ | ⬜ Pass ⬜ Fail |
| Screen Reader | ___/100 | ___ | ⬜ Pass ⬜ Fail |
| Color Contrast | ___/100 | ___ | ⬜ Pass ⬜ Fail |
| Semantic HTML | ___/100 | ___ | ⬜ Pass ⬜ Fail |
| ARIA | ___/100 | ___ | ⬜ Pass ⬜ Fail |
| Forms | ___/100 | ___ | ⬜ Pass ⬜ Fail |
| Media | ___/100 | ___ | ⬜ Pass ⬜ Fail |
| Automated Tests | ___/100 | ___ | ⬜ Pass ⬜ Fail |

### Critical Issues
1. 
2. 
3. 

### Recommendations
1. 
2. 
3. 

### Sign-off
- [ ] All critical issues resolved
- [ ] WCAG AA compliance achieved
- [ ] Lighthouse accessibility score > 90
- [ ] Ready for production deployment

**Auditor:** ___________
**Signature:** ___________
