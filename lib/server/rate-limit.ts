/**
 * Rate limiter sliding window.
 *
 * - Si UPSTASH_REDIS_URL + UPSTASH_REDIS_TOKEN sont définis → Redis (multi-instance, serverless-safe)
 * - Sinon → fallback Map en mémoire (dev local, single-instance)
 *
 * Usage :
 *   const result = await rateLimit(request, { limit: 5, window: 60 });
 *   if (!result.ok) return result.response;
 */

// ─── Fallback mémoire ────────────────────────────────────────────────────────

const memStore = new Map<string, { count: number; resetAt: number }>();

async function rateLimitMemory(
  storeKey: string,
  limit: number,
  windowMs: number
) {
  const now = Date.now();
  const entry = memStore.get(storeKey);

  if (!entry || now > entry.resetAt) {
    memStore.set(storeKey, { count: 1, resetAt: now + windowMs });
    return { count: 1, resetAt: now + windowMs };
  }

  entry.count += 1;
  return { count: entry.count, resetAt: entry.resetAt };
}

// ─── Backend Redis (Upstash) ─────────────────────────────────────────────────

async function rateLimitRedis(
  storeKey: string,
  limit: number,
  windowSec: number
) {
  const url = process.env.UPSTASH_REDIS_URL!;
  const token = process.env.UPSTASH_REDIS_TOKEN!;

  // INCR + EXPIRE via Upstash REST API (pas de SDK requis)
  const incrRes = await fetch(`${url}/incr/${encodeURIComponent(storeKey)}`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
  });
  const { result: count } = (await incrRes.json()) as { result: number };

  // Définir TTL uniquement au premier incrément
  if (count === 1) {
    await fetch(`${url}/expire/${encodeURIComponent(storeKey)}/${windowSec}`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
    });
  }

  // Récupérer le TTL restant pour le header Retry-After
  const ttlRes = await fetch(`${url}/ttl/${encodeURIComponent(storeKey)}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const { result: ttl } = (await ttlRes.json()) as { result: number };
  const resetAt = Date.now() + Math.max(ttl, 0) * 1000;

  return { count, resetAt };
}

// ─── Interface publique ──────────────────────────────────────────────────────

export interface RateLimitOptions {
  /** Nombre max de requêtes autorisées dans la fenêtre */
  limit: number;
  /** Durée de la fenêtre en secondes */
  window: number;
  /** Clé personnalisée (ex: userId). Sinon, utilise l'IP. */
  key?: string;
}

export interface RateLimitResult {
  ok: true;
  remaining: number;
  resetAt: number;
}

export interface RateLimitBlocked {
  ok: false;
  response: Response;
}

export async function rateLimit(
  request: Request,
  options: RateLimitOptions
): Promise<RateLimitResult | RateLimitBlocked> {
  const { limit, window: windowSec, key } = options;

  const ip =
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    request.headers.get("x-real-ip") ??
    "unknown";
  const identifier = key ?? ip;
  const storeKey = `rl:${identifier}:${new URL(request.url).pathname}`;
  const windowMs = windowSec * 1000;

  const useRedis =
    !!process.env.UPSTASH_REDIS_URL && !!process.env.UPSTASH_REDIS_TOKEN;

  const { count, resetAt } = useRedis
    ? await rateLimitRedis(storeKey, limit, windowSec)
    : await rateLimitMemory(storeKey, limit, windowMs);

  if (count > limit) {
    const retryAfter = Math.ceil((resetAt - Date.now()) / 1000);
    return {
      ok: false,
      response: new Response(
        JSON.stringify({
          error: "Trop de requêtes. Veuillez réessayer dans quelques secondes.",
          retryAfter,
        }),
        {
          status: 429,
          headers: {
            "Content-Type": "application/json",
            "Retry-After": String(retryAfter),
            "X-RateLimit-Limit": String(limit),
            "X-RateLimit-Remaining": "0",
            "X-RateLimit-Reset": String(Math.ceil(resetAt / 1000)),
          },
        }
      ),
    };
  }

  return { ok: true, remaining: limit - count, resetAt };
}
