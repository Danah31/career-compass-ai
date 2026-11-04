// Analysis contract. The UI calls `analyzeCv`; it reads the PDF in the browser
// and runs the AI analysis through a server function.
import { runCvAnalysis } from "./cv-analysis.functions";

export type SkillMatch = { skill: string; status: "matched" | "partial" | "missing" };

export type AnalysisResult = {
  matchScore: number;
  summary: string;
  skills: string[];
  strengths: string[];
  weaknesses: string[];
  missingQualifications: string[];
  comparison: SkillMatch[];
  cvRecommendations: string[];
  skillRecommendations: { skill: string; resource: string }[];
};

export type AnalysisStage = "reading" | "analyzing";

export type AnalysisInput = {
  file: File;
  jobDescription: string;
  onStage?: (stage: AnalysisStage) => void;
};

/** Error whose message is safe to show to the user. */
export class AnalysisError extends Error {}

export async function analyzeCv({ file, jobDescription, onStage }: AnalysisInput): Promise<AnalysisResult> {
  onStage?.("reading");
  const { extractPdfText, PdfReadError } = await import("./pdf-text");
  let cvText: string;
  try {
    cvText = await extractPdfText(file);
  } catch (e) {
    if (e instanceof PdfReadError) throw new AnalysisError(e.message);
    throw new AnalysisError("We couldn't read this PDF. Please try another file.");
  }

  onStage?.("analyzing");
  let res;
  try {
    res = await runCvAnalysis({ data: { cvText, jobDescription } });
  } catch {
    throw new AnalysisError("Couldn't reach the server. Check your connection and try again.");
  }
  if (!res.ok) throw new AnalysisError(res.message);
  return res.result;
}
