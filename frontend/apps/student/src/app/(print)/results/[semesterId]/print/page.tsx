import { ResultPrintView } from "../../../../../features/results/components/result-print-view";
import { resultStatement } from "../../../../../features/results/server/results";

export const metadata = { title: "Print result statement" };

export default async function PrintResultPage({
  params,
}: PageProps<"/results/[semesterId]/print">) {
  const { semesterId } = await params;
  return <ResultPrintView statement={await resultStatement(semesterId)} />;
}
