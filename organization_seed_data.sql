-- =========================================================
-- AIIA-CTMS: Organization Initial Seed Data
-- File: organization_seed_data.sql
-- Date: 2026-09-21
--
-- INSTRUCTIONS
-- Run this file manually in the Supabase SQL editor.
-- This script is idempotent. It will safely insert the seed
-- organizations without duplicating existing rows (e.g. 
-- 'Dabur India Ltd.' if it was already entered manually).
-- =========================================================

insert into organizations (name)
select name from (values 
  ('All India Institute of Ayurveda (AIIA)'),
  ('Central Council for Research in Ayurvedic Sciences (CCRAS)'),
  ('Indian Council of Medical Research (ICMR)'),
  ('National Institute of Ayurveda (NIA)'),
  ('Institute of Teaching and Research in Ayurveda (ITRA)'),
  ('Ministry of Ayush'),
  ('Patanjali Research Foundation'),
  ('Dabur India Ltd.'),
  ('Himalaya Wellness Company'),
  ('Sandu Pharmaceuticals')
) as seed(name)
where not exists (
  select 1 from organizations o 
  where lower(o.name) = lower(seed.name)
);
