import { beforeEach, describe, expect, it, vi } from "vitest";

const tick = vi.fn(async () => []);
vi.mock("@/lib/escalation-runner", () => ({ runEscalationTick: tick }));

describe("maybeRunEscalationTick", () => {
  beforeEach(() => {
    tick.mockClear();
    (globalThis as { __nonninaLastTick?: number }).__nonninaLastTick = undefined;
  });

  it("runs at most once per 15 s", async () => {
    const { maybeRunEscalationTick } = await import("@/lib/escalation-heartbeat");
    const t0 = new Date("2026-11-07T10:00:00Z");
    await maybeRunEscalationTick(t0);
    await maybeRunEscalationTick(new Date(t0.getTime() + 5_000));
    expect(tick).toHaveBeenCalledTimes(1);
    await maybeRunEscalationTick(new Date(t0.getTime() + 16_000));
    expect(tick).toHaveBeenCalledTimes(2);
  });

  it("never throws when the tick fails", async () => {
    tick.mockRejectedValueOnce(new Error("boom"));
    const { maybeRunEscalationTick } = await import("@/lib/escalation-heartbeat");
    await expect(maybeRunEscalationTick(new Date("2026-11-07T11:00:00Z"))).resolves.toBeUndefined();
  });
});
