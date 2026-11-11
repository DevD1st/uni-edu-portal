import { Banner, PageHeader } from "@uemp/ui";
import { StudentBackLink } from "../../../../features/portal/components/student-back-link";
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
      <StudentBackLink href="/registration">
        Back to course registration
      </StudentBackLink>
      <PageHeader
        title="Registration summary"
        eyebrow="Saved semester record"
        description={summary.semesterName + " · " + summary.academicSession}
      />
      {registered === "1" && (
        <Banner tone="success">Your courses were registered.</Banner>
      )}
      <RegistrationSummary summary={summary} />
    </>
  );
}
