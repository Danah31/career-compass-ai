// Browser-only PDF text extraction. pdfjs is imported lazily so it never runs during SSR.

export class PdfReadError extends Error {}

export async function extractPdfText(file: File): Promise<string> {
  const pdfjs = await import("pdfjs-dist");
  const workerUrl = (await import("pdfjs-dist/build/pdf.worker.min.mjs?url")).default;
  pdfjs.GlobalWorkerOptions.workerSrc = workerUrl;

  let doc;
  try {
    doc = await pdfjs.getDocument({ data: new Uint8Array(await file.arrayBuffer()) }).promise;
  } catch (e) {
    const name = (e as { name?: string })?.name;
    if (name === "PasswordException") throw new PdfReadError("This PDF is password-protected. Please upload an unlocked copy.");
    throw new PdfReadError("We couldn't open this PDF. It may be damaged — try exporting it again.");
  }

  const pages: string[] = [];
  for (let i = 1; i <= Math.min(doc.numPages, 15); i++) {
    const page = await doc.getPage(i);
    const content = await page.getTextContent();
    pages.push(content.items.map((it) => ("str" in it ? it.str : "")).join(" "));
  }
  await (doc as unknown as { cleanup?: () => Promise<void> }).cleanup?.();

  const text = pages.join("\n").replace(/[ \t]+/g, " ").replace(/\n{3,}/g, "\n\n").trim();
  if (text.length < 50) {
    throw new PdfReadError("This looks like a scanned image. Please upload a text-based PDF.");
  }
  return text;
}
