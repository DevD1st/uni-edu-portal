import { Surface } from "@uemp/ui";
import { AcademicMetrics } from "../../portal/components/academic-metrics";
import { PrintViewLink } from "../../portal/components/print-view-link";
import { StudentRecordDetails } from "../../portal/components/student-record-details";
import type { RegistrationSummary as Summary } from "../contracts";
import { RegisteredCourses } from "./registered-courses";

export function RegistrationSummary({ summary }: { summary: Summary }) {
  return (
    <Surface className="u-stack">
      <AcademicMetrics
        label="Registration totals"
        items={[{ label: "Total credit units", value: summary.totalUnits }]}
      />
      <StudentRecordDetails record={summary} />
      <RegisteredCourses courses={summary.courses} />
      <PrintViewLink
        href={"/registration/" + summary.semesterId + "/print"}
        label="Print registration summary"
      />
    </Surface>
  );
}
