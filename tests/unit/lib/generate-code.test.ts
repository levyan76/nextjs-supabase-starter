import { describe, expect, it } from "vitest";
import { generateCode } from "@/lib/generate-code";

describe("generateCode", () => {
  const today = new Date();
  const expectedDate = [
    today.getFullYear(),
    String(today.getMonth() + 1).padStart(2, "0"),
    String(today.getDate()).padStart(2, "0"),
  ].join("");

  it("generates a code with prefix", () => {
    const code = generateCode("INV");
    expect(code).toMatch(new RegExp(`^INV-${expectedDate}-[A-Z0-9]{4}$`));
  });

  it("generates a code without prefix", () => {
    const code = generateCode();
    expect(code).toMatch(new RegExp(`^${expectedDate}-[A-Z0-9]{4}$`));
  });

  it("uppercases the prefix", () => {
    const code = generateCode("cmd");
    expect(code).toMatch(/^CMD-/);
  });

  it("generates unique codes", () => {
    const codes = new Set(
      Array.from({ length: 50 }, () => generateCode("TEST"))
    );
    expect(codes.size).toBeGreaterThan(1);
  });
});
