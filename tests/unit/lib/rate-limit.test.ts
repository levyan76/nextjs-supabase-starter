import { describe, it, expect } from "vitest";
import { rateLimit } from "@/lib/server/rate-limit";

function makeRequest(ip = "1.2.3.4", path = "/api/test"): Request {
  return new Request(`http://localhost${path}`, {
    headers: { "x-forwarded-for": ip },
  });
}

describe("rateLimit", () => {
  it("should allow requests under the limit", async () => {
    const req = makeRequest("10.0.0.1", "/api/rl-test-allow");
    const result = await rateLimit(req, { limit: 3, window: 60 });
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.remaining).toBe(2);
    }
  });

  it("should block requests exceeding the limit", async () => {
    const ip = "10.0.0.2";
    const path = "/api/rl-test-block";

    // Exhaust the limit
    for (let i = 0; i < 3; i++) {
      await rateLimit(makeRequest(ip, path), { limit: 3, window: 60 });
    }

    // Next request should be blocked
    const result = await rateLimit(makeRequest(ip, path), {
      limit: 3,
      window: 60,
    });
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.response.status).toBe(429);
    }
  });

  it("should isolate limits per IP", async () => {
    const path = "/api/rl-test-isolation";
    await rateLimit(makeRequest("20.0.0.1", path), { limit: 1, window: 60 });
    const blocked = await rateLimit(makeRequest("20.0.0.1", path), {
      limit: 1,
      window: 60,
    });
    const allowed = await rateLimit(makeRequest("20.0.0.2", path), {
      limit: 1,
      window: 60,
    });

    expect(blocked.ok).toBe(false);
    expect(allowed.ok).toBe(true);
  });

  it("should isolate limits per path", async () => {
    const ip = "30.0.0.1";
    await rateLimit(makeRequest(ip, "/api/path-a"), { limit: 1, window: 60 });
    const blockedA = await rateLimit(makeRequest(ip, "/api/path-a"), {
      limit: 1,
      window: 60,
    });
    const allowedB = await rateLimit(makeRequest(ip, "/api/path-b"), {
      limit: 1,
      window: 60,
    });

    expect(blockedA.ok).toBe(false);
    expect(allowedB.ok).toBe(true);
  });

  it("should respect custom key over IP", async () => {
    const path = "/api/rl-test-key";
    await rateLimit(makeRequest("99.0.0.1", path), {
      limit: 1,
      window: 60,
      key: "user-abc",
    });
    const result = await rateLimit(makeRequest("99.0.0.2", path), {
      limit: 1,
      window: 60,
      key: "user-abc",
    });

    // Same key, different IP — should still be blocked
    expect(result.ok).toBe(false);
  });

  it("should return correct Retry-After header when blocked", async () => {
    const ip = "40.0.0.1";
    const path = "/api/rl-test-retry";
    await rateLimit(makeRequest(ip, path), { limit: 1, window: 30 });
    const result = await rateLimit(makeRequest(ip, path), {
      limit: 1,
      window: 30,
    });

    expect(result.ok).toBe(false);
    if (!result.ok) {
      const retryAfter = result.response.headers.get("Retry-After");
      expect(retryAfter).toBeTruthy();
      expect(Number(retryAfter)).toBeGreaterThan(0);
      expect(Number(retryAfter)).toBeLessThanOrEqual(30);
    }
  });
});
