import { DataTable } from "@uemp/ui";
import type { RegistrationSummary } from "../contracts";

export function RegisteredCourses({
  courses,
}: {
  courses: RegistrationSummary["courses"];
}) {
  return (
    <DataTable
      caption="Registered courses"
      columns={[
        { label: "Code" },
        { label: "Course" },
        { label: "Units", numeric: true },
      ]}
    >
      {courses.map(({ id, code, name, units }) => (
        <tr key={id}>
          <th scope="row">{code}</th>
          <td>{name}</td>
          <td data-numeric>{units}</td>
        </tr>
      ))}
    </DataTable>
  );
}
