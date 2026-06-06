/**
 * Helper pour lire les feature flags depuis Supabase.
 * Usage côté serveur (Server Components, Server Actions, route handlers) :
 *
 *   const enabled = await isEnabled("azure_sso");
 *   if (!enabled) return redirect("/login");
 *
 * Usage côté client : utiliser le hook useFeatureFlag (voir hooks/use-feature-flag.ts)
 */

import { createClient } from "@/lib/supabase/server";
import { logger } from "@/lib/server/logger";

/**
 * Retourne true si le flag est activé, false sinon (incluant si absent).
 * Fail-safe : toute erreur retourne false.
 */
export async function isEnabled(key: string): Promise<boolean> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("feature_flags")
      .select("enabled")
      .eq("key", key)
      .single();

    if (error) {
      logger.warn("feature_flag.read_failed", { key, error: error.message });
      return false;
    }

    return data?.enabled ?? false;
  } catch (err) {
    logger.error("feature_flag.unexpected", { key, error: String(err) });
    return false;
  }
}

/**
 * Retourne un map de tous les flags actifs.
 * Utile pour passer les flags à un layout ou un composant root.
 */
export async function getAllFlags(): Promise<Record<string, boolean>> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("feature_flags")
      .select("key, enabled");

    if (error) {
      logger.warn("feature_flag.get_all_failed", { error: error.message });
      return {};
    }

    return Object.fromEntries((data ?? []).map((f) => [f.key, f.enabled]));
  } catch {
    return {};
  }
}
