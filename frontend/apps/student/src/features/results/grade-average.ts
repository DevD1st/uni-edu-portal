export function gradeAverage(value: number | null) {
  return value === null ? "Unavailable" : value.toFixed(2);
}
