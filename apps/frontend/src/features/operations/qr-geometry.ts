export function qrGeometry(matrix: unknown): { size: number; modules: { x: number; y: number }[] } | null {
  if (!Array.isArray(matrix) || matrix.length < 21 || matrix.length > 177 || (matrix.length - 21) % 4 !== 0) return null;
  if (!matrix.every((row) => Array.isArray(row) && row.length === matrix.length && row.every((cell) => typeof cell === "boolean"))) return null;
  const modules = matrix.flatMap((row: boolean[], y: number) => row.flatMap((filled, x) => filled ? [{ x: x + 4, y: y + 4 }] : []));
  return { size: matrix.length + 8, modules };
}
