import type { NextConfig } from "next";
import { fileURLToPath } from "node:url";

const config: NextConfig = {
  poweredByHeader: false,
  // Docker creates a portable Linux server; host builds avoid Windows junction artifacts.
  ...(process.env["UEMP_STANDALONE"] === "1" ? { output: "standalone" as const } : {}),
  outputFileTracingRoot: fileURLToPath(new URL("../../", import.meta.url)),
  transpilePackages: ["@uemp/ui", "@uemp/api-contracts", "@uemp/web-client"],
};

export default config;
