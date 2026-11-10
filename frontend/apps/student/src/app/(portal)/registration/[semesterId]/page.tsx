import Link from "next/link";
import { Banner, PageHeader } from "@uemp/ui";
import { RegistrationSummary } from "../../../../features/registration/components/registration-summary";
import { registrationSummary } from "../../../../features/registration/server/registration";

export const metadata = { title: "Registration summary" };

export default async function RegistrationSummaryPage({
  params,
  searchParams,
}: PageProps<"/registration/[semesterId]">) {
  const [{ semesterId }, { registered }] = await Promise.all([params, searchParams]);
  const summary = await registrationSummary(semesterId);
  return (
    <>
      <Link href="/registration" className="u-text-link" prefetch={false}>
        Back to course registration
      </Link>
      <PageHeader
        title="Registration summary"
        description={summary.semesterName + " · " + summary.academicSession}
      />
      {registered === "1" && (
        <Banner tone="success">Your courses were registered.</Banner>
      )}
      <RegistrationSummary summary={summary} />
    </>
  );
}
