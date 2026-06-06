import { createServerClient } from "@supabase/ssr";
import createIntlMiddleware from "next-intl/middleware";
import { type NextRequest, NextResponse } from "next/server";
import { routing } from "@/lib/i18n/routing";
import { rateLimit } from "@/lib/server/rate-limit";

const intlMiddleware = createIntlMiddleware(routing);

const PUBLIC_ROUTES = ["/login", "/callback", "/setup"];
const AUTH_ROUTE = "/login";

// Routes et limites de rate limiting (appliquées avant auth)
const RATE_LIMITED_ROUTES: { path: string; limit: number; window: number }[] = [
  { path: "/login", limit: 10, window: 60 }, // 10 tentatives/min par IP
  { path: "/setup", limit: 5, window: 300 }, // 5 tentatives/5min
  { path: "/api/", limit: 60, window: 60 }, // 60 req/min sur toutes les API
];

function isPublicRoute(pathname: string): boolean {
  return PUBLIC_ROUTES.some(
    (route) => pathname === route || pathname.startsWith(route + "/")
  );
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // ─── Rate limiting ──────────────────────────────────────────────
  const rlRoute = RATE_LIMITED_ROUTES.find(
    (r) => pathname === r.path || pathname.startsWith(r.path)
  );
  if (rlRoute) {
    const rl = await rateLimit(request, {
      limit: rlRoute.limit,
      window: rlRoute.window,
    });
    if (!rl.ok) return rl.response;
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

  if (!supabaseUrl || !supabaseKey || supabaseKey.startsWith("replace_")) {
    return intlMiddleware(request);
  }

  let response = intlMiddleware(request);

  response = NextResponse.next({
    request: { headers: request.headers },
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          response = NextResponse.next({
            request: { headers: request.headers },
          });
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user && !isPublicRoute(pathname)) {
    const loginUrl = new URL(AUTH_ROUTE, request.url);
    loginUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(loginUrl);
  }

  if (user && pathname === AUTH_ROUTE) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  if (
    user &&
    pathname.startsWith("/admin") &&
    user.app_metadata?.role !== "ADMIN"
  ) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  return response;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
