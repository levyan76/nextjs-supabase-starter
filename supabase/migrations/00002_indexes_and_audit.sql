-- ================================================================
-- Migration 00002 : Indexes de performance + colonnes d'audit
-- Ajoute created_by, updated_by sur profiles + indexes
-- Note : active, deleted_at, phone sont définis dans 00001
-- ================================================================

-- ─── Colonnes d'audit (absentes de 00001) ───────────────────────

ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS created_by  UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS updated_by  UUID REFERENCES auth.users(id) ON DELETE SET NULL;

-- ─── Indexes de performance ──────────────────────────────────────

-- Lookup par email (login, recherche utilisateur)
CREATE INDEX IF NOT EXISTS idx_profiles_email
  ON public.profiles (email);

-- Filtrage par rôle (admin queries)
CREATE INDEX IF NOT EXISTS idx_profiles_role
  ON public.profiles (role);

-- Filtrage soft-delete (la majorité des queries excluent deleted_at IS NOT NULL)
CREATE INDEX IF NOT EXISTS idx_profiles_deleted_at
  ON public.profiles (deleted_at)
  WHERE deleted_at IS NULL;

-- Filtrage utilisateurs actifs
CREATE INDEX IF NOT EXISTS idx_profiles_active
  ON public.profiles (active)
  WHERE active = true;

-- ─── Trigger : auto-remplir updated_by depuis la session JWT ─────

CREATE OR REPLACE FUNCTION public.set_updated_by()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  NEW.updated_by = auth.uid();
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_profiles_updated_by
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_by();

-- ─── Policy RLS supplémentaire : INSERT par admin seulement ──────

CREATE POLICY "Admin peut insérer un profil"
  ON public.profiles FOR INSERT
  WITH CHECK ((auth.jwt() -> 'app_metadata' ->> 'role') = 'ADMIN');

-- ─── Commentaires de documentation DB ───────────────────────────

COMMENT ON COLUMN public.profiles.active     IS 'Indique si le compte est actif (false = désactivé sans suppression)';
COMMENT ON COLUMN public.profiles.deleted_at IS 'Soft delete : non null = supprimé logiquement';
COMMENT ON COLUMN public.profiles.created_by IS 'UUID de l''admin ayant créé ce profil';
COMMENT ON COLUMN public.profiles.updated_by IS 'UUID du dernier utilisateur ayant modifié ce profil';
COMMENT ON COLUMN public.profiles.phone      IS 'Numéro de téléphone optionnel';
