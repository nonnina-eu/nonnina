import { describe, expect, it } from "vitest";
import { formatReminder, nextReminder, partOfDay } from "@/lib/time";

const times = [
  { time: "18:00", label: "Tabletten" },
  { time: "08:00", label: "Tabletten" },
];

describe("nextReminder", () => {
  it("returns the next slot today", () => {
    const r = nextReminder(times, new Date(2026, 10, 7, 10, 30));
    expect(r).toEqual({ time: "18:00", label: "Tabletten", tomorrow: false });
  });
  it("wraps to tomorrow after the last slot", () => {
    const r = nextReminder(times, new Date(2026, 10, 7, 19, 0));
    expect(r).toEqual({ time: "08:00", label: "Tabletten", tomorrow: true });
  });
  it("handles empty lists", () => {
    expect(nextReminder([], new Date())).toBeNull();
    expect(formatReminder(null, "de")).toMatch(/Keine/);
  });
  it("formats in both languages", () => {
    const r = { time: "18:00", label: "Tabletten", tomorrow: false };
    expect(formatReminder(r, "de")).toBe("Tabletten um 18:00");
    expect(formatReminder(r, "it")).toBe("Tabletten alle 18:00");
  });
});

describe("partOfDay", () => {
  it("maps hours", () => {
    expect(partOfDay(new Date(2026, 0, 1, 7))).toBe("morning");
    expect(partOfDay(new Date(2026, 0, 1, 13))).toBe("afternoon");
    expect(partOfDay(new Date(2026, 0, 1, 19))).toBe("evening");
    expect(partOfDay(new Date(2026, 0, 1, 23))).toBe("night");
  });
});
