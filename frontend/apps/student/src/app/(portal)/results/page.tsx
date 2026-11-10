import { PageHeader } from "@uemp/ui";
import { ResultHistory } from "../../../features/results/components/result-history";
import { resultHistory } from "../../../features/results/server/results";

export const metadata = { title: "Results" };

export default async function ResultsPage() {
  const history = await resultHistory();
  return (
    <>
      <PageHeader title="Results" />
      <ResultHistory history={history} />
    </>
  );
}
