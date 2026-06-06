/**
 * Tests du middleware Next.js (auth + rate limit + i18n bypass).
 *
 * Stratégie de mock :
 *   - Le rate limiter utilise le vrai code (store mémoire interne).
 *   - `@supabase/ssr` est mocké : on contrôle ce que `auth.getUser()` retourne.
 *   - `next-intl/middleware` est mocké pour retourner un NextResponse.next() pass-through.
 *
 * Les tests "bypass" exploitent le fait que sans clé Supabase configurée
 * (ou avec `replace_*`), le middleware court-circuite l'auth.
 */
import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { NextRequest, NextResponse } from "next/server";

// ─── Mocks ──────────────────────────────────────────────────────────────────

vi.mock("next-intl/middleware", () => ({
  default: () => () => NextResponse.next(),
}));

// `@/lib/i18n/routing` tire `next-intl/navigation` qui veut charger
// `next/navigation` en ESM (échoue sous Vitest). On stub la valeur lue
// par le middleware — il ne fait que la passer à `createIntlMiddleware`,
// lui-même déjà mocké ci-dessus.
vi.mock("@/lib/i18n/routing", () => ({
  routing: {
    locales: ["fr", "en"],
    defaultLocale: "fr",
    localePrefix: "never",
  },
}));

const getUserMock = vi.fn();

vi.mock("@supabase/ssr", () => ({
  createServerClient: () => ({
    auth: { getUser: getUserMock },
  }),
}));

// ─── Helpers ────────────────────────────────────────────────────────────────

function makeRequest(
  pathname: string,
  opts: { ip?: string } = {}
): NextRequest {
  const url = `http://localhost${pathname}`;
  const req = new NextRequest(url, {
    headers: {
      "x-forwarded-for":
        opts.ip ?? `127.0.0.${Math.floor(Math.random() * 250) + 1}`,
    },
  });
  return req;
}

async function importMiddleware() {
  // Re-import pour bénéficier des env vars définies dans le test courant.
  const mod = await import("@/middleware");
  return mod.middleware;
}

// ─── Reset ──────────────────────────────────────────────────────────────────

const ORIG_ENV = { ...process.env };

beforeEach(() => {
  vi.resetModules();
  getUserMock.mockReset();
});

afterEach(() => {
  process.env = { ...ORIG_ENV };
});

// ────────────────────────────────────────────────────────────────────────────
// Bypass mode (pas de clé Supabase valide → pass-through intl)
// ────────────────────────────────────────────────────────────────────────────

describe("middleware — bypass mode (no Supabase)", () => {
  beforeEach(() => {
    delete process.env.NEXT_PUBLIC_SUPABASE_URL;
    delete process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
  });

  it("lets a request through when env vars are missing", async () => {
    const middleware = await importMiddleware();
    const res = await middleware(makeRequest("/dashboard"));
    expect(res).toBeInstanceOf(NextResponse);
    expect(res.status).toBe(200);
    expect(getUserMock).not.toHaveBeenCalled();
  });

  it('lets a request through when key starts with "replace_"', async () => {
    process.env.NEXT_PUBLIC_SUPABASE_URL = "http://127.0.0.1:54321";
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY = "replace_with_real_key";

    const middleware = await importMiddleware();
    const res = await middleware(makeRequest("/admin"));
    expect(res.status).toBe(200);
    expect(getUserMock).not.toHaveBeenCalled();
  });
});

// ────────────────────────────────────────────────────────────────────────────
// Auth mode — pas d'utilisateur connecté
// ────────────────────────────────────────────────────────────────────────────

describe("middleware — auth mode (no user)", () => {
  beforeEach(() => {
    process.env.NEXT_PUBLIC_SUPABASE_URL = "http://127.0.0.1:54321";
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY =
      "sb-pub-real-looking-key";
    getUserMock.mockResolvedValue({ data: { user: null } });
  });

  it("redirects to /login with ?redirect= for a protected route", async () => {
    const middleware = await importMiddleware();
    const res = await middleware(makeRequest("/dashboard"));
    expect(res.status).toBe(307);
    const location = res.headers.get("location")!;
    expect(location).toContain("/login");
    expect(location).toContain("redirect=%2Fdashboard");
  });

  it("does NOT redirect for /login (public route)", async () => {
    const middleware = await importMiddleware();
    const res = await middleware(makeRequest("/login"));
    expect(res.status).toBe(200);
  });

  it("does NOT redirect for /callback (public route)", async () => {
    const middleware = await importMiddleware();
    const res = await middleware(makeRequest("/callback"));
    expect(res.status).toBe(200);
  });

  it("does NOT redirect for /setup (public route)", async () => {
    const middleware = await importMiddleware();
    const res = await middleware(makeRequest("/setup"));
    expect(res.status).toBe(200);
  });
});

