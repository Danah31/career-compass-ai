# Make CareerPilot analyze real CVs

The screens stay exactly as they are. Only the step behind the "Analyze with AI" button changes: it stops returning sample text and actually reads the CV and job post.

## What's missing today
- The PDF is never opened. Only its name and size are shown.
- The results come from a fixed template, not from the CV.
- Nothing runs on a server, so no AI can be called safely.
- Every failure shows the same message: "Analysis failed".

## Minimum steps
1. **Turn on Lovable Cloud.** This provides the AI access and a private place to keep the AI key. No database, login or file storage is needed.
2. **Read the text from the PDF in the browser.** When a CV is chosen, pull out its text. Stop early with a clear message if the PDF is password-protected, damaged, or a scanned image with no text ("This looks like a scanned image. Please upload a text-based PDF.").
3. **Run the AI analysis on the server.** Send the CV text and job description to the AI with fixed instructions. The AI must return the result in the exact shape the dashboard already uses: score, summary, skills, strengths, weaknesses, missing qualifications, skill-by-skill comparison, CV tips and skills to learn.
4. **Check the answer.** Check the AI's answer before showing it: keep the score between 0 and 100 and make sure every list is filled. If the answer is broken, show an error instead of a half-empty dashboard.
5. **Clear errors and loading.** Show a specific message for each case: unreadable PDF, CV or job post too short or too long, AI busy ("Try again in a minute"), AI credits used up, and network or unknown errors. The button shows two stages: "Reading CV…" and then "Analyzing…". It can't be clicked twice. Your file and text are kept, so you can retry right away.
6. **Test it.** Run one real CV and job post from start to finish in the preview. Add small automatic tests for the answer check and the score limits.

## Not included (on purpose)
Accounts, saved history, file storage, or any redesign. Each of these can be added later.

## Services and costs
- **Lovable Cloud:** free to turn on. Here it's only used to run the analysis.
- **Lovable AI:** charged per analysis. Your workspace gets a small free amount each month. After that, AI use comes out of your workspace credits, which may mean upgrading to a paid plan. Each analysis is one AI request.
- **PDF reading:** a free, open-source library that runs in the visitor's browser. No extra cost.
- **Setup for you:** none. The AI key is created automatically. No outside accounts are needed.

## Technical details
- Extract text with `pdfjs-dist`, loaded only in the browser after the page has loaded (it can't run during server rendering). Limit the text to about 30k characters.
- A `createServerFn` (POST) checks the input size, then calls the AI Gateway Responses API with `openai/gpt-6-astra`. It streams the response and reads the full result on the server, using a strict `json_schema` that matches the `AnalysisResult` type. Reasoning effort is `low`.
- Replace only the body of `analyzeCv` in `src/lib/analysis.ts`. The UI in `analyze.tsx` changes only to show the specific error messages and the two loading stages.
- Gateway errors 402, 403 and 429 become messages the user can understand. Failures are not retried automatically.
- Record the decision in `AGENTS.md`: PDF text is extracted in the browser, and the AI is called only from server functions.
