export type ChartDatum = {
  id: string;
  label: string;
  value: number | null;
  shortLabel?: string;
  detail?: string;
  href?: string;
  hrefLabel?: string;
};

export type ChartValueFormat = "count" | "grade";

export function validChartValue(value: number | null, format: ChartValueFormat) {
  if (value === null || !Number.isFinite(value) || value < 0) return null;
  if (format === "grade") return value <= 5 ? value : null;
  return Number.isSafeInteger(value) ? value : null;
}

export function formatChartValue(value: number | null, format: ChartValueFormat) {
  const available = validChartValue(value, format);
  if (available === null) return "Unavailable";
  return format === "grade"
    ? available.toFixed(2) + " / 5.00"
    : new Intl.NumberFormat("en", { maximumFractionDigits: 0 }).format(available);
}

export function chartMaximum(
  data: readonly ChartDatum[],
  format: ChartValueFormat,
  maximum?: number,
) {
  if (format === "grade") return 5;
  const highest = Math.max(
    0,
    ...data.map((point) => validChartValue(point.value, format) ?? 0),
  );
  const requested =
    maximum !== undefined && Number.isSafeInteger(maximum) && maximum > 0 ? maximum : 0;
  // A zero-only count series still needs a usable axis. Its bars remain exactly zero.
  return Math.max(1, highest, requested);
}

export function chartTicks(maximum: number, format: ChartValueFormat) {
  return format === "grade"
    ? [0, 2.5, 5]
    : [...new Set([0, Math.floor(maximum / 2), maximum])];
}

export function trendSegments(data: readonly ChartDatum[], format: ChartValueFormat) {
  const segments: { index: number; value: number }[][] = [];
  let segment: { index: number; value: number }[] = [];
  for (const [index, point] of data.entries()) {
    const value = validChartValue(point.value, format);
    if (value === null) {
      if (segment.length) segments.push(segment);
      segment = [];
    } else segment.push({ index, value });
  }
  if (segment.length) segments.push(segment);
  return segments;
}

export function chartKeyTarget(key: string, index: number, length: number) {
  if (!length) return null;
  if (key === "Home") return 0;
  if (key === "End") return length - 1;
  if (key === "ArrowLeft" || key === "ArrowUp") return Math.max(0, index - 1);
  if (key === "ArrowRight" || key === "ArrowDown")
    return Math.min(length - 1, index + 1);
  return null;
}
