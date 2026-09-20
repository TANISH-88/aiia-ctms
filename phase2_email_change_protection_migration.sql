-- =========================================================
-- AIIA CTMS — Phase 2: Email Change Protection Migration
-- Run this in the Supabase SQL editor.
--
-- This migration provides email change protection with admin-only override.
-- Direct client-side email changes are blocked, but admins can change
-- user emails via the admin-change-user-email Edge Function.
--
-- ARCHITECTURE: Application/API path restriction (not database trigger)
-- =========================================================

-- =========================================================
-- IMPORTANT: MANUAL CONFIGURATION REQUIRED
-- =========================================================
--
-- Primary control: Configure Supabase Auth settings
--
-- 1. Go to Supabase Dashboard → Authentication → Providers
-- 2. Find the Email provider
-- 3. Disable "Allow email changes" (or similar setting)
-- 4. Save the configuration
--
-- This is the standard Supabase way to prevent email changes.
-- Both client-side and server-side Auth API requests are processed
-- by Supabase Auth, so we implement the restriction at the application
-- level rather than trying to distinguish callers in auth.users triggers.
--
-- =========================================================

-- Remove any existing email change triggers (they are not reliable)
DROP TRIGGER IF EXISTS trg_block_auth_email_change ON auth.users;
DROP FUNCTION IF EXISTS block_auth_email_change() CASCADE;
DROP FUNCTION IF EXISTS block_auth_email_change_with_logging() CASCADE;

-- =========================================================
-- SECURITY ARCHITECTURE:
--
-- 1. Direct client-side: supabase.auth.updateUser({email})
--    → BLOCKED by Supabase Auth settings (disable email changes)
--
-- 2. Admin server-side: admin-change-user-email Edge Function
--    → ALLOWED via Supabase Auth Admin API (service role)
--    → Requires admin role verification in Edge Function
--    → Non-admin callers get 403 from Edge Function
--
-- 3. Database: No auth.users trigger (reliable distinction impossible)
--    → Both paths processed by Supabase Auth at the application level
--    → Restriction implemented at API path level, not database level
--
-- =========================================================

-- =========================================================
-- Verification steps:
-- 1. Configure Auth settings to disable email changes (primary control)
-- 2. Try supabase.auth.updateUser({email}) as normal user → Should FAIL
-- 3. Try admin-change-user-email as admin → Should SUCCEED
-- 4. Try admin-change-user-email as non-admin → Should FAIL (403)
-- =========================================================
