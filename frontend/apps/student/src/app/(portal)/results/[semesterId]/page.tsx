import { PageHeader } from "@uemp/ui";
import { StudentBackLink } from "../../../../features/portal/components/student-back-link";
import { ResultStatement } from "../../../../features/results/components/result-statement";
import { resultStatement } from "../../../../features/results/server/results";

export const metadata = { title: "Result statement" };

export default async function ResultStatementPage({
  params,
}: PageProps<"/results/[semesterId]">) {
  const { semesterId } = await params;
  const statement = await resultStatement(semesterId);
  return (
    <>
      <StudentBackLink href="/results">Back to results</StudentBackLink>
      <PageHeader
        title="Result statement"
        eyebrow="Published academic record"
        description={statement.semesterName + " · " + statement.academicSession}
      />
      <ResultStatement statement={statement} />
    </>
  );
}
