import { redirect } from "next/navigation";
import type { ReactNode } from "react";
import { studentAccount } from "../../features/auth/server/session";
import { accountName } from "../../features/portal/server/student-profile";
import { StudentShell } from "../../features/portal/student-shell";

export const dynamic = "force-dynamic";

export default async function ProtectedLayout({ children }: { children: ReactNode }) {
  const account = await studentAccount();
  if (!account) redirect("/sign-in");
  return <StudentShell name={accountName(account)}>{children}</StudentShell>;
}
