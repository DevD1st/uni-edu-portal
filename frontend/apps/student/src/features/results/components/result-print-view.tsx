import { AcademicMetrics } from "../../portal/components/academic-metrics";
import { AcademicPrintView } from "../../portal/components/academic-print-view";
import { StudentRecordDetails } from "../../portal/components/student-record-details";
import type { ResultStatement } from "../contracts";
import { gradeAverage } from "../grade-average";
import { PublishedGradesTable } from "./published-grades-table";

export function ResultPrintView({ statement }: { statement: ResultStatement }) {
  return (
    <AcademicPrintView
      title="Result statement"
      semesterName={statement.semesterName}
      academicSession={statement.academicSession}
      backHref={"/results/" + statement.semesterId}
    >
      <StudentRecordDetails record={statement} />
      {statement.courses.length > 0 ? (
        <div className="student-print-results">
          <PublishedGradesTable courses={statement.courses} includeGradePoints />
        </div>
      ) : (
        <p>No grades have been published for this semester.</p>
      )}
      <AcademicMetrics
        label="Academic averages"
        items={[
          { label: "Approved units", value: statement.approvedUnits },
          { label: "Semester GPA", value: gradeAverage(statement.gpa) },
          { label: "Cumulative GPA", value: gradeAverage(statement.cgpa) },
        ]}
      />
      <p>
        Only currently approved results are included in this statement and its averages.
      </p>
    </AcademicPrintView>
  );
}
