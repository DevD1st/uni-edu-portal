import { DataTable, ResourceState } from "@uemp/ui";
import type { Dto } from "@uemp/api-contracts/response";
import { markText } from "./result-status";

export function studentLabel(record: {
  firstName: string | null;
  lastName: string | null;
  matricNumber: string | null;
}) {
  return (
    [record.firstName, record.lastName].filter(Boolean).join(" ") ||
    record.matricNumber ||
    "Student record"
  );
}

export function ResultMarks({ marks }: { marks: Dto<"ResultMarkResponseDto">[] }) {
  if (!marks.length)
    return <ResourceState state="empty" title="No marks on this page" />;
  return (
    <DataTable
      caption="Roster marks"
      columns={[
        { label: "Student" },
        { label: "Matriculation number" },
        { label: "CA", numeric: true },
        { label: "Exam", numeric: true },
        { label: "Total", numeric: true },
        { label: "Grade" },
      ]}
    >
      {marks.map((mark) => (
        <tr key={mark.id}>
          <th scope="row">{studentLabel(mark)}</th>
          <td>{mark.matricNumber ?? "—"}</td>
          <td data-numeric>{markText(mark.caScore)}</td>
          <td data-numeric>{markText(mark.examScore)}</td>
          <td data-numeric>{markText(mark.totalScore)}</td>
          <td>{mark.grade ?? "—"}</td>
        </tr>
      ))}
    </DataTable>
  );
}
