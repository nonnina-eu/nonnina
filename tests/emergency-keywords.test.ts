import { describe, expect, it } from "vitest";
import { detectEmergency, normaliseText } from "@/lib/emergency-keywords";

describe("normaliseText", () => {
  it("lowercases, strips accents and ß, collapses punctuation", () => {
    expect(normaliseText("Ich bin GESTÜRZT!  Große Schmerzen…")).toBe("ich bin gesturzt grosse schmerzen");
    expect(normaliseText("Sono caduta, non riesco ad alzarmi.")).toBe("sono caduta non riesco ad alzarmi");
  });
});

describe("detectEmergency – emergency level", () => {
  it.each([
    ["Ich bin gestürzt und komme nicht hoch", "de"],
    ["ich bin hingefallen und kann nicht aufstehen", "de"],
    ["Ich habe Brustschmerzen", "de"],
    ["Ich bekomme keine Luft", "de"],
    ["Sono caduta e non riesco ad alzarmi", "it"],
    ["Ho un dolore al petto fortissimo", "it"],
    ["Non respiro bene", "it"],
    ["I fell and I can't get up", "en"],
    ["I have chest pain", "en"],
    ["I can’t breathe", "en"],
  ])("detects %s (%s)", (transcript, language) => {
    const match = detectEmergency(transcript);
    expect(match?.level).toBe("emergency");
    expect(match?.language).toBe(language);
  });

  it("is case and accent insensitive", () => {
    expect(detectEmergency("ICH BIN GESTURZT")?.level).toBe("emergency");
    expect(detectEmergency("Ich bin gestuerzt")?.level).toBe("emergency");
  });
});

describe("detectEmergency – warning level", () => {
  it.each(["Mir ist schwindelig", "Ich habe meine Tabletten vergessen", "Mi gira la testa", "Non ho mangiato oggi", "I feel dizzy"])(
    "detects %s as warning",
    (transcript) => {
      expect(detectEmergency(transcript)?.level).toBe("warning");
    },
  );

  it("prefers emergency when both appear", () => {
    expect(detectEmergency("Mir ist schwindelig und ich bin gestürzt")?.level).toBe("emergency");
  });
});

describe("detectEmergency – no false positives", () => {
  it.each([
    "Wie wird das Wetter morgen?",
    "Mein Enkel kommt am Sonntag zu Besuch.",
    "That was very helpful, thank you.",
    "Vorrei sapere che ore sono.",
    "",
    "   ",
  ])("ignores %s", (transcript) => {
    expect(detectEmergency(transcript)).toBeNull();
  });

  it("matches whole words only", () => {
    expect(detectEmergency("helpful")).toBeNull();
    expect(detectEmergency("firefighter museum")).toBeNull();
  });
});
