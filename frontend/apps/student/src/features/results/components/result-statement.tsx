import { GraduationCap } from "lucide-react";
import { Badge, Surface } from "@uemp/ui";
import { AcademicMetrics } from "../../portal/components/academic-metrics";
import { RecordPrintAction } from "../../portal/components/record-print-action";
import { StudentSectionHeading } from "../../portal/components/student-section-heading";
import { StudentRecordDetails } from "../../portal/components/student-record-details";
import type { ResultStatement as Statement } from "../contracts";
import { gradeAverage } from "../grade-average";
import { PublishedGrades } from "./published-grades";

export function ResultStatement({ statement }: { statement: Statement }) {
  return (
    <Surface className="u-stack">
      <StudentSectionHeading
        title="Semester performance"
        icon={GraduationCap}
        description="Grades and averages from currently approved results."
        meta={
          statement.courses.length > 0 ? (
            <Badge tone="success">Published results</Badge>
          ) : (
            <Badge>Awaiting publication</Badge>
          )
        }
      />
      <AcademicMetrics
        label="Academic averages"
        items={[
          { label: "Semester GPA", value: gradeAverage(statement.gpa) },
          { label: "Cumulative GPA", value: gradeAverage(statement.cgpa) },
          { label: "Approved units", value: statement.approvedUnits },
        ]}
      />
      <StudentRecordDetails record={statement} />
      <PublishedGrades courses={statement.courses} />
      <RecordPrintAction
        href={"/results/" + statement.semesterId + "/print"}
        label="Print result statement"
      />
    </Surface>
  );
}
