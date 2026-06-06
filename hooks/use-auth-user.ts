"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import { useEffect } from "react";
import type { User } from "@supabase/supabase-js";

type UserRole = string; // "USER" | "ADMIN" — étendu par chaque app

export interface AuthUser {
  id: string;
  email: string;
  role: UserRole | null;
  firstName: string | null;
  lastName: string | null;
  fullName: string;
  isAdmin: boolean;
}

function mapUserToAuthUser(user: User | null): AuthUser | null {
  if (!user) return null;

  const appMetadata = user.app_metadata as { role?: string } | undefined;
  const userMetadata = user.user_metadata as
    | { first_name?: string; last_name?: string; role?: string }
    | undefined;

  const firstName = userMetadata?.first_name || null;
  const lastName = userMetadata?.last_name || null;
  const fullName =
    [firstName, lastName].filter(Boolean).join(" ") ||
    user.email?.split("@")[0] ||
    "User";

  const role = appMetadata?.role || userMetadata?.role || null;

  return {
    id: user.id,
    email: user.email || "",
    role,
    firstName,
    lastName,
    fullName,
    isAdmin: role === "ADMIN",
  };
}

/**
 * Hook to get the current authenticated user with role/type from app_metadata.
 * Subscribes to auth state changes for real-time updates.
 */
export function useAuthUser() {
  const supabase = createClient();
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ["auth", "user"],
    refetchOnWindowFocus: false,
    queryFn: async () => {
      const {
        data: { user },
        error,
      } = await supabase.auth.getUser();
      if (error) throw error;
      return mapUserToAuthUser(user);
    },
    retry: 5,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  // Subscribe to auth state changes
  useEffect(() => {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (
        event === "SIGNED_IN" ||
        event === "TOKEN_REFRESHED" ||
        event === "USER_UPDATED"
      ) {
        const mappedUser = mapUserToAuthUser(session?.user || null);
        queryClient.setQueryData(["auth", "user"], mappedUser);

        // On initial sign-in, the token might be missing custom claims (like role)
        // that are set by database triggers. Invalidate the query to force a fresh fetch
        // from the server rather than just relying on the potentially stale local token.
        if (event === "SIGNED_IN") {
          queryClient.invalidateQueries({ queryKey: ["auth", "user"] });
        }
      } else if (event === "SIGNED_OUT") {
        queryClient.setQueryData(["auth", "user"], null);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [supabase, queryClient]);

  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
    queryClient.invalidateQueries({ queryKey: ["auth", "user"] });
  };

  return {
    user: query.data,
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
    refetch: query.refetch,
    signOut,
  };
}

/**
 * Vérifie si l'utilisateur courant a un rôle donné.
 * Usage: useHasRole("ADMIN") ou useHasRole(["ADMIN", "USER"])
 */
export function useHasRole(role: string | string[]) {
  const { user, isLoading } = useAuthUser();
  const roles = Array.isArray(role) ? role : [role];
  const hasRole = user?.role ? roles.includes(user.role) : false;
  return { hasRole, isLoading };
}

/**
 * Hook to check if current user is an admin
 */
export function useIsAdmin() {
  const { user, isLoading } = useAuthUser();

  return {
    isAdmin: user?.isAdmin || false,
    isLoading,
  };
}
