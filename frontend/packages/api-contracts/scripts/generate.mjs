import { readFile, writeFile } from "node:fs/promises";
import openapiTS, { astToString } from "openapi-typescript";

const operations = {
  "/v1/auth/sign-in": ["post"],
  "/v1/auth/refresh": ["post"],
  "/v1/auth/sign-out": ["post"],
  "/v1/users/me": ["get"],
  "/v1/admin/admins/me/authorization": ["get"],
  "/v1/academic-references": ["get"],
  "/v1/lecturer/offerings": ["get"],
  "/v1/admin/results": ["get"],
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

// Keep this package focused on the routes the foundation actually uses.
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
