/**
 * Query Keys Factory.
 * Add app-specific keys here as you build out your data layer.
 */

import { FilterType } from "../interfaces";

export const queryKeys = {
  // Utilisateurs / Profils
  users: {
    all: ["users"] as const,
    lists: () => [...queryKeys.users.all, "list"] as const,
    list: (filters?: FilterType) =>
      [...queryKeys.users.lists(), filters] as const,
    details: () => [...queryKeys.users.all, "detail"] as const,
    detail: (id: string) => [...queryKeys.users.details(), id] as const,
    me: () => [...queryKeys.users.all, "me"] as const,
  },

  // Dashboard
  dashboard: {
    all: ["dashboard"] as const,
    stats: (role?: string) =>
      [...queryKeys.dashboard.all, "stats", role] as const,
  },

  // Clé générique pour les ressources de l'app dérivée
  // Usage: queryKeys.records("estimates").list(filters)
  records: (resource: string) => ({
    all: [resource] as const,
    lists: () => [resource, "list"] as const,
    list: (filters?: FilterType) => [resource, "list", filters] as const,
    details: () => [resource, "detail"] as const,
    detail: (id: string) => [resource, "detail", id] as const,
  }),
} as const;
