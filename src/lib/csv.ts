type Cell = string | number | boolean | null | undefined;

function sanitize(value: Cell) {
  if (value === null || value === undefined) return "";

  let text = String(value);

  // Prevent spreadsheet formula injection in exported files.
  if (/^[=+\-@\t\r]/.test(text)) {
    text = `'${text}`;
  }

  return text;
}

function escapeCell(value: Cell) {
  const text = sanitize(value);

  if (/[",\r\n]/.test(text)) {
    return `"${text.replaceAll('"', '""')}"`;
  }

  return text;
}

export function buildCsv(rows: Cell[][]) {
  // BOM keeps Thai text readable when the file is opened in Excel.
  return `\uFEFF${rows
    .map((row) => row.map(escapeCell).join(","))
    .join("\r\n")}`;
}

export function csvResponse(filename: string, rows: Cell[][]) {
  return new Response(buildCsv(rows), {
    headers: {
      "content-type": "text/csv; charset=utf-8",
      "content-disposition": `attachment; filename="${filename}"`,
      "cache-control": "no-store",
    },
  });
}
