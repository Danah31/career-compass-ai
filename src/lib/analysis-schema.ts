import { z } from "zod";
import type { AnalysisResult } from "./analysis";

// Strict-mode friendly: every field required, no optional/defaults.
export const analysisSchema = z.object({
  matchScore: z.number(),
  summary: z.string(),
  skills: z.array(z.string()),
  strengths: z.array(z.string()),
  weaknesses: z.array(z.string()),
  missingQualifications: z.array(z.string()),
  comparison: z.array(
    z.object({ skill: z.string(), status: z.enum(["matched", "partial", "missing"]) }),
  ),
  cvRecommendations: z.array(z.string()),
  skillRecommendations: z.array(z.object({ skill: z.string(), resource: z.string() })),
});

export const LIMITS = { cvMin: 200, cvMax: 30000, jdMin: 30, jdMax: 15000 };

const clean = (list: string[]) =>
  Array.from(new Set(list.map((s) => s.trim()).filter(Boolean)));

/** Normalizes AI output; returns null when it is too incomplete to show. */
export function sanitizeAnalysis(raw: unknown): AnalysisResult | null {
  const parsed = analysisSchema.safeParse(raw);
  if (!parsed.success) return null;
  const r = parsed.data;
  const seen = new Set<string>();
  const comparison = r.comparison
    .map((c) => ({ ...c, skill: c.skill.trim() }))
    .filter((c) => c.skill && !seen.has(c.skill.toLowerCase()) && seen.add(c.skill.toLowerCase()));
  const result: AnalysisResult = {
    matchScore: Math.round(Math.min(100, Math.max(0, Number.isFinite(r.matchScore) ? r.matchScore : 0))),
    summary: r.summary.trim(),
    skills: clean(r.skills),
    strengths: clean(r.strengths),
    weaknesses: clean(r.weaknesses),
    missingQualifications: clean(r.missingQualifications),
    comparison,
    cvRecommendations: clean(r.cvRecommendations),
    skillRecommendations: r.skillRecommendations
      .map((s) => ({ skill: s.skill.trim(), resource: s.resource.trim() }))
      .filter((s) => s.skill && s.resource),
  };
  if (!result.summary || !result.skills.length || !result.comparison.length || !result.cvRecommendations.length) {
    return null;
  }
  return result;
}
