-- ================================================================
-- Migration 00003 : Feature Flags
-- Table générique pour activer/désactiver des fonctionnalités
-- sans redéploiement, configurable par les admins.
-- ================================================================

CREATE TABLE IF NOT EXISTS public.feature_flags (
  id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  key         TEXT        NOT NULL UNIQUE,
  enabled     BOOLEAN     NOT NULL DEFAULT false,
  description TEXT,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_by  UUID REFERENCES auth.users(id) ON DELETE SET NULL
);

-- RLS
ALTER TABLE public.feature_flags ENABLE ROW LEVEL SECURITY;

-- Lecture par tous les utilisateurs authentifiés (flags publics)
CREATE POLICY "Lecture des feature flags"
  ON public.feature_flags FOR SELECT
  USING (auth.role() = 'authenticated');

-- Modification réservée aux admins
CREATE POLICY "Admin gère les feature flags"
  ON public.feature_flags FOR ALL
  USING ((auth.jwt() -> 'app_metadata' ->> 'role') = 'ADMIN');

-- updated_at automatique
CREATE TRIGGER trg_feature_flags_updated_at
  BEFORE UPDATE ON public.feature_flags
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- Index sur la clé (lookup principal)
CREATE INDEX IF NOT EXISTS idx_feature_flags_key
  ON public.feature_flags (key);

-- Index sur enabled (filtrer uniquement les flags actifs)
CREATE INDEX IF NOT EXISTS idx_feature_flags_enabled
  ON public.feature_flags (enabled)
  WHERE enabled = true;

-- Données initiales (flags de base du template)
INSERT INTO public.feature_flags (key, enabled, description) VALUES
  ('maintenance_mode',    false, 'Active une page de maintenance pour les utilisateurs non-admin'),
  ('email_notifications', false, 'Active l''envoi de notifications par courriel (Mailgun)'),
  ('azure_sso',           false, 'Active l''authentification SSO via Microsoft Azure')
ON CONFLICT (key) DO NOTHING;

COMMENT ON TABLE public.feature_flags IS 'Flags de fonctionnalités — activables/désactivables sans redéploiement';
COMMENT ON COLUMN public.feature_flags.key IS 'Identifiant unique du flag, ex: maintenance_mode';
