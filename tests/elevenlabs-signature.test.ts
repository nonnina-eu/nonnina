import { createHmac } from "node:crypto";
import { describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));
const { verifyWebhookSignature } = await import("@/lib/elevenlabs");

describe("verifyWebhookSignature", () => {
  const secret = "whsec_test";
  const body = JSON.stringify({ hello: "world" });
  const t = Math.floor(Date.now() / 1000);
  const sig = createHmac("sha256", secret).update(`${t}.${body}`).digest("hex");

  it("accepts a valid signature", () => {
    expect(verifyWebhookSignature(`t=${t},v0=${sig}`, body, secret)).toBe(true);
  });
  it("rejects a tampered body", () => {
    expect(verifyWebhookSignature(`t=${t},v0=${sig}`, body + " ", secret)).toBe(false);
  });
  it("rejects stale timestamps", () => {
    const old = t - 60 * 60;
    const oldSig = createHmac("sha256", secret).update(`${old}.${body}`).digest("hex");
    expect(verifyWebhookSignature(`t=${old},v0=${oldSig}`, body, secret)).toBe(false);
  });
  it("rejects missing header", () => {
    expect(verifyWebhookSignature(null, body, secret)).toBe(false);
  });
});
