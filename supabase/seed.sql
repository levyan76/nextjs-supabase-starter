-- ================================================================
-- SEED — Reproducible development / test data.
-- DO NOT run in production.
-- Usage: supabase db reset  (applies migrations + seed)
-- ================================================================

-- ─── Utilisateurs de test ────────────────────────────────────────
-- Note : les mots de passe sont gérés par Supabase Auth.
-- Ces insertions créent uniquement les profils (le trigger handle_new_user
-- crée normalement le profil lors de la création auth.users).
-- Pour un vrai seed auth, utiliser supabase CLI ou l'API admin.

-- Admin de test
INSERT INTO public.profiles (id, email, first_name, last_name, role, active)
VALUES
  ('00000000-0000-0000-0000-000000000001', 'admin@example.com',  'Admin',  'Test',  'ADMIN', true),
  ('00000000-0000-0000-0000-000000000002', 'user1@example.com',  'Alice',  'Martin','USER',  true),
  ('00000000-0000-0000-0000-000000000003', 'user2@example.com',  'Bob',    'Tremblay','USER',true),
  ('00000000-0000-0000-0000-000000000004', 'user3@example.com',  'Claire', 'Leblanc','USER', false),
  ('00000000-0000-0000-0000-000000000005', 'deleted@example.com','Dave',   'Supprimé','USER',false)
ON CONFLICT (id) DO NOTHING;

-- Soft-delete du 5e utilisateur
UPDATE public.profiles
SET deleted_at = now() - interval '7 days'
WHERE id = '00000000-0000-0000-0000-000000000005';

-- ─── Feature flags de dev ────────────────────────────────────────
INSERT INTO public.feature_flags (key, enabled, description) VALUES
  ('maintenance_mode',    false, 'Active une page de maintenance'),
  ('email_notifications', false, 'Active les notifications courriel'),
  ('azure_sso',           false, 'Active le SSO Microsoft Azure')
ON CONFLICT (key) DO UPDATE SET
  description = EXCLUDED.description;
