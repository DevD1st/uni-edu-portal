import { Badge, DataTable, ResourceState } from "@uemp/ui";
import type { ResultStatement } from "../contracts";

type Courses = ResultStatement["courses"];

export function PublishedGrades({ courses }: { courses: Courses }) {
  if (courses.length === 0)
    return (
      <ResourceState
        state="empty"
        title="No grades have been published for this semester"
      />
    );

  return (
    <>
      <section aria-label="Published grades" className="u-stack medium:hidden">
        <h2>Published grades</h2>
        <ul className="student-grade-list">
          {courses.map((course) => (
            <li key={course.id}>
              <div className="student-grade-heading">
                <h3>
                  <strong>{course.code}</strong> · {course.name}
                </h3>
                <Badge tone={course.grade === "F" ? "warning" : "neutral"}>
                  Grade {course.grade}
                </Badge>
              </div>
              <dl className="student-grade-marks">
                <div>
                  <dt>Units</dt>
                  <dd>{course.units}</dd>
                </div>
                <div>
                  <dt>CA</dt>
                  <dd>{course.caScore.toFixed(2)}</dd>
                </div>
                <div>
                  <dt>Exam</dt>
                  <dd>{course.examScore.toFixed(2)}</dd>
                </div>
                <div>
                  <dt>Total</dt>
                  <dd>{course.totalScore.toFixed(2)}</dd>
                </div>
              </dl>
            </li>
          ))}
        </ul>
      </section>
      <div className="hidden medium:block">
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
            </tr>
          ))}
        </DataTable>
      </div>
    </>
  );
}
