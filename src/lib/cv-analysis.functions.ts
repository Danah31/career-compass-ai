import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { createOpenAI } from "@ai-sdk/openai";
import { streamText, Output } from "ai";
import { analysisSchema, sanitizeAnalysis, LIMITS } from "./analysis-schema";
import type { AnalysisResult } from "./analysis";

export type AnalyzeResponse =
  | { ok: true; result: AnalysisResult }
  | { ok: false; code: "input" | "busy" | "credits" | "config" | "invalid" | "unknown"; message: string };

const INSTRUCTIONS = `You are a careful career advisor for university students and fresh graduates.
Compare the candidate's CV with the job description and return an honest, specific analysis.
Rules:
- Base everything only on the CV text and job description. Never invent experience.
- matchScore: integer 0-100 reflecting how well the CV meets the job's requirements.
- summary: 2-3 sentences addressed to the candidate ("you").
- skills: concrete skills actually present in the CV (max 15).
- strengths / weaknesses: 3-5 items each, specific to this CV versus this job.
- missingQualifications: requirements from the job the CV does not show (may be empty only if none).
- comparison: every key skill/requirement from the job (5-12 items), status "matched" if clearly shown, "partial" if related or weakly shown, "missing" if absent.
- cvRecommendations: 3-6 actionable edits to the CV text itself.
- skillRecommendations: 2-5 skills to develop, each with a short practical way to learn it.
Write in the same language as the job description. Keep each item under 25 words.`;

export const runCvAnalysis = createServerFn({ method: "POST" })
  .validator((input) =>
    z.object({ cvText: z.string(), jobDescription: z.string() }).parse(input),
  )
  .handler(async ({ data }): Promise<AnalyzeResponse> => {
    const cvText = data.cvText.trim();
    const jd = data.jobDescription.trim();
    if (cvText.length < LIMITS.cvMin) return { ok: false, code: "input", message: "We found too little text in your CV to analyze." };
    if (jd.length < LIMITS.jdMin) return { ok: false, code: "input", message: "Paste a job description (at least 30 characters)." };
    if (jd.length > LIMITS.jdMax) return { ok: false, code: "input", message: "The job description is too long. Please shorten it to under 15,000 characters." };

    const apiKey = process.env["LOVABLE_API_KEY"];
    if (!apiKey) return { ok: false, code: "config", message: "AI analysis isn't set up yet. Please try again later." };

    const provider = createOpenAI({
      baseURL: "https://ai.gateway.lovable.dev/v1",
      apiKey,
      headers: { "Lovable-API-Key": apiKey, "X-Lovable-AIG-SDK": "vercel-ai-sdk" },
    });

    try {
      const result = streamText({
        model: provider.responses("openai/gpt-6-astra"),
        instructions: INSTRUCTIONS,
        messages: [
          {
            role: "user",
            content: `JOB DESCRIPTION:\n${jd}\n\n---\nCANDIDATE CV:\n${cvText.slice(0, LIMITS.cvMax)}`,
          },
        ],
        output: Output.object({ schema: analysisSchema, name: "cv_analysis" }),
        maxRetries: 0,
        providerOptions: {
          openai: {
            forceReasoning: true,
            reasoningEffort: "low",
            reasoningSummary: "auto",
            store: false,
            include: ["reasoning.encrypted_content"],
          },
        },
      });
      const output = await result.output;
      const clean = sanitizeAnalysis(output);
      if (!clean) return { ok: false, code: "invalid", message: "The AI returned an incomplete analysis. Please try again." };
      return { ok: true, result: clean };
    } catch (error) {
      console.error(error);
      const status = findStatus(error);
      if (status === 429) return { ok: false, code: "busy", message: "The AI is busy right now. Try again in a minute." };
      if (status === 402) return { ok: false, code: "credits", message: "AI credits for this app are used up. Please try again later." };
      if (status === 403) return { ok: false, code: "credits", message: "AI analysis is currently unavailable for this app." };
      if (status === 401) return { ok: false, code: "config", message: "AI analysis isn't set up correctly. Please try again later." };
      return { ok: false, code: "unknown", message: "Analysis failed. Please try again." };
    }
  });

function findStatus(error: unknown): number | undefined {
  let cur: unknown = error;
  for (let i = 0; i < 5 && cur && typeof cur === "object"; i++) {
    const s = (cur as { statusCode?: unknown }).statusCode;
    if (typeof s === "number") return s;
    cur = (cur as { cause?: unknown; lastError?: unknown }).lastError ?? (cur as { cause?: unknown }).cause;
  }
  return undefined;
}
