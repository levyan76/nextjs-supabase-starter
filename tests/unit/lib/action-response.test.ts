import { describe, it, expect } from "vitest";
import {
  actionSuccess,
  actionError,
  withActionResponse,
} from "@/lib/server/action-response";

describe("actionSuccess", () => {
  it("should return ok:true with data", () => {
    const result = actionSuccess({ userId: "abc" });
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.data).toEqual({ userId: "abc" });
    }
  });

  it("should work with void data", () => {
    const result = actionSuccess(undefined);
    expect(result.ok).toBe(true);
  });
});

describe("actionError", () => {
  it("should return ok:false with message", () => {
    const result = actionError("Unauthorized", 401);
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.message).toBe("Unauthorized");
      expect(result.code).toBe(401);
    }
  });

  it("should work without a code", () => {
    const result = actionError("Something failed");
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.code).toBeUndefined();
    }
  });
});

describe("withActionResponse", () => {
  it("should wrap a successful async function", async () => {
    const action = withActionResponse(async (x: number) => x * 2);
    const result = await action(5);
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.data).toBe(10);
    }
  });

  it("should catch thrown errors and return actionError", async () => {
    const action = withActionResponse(async () => {
      throw new Error("DB connection failed");
    });
    const result = await action();
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.message).toBe("DB connection failed");
    }
  });

  it("should handle non-Error throws", async () => {
    const action = withActionResponse(async () => {
      throw "string error";
    });
    const result = await action();
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.message).toBe("Erreur inattendue");
    }
  });
});
