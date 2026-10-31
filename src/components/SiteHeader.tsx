import { Link } from "@tanstack/react-router";
import { Sparkles } from "lucide-react";

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-border/60 bg-background/80 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
        <Link to="/" className="flex items-center gap-2 font-display text-lg font-semibold">
          <span className="grid h-8 w-8 place-items-center rounded-lg bg-gradient-primary text-primary-foreground">
            <Sparkles className="h-4 w-4" />
          </span>
          CareerPilot
        </Link>
        <nav className="flex items-center gap-1 text-sm font-medium">
          <Link to="/" className="rounded-lg px-3 py-2 text-muted-foreground hover:text-foreground" activeProps={{ className: "text-foreground" }} activeOptions={{ exact: true }}>
            Home
          </Link>
          <Link to="/analyze" className="rounded-lg bg-primary px-4 py-2 text-primary-foreground shadow-soft hover:opacity-90">
            Analyze CV
          </Link>
        </nav>
      </div>
    </header>
  );
}
