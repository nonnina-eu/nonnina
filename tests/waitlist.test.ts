import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));

const insert = vi.fn();
vi.mock("@supabase/supabase-js", () => ({
  createClient: vi.fn(() => ({ from: vi.fn(() => ({ insert })) })),
}));

import { addToWaitlist } from "@/lib/waitlist";

const g = globalThis as unknown as { __waitlistMemory?: Map<string, unknown> };
const input = (email: string) => ({ email, role: "family" as const, city: "Stuttgart", message: "hi", hp_field: "" });

describe("addToWaitlist", () => {
  beforeEach(() => {
    g.__waitlistMemory = undefined;
    insert.mockReset();
    vi.spyOn(console, "info").mockImplementation(() => {});
    vi.spyOn(console, "error").mockImplementation(() => {});
  });
  afterEach(() => {
    vi.unstubAllEnvs();
    vi.restoreAllMocks();
  });

  describe("with Supabase", () => {
    beforeEach(() => {
      vi.stubEnv("NEXT_PUBLIC_SUPABASE_URL", "https://x.supabase.co");
      vi.stubEnv("SUPABASE_SERVICE_ROLE_KEY", "service-role");
    });

    it("stores the sign-up in Supabase", async () => {
      insert.mockResolvedValue({ error: null });
      await expect(addToWaitlist(input("Anna@Example.com"))).resolves.toEqual({ created: true, storage: "supabase" });
      expect(insert).toHaveBeenCalledWith({ email: "anna@example.com", role: "family", city: "Stuttgart", message: "hi" });
      expect(console.info).not.toHaveBeenCalled();
    });

    it("reports a duplicate email without using the fallback", async () => {
      insert.mockResolvedValue({ error: { code: "23505", message: "duplicate key" } });
      await expect(addToWaitlist(input("anna@example.com"))).resolves.toEqual({ created: false, storage: "supabase" });
      expect(console.error).not.toHaveBeenCalled();
      expect(console.info).not.toHaveBeenCalled();
    });

    it("logs the error and saves to the fallback when the insert fails", async () => {
      insert.mockResolvedValue({ error: { code: "42P01", message: 'relation "waitlist" does not exist' } });
      await expect(addToWaitlist(input("anna@example.com"))).resolves.toEqual({ created: true, storage: "fallback" });
      expect(console.error).toHaveBeenCalledWith(expect.stringContaining('[waitlist] supabase insert failed: relation "waitlist" does not exist'));
      const [prefix, line] = vi.mocked(console.info).mock.calls[0];
      expect(prefix).toBe("[waitlist] fallback signup");
      expect(JSON.parse(line as string)).toMatchObject({ reason: "insert-failed", email: "anna@example.com", role: "family", city: "Stuttgart", message: "hi" });
      expect(g.__waitlistMemory?.has("anna@example.com")).toBe(true);
    });

    it("falls back when the client throws", async () => {
      insert.mockRejectedValue(new Error("fetch failed"));
      await expect(addToWaitlist(input("anna@example.com"))).resolves.toEqual({ created: true, storage: "fallback" });
      expect(console.error).toHaveBeenCalledWith(expect.stringContaining("fetch failed"));
    });

    it("throws when even the fallback cannot be written", async () => {
      insert.mockResolvedValue({ error: { code: "500", message: "boom" } });
      vi.mocked(console.info).mockImplementation(() => {
        throw new Error("log unavailable");
      });
      await expect(addToWaitlist(input("anna@example.com"))).rejects.toThrow("log unavailable");
      expect(g.__waitlistMemory?.has("anna@example.com")).toBe(false);
    });
  });

  describe("without Supabase", () => {
    beforeEach(() => {
      vi.stubEnv("NEXT_PUBLIC_SUPABASE_URL", "");
      vi.stubEnv("SUPABASE_SERVICE_ROLE_KEY", "");
    });

    it("keeps sign-ups in memory and the log, and detects duplicates", async () => {
      await expect(addToWaitlist(input("anna@example.com"))).resolves.toEqual({ created: true, storage: "fallback" });
      await expect(addToWaitlist(input("ANNA@example.com"))).resolves.toEqual({ created: false, storage: "fallback" });
      expect(insert).not.toHaveBeenCalled();
      expect(console.info).toHaveBeenCalledTimes(1);
      expect(JSON.parse(vi.mocked(console.info).mock.calls[0][1] as string)).toMatchObject({ reason: "no-database", email: "anna@example.com" });
    });
  });
});
