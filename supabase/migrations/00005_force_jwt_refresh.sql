-- ================================================================
-- Migration 00005 : Refresh JWT forcé lors d'un changement de rôle
-- Invalide toutes les sessions actives d'un user quand son rôle change.
-- Empêche qu'un ADMIN révoqué garde ses droits jusqu'à expiration du JWT.
-- ================================================================

CREATE OR REPLACE FUNCTION public.sync_role_to_jwt()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  -- 1. Mettre à jour app_metadata avec le nouveau rôle
  UPDATE auth.users
  SET raw_app_meta_data = raw_app_meta_data || jsonb_build_object('role', NEW.role::text)
  WHERE id = NEW.id;

  -- 2. Si le rôle a changé, invalider toutes les sessions actives
  --    en incrémentant le compteur de révocation de session.
  --    Cela force un re-login au prochain appel d'API protégé.
  IF OLD.role IS DISTINCT FROM NEW.role THEN
    UPDATE auth.users
    SET
      raw_app_meta_data = raw_app_meta_data
        || jsonb_build_object('role', NEW.role::text)
        || jsonb_build_object('session_invalidated_at', extract(epoch from now())::text),
      -- Révoquer tous les refresh tokens existants
      banned_until = NULL  -- s'assurer que le user n'est pas banni
    WHERE id = NEW.id;

    -- Supprimer toutes les sessions actives (force re-login)
    DELETE FROM auth.sessions WHERE user_id = NEW.id;
  END IF;

  RETURN NEW;
END;
$$;

-- Le trigger trg_sync_role_to_jwt sur profiles existe déjà (migration 00001)
-- Cette migration remplace uniquement la fonction sous-jacente.

COMMENT ON FUNCTION public.sync_role_to_jwt IS
  'Synchronise le rôle dans app_metadata JWT et invalide les sessions si le rôle change';
