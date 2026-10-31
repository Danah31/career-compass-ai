import { createFileRoute } from "@tanstack/react-router";
import { useRef, useState, type ReactNode } from "react";
import {
  Upload, FileText, X, Loader2, Sparkles, CheckCircle2, AlertTriangle, XCircle,
  TrendingUp, TrendingDown, Target, Lightbulb, GraduationCap, RotateCcw,
} from "lucide-react";
import { SiteHeader } from "@/components/SiteHeader";
import { analyzeCv, type AnalysisResult } from "@/lib/analysis";

export const Route = createFileRoute("/analyze")({
  head: () => ({
    meta: [
      { title: "Analyze your CV — CareerPilot" },
      { name: "description", content: "Upload your CV as PDF and compare it with a job description using AI." },
      { property: "og:title", content: "Analyze your CV — CareerPilot" },
      { property: "og:description", content: "Get a match score, skill gaps and personalized recommendations." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: AnalyzePage,
});

function AnalyzePage() {
  const [file, setFile] = useState<File | null>(null);
  const [jd, setJd] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [drag, setDrag] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const pick = (f?: File) => {
    if (!f) return;
    if (f.type !== "application/pdf") return setError("Please upload a PDF file.");
    if (f.size > 10 * 1024 * 1024) return setError("File must be under 10 MB.");
    setError("");
    setFile(f);
  };

  const run = async () => {
    if (!file) return setError("Upload your CV first.");
    if (jd.trim().length < 30) return setError("Paste a job description (at least 30 characters).");
    setError("");
    setLoading(true);
    try {
      setResult(await analyzeCv({ file, jobDescription: jd }));
    } catch {
      setError("Analysis failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen">
      <SiteHeader />
      <main className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
        {!result ? (
          <>
            <h1 className="text-3xl font-bold">Analyze your CV</h1>
            <p className="mt-2 text-muted-foreground">Upload your CV and paste the job you're applying for.</p>
            <div className="mt-8 grid gap-6 lg:grid-cols-2">
              <Card title="1. Upload CV" icon={<Upload className="h-4 w-4" />}>
                {file ? (
                  <div className="flex items-center gap-3 rounded-xl border border-border bg-primary-soft p-4">
                    <FileText className="h-8 w-8 text-primary" />
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-medium">{file.name}</p>
                      <p className="text-xs text-muted-foreground">{(file.size / 1024).toFixed(0)} KB · PDF</p>
                    </div>
                    <button aria-label="Remove file" onClick={() => setFile(null)} className="rounded-lg p-2 hover:bg-card"><X className="h-4 w-4" /></button>
                  </div>
                ) : (
                  <button
                    onClick={() => inputRef.current?.click()}
                    onDragOver={(e) => { e.preventDefault(); setDrag(true); }}
                    onDragLeave={() => setDrag(false)}
                    onDrop={(e) => { e.preventDefault(); setDrag(false); pick(e.dataTransfer.files[0]); }}
                    className={`flex h-64 w-full flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed transition ${drag ? "border-primary bg-primary-soft" : "border-border bg-muted hover:border-primary"}`}
                  >
                    <span className="grid h-12 w-12 place-items-center rounded-full bg-card text-primary shadow-card"><Upload className="h-5 w-5" /></span>
                    <span className="font-medium">Drop your PDF here or click to browse</span>
                    <span className="text-xs text-muted-foreground">PDF only · max 10 MB</span>
                  </button>
                )}
                <input ref={inputRef} type="file" accept="application/pdf" className="hidden" onChange={(e) => pick(e.target.files?.[0])} />
              </Card>
              <Card title="2. Job description" icon={<FileText className="h-4 w-4" />}>
                <textarea
                  value={jd}
                  onChange={(e) => setJd(e.target.value)}
                  placeholder="Paste the full job description here…"
                  className="h-64 w-full resize-none rounded-xl border border-input bg-background p-4 text-sm outline-none focus:ring-2 focus:ring-ring"
                />
                <p className="mt-2 text-right text-xs text-muted-foreground">{jd.length} characters</p>
              </Card>
            </div>
            {error && <p className="mt-4 rounded-lg bg-destructive-soft px-4 py-3 text-sm text-destructive">{error}</p>}
            <div className="mt-6 flex justify-end">
              <button onClick={run} disabled={loading} className="inline-flex items-center gap-2 rounded-xl bg-primary px-6 py-3 font-semibold text-primary-foreground shadow-soft hover:opacity-90 disabled:opacity-60">
                {loading ? <><Loader2 className="h-4 w-4 animate-spin" /> Analyzing…</> : <><Sparkles className="h-4 w-4" /> Analyze with AI</>}
              </button>
            </div>
          </>
        ) : (
          <Dashboard result={result} fileName={file?.name ?? ""} onReset={() => setResult(null)} />
        )}
      </main>
    </div>
  );
}

function Card({ title, icon, children, className = "" }: { title: string; icon: ReactNode; children: ReactNode; className?: string }) {
  return (
    <section className={`rounded-2xl border border-border bg-card p-6 shadow-card ${className}`}>
      <h2 className="mb-4 flex items-center gap-2 text-base font-semibold">
        <span className="grid h-7 w-7 place-items-center rounded-lg bg-primary-soft text-primary">{icon}</span>
        {title}
      </h2>
      {children}
    </section>
  );
}

function List({ items, icon }: { items: string[]; icon: ReactNode }) {
  return (
    <ul className="space-y-2.5 text-sm">
      {items.map((i) => <li key={i} className="flex gap-2">{icon}<span>{i}</span></li>)}
    </ul>
  );
}

const statusStyle = {
  matched: { cls: "bg-success-soft text-success", label: "Matched", Icon: CheckCircle2 },
  partial: { cls: "bg-warning-soft text-warning", label: "Partial", Icon: AlertTriangle },
  missing: { cls: "bg-destructive-soft text-destructive", label: "Missing", Icon: XCircle },
};

function Dashboard({ result, fileName, onReset }: { result: AnalysisResult; fileName: string; onReset: () => void }) {
  const r = result;
  const circ = 2 * Math.PI * 52;
  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-sm text-muted-foreground">{fileName}</p>
          <h1 className="text-3xl font-bold">Your analysis</h1>
        </div>
        <button onClick={onReset} className="inline-flex items-center gap-2 rounded-xl border border-border bg-card px-4 py-2 text-sm font-semibold hover:bg-muted">
          <RotateCcw className="h-4 w-4" /> New analysis
        </button>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        <section className="flex flex-col items-center justify-center rounded-2xl bg-gradient-primary p-6 text-primary-foreground shadow-soft">
          <svg viewBox="0 0 120 120" className="h-36 w-36 -rotate-90">
            <circle cx="60" cy="60" r="52" fill="none" stroke="currentColor" strokeOpacity="0.25" strokeWidth="10" />
            <circle cx="60" cy="60" r="52" fill="none" stroke="currentColor" strokeWidth="10" strokeLinecap="round" strokeDasharray={circ} strokeDashoffset={circ * (1 - r.matchScore / 100)} />
          </svg>
          <p className="-mt-24 mb-16 font-display text-4xl font-bold">{r.matchScore}%</p>
          <p className="font-semibold">Job match score</p>
        </section>
        <Card title="Summary" icon={<Sparkles className="h-4 w-4" />} className="lg:col-span-2">
          <p className="text-sm leading-relaxed text-muted-foreground">{r.summary}</p>
          <p className="mt-4 text-xs font-semibold uppercase text-muted-foreground">Skills found in your CV</p>
          <div className="mt-2 flex flex-wrap gap-2">
            {r.skills.map((s) => <span key={s} className="rounded-full bg-primary-soft px-3 py-1 text-xs font-medium text-primary">{s}</span>)}
          </div>
        </Card>

        <Card title="Strengths" icon={<TrendingUp className="h-4 w-4" />}>
          <List items={r.strengths} icon={<CheckCircle2 className="h-4 w-4 shrink-0 text-success" />} />
        </Card>
        <Card title="Weaknesses" icon={<TrendingDown className="h-4 w-4" />}>
          <List items={r.weaknesses} icon={<AlertTriangle className="h-4 w-4 shrink-0 text-warning" />} />
        </Card>
        <Card title="Missing qualifications" icon={<Target className="h-4 w-4" />}>
          <List items={r.missingQualifications} icon={<XCircle className="h-4 w-4 shrink-0 text-destructive" />} />
        </Card>

        <Card title="Skills vs. job requirements" icon={<Target className="h-4 w-4" />} className="lg:col-span-3">
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {r.comparison.map((c) => {
              const s = statusStyle[c.status];
              return (
                <div key={c.skill} className="flex items-center justify-between rounded-xl border border-border p-3">
                  <span className="font-medium">{c.skill}</span>
                  <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold ${s.cls}`}>
                    <s.Icon className="h-3.5 w-3.5" />{s.label}
                  </span>
                </div>
              );
            })}
          </div>
        </Card>

        <Card title="Improve your CV" icon={<Lightbulb className="h-4 w-4" />} className="lg:col-span-2">
          <ol className="space-y-3 text-sm">
            {r.cvRecommendations.map((t, i) => (
              <li key={t} className="flex gap-3">
                <span className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-primary text-xs font-bold text-primary-foreground">{i + 1}</span>
                <span className="pt-0.5">{t}</span>
              </li>
            ))}
          </ol>
        </Card>
        <Card title="Skills to develop" icon={<GraduationCap className="h-4 w-4" />}>
          <div className="space-y-3">
            {r.skillRecommendations.map((s) => (
              <div key={s.skill} className="rounded-xl bg-muted p-3">
                <p className="font-semibold">{s.skill}</p>
                <p className="mt-1 text-xs text-muted-foreground">{s.resource}</p>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
