"use server";

import { randomInt } from "node:crypto";
import { createAdminClient, createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { getPaginationRange } from "@/lib/utils";
import { logger } from "@/lib/server/logger";
import { createUserSchema, updateUserSchema } from "@/lib/validations/admin";

// ─── Helpers ────────────────────────────────────────────────────────────────

async function verifyAdmin() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if ((profile as { role?: string } | null)?.role !== "ADMIN") {
    throw new Error("Unauthorized: Only Admins can perform this action");
  }

  return { supabase, user };
}

// ─── Read Actions ───────────────────────────────────────────────────────────

export async function fetchUsers(
  params: {
    page?: number;
    pageSize?: number;
    search?: string;
    showDeleted?: boolean;
  } = {}
) {
  const { page = 1, pageSize = 10, search, showDeleted = false } = params;
  const supabase = await createClient();

  const [from, to] = getPaginationRange(page, pageSize);

  let queryBuilder = supabase
    .from("profiles")
    .select("*", { count: "exact" })
    .order("email", { ascending: true })
    .range(from, to);

  // Filter out soft-deleted users unless explicitly requested
  if (!showDeleted) {
    queryBuilder = queryBuilder.is("deleted_at", null);
  }

  if (search) {
    queryBuilder = queryBuilder.or(
      `first_name.ilike.%${search}%,last_name.ilike.%${search}%,email.ilike.%${search}%,role.ilike.%${search}%`
    );
  }

  const { data, count, error } = await queryBuilder;

  if (error) throw new Error(error.message);

  return {
    users: data ?? [],
    totalCount: count ?? 0,
  };
}

export async function fetchUser(userId: string) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", userId)
    .single();

  if (error) throw new Error(error.message);
  return data;
}

export async function fetchUserStats() {
  const supabase = await createClient();

  // Total users (non-deleted only)
  const { count: totalUsers, error: totalError } = await supabase
    .from("profiles")
    .select("*", { count: "exact", head: true })
    .is("deleted_at", null);

  if (totalError) throw new Error(totalError.message);

  // Active users (non-deleted only)
  const { count: activeUsers, error: activeError } = await supabase
    .from("profiles")
    .select("*", { count: "exact", head: true })
    .eq("active", true)
    .is("deleted_at", null);

  if (activeError) throw new Error(activeError.message);

  return {
    totalUsers: totalUsers || 0,
    activeUsers: activeUsers || 0,
    inactiveUsers: (totalUsers || 0) - (activeUsers || 0),
  };
}

// ─── Write Actions ──────────────────────────────────────────────────────────

export async function createUser(formData: FormData) {
  await verifyAdmin();

  const parsed = createUserSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
    firstName: formData.get("firstName"),
    lastName: formData.get("lastName"),
    role: formData.get("role") || "USER",
    active: formData.get("active") === "true",
  });

  if (!parsed.success) {
    const message = parsed.error.issues.map((e) => e.message).join(", ");
    throw new Error(message);
  }

  const { email, password, firstName, lastName, role, active } = parsed.data;

  // Create admin Supabase client with service role key
  const supabaseAdmin = createAdminClient();

  // Create auth user - the trigger will automatically create the profile
  const { data: newUser, error: createError } =
    await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      app_metadata: { role },
      user_metadata: { first_name: firstName, last_name: lastName, role },
    });

  if (createError) {
    logger.error("user.create_failed", { email, error: createError.message });
    throw new Error(createError.message);
  }

  // Explicitly update the profile's active status (trigger uses DB default)
  const { error: profileError } = await supabaseAdmin
    .from("profiles")
    .update({ active })
    .eq("id", newUser.user.id);

  if (profileError) {
    logger.warn("user.profile_active_update_failed", {
      userId: newUser.user.id,
      error: profileError.message,
    });
  }

  logger.info("user.created", { userId: newUser.user.id, email, role });
  return { success: true, userId: newUser.user.id };
}

