import "server-only";

import { PDFDocument, StandardFonts, rgb } from "pdf-lib";

export type PdfDocumentKind =
  | "invoice"
  | "pickup-receipt"
  | "wallet-statement"
  | "listing-summary"
  | "environmental-report"
  | "profile-summary";

interface PdfSection {
  title: string;
  lines: string[];
}

/**
 * Helvetica (StandardFonts) only supports WinAnsi.
 * Strip / replace common Unicode so drawText does not throw.
 */
function toPdfSafeText(value: string): string {
  return value
    .replace(/₹/g, "Rs ")
    .replace(/×/g, "x")
    .replace(/[—–−]/g, "-")
    .replace(/[“”]/g, '"')
    .replace(/[‘’]/g, "'")
    .replace(/…/g, "...")
    .replace(/[^\x09\x0A\x0D\x20-\x7E]/g, "?");
}

/**
 * PDF generation for demo-ready documents (pdf-lib).
 * Excel export remains a future adapter on the CSV row maps.
 */
export async function buildSimplePdf(input: {
  title: string;
  subtitle?: string;
  sections: PdfSection[];
  footer?: string;
}): Promise<Uint8Array> {
  const doc = await PDFDocument.create();
  let page = doc.addPage([595.28, 841.89]); // A4
  const font = await doc.embedFont(StandardFonts.Helvetica);
  const bold = await doc.embedFont(StandardFonts.HelveticaBold);
  const { height } = page.getSize();
  let y = height - 48;

  const draw = (
    text: string,
    opts: {
      x: number;
      size: number;
      bold?: boolean;
      color?: ReturnType<typeof rgb>;
    },
  ) => {
    const safe = toPdfSafeText(text).slice(0, 110);
    if (!safe) return;
    page.drawText(safe, {
      x: opts.x,
      y,
      size: opts.size,
      font: opts.bold ? bold : font,
      color: opts.color ?? rgb(0.15, 0.15, 0.15),
    });
  };

  draw("NexPlast", {
    x: 48,
    size: 18,
    bold: true,
    color: rgb(0.02, 0.45, 0.32),
  });
  y -= 28;

  draw(input.title, { x: 48, size: 14, bold: true });
  y -= 18;
  if (input.subtitle) {
    draw(input.subtitle, {
      x: 48,
      size: 10,
      color: rgb(0.35, 0.35, 0.35),
    });
    y -= 20;
  }

  for (const section of input.sections) {
    if (y < 80) {
      page = doc.addPage([595.28, 841.89]);
      y = height - 48;
    }
    draw(section.title, { x: 48, size: 11, bold: true });
    y -= 16;
    for (const line of section.lines) {
      if (y < 64) {
        page = doc.addPage([595.28, 841.89]);
        y = height - 48;
      }
      draw(line, {
        x: 56,
        size: 10,
        color: rgb(0.15, 0.15, 0.15),
      });
      y -= 14;
    }
    y -= 10;
  }

  page.drawText(
    toPdfSafeText(
      input.footer ??
        `Generated ${new Date().toISOString()} - NexPlast circular economy platform`,
    ).slice(0, 110),
    {
      x: 48,
      y: 36,
      size: 8,
      font,
      color: rgb(0.45, 0.45, 0.45),
    },
  );

  return doc.save();
}

export function pdfResponse(filename: string, bytes: Uint8Array): Response {
  return new Response(Buffer.from(bytes), {
    status: 200,
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="${filename}"`,
      "Cache-Control": "no-store",
    },
  });
}

export const PdfService = {
  build: buildSimplePdf,
  response: pdfResponse,
};
