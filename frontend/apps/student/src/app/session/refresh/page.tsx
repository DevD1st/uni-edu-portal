import { AuthLayout } from "@uemp/ui";
import { SessionRefresh } from "../../../features/auth/components/session-refresh";
import { studentReturnTo } from "../../../features/auth/session-policy";

export const metadata = { title: "Renewing your session" };

export default async function RefreshPage({
  searchParams,
}: PageProps<"/session/refresh">) {
  const { returnTo } = await searchParams;
  return (
    <AuthLayout
      portal="Student portal"
      title="Returning to your workspace"
      description="Your session is being renewed securely."
      asideTitle="Your studies, in one place."
      asideDescription="Keep your academic profile and university information close at hand."
    >
      <SessionRefresh returnTo={studentReturnTo(returnTo)} />
    </AuthLayout>
  );
}
