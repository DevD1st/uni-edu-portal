import type { components } from "./generated";
import generatedSchemas from "./generated-response-schemas.json";

type Schema = {
  $ref?: string;
  type?: string;
  format?: string;
  nullable?: boolean;
  enum?: unknown[];
  required?: string[];
  items?: Schema;
  properties?: Record<string, Schema>;
  allOf?: Schema[];
};

const schemas: Record<string, Schema> = generatedSchemas;
export type DtoName = keyof components["schemas"];
export type Dto<Name extends DtoName> = components["schemas"][Name];

export function isUuid(value: unknown): value is string {
  return (
    typeof value === "string" &&
    /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(value)
  );
}

// The generated rules describe the structural OpenAPI 3.0 schemas used by the Nest DTOs.
function matches(schema: Schema, value: unknown): boolean {
  if (value === null && schema.nullable) return true;
  if (schema.$ref) {
    const target = schemas[schema.$ref.slice("#/components/schemas/".length)];
    return Boolean(target && matches(target, value));
  }
  if (schema.allOf && !schema.allOf.every((part) => matches(part, value))) return false;
  if (schema.enum && !schema.enum.includes(value)) return false;
  if (schema.type === "array") {
    const items = schema.items;
    return (
      Array.isArray(value) &&
      (!items || value.every((item: unknown) => matches(items, item)))
    );
  }
  if (schema.type === "object" || schema.properties) {
    if (!value || typeof value !== "object" || Array.isArray(value)) return false;
    const record = value as Record<string, unknown>;
    if (schema.required?.some((name) => !Object.hasOwn(record, name))) return false;
    return Object.entries(schema.properties ?? {}).every(
      ([key, property]) =>
        !Object.hasOwn(record, key) || matches(property, record[key]),
    );
  }
  if (schema.type === "integer")
    return typeof value === "number" && Number.isSafeInteger(value);
  if (schema.type === "number")
    return typeof value === "number" && Number.isFinite(value);
  if (schema.format === "uuid") return isUuid(value);
  return !schema.type || typeof value === schema.type;
}

export function dto<Name extends DtoName>(name: Name) {
  return (value: unknown): Dto<Name> => {
    const schema = schemas[name];
    if (!schema || !matches(schema, value))
      throw new Error("Invalid " + name + " response");
    return value as Dto<Name>;
  };
}
