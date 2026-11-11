import { AcademicMetrics } from "../../portal/components/academic-metrics";
import { AcademicPrintView } from "../../portal/components/academic-print-view";
import { StudentRecordDetails } from "../../portal/components/student-record-details";
import type { RegistrationSummary } from "../contracts";
import { RegisteredCourses } from "./registered-courses";

export function RegistrationPrintView({ summary }: { summary: RegistrationSummary }) {
  return (
    <AcademicPrintView
      title="Registration summary"
      semesterName={summary.semesterName}
      academicSession={summary.academicSession}
      backHref={"/registration/" + summary.semesterId}
    >
      <StudentRecordDetails record={summary} />
      <RegisteredCourses courses={summary.courses} />
      <AcademicMetrics
        label="Registration totals"
        items={[
          { label: "Registered courses", value: summary.courses.length },
          { label: "Total credit units", value: summary.totalUnits },
        ]}
      />
    </AcademicPrintView>
  );
}
