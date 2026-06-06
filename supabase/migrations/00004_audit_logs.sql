-- ================================================================
-- Migration 00004 : Table audit_logs
-- Historise toutes les mutations importantes pour conformité RGPD/SOC2.
-- Extensible : appeler log_audit_event() depuis n'importe quel trigger.
-- ================================================================

CREATE TABLE IF NOT EXISTS public.audit_logs (
  id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  table_name  TEXT        NOT NULL,
  record_id   UUID        NOT NULL,
  action      TEXT        NOT NULL CHECK (action IN ('INSERT', 'UPDATE', 'DELETE')),
  old_data    JSONB,
  new_data    JSONB,
  changed_by  UUID        REFERENCES auth.users(id) ON DELETE SET NULL,
  changed_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- RLS : lecture admin uniquement
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admin lit les audit logs"
  ON public.audit_logs FOR SELECT
  USING ((auth.jwt() -> 'app_metadata' ->> 'role') = 'ADMIN');

-- Personne ne peut insérer/modifier/supprimer depuis le client
-- (uniquement via SECURITY DEFINER functions)

-- Index sur la table source (filtrage par entité)
CREATE INDEX IF NOT EXISTS idx_audit_logs_table_record
  ON public.audit_logs (table_name, record_id);

-- Index sur l'auteur (qui a fait quoi)
CREATE INDEX IF NOT EXISTS idx_audit_logs_changed_by
  ON public.audit_logs (changed_by);

-- Index temporel (audit trail chronologique)
CREATE INDEX IF NOT EXISTS idx_audit_logs_changed_at
  ON public.audit_logs (changed_at DESC);

-- ─── Fonction générique d'audit ─────────────────────────────────

CREATE OR REPLACE FUNCTION public.log_audit_event()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  INSERT INTO public.audit_logs (table_name, record_id, action, old_data, new_data, changed_by)
  VALUES (
    TG_TABLE_NAME,
    CASE
      WHEN TG_OP = 'DELETE' THEN OLD.id
      ELSE NEW.id
    END,
    TG_OP,
    CASE WHEN TG_OP IN ('UPDATE', 'DELETE') THEN to_jsonb(OLD) ELSE NULL END,
    CASE WHEN TG_OP IN ('INSERT', 'UPDATE') THEN to_jsonb(NEW) ELSE NULL END,
    auth.uid()
  );
  RETURN COALESCE(NEW, OLD);
END;
$$;

-- ─── Trigger sur profiles ────────────────────────────────────────
-- Audite toute modification de profil (role change, soft delete, etc.)

CREATE TRIGGER trg_audit_profiles
  AFTER INSERT OR UPDATE OR DELETE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.log_audit_event();

-- ─── Trigger sur feature_flags ──────────────────────────────────

CREATE TRIGGER trg_audit_feature_flags
  AFTER INSERT OR UPDATE OR DELETE ON public.feature_flags
  FOR EACH ROW EXECUTE FUNCTION public.log_audit_event();

COMMENT ON TABLE public.audit_logs IS 'Historique immuable de toutes les mutations — conformité RGPD/SOC2';
COMMENT ON FUNCTION public.log_audit_event IS 'Trigger générique — ajouter sur toute table métier critique';
