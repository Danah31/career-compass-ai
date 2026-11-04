
// Browser-only PDF text extraction with OCR fallback.

export class PdfReadError extends Error {}

export async function extractPdfText(file: File): Promise<string> {
  const pdfjs = await import("pdfjs-dist");
  const workerUrl = (
    await import("pdfjs-dist/build/pdf.worker.min.mjs?url")
  ).default;

  pdfjs.GlobalWorkerOptions.workerSrc = workerUrl;

  let doc;

  try {
    doc = await pdfjs.getDocument({
      data: new Uint8Array(await file.arrayBuffer()),
    }).promise;
  } catch (e) {
    const name = (e as { name?: string })?.name;

    if (name === "PasswordException") {
      throw new PdfReadError(
        "This PDF is password-protected. Please upload an unlocked copy.",
      );
    }

    throw new PdfReadError(
      "We couldn't open this PDF. It may be damaged — try exporting it again.",
    );
  }

  try {
    const pages: string[] = [];

    // First attempt: extract selectable PDF text.
    for (let i = 1; i <= Math.min(doc.numPages, 15); i++) {
      const page = await doc.getPage(i);
      const content = await page.getTextContent();

      pages.push(
        content.items.map((it) => ("str" in it ? it.str : "")).join(" "),
      );
    }

    const text = pages
      .join("\n")
      .replace(/[ \t]+/g, " ")
      .replace(/\n{3,}/g, "\n\n")
      .trim();

    // If text exists, return it without using OCR.
    if (text.length >= 50) {
      return text;
    }

    // Fallback: OCR for scanned/image-based PDFs.
    const { createWorker } = await import("tesseract.js");
    const ocrWorker = await createWorker("eng");

    try {
      const ocrPages: string[] = [];

      for (let i = 1; i <= Math.min(doc.numPages, 10); i++) {
        const page = await doc.getPage(i);
        const viewport = page.getViewport({ scale: 2 });

        const canvas = document.createElement("canvas");
        const context = canvas.getContext("2d");

        if (!context) {
          throw new PdfReadError("Could not prepare the PDF page for OCR.");
        }

        canvas.width = viewport.width;
        canvas.height = viewport.height;

        await page.render({
          canvas,
          canvasContext: context,
          viewport,
        }).promise;

        const result = await ocrWorker.recognize(canvas);
        ocrPages.push(result.data.text);

        canvas.width = 0;
        canvas.height = 0;
      }

      const ocrText = ocrPages
        .join("\n")
        .replace(/[ \t]+/g, " ")
        .replace(/\n{3,}/g, "\n\n")
        .trim();

      if (ocrText.length < 50) {
        throw new PdfReadError(
          "We couldn't recognize enough text in this PDF. Please upload a clearer file.",
        );
      }

      return ocrText;
    } finally {
      await ocrWorker.terminate();
    }
  } finally {
    await doc.cleanup();
  }
}
