/**
 * Neon's HTTP driver returns `{ rows }` from `db.execute`. This helper keeps
 * the raw SQL call sites readable and typed.
 */
export function firstRow<T extends Record<string, unknown>>(
  result: unknown,
): T | undefined {
  const rows = (result as { rows?: T[] })?.rows;
  return rows?.[0];
}
