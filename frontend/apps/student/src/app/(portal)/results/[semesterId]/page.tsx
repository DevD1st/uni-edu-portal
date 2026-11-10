import Link from "next/link";
import { PageHeader } from "@uemp/ui";
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
      <Link href="/results" className="u-text-link" prefetch={false}>
        Back to results
      </Link>
      <PageHeader
        title="Result statement"
        description={statement.semesterName + " · " + statement.academicSession}
      />
      <ResultStatement statement={statement} />
    </>
  );
}