export async function updateUser(formData: FormData) {
  const { supabase } = await verifyAdmin();

  const parsed = updateUserSchema.safeParse({
    userId: formData.get("userId"),
    firstName: formData.get("firstName"),
    lastName: formData.get("lastName"),
    role: formData.get("role") || "USER",
    active: formData.get("active") === "true",
  });

  if (!parsed.success) {
    const message = parsed.error.issues.map((e) => e.message).join(", ");
    throw new Error(message);
  }

  const { userId, firstName, lastName, role, active } = parsed.data;

  // Update profile (the trigger will sync role/type to app_metadata)
  const { error: updateError } = await supabase
    .from("profiles")
    .update({ first_name: firstName, last_name: lastName, role, active })
    .eq("id", userId);

  if (updateError) {
    logger.error("user.update_failed", { userId, error: updateError.message });
    throw new Error(updateError.message);
  }

  revalidatePath("/admin/users");
  return { success: true };
}

export async function resetUserPassword(userId: string) {
  const { user: currentUser } = await verifyAdmin();

  // Prevention: cannot reset own password
  if (currentUser.id === userId) {
    throw new Error(
      "Vous ne pouvez pas réinitialiser votre propre mot de passe"
    );
  }

  // Generate a temporary password with a cryptographically secure source.
  const chars =
    "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*";
  const newPassword = Array.from(
    { length: 16 },
    () => chars[randomInt(chars.length)]
  ).join("");

  const supabaseAdmin = createAdminClient();
  const { error } = await supabaseAdmin.auth.admin.updateUserById(userId, {
    password: newPassword,
  });

  if (error) {
    logger.error("user.password_reset_failed", {
      userId,
      error: error.message,
    });
    throw new Error(error.message);
  }

  return { success: true, newPassword };
}

// ─── Soft Delete / Restore ──────────────────────────────────────────────────

export async function softDeleteUser(userId: string) {
  const { user: currentUser } = await verifyAdmin();

  // Prevention: cannot delete yourself
  if (currentUser.id === userId) {
    throw new Error("Vous ne pouvez pas supprimer votre propre compte");
  }

  const supabaseAdmin = createAdminClient();

  // 1. Set deleted_at + deactivate profile
  const { error: profileError } = await supabaseAdmin
    .from("profiles")
    .update({
      deleted_at: new Date().toISOString(),
      active: false,
    })
    .eq("id", userId)
    .is("deleted_at", null); // Guard: only delete non-deleted users

  if (profileError) {
    logger.error("user.soft_delete_profile_failed", {
      userId,
      error: profileError.message,
    });
    throw new Error(profileError.message);
  }

  // 2. Ban the user in Supabase Auth (100 years ≈ permanent)
  const { error: banError } = await supabaseAdmin.auth.admin.updateUserById(
    userId,
    { ban_duration: "876000h" }
  );

  if (banError) {
    logger.error("user.ban_failed", { userId, error: banError.message });
    await supabaseAdmin
      .from("profiles")
      .update({ deleted_at: null, active: true })
      .eq("id", userId);
    throw new Error(banError.message);
  }

  revalidatePath("/admin/users");
  return { success: true };
}

export async function restoreUser(userId: string) {
  await verifyAdmin();

  const supabaseAdmin = createAdminClient();

  // 1. Clear deleted_at + reactivate profile
  const { error: profileError } = await supabaseAdmin
    .from("profiles")
    .update({
      deleted_at: null,
      active: true,
    })
    .eq("id", userId)
    .not("deleted_at", "is", null); // Guard: only restore deleted users

  if (profileError) {
    logger.error("user.restore_profile_failed", {
      userId,
      error: profileError.message,
    });
    throw new Error(profileError.message);
  }

  // 2. Unban the user in Supabase Auth
  const { error: unbanError } = await supabaseAdmin.auth.admin.updateUserById(
    userId,
    { ban_duration: "none" }
  );

  if (unbanError) {
    logger.error("user.unban_failed", { userId, error: unbanError.message });
    await supabaseAdmin
      .from("profiles")
      .update({ deleted_at: new Date().toISOString(), active: false })
      .eq("id", userId);
    throw new Error(unbanError.message);
  }

  revalidatePath("/admin/users");
  return { success: true };
}
