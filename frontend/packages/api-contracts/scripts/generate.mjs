import { readFile, writeFile } from "node:fs/promises";
import openapiTS, { astToString } from "openapi-typescript";

const operations = {
  "/v1/auth/signup/student": ["post"],
  "/v1/auth/sign-in": ["post"],
  "/v1/auth/refresh": ["post"],
  "/v1/auth/sign-out": ["post"],
  "/v1/users/me": ["get", "patch"],
  "/v1/admin/admins/me/authorization": ["get"],
  "/v1/academic-references": ["get"],
  "/v1/lecturer/offerings": ["get"],
  "/v1/lecturer/offerings/{id}/roster": ["get"],
  "/v1/lecturer/offerings/{id}/close-registration": ["post"],
  "/v1/lecturer/results/{id}": ["get"],
  "/v1/lecturer/results/{id}/marks": ["patch"],
  "/v1/lecturer/results/{id}/submit": ["post"],
  "/v1/admin/results": ["get"],
  "/v1/admin/results/options": ["get"],
  "/v1/admin/results/{id}": ["get"],
  "/v1/admin/results/{id}/approve": ["post"],
  "/v1/admin/results/{id}/request-corrections": ["post"],
  "/v1/admin/results/{id}/reopen": ["post"],
  "/v1/admin/registrations": ["get"],
  "/v1/admin/registrations/students/{userId}": ["post"],
  "/v1/admin/registrations/students/{userId}/available": ["get"],
  "/v1/admin/academic": ["get"],
  "/v1/admin/academic/faculties": ["post"],
  "/v1/admin/academic/faculties/{id}": ["put"],
  "/v1/admin/academic/faculties/{id}/current-semester": ["put"],
  "/v1/admin/academic/departments": ["post"],
  "/v1/admin/academic/departments/{id}": ["put"],
  "/v1/admin/academic/programmes": ["post"],
  "/v1/admin/academic/programmes/{id}": ["put"],
  "/v1/admin/academic/sessions": ["post"],
  "/v1/admin/academic/sessions/{id}": ["put"],
  "/v1/admin/academic/semesters": ["post"],
  "/v1/admin/academic/semesters/{id}": ["put"],
  "/v1/admin/academic/levels/{id}/status": ["put"],
  "/v1/admin/courses": ["get", "post"],
  "/v1/admin/courses/{id}": ["put"],
  "/v1/admin/courses/lecturers": ["get"],
  "/v1/admin/courses/curriculum": ["post"],
  "/v1/admin/courses/curriculum/{id}": ["delete"],
  "/v1/admin/courses/offerings": ["post"],
  "/v1/admin/courses/offerings/{id}": ["patch"],
  "/v1/admin/users": ["get"],
  "/v1/admin/users/students": ["post"],
  "/v1/admin/users/{userId}": ["get", "patch", "delete"],
  "/v1/admin/users/{userId}/student-placement": ["put"],
  "/v1/admin/users/{userId}/status": ["patch"],
  "/v1/admin/users/{userId}/revoke-sessions": ["post"],
  "/v1/admin/admins": ["get", "post"],
  "/v1/admin/admins/{adminId}": ["get"],
  "/v1/admin/admins/{adminId}/roles": ["post"],
  "/v1/admin/admins/{adminId}/roles/{grantId}": ["delete"],
  "/v1/admin/roles": ["get", "post"],
  "/v1/admin/roles/{roleId}": ["put", "delete"],
  "/v1/admin/reports/options": ["get"],
  "/v1/admin/reports/overview": ["get"],
  "/v1/admin/reports/courses": ["get"],
  "/v1/admin/audit-events": ["get"],
  "/v1/admin/audit-events/{eventId}": ["get"],
  "/v1/student/registrations": ["get", "post"],
  "/v1/student/registrations/available": ["get"],
  "/v1/student/registrations/{id}": ["get"],
  "/v1/student/registrations/{id}/summary/download": ["get"],
  "/v1/student/results": ["get"],
  "/v1/student/results/{id}": ["get"],
  "/v1/student/results/{id}/statement/download": ["get"],
};

