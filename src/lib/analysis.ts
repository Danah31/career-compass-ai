// Analysis contract. `analyzeCv` is a local mock today; swap its body for a
// server function call (AI Gateway) without changing the UI.

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

export type AnalysisInput = { file: File; jobDescription: string };

const KNOWN = [
  "Python", "JavaScript", "TypeScript", "React", "SQL", "Excel", "Communication",
  "Teamwork", "Leadership", "Data Analysis", "Machine Learning", "Project Management",
  "Git", "Cloud", "Problem Solving", "Presentation",
];

export async function analyzeCv({ jobDescription }: AnalysisInput): Promise<AnalysisResult> {
  await new Promise((r) => setTimeout(r, 2200));
  const jd = jobDescription.toLowerCase();
  const required = KNOWN.filter((s) => jd.includes(s.toLowerCase()));
  const req = required.length ? required : ["Communication", "SQL", "Python", "Teamwork", "Cloud"];
  const cvSkills = ["Python", "Excel", "Communication", "Teamwork", "Data Analysis", "Presentation", "Git"];
  const comparison: SkillMatch[] = req.map((skill, i) => ({
    skill,
    status: cvSkills.includes(skill) ? "matched" : i % 3 === 0 ? "partial" : "missing",
  }));
  const matched = comparison.filter((c) => c.status === "matched").length;
  const partial = comparison.filter((c) => c.status === "partial").length;
  const matchScore = Math.round(((matched + partial * 0.5) / comparison.length) * 100);
  const missing = comparison.filter((c) => c.status === "missing").map((c) => c.skill);

  return {
    matchScore,
    summary:
      "A motivated graduate profile with solid analytical foundations and good teamwork experience. Strengthening a few technical requirements would make you a strong fit for this role.",
    skills: cvSkills,
    strengths: [
      "Clear academic background with relevant coursework",
      "Hands-on group projects showing collaboration",
      "Good foundation in data tools (Python, Excel)",
    ],
    weaknesses: [
      "Achievements lack measurable results",
      "Limited professional or internship experience",
      "Summary section is generic",
    ],
    missingQualifications: missing.length ? missing.map((m) => `Experience with ${m}`) : ["Relevant certification"],
    comparison,
    cvRecommendations: [
      "Quantify impact, e.g. “Improved report speed by 30%”.",
      "Tailor your summary to this role using keywords from the job post.",
      "Move projects above education to highlight practical experience.",
      "Keep the CV to one page with consistent formatting.",
    ],
    skillRecommendations: (missing.length ? missing : ["Cloud"]).map((skill) => ({
      skill,
      resource: `Complete a beginner ${skill} course and build one small portfolio project.`,
    })),
  };
}
