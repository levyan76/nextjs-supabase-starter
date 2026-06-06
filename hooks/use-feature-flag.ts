"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

/**
 * Hook React pour lire un feature flag côté client.
 * Fail-safe : retourne false si Supabase n'est pas configuré ou si le flag n'existe pas.
 *
 * Usage :
 *   const azureSsoEnabled = useFeatureFlag("azure_sso");
 *   if (azureSsoEnabled) { ... }
 */
export function useFeatureFlag(key: string): boolean {
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
    if (!supabaseUrl || !supabaseKey || supabaseKey.startsWith("replace_"))
      return;

    const supabase = createClient();
    supabase
      .from("feature_flags")
      .select("enabled")
      .eq("key", key)
      .single()
      .then(({ data }) => {
        setEnabled(data?.enabled ?? false);
      });
  }, [key]);

  return enabled;
}

/**
 * Hook pour récupérer tous les flags d'un coup (évite N requêtes).
 * Retourne un Record<string, boolean> vide pendant le chargement.
 */
export function useAllFeatureFlags(): Record<string, boolean> {
  const [flags, setFlags] = useState<Record<string, boolean>>({});

  useEffect(() => {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
    if (!supabaseUrl || !supabaseKey || supabaseKey.startsWith("replace_"))
      return;

    const supabase = createClient();
    supabase
      .from("feature_flags")
      .select("key, enabled")
      .then(({ data }) => {
        if (data) {
          setFlags(Object.fromEntries(data.map((f) => [f.key, f.enabled])));
        }
      });
  }, []);

  return flags;
}
