import "server-only";

/**
 * CSV export helpers — Phase 10.
 * Excel/PDF advanced reporting is prepared via exporters that accept the same row maps.
 */

export function escapeCsvCell(value: unknown): string {
  if (value == null) return "";
  const raw =
    value instanceof Date
      ? value.toISOString()
      : typeof value === "object"
        ? JSON.stringify(value)
        : String(value);
  if (/[",\n\r]/.test(raw)) {
    return `"${raw.replaceAll('"', '""')}"`;
  }
  return raw;
}

export function rowsToCsv(
  headers: string[],
  rows: Record<string, unknown>[],
): string {
  const lines = [
    headers.map(escapeCsvCell).join(","),
    ...rows.map((row) =>
      headers.map((h) => escapeCsvCell(row[h])).join(","),
    ),
  ];
  return `\uFEFF${lines.join("\n")}`;
}

export function csvResponse(
  filename: string,
  headers: string[],
  rows: Record<string, unknown>[],
): Response {
  const body = rowsToCsv(headers, rows);
  return new Response(body, {
    status: 200,
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="${filename}"`,
      "Cache-Control": "no-store",
    },
  });
}

/** Future Excel adapter hook — same rows, different serializer. */
export interface TableExporter {
  export(
    headers: string[],
    rows: Record<string, unknown>[],
  ): Promise<Buffer | string>;
}

export const CsvExporter: TableExporter = {
  async export(headers, rows) {
    return rowsToCsv(headers, rows);
  },
};
