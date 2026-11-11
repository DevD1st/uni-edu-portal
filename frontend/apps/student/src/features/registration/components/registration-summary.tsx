import { ClipboardCheck } from "lucide-react";
import { Badge, Surface } from "@uemp/ui";
import { AcademicMetrics } from "../../portal/components/academic-metrics";
import { RecordPrintAction } from "../../portal/components/record-print-action";
import { StudentSectionHeading } from "../../portal/components/student-section-heading";
import { StudentRecordDetails } from "../../portal/components/student-record-details";
import type { RegistrationSummary as Summary } from "../contracts";
import { RegisteredCourses } from "./registered-courses";

export function RegistrationSummary({ summary }: { summary: Summary }) {
  return (
    <Surface className="u-stack">
      <StudentSectionHeading
        title="Registered semester"
        icon={ClipboardCheck}
        meta={<Badge tone="success">Saved registration</Badge>}
      />
      <AcademicMetrics
        label="Registration totals"
        items={[{ label: "Total credit units", value: summary.totalUnits }]}
      />
      <StudentRecordDetails record={summary} />
      <RegisteredCourses courses={summary.courses} />
      <RecordPrintAction
        href={"/registration/" + summary.semesterId + "/print"}
        label="Print registration summary"
      />
    </Surface>
  );
}
