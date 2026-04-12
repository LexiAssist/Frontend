# Manual Testing Guide for Profile Management

## Prerequisites
1. Start the frontend development server: `npm run dev`
2. Ensure you have a valid user account and are logged in
3. Navigate to the Settings page

## Test Cases

### Test 1: Display User Profile Data (Requirement 10.1, 10.2)
**Steps:**
1. Navigate to Settings page
2. Click on "Profile" tab (should be selected by default)

**Expected Results:**
- First Name field should display the user's first name
- Last Name field should display the user's last name
- Email field should display the user's email (read-only)
- School field should display the user's school (if set)
- Department field should display the user's department (if set)
- Academic Level dropdown should show the user's academic level (if set)

### Test 2: Update Profile with Partial Data (Requirement 10.3)
**Steps:**
1. Navigate to Settings > Profile
2. Change only the "First Name" field to a new value
3. Click "Save Changes" button
4. Wait for success message

**Expected Results:**
- Loading spinner should appear on the button
- Success message "Settings saved successfully!" should appear
- The updated first name should be reflected in the form
- Other fields should remain unchanged

### Test 3: Update Auth Store After Profile Update (Requirement 10.4)
**Steps:**
1. Navigate to Settings > Profile
2. Update any profile field (e.g., School)
3. Click "Save Changes"
4. Navigate to another page (e.g., Dashboard)
5. Return to Settings > Profile

**Expected Results:**
- The updated profile data should persist across page navigations
- The auth store should contain the updated user data
- No additional API call should be needed to fetch the updated data

### Test 4: Handle Profile Update Errors (Requirement 10.5)
**Steps:**
1. Navigate to Settings > Profile
2. Clear the "First Name" field (leave it empty)
3. Click "Save Changes"

**Expected Results:**
- Error message should appear (e.g., "First name is required")
- Form should remain in editable state
- No data should be saved

### Test 5: Change Password (Requirement 10.6)
**Steps:**
1. Navigate to Settings > Account
2. Scroll to "Change Password" section
3. Enter current password
4. Enter new password (minimum 8 characters)
5. Confirm new password (must match)
6. Click "Update Password"

**Expected Results:**
- Loading spinner should appear on the button
- Success message should appear
- Form fields should be cleared after successful password change
- User should be able to log in with the new password

### Test 6: Change Password Validation
**Steps:**
1. Navigate to Settings > Account
2. Scroll to "Change Password" section
3. Enter current password
4. Enter new password (e.g., "newpass123")
5. Enter different confirm password (e.g., "different456")

**Expected Results:**
- Error message "Passwords do not match" should appear
- "Update Password" button should be disabled
- No API call should be made

### Test 7: Email Field is Read-Only
**Steps:**
1. Navigate to Settings > Profile
2. Try to click on the Email field

**Expected Results:**
- Email field should be disabled/read-only
- Cursor should show "not-allowed" icon
- Helper text "Email address cannot be changed" should be visible

### Test 8: Academic Level Dropdown
**Steps:**
1. Navigate to Settings > Profile
2. Click on the Academic Level dropdown

**Expected Results:**
- Dropdown should show the following options:
  - High School
  - Undergraduate
  - Graduate
  - PhD
  - Other
- Selected option should be highlighted
- Selecting a new option should update the form

## Mock Mode Testing

### Test 9: Mock Mode Toggle
**Steps:**
1. Navigate to Settings > Developer
2. Toggle "Enable Mock Backend" switch
3. Navigate to Settings > Profile
4. Update any field and save

**Expected Results:**
- Mock mode indicator should show "Active"
- Profile save should use mock service (check browser console for "[MOCK] Profile saved:" log)
- 1-second delay should be noticeable
- Success message should appear

## API Integration Testing

### Test 10: Real API Call (Mock Mode Disabled)
**Steps:**
1. Navigate to Settings > Developer
2. Ensure "Enable Mock Backend" is OFF
3. Navigate to Settings > Profile
4. Update a field and save
5. Open browser DevTools > Network tab

**Expected Results:**
- PUT request to `/api/v1/users/me` should be visible in Network tab
- Request payload should contain only the changed fields in snake_case format
- Response should contain the updated user object
- Auth store should be updated with the response data

## Error Scenarios

### Test 11: Network Error Handling
**Steps:**
1. Open browser DevTools > Network tab
2. Enable "Offline" mode
3. Navigate to Settings > Profile
4. Update a field and save

**Expected Results:**
- Error message should appear (e.g., "Network error. Please check your connection")
- Form should remain in editable state
- User can retry after going back online

### Test 12: Invalid Token Handling
**Steps:**
1. Manually clear the access token from localStorage
2. Navigate to Settings > Profile
3. Try to save changes

**Expected Results:**
- Token refresh should be attempted automatically
- If refresh fails, user should be redirected to login page
- Original destination should be preserved for redirect after login

## Notes
- All tests should be performed with both mock mode enabled and disabled
- Check browser console for any errors or warnings
- Verify that the auth store is properly updated after each operation
- Test with different user roles if applicable
