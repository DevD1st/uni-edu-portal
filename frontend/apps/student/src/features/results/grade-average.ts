// Screen and print views use the same institution-wide five-point scale.
const gradePointScale = 5;

export function gradeAverage(value: number | null) {
  return value === null
    ? "Unavailable"
    : `${value.toFixed(2)} / ${gradePointScale.toFixed(2)}`;
}
