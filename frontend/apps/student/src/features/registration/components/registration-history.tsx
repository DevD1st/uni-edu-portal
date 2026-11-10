import { AcademicTermList } from "../../portal/components/academic-term-list";
import type { RegistrationHistory as History } from "../contracts";

export function RegistrationHistory({ history }: { history: History }) {
  return (
    <AcademicTermList
      title="Registration history"
      emptyTitle="You haven’t registered for any courses yet"
      records={history.terms.map((term) => ({
        href: "/registration/" + term.semesterId,
        label: term.semesterName + " · " + term.academicSession,
        detail: term.totalUnits + " credit units",
      }))}
    />
  );
}
