import type { NextConfig } from "next";

const config: NextConfig = {
  poweredByHeader: false,
  transpilePackages: ["@uemp/ui", "@uemp/api-contracts", "@uemp/web-client"],
};

export default config;
