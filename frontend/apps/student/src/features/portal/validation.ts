export function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

export function isUuid(value: unknown): value is string {
  return (
    typeof value === "string" &&
    /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(value)
  );
}

export const isText = (value: unknown): value is string => typeof value === "string";
export const isNumber = (value: unknown): value is number =>
  typeof value === "number" && Number.isFinite(value);
export const isUnits = (value: unknown): value is number =>
  isNumber(value) && Number.isSafeInteger(value) && value >= 0;

export function isArrayOf(value: unknown, valid: (item: unknown) => boolean) {
  return Array.isArray(value) && value.every(valid);
}