// ────────────────────────────────────────────────────────────────────────────
// Auth mode — utilisateur connecté
// ────────────────────────────────────────────────────────────────────────────

describe("middleware — auth mode (logged-in user)", () => {
  beforeEach(() => {
    process.env.NEXT_PUBLIC_SUPABASE_URL = "http://127.0.0.1:54321";
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY =
      "sb-pub-real-looking-key";
  });

  it("redirects /login → /dashboard when already logged in", async () => {
    getUserMock.mockResolvedValue({
      data: { user: { id: "u1", app_metadata: { role: "USER" } } },
    });
    const middleware = await importMiddleware();
    const res = await middleware(makeRequest("/login"));
    expect(res.status).toBe(307);
    expect(res.headers.get("location")).toContain("/dashboard");
  });

  it("blocks USER from /admin/* → redirect /dashboard", async () => {
    getUserMock.mockResolvedValue({
      data: { user: { id: "u1", app_metadata: { role: "USER" } } },
    });
    const middleware = await importMiddleware();
    const res = await middleware(makeRequest("/admin/users"));
    expect(res.status).toBe(307);
    expect(res.headers.get("location")).toContain("/dashboard");
  });

  it("allows ADMIN to access /admin/*", async () => {
    getUserMock.mockResolvedValue({
      data: { user: { id: "u1", app_metadata: { role: "ADMIN" } } },
    });
    const middleware = await importMiddleware();
    const res = await middleware(makeRequest("/admin/users"));
    expect(res.status).toBe(200);
  });

  it("allows USER to access non-admin routes", async () => {
    getUserMock.mockResolvedValue({
      data: { user: { id: "u1", app_metadata: { role: "USER" } } },
    });
    const middleware = await importMiddleware();
    const res = await middleware(makeRequest("/profile"));
    expect(res.status).toBe(200);
  });
});

// ────────────────────────────────────────────────────────────────────────────
// Rate limiting (s'applique avant tout, même en bypass mode)
// ────────────────────────────────────────────────────────────────────────────

describe("middleware — rate limiting", () => {
  beforeEach(() => {
    // Bypass auth pour isoler le rate limit
    delete process.env.NEXT_PUBLIC_SUPABASE_URL;
    delete process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
    delete process.env.UPSTASH_REDIS_URL;
    delete process.env.UPSTASH_REDIS_TOKEN;
  });

  it("returns 429 after exhausting /setup limit (5 req/5min)", async () => {
    const middleware = await importMiddleware();
    const ip = "192.0.2.10";

    // 5 requêtes autorisées
    for (let i = 0; i < 5; i++) {
      const res = await middleware(makeRequest("/setup", { ip }));
      expect(res.status).toBe(200);
    }

    // 6e bloquée
    const blocked = await middleware(makeRequest("/setup", { ip }));
    expect(blocked.status).toBe(429);
    expect(blocked.headers.get("retry-after")).toBeTruthy();
  });

  it("does NOT rate-limit routes outside the configured list", async () => {
    const middleware = await importMiddleware();
    const ip = "192.0.2.11";

    // 100 hits sur /dashboard → toutes OK (pas dans la liste)
    for (let i = 0; i < 100; i++) {
      const res = await middleware(makeRequest("/dashboard", { ip }));
      expect(res.status).toBe(200);
    }
  });

  it("isolates rate-limit counters per IP", async () => {
    const middleware = await importMiddleware();

    // IP A : épuise sa limite /setup
    for (let i = 0; i < 5; i++) {
      await middleware(makeRequest("/setup", { ip: "192.0.2.20" }));
    }
    const blockedA = await middleware(
      makeRequest("/setup", { ip: "192.0.2.20" })
    );
    expect(blockedA.status).toBe(429);

    // IP B : fresh → passe
    const okB = await middleware(makeRequest("/setup", { ip: "192.0.2.21" }));
    expect(okB.status).toBe(200);
  });
});
