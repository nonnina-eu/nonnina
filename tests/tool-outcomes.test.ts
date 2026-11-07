import { describe, expect, it } from "vitest";
import { emergencyToolOutcome, helpRequestToolOutcome } from "@/lib/tool-outcomes";

const sent = { status: "sent" as const };
const demo = { status: "demo" as const };
const failed = { status: "failed" as const };
const skipped = { status: "skipped" as const };

describe("emergencyToolOutcome", () => {
  it("reports relatives_notified only when a real message left the system", () => {
    expect(emergencyToolOutcome({ phase: "notified", notified: [sent, failed] })).toBe("relatives_notified");
    expect(emergencyToolOutcome({ phase: "acknowledged", notified: [sent] })).toBe("relatives_notified");
  });

  it("is honest about demo mode (no SMS sent)", () => {
    expect(emergencyToolOutcome({ phase: "notified", notified: [demo, demo] })).toBe("demo_mode_logged_no_sms_sent");
    expect(emergencyToolOutcome({ phase: "notified", notified: [demo, failed] })).toBe("demo_mode_logged_no_sms_sent");
  });

  it("tells Lina to send the senior to 112 when notifying failed", () => {
    expect(emergencyToolOutcome({ phase: "failed", notified: [] })).toBe("notification_failed_tell_senior_to_call_112");
    expect(emergencyToolOutcome({ phase: "notified", notified: [failed, skipped] })).toBe("notification_failed_tell_senior_to_call_112");
    expect(emergencyToolOutcome({ phase: "notified", notified: [] })).toBe("notification_failed_tell_senior_to_call_112");
    // still in flight / nothing happened: never claim success
    expect(emergencyToolOutcome({ phase: "notifying", notified: [] })).toBe("notification_failed_tell_senior_to_call_112");
    expect(emergencyToolOutcome({ phase: "none", notified: [sent] })).toBe("notification_failed_tell_senior_to_call_112");
  });

  it("reports a started warning countdown", () => {
    expect(emergencyToolOutcome({ phase: "countdown", notified: [] })).toBe("warning_countdown_started");
  });
});

describe("helpRequestToolOutcome", () => {
  it("family_informed when an SMS/email was sent", () => {
    expect(helpRequestToolOutcome({ ok: true, notified: [sent] })).toBe("family_informed");
  });

  it("saved but not messaged in demo mode or when the provider failed", () => {
    expect(helpRequestToolOutcome({ ok: true, notified: [demo] })).toBe("saved_family_will_see_it_in_the_app");
    expect(helpRequestToolOutcome({ ok: true, notified: [failed] })).toBe("saved_family_will_see_it_in_the_app");
    expect(helpRequestToolOutcome({ ok: true, notified: [] })).toBe("saved_family_will_see_it_in_the_app");
    expect(helpRequestToolOutcome({ ok: true })).toBe("saved_family_will_see_it_in_the_app");
  });

  it("failed when the request was not stored", () => {
    expect(helpRequestToolOutcome({ ok: false })).toBe("failed_tell_senior_to_try_again_or_press_help");
    expect(helpRequestToolOutcome({ ok: false, notified: [sent] })).toBe("failed_tell_senior_to_try_again_or_press_help");
  });
});
