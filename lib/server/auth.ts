import { createClient } from "@/lib/supabase/server";

export class ApiError extends Error {
  translation_path: string;
  status: number;

  constructor(message: string, translation_path: string, status: number = 400) {
    super(message);
    this.translation_path = translation_path;
    this.status = status;
  }
}

export async function getCurrentUser() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return user;
}

export async function getAuthToken() {
  const supabase = await createClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) return undefined;

  const {
    data: { session },
  } = await supabase.auth.getSession();

  return session?.access_token;
}

export async function requireUser() {
  const user = await getCurrentUser();
  if (!user) {
    throw new ApiError("Unauthorized", "Office.errors.unauthorized", 401);
  }
  return user;
}

export async function requireAdminRole() {
  const user = await requireUser();

  const role = user.app_metadata?.role;
  if (role !== "ADMIN") {
    throw new ApiError(
      `Forbidden: Admin access required. Current role: ${role}`,
      "errors.forbidden",
      403
    );
  }

  return user;
}
