import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";
import { passwordSchema } from "@/lib/validations/user";
import { rateLimit } from "@/lib/server/rate-limit";
import { logger } from "@/lib/server/logger";

export async function GET(request: Request) {
  try {
    const rl = await rateLimit(request, { limit: 10, window: 60 });
    if (!rl.ok) return rl.response;

    const supabaseAdmin = createAdminClient();
    const { data, error } = await supabaseAdmin.auth.admin.listUsers();

    if (error) {
      logger.warn("setup.check_failed", { error: error.message });
      return NextResponse.json({ needsSetup: false }, { status: 200 });
    }

    const needsSetup = !data.users || data.users.length === 0;
    return NextResponse.json({ needsSetup });
  } catch {
    return NextResponse.json({ needsSetup: false });
  }
}

export async function POST(request: Request) {
  const rl = await rateLimit(request, { limit: 5, window: 300 });
  if (!rl.ok) {
    logger.warn("setup.rate_limit_triggered", { endpoint: "/api/setup" });
    return rl.response;
  }

  try {
    const body = await request.json();
    const { firstName, lastName, email, password } = body;

    if (!firstName || !lastName || !email || !password) {
      return NextResponse.json(
        { error: "Tous les champs sont requis." },
        { status: 400 }
      );
    }

    const passwordResult = passwordSchema.safeParse(password);
    if (!passwordResult.success) {
      return NextResponse.json(
        { error: passwordResult.error.issues[0].message },
        { status: 400 }
      );
    }

    const supabaseAdmin = createAdminClient();

    // Guard: only allow setup if no users exist
    const { data: existingUsers } = await supabaseAdmin.auth.admin.listUsers();
    if (existingUsers?.users && existingUsers.users.length > 0) {
      logger.warn("setup.already_configured", { email });
      return NextResponse.json(
        { error: "Un compte administrateur existe déjà." },
        { status: 409 }
      );
    }

    const { error: createError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      app_metadata: { role: "ADMIN" },
      user_metadata: {
        first_name: firstName,
        last_name: lastName,
        role: "ADMIN",
      },
    });

    if (createError) {
      logger.error("setup.create_admin_failed", {
        email,
        error: createError.message,
      });
      return NextResponse.json({ error: createError.message }, { status: 400 });
    }

    logger.info("setup.admin_created", { email });
    return NextResponse.json({ success: true });
  } catch (err) {
    logger.error("setup.unexpected_error", {
      error: err instanceof Error ? err.message : String(err),
    });
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Erreur inconnue." },
      { status: 500 }
    );
  }
}
