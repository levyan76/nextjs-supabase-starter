// Reusable generic types. Import and extend in your app.

// Paramètres de filtre génériques (pagination, recherche, etc.)
export type FilterType = Record<string, unknown>;

export interface BaseParams {
  page?: number;
  pageSize?: number;
  search?: string;
}

// Profil utilisateur de base (lié à auth.users de Supabase)
export interface UserProfile {
  id: string;
  email: string;
  first_name: string | null;
  last_name: string | null;
  role: string;
  created_at: string;
  updated_at: string;
}

// Réponse paginée générique
export interface PaginatedResponse<T> {
  data: T[];
  totalCount: number;
  page: number;
  pageSize: number;
}