async function loadContract() {
  if (process.env.UEMP_OPENAPI_FILE)
    return JSON.parse(await readFile(process.env.UEMP_OPENAPI_FILE, "utf8"));

  const origin = new URL(process.env.UEMP_API_ORIGIN ?? "http://localhost:3000");
  if (
    !["http:", "https:"].includes(origin.protocol) ||
    origin.username ||
    origin.password
  )
    throw new Error("UEMP_API_ORIGIN must be an HTTP origin without credentials.");

  const headers = new Headers({ accept: "application/json" });
  const { UEMP_SWAGGER_USER, UEMP_SWAGGER_PASSWORD } = process.env;
  if (UEMP_SWAGGER_USER && UEMP_SWAGGER_PASSWORD) {
    const encoded = Buffer.from(
      UEMP_SWAGGER_USER + ":" + UEMP_SWAGGER_PASSWORD,
    ).toString("base64");
    headers.set("authorization", "Basic " + encoded);
  }

  const response = await fetch(new URL("/docs-json", origin), {
    headers,
    redirect: "error",
    signal: AbortSignal.timeout(15_000),
  });
  if (!response.ok)
    throw new Error("OpenAPI request failed with HTTP " + response.status + ".");
  return response.json();
}

const source = await loadContract();
const paths = {};
const schemas = {};
for (const [path, methods] of Object.entries(operations)) {
  const entry = source.paths?.[path];
  if (!entry) throw new Error("The backend contract is missing " + path);
  paths[path] = Object.fromEntries(
    methods.map((method) => {
      if (!entry[method])
        throw new Error("The backend contract is missing " + method + " " + path);
      return [method, entry[method]];
    }),
  );
}

// Include the schemas referenced by the routes used in the portals.
function includeSchema(name) {
  if (Object.hasOwn(schemas, name)) return;
  const schema = source.components?.schemas?.[name];
  if (!schema) throw new Error("The backend contract is missing schema " + name);
  schemas[name] = schema;
  collectRefs(schema);
}

function collectRefs(value) {
  if (!value || typeof value !== "object") return;
  if (
    typeof value.$ref === "string" &&
    value.$ref.startsWith("#/components/schemas/")
  ) {
    includeSchema(value.$ref.slice("#/components/schemas/".length));
  }
  for (const child of Object.values(value)) collectRefs(child);
}

collectRefs(paths);
includeSchema("ErrorResponseDto");
const document = {
  openapi: source.openapi,
  info: source.info,
  paths,
  components: { schemas, securitySchemes: source.components?.securitySchemes ?? {} },
};
const types = astToString(await openapiTS(document, { alphabetize: true }));
await writeFile(new URL("../src/generated.ts", import.meta.url), types, "utf8");

// Keep structural validation rules alongside the generated types without bundling documentation examples.
function structuralSchema(schema) {
  const fields = ["$ref", "type", "format", "nullable", "enum", "required"];
  const result = Object.fromEntries(
    fields.filter((key) => key in schema).map((key) => [key, schema[key]]),
  );
  if (schema.items) result.items = structuralSchema(schema.items);
  if (schema.properties)
    result.properties = Object.fromEntries(
      Object.entries(schema.properties).map(([key, child]) => [
        key,
        structuralSchema(child),
      ]),
    );
  if (schema.allOf) result.allOf = schema.allOf.map(structuralSchema);
  return result;
}
const responseRules = Object.fromEntries(
  Object.entries(schemas).map(([name, schema]) => [name, structuralSchema(schema)]),
);
await writeFile(
  new URL("../src/generated-response-schemas.json", import.meta.url),
  JSON.stringify(responseRules, null, 2) + "\n",
  "utf8",
);
