import { describe, expect, it } from "vitest";
import { userSchema } from "@/lib/validations/user";

describe("safe redirect validation", () => {
  function isSafeRedirect(raw: string): boolean {
    return raw.startsWith("/") && !raw.startsWith("//");
  }

  it("accepts internal paths", () => {
    expect(isSafeRedirect("/dashboard")).toBe(true);
    expect(isSafeRedirect("/admin/users")).toBe(true);
    expect(isSafeRedirect("/profile")).toBe(true);
  });

  it("rejects absolute URLs", () => {
    expect(isSafeRedirect("https://evil.com")).toBe(false);
    expect(isSafeRedirect("http://evil.com")).toBe(false);
  });

  it("rejects protocol-relative URLs", () => {
    expect(isSafeRedirect("//evil.com")).toBe(false);
    expect(isSafeRedirect("//evil.com/steal")).toBe(false);
  });

  it("rejects empty string", () => {
    expect(isSafeRedirect("")).toBe(false);
  });

  it("rejects javascript: scheme", () => {
    expect(isSafeRedirect("javascript:alert(1)")).toBe(false);
  });
});

describe("password schema strength", () => {
  const validBase = {
    firstName: "Jean",
    lastName: "Dupont",
    email: "jean@example.com",
    role: "USER" as const,
    active: true,
  };

  it("rejects passwords shorter than 8 chars", () => {
    const result = userSchema.safeParse({ ...validBase, password: "Ab1!" });
    expect(result.success).toBe(false);
  });

  it("rejects passwords without uppercase", () => {
    const result = userSchema.safeParse({ ...validBase, password: "abcdef1!" });
    expect(result.success).toBe(false);
  });

  it("rejects passwords without digit", () => {
    const result = userSchema.safeParse({ ...validBase, password: "Abcdefg!" });
    expect(result.success).toBe(false);
  });

  it("rejects passwords without special character", () => {
    const result = userSchema.safeParse({ ...validBase, password: "Abcdef12" });
    expect(result.success).toBe(false);
  });

  it("accepts a strong password", () => {
    const result = userSchema.safeParse({
      ...validBase,
      password: "Secure@123",
    });
    expect(result.success).toBe(true);
  });

  it("accepts empty string (password optional on edit)", () => {
    const result = userSchema.safeParse({ ...validBase, password: "" });
    expect(result.success).toBe(true);
  });

  it("accepts undefined password", () => {
    const result = userSchema.safeParse({ ...validBase });
    expect(result.success).toBe(true);
  });
});
