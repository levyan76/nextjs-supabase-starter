/**
 * Script to create a default admin user.
 * Usage: ADMIN_EMAIL="admin@example.com" ADMIN_PASSWORD="..." npx tsx scripts/create-admin.ts
 */

import { randomBytes } from "node:crypto";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl =
  process.env.NEXT_PUBLIC_SUPABASE_URL || "http://127.0.0.1:54321";
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const email = process.env.ADMIN_EMAIL;
const generatedPassword = randomBytes(18).toString("base64url");
const password = process.env.ADMIN_PASSWORD || generatedPassword;

if (!supabaseServiceKey) {
  console.error(
    "Error: SUPABASE_SERVICE_ROLE_KEY environment variable is required"
  );
  process.exit(1);
}

if (!email) {
  console.error("Error: ADMIN_EMAIL environment variable is required");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

async function createAdminUser() {
  console.log("Creating admin user...");
  console.log("Email:", email);
  if (!process.env.ADMIN_PASSWORD) {
    console.log("Temporary password:", password);
    console.log("⚠️  Change this generated password after first login.\n");
  }

  try {
    const { data: existingUsers } = await supabase
      .from("profiles")
      .select("email")
      .eq("email", email)
      .single();

    if (existingUsers) {
      console.log("✅ Admin user already exists:", email);
      return;
    }

    const { data: newUser, error: createError } =
      await supabase.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
        user_metadata: {
          first_name: "Admin",
          last_name: "User",
          type: "INTERNE",
          role: "ADMIN",
        },
      });

    if (createError) {
      console.error("❌ Error creating user:", createError.message);
      process.exit(1);
    }

    console.log("✅ Admin user created successfully!");
    console.log("User ID:", newUser.user.id);
    console.log("Email:", email);
    if (!process.env.ADMIN_PASSWORD) {
      console.log("Temporary password:", password);
    }
  } catch (error) {
    console.error("❌ Unexpected error:", error);
    process.exit(1);
  }
}

createAdminUser();
