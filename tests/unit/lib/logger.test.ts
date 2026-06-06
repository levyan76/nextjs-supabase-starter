import { describe, it, expect, vi, afterEach } from "vitest";
import { logger } from "@/lib/server/logger";

describe("logger", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("should emit info level without throwing", () => {
    const spy = vi.spyOn(console, "log").mockImplementation(() => {});
    expect(() => logger.info("test.event", { userId: "123" })).not.toThrow();
    spy.mockRestore();
  });

  it("should emit error level without throwing", () => {
    const spy = vi.spyOn(console, "error").mockImplementation(() => {});
    expect(() => logger.error("test.error", { message: "boom" })).not.toThrow();
    spy.mockRestore();
  });

  it("should emit warn level without throwing", () => {
    const spy = vi.spyOn(console, "log").mockImplementation(() => {});
    expect(() => logger.warn("test.warn")).not.toThrow();
    spy.mockRestore();
  });

  it("should emit debug level without throwing", () => {
    const spy = vi.spyOn(console, "log").mockImplementation(() => {});
    expect(() => logger.debug("test.debug", { trace: "abc" })).not.toThrow();
    spy.mockRestore();
  });
});
