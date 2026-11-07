import { describe, expect, it } from "vitest";
import { shouldEscalate, toHelpCategory } from "@/lib/escalation";

describe("toHelpCategory", () => {
  it("passes through known categories", () => {
    expect(toHelpCategory("legal")).toBe("legal");
    expect(toHelpCategory("Daily Help")).toBe("daily_help");
  });
  it("maps free text in DE/IT/EN", () => {
    expect(toHelpCategory("Pflegegeld beantragen")).toBe("money");
    expect(toHelpCategory("contratto badante")).toBe("legal");
    expect(toHelpCategory("feels lonely")).toBe("loneliness");
    expect(toHelpCategory("Einkaufen")).toBe("daily_help");
    expect(toHelpCategory("something else")).toBe("other");
    expect(toHelpCategory(undefined)).toBe("other");
  });
});

describe("shouldEscalate", () => {
  it("escalates when the agent flags needs_human", () => {
    expect(shouldEscalate({ needs_human: true, problem_category: "other" })).toBe(true);
  });
  it("always escalates legal and money topics", () => {
    expect(shouldEscalate({ needs_human: false, problem_category: "legal" })).toBe(true);
    expect(shouldEscalate({ needs_human: false, problem_category: "money" })).toBe(true);
    expect(shouldEscalate({ needs_human: null, problem_category: "Versicherung" })).toBe(true);
  });
  it("does not escalate small talk or solved daily help", () => {
    expect(shouldEscalate({ needs_human: false, problem_category: "loneliness" })).toBe(false);
    expect(shouldEscalate({})).toBe(false);
  });
});
