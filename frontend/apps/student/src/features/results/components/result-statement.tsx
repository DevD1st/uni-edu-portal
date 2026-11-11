import { Surface } from "@uemp/ui";
import { AcademicMetrics } from "../../portal/components/academic-metrics";
import { PrintViewLink } from "../../portal/components/print-view-link";
import { StudentRecordDetails } from "../../portal/components/student-record-details";
import type { ResultStatement as Statement } from "../contracts";
import { gradeAverage } from "../grade-average";
import { PublishedGrades } from "./published-grades";

export function ResultStatement({ statement }: { statement: Statement }) {
  return (
    <Surface className="u-stack">
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
      <PrintViewLink
        href={"/results/" + statement.semesterId + "/print"}
        label="Print result statement"
      />
    </Surface>
  );
}
