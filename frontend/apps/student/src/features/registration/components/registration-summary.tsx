import { DataTable, Surface } from "@uemp/ui";
import { AcademicMetrics } from "../../portal/components/academic-metrics";
import { DownloadButton } from "../../portal/components/download-button";
import { StudentRecordDetails } from "../../portal/components/student-record-details";
import type { RegistrationSummary as Summary } from "../contracts";

export function RegistrationSummary({ summary }: { summary: Summary }) {
  return (
    <Surface className="u-stack">
      <AcademicMetrics
        label="Registration totals"
        items={[{ label: "Total credit units", value: summary.totalUnits }]}
      />
      <StudentRecordDetails record={summary} />
      <DataTable
        caption="Registered courses"
        columns={[
          { label: "Code" },
          { label: "Course" },
          { label: "Units", numeric: true },
        ]}
      >
        {summary.courses.map(({ id, code, name, units }) => (
          <tr key={id}>
            <th scope="row">{code}</th>
            <td>{name}</td>
            <td data-numeric>{units}</td>
          </tr>
        ))}
      </DataTable>
      <DownloadButton
        path={"/api/student/registrations/" + summary.semesterId + "/download"}
        filename="course-registration.txt"
        label="Download registration summary"
      />
    </Surface>
  );
}
