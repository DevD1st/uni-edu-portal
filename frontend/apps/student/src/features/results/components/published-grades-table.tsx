import { DataTable } from "@uemp/ui";
import type { ResultStatement } from "../contracts";

export function PublishedGradesTable({
  courses,
  includeGradePoints = false,
}: {
  courses: ResultStatement["courses"];
  includeGradePoints?: boolean;
}) {
  return (
    <DataTable
      caption="Published grades"
      columns={[
        { label: "Code" },
        { label: "Course" },
        { label: "Units", numeric: true },
        { label: "CA", numeric: true },
        { label: "Exam", numeric: true },
        { label: "Total", numeric: true },
        { label: "Grade" },
        ...(includeGradePoints ? [{ label: "Grade points", numeric: true }] : []),
      ]}
    >
      {courses.map((course) => (
        <tr key={course.id}>
          <th scope="row">{course.code}</th>
          <td>{course.name}</td>
          <td data-numeric>{course.units}</td>
          <td data-numeric>{course.caScore.toFixed(2)}</td>
          <td data-numeric>{course.examScore.toFixed(2)}</td>
          <td data-numeric>{course.totalScore.toFixed(2)}</td>
          <td>{course.grade}</td>
          {includeGradePoints && <td data-numeric>{course.gradePoint.toFixed(2)}</td>}
        </tr>
      ))}
    </DataTable>
  );
}
