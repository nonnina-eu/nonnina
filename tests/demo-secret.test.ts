import { afterEach, describe, expect, it } from "vitest";
import { demoSecretOk } from "@/lib/demo-secret";

describe("demoSecretOk", () => {
  const original = process.env.DEMO_SECRET;
  afterEach(() => {
    if (original === undefined) delete process.env.DEMO_SECRET;
    else process.env.DEMO_SECRET = original;
  });

  it("keeps the demo routes open when DEMO_SECRET is not set", () => {
    delete process.env.DEMO_SECRET;
    expect(demoSecretOk(null)).toBe(true);
  });

  it("requires the exact header when DEMO_SECRET is set", () => {
    process.env.DEMO_SECRET = "s3cret";
    expect(demoSecretOk(null)).toBe(false);
    expect(demoSecretOk("wrong")).toBe(false);
    expect(demoSecretOk("s3cret!")).toBe(false);
    expect(demoSecretOk("s3cret")).toBe(true);
  });
});
