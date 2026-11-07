import { describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));
const { inlineCallTwiml, isPublicUrl } = await import("@/lib/notify");

describe("local calls without a public URL", () => {
  it("knows which URLs Twilio can reach", () => {
    expect(isPublicUrl("http://localhost:3000")).toBe(false);
    expect(isPublicUrl("http://192.168.1.20:3000")).toBe(false);
    expect(isPublicUrl("https://www.nonnina.eu")).toBe(true);
  });

  it("builds escaped TwiML that speaks the message twice in the senior's language", () => {
    const xml = inlineCallTwiml('Maria sagte: "Ich bin gefallen" & braucht Hilfe <jetzt>', "de");
    expect(xml.match(/<Say language="de-DE">/g)).toHaveLength(2);
    expect(xml).toContain("&quot;Ich bin gefallen&quot; &amp; braucht Hilfe &lt;jetzt&gt;");
    expect(inlineCallTwiml("Ciao", "it")).toContain('language="it-IT"');
  });
});
