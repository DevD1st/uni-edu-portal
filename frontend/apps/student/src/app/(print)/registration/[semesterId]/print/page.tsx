import { RegistrationPrintView } from "../../../../../features/registration/components/registration-print-view";
import { registrationSummary } from "../../../../../features/registration/server/registration";

export const metadata = { title: "Print registration summary" };

export default async function PrintRegistrationPage({
  params,
}: PageProps<"/registration/[semesterId]/print">) {
  const { semesterId } = await params;
  return <RegistrationPrintView summary={await registrationSummary(semesterId)} />;
}
