import { createClient } from "@/lib/supabase/server";
import { getDefaultRoute } from "@/lib/utils";
import { NextResponse } from "next/server";
import { headers } from "next/headers";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get("code");

  // Get the proper app URL for redirects
  // Priority: NEXT_PUBLIC_APP_URL > headers (for local dev) > fallback
  const getAppUrl = async () => {
    if (process.env.NEXT_PUBLIC_APP_URL) {
      return process.env.NEXT_PUBLIC_APP_URL;
    }

    // For local development, construct URL from headers
    const headersList = await headers();
    const host = headersList.get("host");
    const protocol = headersList.get("x-forwarded-proto") || "http";

    return host ? `${protocol}://${host}` : "http://localhost:3001";
  };

  const appUrl = await getAppUrl();

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error) {
      // Get user profile to determine role-based redirect
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (user) {
        const { data: profile } = await supabase
          .from("profiles")
          .select("role")
          .eq("id", user.id)
          .single();

        // Redirect based on role
        const role = (profile as { role?: string } | null)?.role;
        const redirectPath = getDefaultRoute(role);

        return NextResponse.redirect(`${appUrl}${redirectPath}`);
      }
    }
  }

  // Return to login if something went wrong
  return NextResponse.redirect(`${appUrl}/login`);
}
