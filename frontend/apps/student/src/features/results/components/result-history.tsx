import { Surface } from "@uemp/ui";
import { AcademicMetrics } from "../../portal/components/academic-metrics";
import { AcademicTermList } from "../../portal/components/academic-term-list";
import type { ResultHistory as History } from "../contracts";
import { gradeAverage } from "../grade-average";

export function ResultHistory({ history }: { history: History }) {
  return (
    <>
      <Surface aria-label="Cumulative GPA">
        <AcademicMetrics
          label="Academic average"
          items={[{ label: "Cumulative GPA", value: gradeAverage(history.cgpa) }]}
        />
      </Surface>
      <AcademicTermList
        title="Result statements"
        emptyTitle="No semester results yet"
        emptyDetail="Your statements appear here after you register for courses."
        records={history.terms.map((term) => ({
          href: "/results/" + term.semesterId,
          label: term.semesterName + " · " + term.academicSession,
          detail:
            term.approvedUnits + " approved units · GPA " + gradeAverage(term.gpa),
        }))}
      />
    </>
  );
}
