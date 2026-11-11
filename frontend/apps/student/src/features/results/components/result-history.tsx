import { Surface } from "@uemp/ui";
import { GraduationCap } from "lucide-react";
import { AcademicMetrics } from "../../portal/components/academic-metrics";
import { AcademicTermList } from "../../portal/components/academic-term-list";
import { StudentSectionHeading } from "../../portal/components/student-section-heading";
import type { ResultHistory as History } from "../contracts";
import { gradeAverage } from "../grade-average";

export function ResultHistory({ history }: { history: History }) {
  return (
    <>
      <Surface className="u-stack" aria-label="Cumulative GPA">
        <StudentSectionHeading
          title="Academic progress"
          icon={GraduationCap}
          description="Your cumulative average uses approved results across all semesters."
        />
        <AcademicMetrics
          label="Academic average"
          items={[
            { label: "Cumulative GPA", value: gradeAverage(history.cgpa) },
            {
              label: "Published semesters",
              value: history.terms.filter(({ approvedUnits }) => approvedUnits > 0)
                .length,
            },
          ]}
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
