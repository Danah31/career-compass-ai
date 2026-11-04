<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.
<!-- LOVABLE:END -->

- CV analysis UI depends only on `analyzeCv` in src/lib/analysis.ts, which extracts PDF text in the browser (pdfjs, lazy-imported) and calls the `runCvAnalysis` server function; keeps the AI key server-side and pdfjs out of SSR.
- AI output is validated by `sanitizeAnalysis` before display; server function returns typed `{ok:false,message}` errors instead of throwing, because the error middleware turns throws into HTML pages.
