import * as z from "zod";

export const reportQuerySchema = z.object({
  from: z.string().trim().optional(),
  to: z.string().trim().optional(),
});

export type ReportQuery = z.infer<typeof reportQuerySchema>;

/**
 * Defaults to the current calendar month so the report page always renders
 * something useful without query parameters.
 */
export function resolveReportRange(from?: string, to?: string) {
  const now = new Date();

  const parsedTo = to ? new Date(to) : now;
  const end = Number.isNaN(parsedTo.getTime()) ? now : parsedTo;
  end.setHours(23, 59, 59, 999);

  const fallbackFrom = new Date(end);
  fallbackFrom.setDate(1);
  fallbackFrom.setHours(0, 0, 0, 0);

  const parsedFrom = from ? new Date(from) : fallbackFrom;
  const start = Number.isNaN(parsedFrom.getTime())
    ? fallbackFrom
    : parsedFrom;
  start.setHours(0, 0, 0, 0);

  return {
    from: start,
    to: end,
    fromValue: toDateInput(start),
    toValue: toDateInput(end),
  };
}

export function toDateInput(value: Date | null | undefined) {
  if (!value) return "";

  const year = value.getFullYear();
  const month = String(value.getMonth() + 1).padStart(2, "0");
  const day = String(value.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}
