import { describe, expect, it } from "vitest";
import {
  checkRoutePermission,
  cn,
  formatDate,
  getDefaultRoute,
  getPaginationRange,
} from "@/lib/utils";

describe("cn", () => {
  it("merges class names", () => {
    expect(cn("px-4", "py-2")).toBe("px-4 py-2");
  });

  it("resolves tailwind conflicts", () => {
    expect(cn("p-4", "p-2")).toBe("p-2");
  });

  it("ignores falsy values", () => {
    expect(cn("px-4", false, undefined, null, "py-2")).toBe("px-4 py-2");
  });
});

describe("getDefaultRoute", () => {
  it("returns /admin for ADMIN role", () => {
    expect(getDefaultRoute("ADMIN")).toBe("/admin");
  });

  it("returns /dashboard for USER role", () => {
    expect(getDefaultRoute("USER")).toBe("/dashboard");
  });

  it("returns /dashboard when no role provided", () => {
    expect(getDefaultRoute()).toBe("/dashboard");
  });
});

describe("checkRoutePermission", () => {
  it("allows ADMIN on any route", () => {
    expect(checkRoutePermission("/admin/settings", "ADMIN")).toBe(true);
    expect(checkRoutePermission("/dashboard", "ADMIN")).toBe(true);
  });

  it("blocks USER from /admin routes", () => {
    expect(checkRoutePermission("/admin", "USER")).toBe(false);
    expect(checkRoutePermission("/admin/users", "USER")).toBe(false);
  });

  it("allows USER on non-admin routes", () => {
    expect(checkRoutePermission("/dashboard", "USER")).toBe(true);
    expect(checkRoutePermission("/profile", "USER")).toBe(true);
  });
});

describe("getPaginationRange", () => {
  it("returns correct range for page 1", () => {
    expect(getPaginationRange(1, 10)).toEqual([0, 9]);
  });

  it("returns correct range for page 2", () => {
    expect(getPaginationRange(2, 10)).toEqual([10, 19]);
  });

  it("works with different page sizes", () => {
    expect(getPaginationRange(3, 25)).toEqual([50, 74]);
  });
});

describe("formatDate", () => {
  it("formats a date string", () => {
    const result = formatDate("2026-01-15", "fr-CA");
    expect(result).toMatch(/2026/);
  });

  it("formats a Date object", () => {
    const result = formatDate(new Date("2026-06-01"), "en-CA");
    expect(result).toMatch(/2026/);
  });
});
