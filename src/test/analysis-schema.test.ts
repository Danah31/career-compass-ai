import { describe, it, expect } from "vitest";
import { sanitizeAnalysis } from "@/lib/analysis-schema";

const base = {
  matchScore: 72,
  summary: "Solid fit.",
  skills: ["Python"],
  strengths: ["Projects"],
  weaknesses: ["No metrics"],
  missingQualifications: ["Cloud"],
  comparison: [{ skill: "Python", status: "matched" }],
  cvRecommendations: ["Quantify results"],
  skillRecommendations: [{ skill: "Cloud", resource: "Take a course" }],
};

describe("sanitizeAnalysis", () => {
  it("caps the score at 100", () => {
    expect(sanitizeAnalysis({ ...base, matchScore: 140 })?.matchScore).toBe(100);
  });
  it("floors the score at 0", () => {
    expect(sanitizeAnalysis({ ...base, matchScore: -5 })?.matchScore).toBe(0);
  });
  it("rejects an analysis with no skill comparison", () => {
    expect(sanitizeAnalysis({ ...base, comparison: [] })).toBeNull();
  });
  it("rejects malformed output", () => {
    expect(sanitizeAnalysis({ matchScore: "high" })).toBeNull();
  });
});
