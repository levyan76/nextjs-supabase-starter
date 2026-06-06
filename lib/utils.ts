import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Retourne la route par defaut selon le role utilisateur.
 * Etendre cette fonction dans l'app derivee selon les routes metier.
 */
export function getDefaultRoute(role?: string): string {
  switch (role) {
    case "ADMIN":
      return "/admin";
    case "USER":
    default:
      return "/dashboard";
  }
}

/**
 * Verifie si un role a acces a un chemin de route.
 */
export function checkRoutePermission(pathname: string, role: string): boolean {
  if (role === "ADMIN") return true;
  if (pathname.startsWith("/admin")) return false;
  return true;
}

/**
 * Calcule la plage de pagination pour Supabase (.range(from, to) inclusif).
 */
export function getPaginationRange(
  page: number,
  pageSize: number
): [number, number] {
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;
  return [from, to];
}

/**
 * Formate un objet Date en chaine lisible selon la locale.
 */
export function formatDate(date: string | Date, locale = "fr-CA"): string {
  return new Intl.DateTimeFormat(locale, { dateStyle: "medium" }).format(
    typeof date === "string" ? new Date(date) : date
  );
}
