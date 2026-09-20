# Phase 2 Verification Guide

This document describes how to verify the Phase 2 implementation: Admin User Creation + Self-Edit Security.

## Prerequisites

1. Ensure all Phase 2 migrations have been applied:
   - `study_assignments_migration.sql`
   - `phase2_self_edit_security_migration.sql`
   - `phase2_email_change_protection_migration.sql`

2. Ensure the Edge Function `admin-create-user` has been deployed

3. Ensure Supabase Auth settings have been configured to disable email changes (see email change migration)

## Test Scenarios

### A. Admin Creates a User

**Steps:**
1. Log in as an admin user (role = 'admin' in profiles table)
2. Call the Edge Function to create a new user:

```javascript
const { data, error } = await supabase.functions.invoke('admin-create-user', {
  body: {
    email: 'test.user@example.com',
    name: 'Test User',
    role: 'study_coordinator',
    study_id: '<valid-study-uuid>'
  }
});
```

**Expected Result:**
- Function returns success with user_id, email, name, role, and study_id
- No error is returned

**Failure Criteria:**
- 401 error: Authorization header missing or invalid
- 403 error: Non-admin user tried to create a user
- 400 error: Invalid role (not one of: principal_investigator, study_coordinator, monitor)
- 404 error: Study not found
- 500 error: Database operation failed

### B. Verify profiles Row is Correct

**Steps:**
1. After creating the user, query the profiles table:

```javascript
const { data: profile, error } = await supabase
  .from('profiles')
  .select('*')
  .eq('id', '<new-user-id>')
  .single();
```

**Expected Result:**
- profile.id matches the new user id
- profile.full_name matches the provided name
- profile.role matches the requested role
- profile.profile_completed is false (user must complete first-login setup)
- profile.site_id is null (will be assigned later if needed)

**Failure Criteria:**
- Profile not found
- Profile has incorrect values
- profile_completed is true (should be false for new users)

### C. Verify study_assignments Row is Correct

**Steps:**
1. Query the study_assignments table:

```javascript
const { data: assignment, error } = await supabase
  .from('study_assignments')
  .select('*')
  .eq('profile_id', '<new-user-id>')
  .eq('study_id', '<requested-study-id>')
  .single();
```

**Expected Result:**
- assignment.profile_id matches the new user id
- assignment.study_id matches the requested study_id
- assignment.role matches the requested role
- assignment.assigned_at is a valid timestamp

**Failure Criteria:**
- Assignment not found
- Assignment has incorrect values
- assigned_at is null or invalid

### D. Non-Admin Cannot Change Role

**Steps:**
1. Log in as a non-admin user (e.g., study_coordinator)
2. Attempt to update role via direct table update:

```javascript
const { data, error } = await supabase
  .from('profiles')
  .update({ role: 'admin' })
  .eq('id', auth.uid())
  .select();

// Or attempt to update another user's role
const { data2, error2 } = await supabase
  .from('profiles')
  .update({ role: 'admin' })
  .eq('id', '<other-user-id>')
  .select();
```

**Expected Result:**
- Update fails with RLS policy violation
- Error message indicates permission denied
- No rows are updated

**Failure Criteria:**
- Update succeeds (security breach!)
- Role is changed in the database

### E. Non-Admin Cannot Change Email

**Steps:**
1. Log in as a non-admin user
2. Attempt to change email via Supabase Auth API:

```javascript
const { data, error } = await supabase.auth.updateUser({
  email: 'new.email@example.com'
});
```

**Expected Result:**
- Update fails with error message
- Error message indicates email changes are not allowed
- Email is not changed in auth.users

**Failure Criteria:**
- Update succeeds (security breach!)
- Email is changed in the database

**Note:** If the database trigger cannot be created due to permissions, verify that:
1. Supabase Auth settings have "Allow email changes" disabled
2. The Auth API blocks the change with appropriate error

## Additional Security Tests

### F. User Can Update Own full_name

**Steps:**
1. Log in as any authenticated user
2. Update own full_name:

```javascript
const { data, error } = await supabase
  .from('profiles')
  .update({ full_name: 'New Display Name' })
  .eq('id', auth.uid())
  .select();
```

**Expected Result:**
- Update succeeds
- full_name is changed
- role, site_id, and id remain unchanged

**Failure Criteria:**
- Update fails (users should be able to update their own name)
- Other fields are changed

### G. User Cannot Update Another User's Profile

**Steps:**
1. Log in as a non-admin user
2. Attempt to update another user's profile:

```javascript
const { data, error } = await supabase
  .from('profiles')
  .update({ full_name: 'Hacked Name' })
  .eq('id', '<other-user-id>')
  .select();
```

**Expected Result:**
- Update fails with RLS policy violation
- No rows are updated

**Failure Criteria:**
- Update succeeds (security breach!)

### H. Admin Can Update Any Profile

**Steps:**
1. Log in as admin
2. Update another user's profile:

```javascript
const { data, error } = await supabase
  .from('profiles')
  .update({ full_name: 'Admin Updated Name' })
  .eq('id', '<other-user-id>')
  .select();
```

**Expected Result:**
- Update succeeds
- Profile is updated

**Failure Criteria:**
- Update fails (admins should be able to manage profiles)

## Cleanup

After testing, you may want to clean up test users:

```sql
-- Delete test study assignments
DELETE FROM study_assignments WHERE profile_id = '<test-user-id>';

-- Delete test profiles
DELETE FROM profiles WHERE id = '<test-user-id>';

-- Delete test auth users (via Supabase dashboard or Edge Function)
```

## Deployment Checklist

Before deploying to production:

- [ ] All migrations tested in development/staging environment
- [ ] Edge Function deployed and tested
- [ ] Supabase Auth settings configured to disable email changes
- [ ] Admin users have appropriate role assignments
- [ ] Service role key is not exposed in frontend code
- [ ] CORS headers are properly configured for the Edge Function
- [ ] Error handling and logging are adequate
- [ ] Database triggers and policies are active

## Troubleshooting

**Edge Function returns 401:**
- Verify the authorization header is being sent
- Check that the user is authenticated
- Ensure the session token is valid

**Edge Function returns 403:**
- Verify the calling user has admin role in profiles table
- Check that the RLS policies are correctly configured

**Profile update fails unexpectedly:**
- Check that the RLS policies are active
- Verify the trigger is created correctly
- Review the PostgREST schema cache reload

**Email change succeeds despite protection:**
- Verify Supabase Auth settings have email changes disabled
- Check if the database trigger was created successfully
- Review the trigger function logic

## Files Changed in Phase 2

1. `backend/supabase/functions/admin-create-user/index.ts` - Edge Function for admin user creation
2. `backend/supabase/functions/admin-create-user/deno.json` - Deno configuration
3. `backend/supabase/functions/admin-create-user/README.md` - Deployment documentation
4. `study_assignments_migration.sql` - Creates study_assignments table with RLS
5. `phase2_self_edit_security_migration.sql` - Restricts profile updates to full_name only
6. `phase2_email_change_protection_migration.sql` - Blocks direct email changes
7. `PHASE2_VERIFICATION.md` - This verification guide
