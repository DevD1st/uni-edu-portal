import type { ReactNode } from "react";
import { studentAccount } from "../../features/auth/server/session";
import "./print.css";

export const dynamic = "force-dynamic";

export default async function PrintLayout({ children }: { children: ReactNode }) {
  // Print pages have the same session checks, without the portal's navigation shell.
  await studentAccount();
  return children;
}
