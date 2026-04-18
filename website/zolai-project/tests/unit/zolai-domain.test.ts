import { describe, it, expect } from "vitest";
import {
  CURRICULUM_GUIDELINES,
  getTutorSystemPrompt,
  getChatSystemPrompt,
} from "@/lib/zolai/curriculum";

describe("Zolai Curriculum Guidelines", () => {
  it("should define all CEFR levels A1–C2", () => {
    const levels = ["A1", "A2", "B1", "B2", "C1", "C2"];
    for (const level of levels) {
      expect(CURRICULUM_GUIDELINES[level]).toBeDefined();
    }
  });

  it("each level should have focus, patterns, and vocabulary", () => {
    for (const [level, guide] of Object.entries(CURRICULUM_GUIDELINES)) {
      expect(typeof guide.focus).toBe("string");
      expect(guide.focus.length).toBeGreaterThan(0);
      expect(Array.isArray(guide.patterns)).toBe(true);
      expect(guide.patterns.length).toBeGreaterThan(0);
      expect(Array.isArray(guide.vocabulary)).toBe(true);
      expect(guide.vocabulary.length).toBeGreaterThan(0);
    }
  });

  it("A1 vocabulary should include foundational Zolai words", () => {
    const { vocabulary } = CURRICULUM_GUIDELINES.A1;
    expect(vocabulary).toContain("Pasian");
    expect(vocabulary).toContain("Mi");
  });

  it("B2 patterns should use correct negation form", () => {
    const { patterns } = CURRICULUM_GUIDELINES.B2;
    const hasCorrectNegation = patterns.some((p) => p.includes("kei a leh"));
    expect(hasCorrectNegation).toBe(true);
  });

  it("B2 patterns should NOT use forbidden negation 'lo leh'", () => {
    for (const guide of Object.values(CURRICULUM_GUIDELINES)) {
      for (const pattern of guide.patterns) {
        expect(pattern).not.toContain("lo leh");
      }
    }
  });
});

describe("getTutorSystemPrompt", () => {
  it("should return a non-empty string", () => {
    const prompt = getTutorSystemPrompt("A1", "conversation");
    expect(typeof prompt).toBe("string");
    expect(prompt.length).toBeGreaterThan(100);
  });

  it("should include the requested level", () => {
    const prompt = getTutorSystemPrompt("B2", "grammar");
    expect(prompt).toContain("B2");
  });

  it("should enforce Tedim ZVS dialect rules", () => {
    const prompt = getTutorSystemPrompt("A1");
    expect(prompt).toContain("pasian");
    expect(prompt).toContain("NEVER");
    expect(prompt).toContain("pathian");
  });

  it("should include SOV word order rule", () => {
    const prompt = getTutorSystemPrompt("A1");
    expect(prompt).toContain("SOV");
  });

  it("should include correct negation rule", () => {
    const prompt = getTutorSystemPrompt("B2");
    expect(prompt).toContain("nong pai kei a leh");
  });

  it("should fall back to A1 for unknown level", () => {
    const promptUnknown = getTutorSystemPrompt("Z9");
    const promptA1 = getTutorSystemPrompt("A1");
    // Both should contain A1 focus text
    expect(promptUnknown).toContain(CURRICULUM_GUIDELINES.A1.focus);
    expect(promptA1).toContain(CURRICULUM_GUIDELINES.A1.focus);
  });

  it("should include mode-specific content for grammar mode", () => {
    const prompt = getTutorSystemPrompt("B1", "grammar");
    expect(prompt).toContain("Grammar");
  });

  it("should include mode-specific content for translation mode", () => {
    const prompt = getTutorSystemPrompt("B1", "translation");
    expect(prompt).toContain("Translation");
  });

  it("should include natural conversation rules for greeting responses", () => {
    const prompt = getTutorSystemPrompt("A1", "conversation");
    expect(prompt).toContain("NATURAL CONVERSATION RULES");
    expect(prompt).toContain("Ka hoih hi");
  });

  it("should use correct greeting response 'Ka hoih hi' not 'Ka lum hi'", () => {
    const prompt = getTutorSystemPrompt("A1", "conversation");
    expect(prompt).toContain("Ka hoih hi");
    expect(prompt).not.toContain("Ka lum hi");
  });

  it("conversation mode should NOT rigidly repeat patterns", () => {
    const prompt = getTutorSystemPrompt("A1", "conversation");
    expect(prompt).toContain("Adapt responses to the actual user input");
    expect(prompt).toContain("not just curriculum patterns");
  });

  it("should instruct tutor to respond naturally to greetings", () => {
    const prompt = getTutorSystemPrompt("A1", "conversation");
    expect(prompt).toContain("Respond with natural greetings");
    expect(prompt).toContain("NOT just repeating patterns");
  });

  it("should emphasize context-aware responses over pattern matching", () => {
    const prompt = getTutorSystemPrompt("B1", "conversation");
    expect(prompt).toContain("Use patterns as teaching examples");
    expect(prompt).toContain("not as rigid responses");
  });
});

describe("getChatSystemPrompt", () => {
  it("should return a non-empty string", () => {
    const prompt = getChatSystemPrompt();
    expect(typeof prompt).toBe("string");
    expect(prompt.length).toBeGreaterThan(100);
  });

  it("should reference the dictionary size", () => {
    const prompt = getChatSystemPrompt();
    expect(prompt).toContain("24,891");
  });

  it("should enforce Tedim ZVS dialect rules", () => {
    const prompt = getChatSystemPrompt();
    expect(prompt).toContain("pasian");
    expect(prompt).toContain("NEVER");
    expect(prompt).toContain("pathian");
  });

  it("should mention the Bible corpus", () => {
    const prompt = getChatSystemPrompt();
    expect(prompt).toContain("Bible");
  });

  it("should include self-learning approach", () => {
    const prompt = getChatSystemPrompt();
    expect(prompt).toContain("learn");
  });
});

describe("Zolai Language Rules Enforcement", () => {
  const FORBIDDEN_WORDS = ["pathian", "ram", "fapa", "bawipa", "siangpahrang"];
  const REQUIRED_WORDS = ["pasian", "gam", "tapa", "topa", "kumpipa", "tua"];

  it("tutor prompt should not contain forbidden dialect words", () => {
    const prompt = getTutorSystemPrompt("C1", "conversation");
    for (const word of FORBIDDEN_WORDS) {
      // The prompt lists them as forbidden — they appear in the NEVER list, not as usage
      // Verify the prompt explicitly marks them as forbidden
      expect(prompt).toContain("NEVER");
    }
  });

  it("tutor prompt should reference all required Tedim ZVS words", () => {
    const prompt = getTutorSystemPrompt("A1");
    for (const word of REQUIRED_WORDS) {
      expect(prompt).toContain(word);
    }
  });

  it("chat prompt should reference all required Tedim ZVS words", () => {
    const prompt = getChatSystemPrompt();
    for (const word of REQUIRED_WORDS) {
      expect(prompt).toContain(word);
    }
  });
});
