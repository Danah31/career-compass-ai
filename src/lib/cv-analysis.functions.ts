
import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { createGoogleGenerativeAI } from "@ai-sdk/google";
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
- missingQualifications: requirements from the job the CV does not show.
- comparison: every key skill/requirement from the job (5-12 items), status "matched", "partial", or "missing".
- cvRecommendations: 3-6 actionable edits to the CV text itself.
- skillRecommendations: 2-5 skills to develop, each with a short practical way to learn it.
Write in the same language as the job description. Keep each item under 25 words.
Return all fields in the required structured format.`;

export const runCvAnalysis = createServerFn({ method: "POST" })
  .validator((input) =>
    z.object({ cvText: z.string(), jobDescription: z.string() }).parse(input),
  )
  .handler(async ({ data }): Promise<AnalyzeResponse> => {
    const cvText = data.cvText.trim();
    const jd = data.jobDescription.trim();

    if (cvText.length < LIMITS.cvMin)
      return { ok: false, code: "input", message: "We found too little text in your CV to analyze." };

    if (jd.length < LIMITS.jdMin)
      return { ok: false, code: "input", message: "Paste a job description (at least 30 characters)." };

    if (jd.length > LIMITS.jdMax)
      return { ok: false, code: "input", message: "The job description is too long." };

    const apiKey = process.env["GOOGLE_GENERATIVE_AI_API_KEY"];

    if (!apiKey)
      return { ok: false, code: "config", message: "Gemini API key is missing. Check your .env.local file." };

    const google = createGoogleGenerativeAI({ apiKey });

    try {
      const result = streamText({
        model: google("gemini-3.5-flash-lite"),
        instructions: INSTRUCTIONS,
        messages: [
          {
            role: "user",
            content: `JOB DESCRIPTION:\n${jd}\n\n---\nCANDIDATE CV:\n${cvText.slice(0, LIMITS.cvMax)}`,
          },
        ],
        output: Output.object({
          schema: analysisSchema,
          name: "cv_analysis",
        }),
        maxRetries: 0,
      });

      const output = await result.output;
      const clean = sanitizeAnalysis(output);

      if (!clean)
        return { ok: false, code: "invalid", message: "The AI returned an incomplete analysis. Please try again." };

      return { ok: true, result: clean };
    } catch (error) {
      console.error("Gemini analysis error:", error);

      return {
        ok: false,
        code: "unknown",
        message: "Gemini analysis failed. Please check the API configuration and try again.",
      };
    }
  });
