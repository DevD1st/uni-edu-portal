export function normalizeUuidInput({ value }: { value: unknown }): unknown {
  // PostgreSQL canonicalizes UUIDs. Do the same before JavaScript scope and uniqueness checks.
  if (Array.isArray(value))
    return value.map((id: unknown) =>
      typeof id === 'string' ? id.toLowerCase() : id,
    );
  return typeof value === 'string' ? value.toLowerCase() : value;
}
