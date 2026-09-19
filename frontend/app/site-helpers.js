// Shared helper — same behavior as original dashboard.
// Anything that should be an array, made safe.
export function toArray(v) {
  if (Array.isArray(v)) return v;
  if (v == null || v === '') return [];
  return [v];
}
