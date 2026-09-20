-- ============================================================
-- PI Dashboard Diagnostic Queries
-- Run these in Supabase SQL Editor to diagnose PI dashboard issue
-- ============================================================

-- 1. Check all profiles with principal_investigator role
SELECT id, full_name, role, site_id, profile_completed
FROM profiles
WHERE role = 'principal_investigator'
ORDER BY created_at;

-- 2. Check all study_assignments for principal_investigator role
SELECT 
  sa.id,
  sa.profile_id,
  p.full_name as profile_name,
  p.role as profile_role,
  sa.study_id,
  s.title as study_title,
  sa.role as assignment_role,
  sa.assigned_at
FROM study_assignments sa
LEFT JOIN profiles p ON p.id = sa.profile_id
LEFT JOIN studies s ON s.id = sa.study_id
WHERE sa.role = 'principal_investigator'
ORDER BY sa.assigned_at;

-- 3. Check study_assignments for the specific study "yo yo yo"
SELECT 
  sa.id,
  sa.profile_id,
  p.full_name as profile_name,
  p.role as profile_role,
  sa.study_id,
  s.title as study_title,
  sa.role as assignment_role,
  sa.assigned_at
FROM study_assignments sa
LEFT JOIN profiles p ON p.id = sa.profile_id
LEFT JOIN studies s ON s.id = sa.study_id
WHERE sa.study_id = 'dc6267e5-2ce6-4948-8edc-ced8dd979193'
ORDER BY sa.assigned_at;

-- 4. Check if the study "yo yo yo" exists and its current state
SELECT 
  id,
  title,
  status,
  pi_id,
  ec_id,
  created_at
FROM studies
WHERE id = 'dc6267e5-2ce6-4948-8edc-ced8dd979193';

-- 5. Check all assignments for Coordinator 7 (a3319489-5e57-4f64-a1be-b85d5642f6d7)
SELECT 
  sa.id,
  sa.profile_id,
  p.full_name as profile_name,
  p.role as profile_role,
  sa.study_id,
  s.title as study_title,
  sa.role as assignment_role,
  sa.assigned_at
FROM study_assignments sa
LEFT JOIN profiles p ON p.id = sa.profile_id
LEFT JOIN studies s ON s.id = sa.study_id
WHERE sa.profile_id = 'a3319489-5e57-4f64-a1be-b85d5642f6d7'
ORDER BY sa.assigned_at;
