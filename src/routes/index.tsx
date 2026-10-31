import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, FileText, GitCompare, Lightbulb, Target, CheckCircle2 } from "lucide-react";
import { SiteHeader } from "@/components/SiteHeader";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "CareerPilot — AI Career Assistant for Students & Graduates" },
      { name: "description", content: "Upload your CV, paste a job description, and get AI-powered skill gap analysis and personalized recommendations." },
      { property: "og:title", content: "CareerPilot — AI Career Assistant" },
      { property: "og:description", content: "AI CV analysis and job matching for students and fresh graduates." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});

const features = [
  { icon: FileText, title: "CV analysis", text: "Identify your skills, strengths and weaknesses instantly." },
  { icon: GitCompare, title: "Job matching", text: "Compare your profile against any job requirements." },
  { icon: Target, title: "Gap detection", text: "See exactly which qualifications you're missing." },
  { icon: Lightbulb, title: "Smart advice", text: "Get personalized steps to improve your CV and skills." },
];

function Index() {
  return (
    <div className="min-h-screen">
      <SiteHeader />
      <section className="relative overflow-hidden bg-hero">
        <div className="mx-auto grid max-w-6xl items-center gap-12 px-4 py-20 sm:px-6 lg:grid-cols-2 lg:py-28">
          <div>
            <span className="inline-flex items-center gap-2 rounded-full bg-primary-soft px-3 py-1 text-xs font-semibold text-primary">
              Built for students & fresh graduates
            </span>
            <h1 className="mt-5 text-4xl font-bold leading-tight sm:text-5xl lg:text-6xl">
              Land your first job with an <span className="text-primary">AI career coach</span>
            </h1>
            <p className="mt-5 max-w-lg text-lg text-muted-foreground">
              Upload your CV, paste a job post, and get a clear match score, skill gaps, and a plan to stand out.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link to="/analyze" className="inline-flex items-center gap-2 rounded-xl bg-primary px-6 py-3 font-semibold text-primary-foreground shadow-soft hover:opacity-90">
                Analyze my CV <ArrowRight className="h-4 w-4" />
              </Link>
              <a href="#how" className="rounded-xl border border-border bg-card px-6 py-3 font-semibold hover:bg-muted">
                How it works
              </a>
            </div>
          </div>
          <div className="rounded-3xl border border-border bg-card p-6 shadow-soft">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Job match</p>
                <p className="font-display text-xl font-semibold">Junior Data Analyst</p>
              </div>
              <div className="grid h-16 w-16 place-items-center rounded-full bg-primary-soft font-display text-xl font-bold text-primary">78%</div>
            </div>
            <div className="mt-6 space-y-3">
              {[["Python", 90], ["SQL", 60], ["Communication", 85], ["Cloud", 25]].map(([s, v]) => (
                <div key={s as string}>
                  <div className="mb-1 flex justify-between text-sm"><span>{s}</span><span className="text-muted-foreground">{v}%</span></div>
                  <div className="h-2 rounded-full bg-muted"><div className="h-2 rounded-full bg-gradient-primary" style={{ width: `${v}%` }} /></div>
                </div>
              ))}
            </div>
            <div className="mt-6 rounded-xl bg-muted p-4 text-sm">
              <p className="flex gap-2"><CheckCircle2 className="h-4 w-4 shrink-0 text-success" /> Add measurable results to your projects</p>
            </div>
          </div>
        </div>
      </section>

      <section id="how" className="mx-auto max-w-6xl px-4 py-20 sm:px-6">
        <h2 className="text-center text-3xl font-bold">Everything you need to get hired</h2>
        <p className="mx-auto mt-3 max-w-xl text-center text-muted-foreground">Three simple steps: upload, paste, and improve.</p>
        <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {features.map((f) => (
            <div key={f.title} className="rounded-2xl border border-border bg-card p-6 shadow-card">
              <span className="grid h-11 w-11 place-items-center rounded-xl bg-primary-soft text-primary"><f.icon className="h-5 w-5" /></span>
              <h3 className="mt-4 font-semibold">{f.title}</h3>
              <p className="mt-1 text-sm text-muted-foreground">{f.text}</p>
            </div>
          ))}
        </div>
        <div className="mt-16 rounded-3xl bg-gradient-primary p-10 text-center text-primary-foreground">
          <h2 className="text-3xl font-bold">Ready to see how you match?</h2>
          <Link to="/analyze" className="mt-6 inline-flex items-center gap-2 rounded-xl bg-card px-6 py-3 font-semibold text-primary">
            Start free analysis <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>
      <footer className="border-t border-border py-8 text-center text-sm text-muted-foreground">© 2026 CareerPilot</footer>
    </div>
  );
}
