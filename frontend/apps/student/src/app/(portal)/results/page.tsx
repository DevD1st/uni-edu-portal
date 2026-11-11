import { PageHeader } from "@uemp/ui";
import { ResultHistory } from "../../../features/results/components/result-history";
import { resultHistory } from "../../../features/results/server/results";

export const metadata = { title: "Results" };

export default async function ResultsPage() {
  const history = await resultHistory();
  return (
    <>
      <PageHeader
        eyebrow="My studies"
        title="Results"
        description="View your published grades, semester averages, and cumulative academic progress."
      />
      <ResultHistory history={history} />
    </>
  );
}
