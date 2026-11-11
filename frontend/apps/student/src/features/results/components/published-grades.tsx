import { Badge, ResourceState } from "@uemp/ui";
import type { ResultStatement } from "../contracts";
import { PublishedGradesTable } from "./published-grades-table";

type Courses = ResultStatement["courses"];

export function PublishedGrades({ courses }: { courses: Courses }) {
  if (courses.length === 0)
    return (
      <ResourceState
        state="empty"
        title="No grades have been published for this semester"
        detail="Approved results will appear here after departmental review. Your averages will update when results are published."
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
                  <strong className="student-grade-code">{course.code}</strong>
                  <span className="student-grade-name">
                    <span className="sr-only"> · </span>
                    {course.name}
                  </span>
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
                <div className="student-grade-total">
                  <dt>Total</dt>
                  <dd>{course.totalScore.toFixed(2)}</dd>
                </div>
              </dl>
              <p className="student-grade-detail">
                Grade points <strong>{course.gradePoint.toFixed(2)}</strong>
              </p>
            </li>
          ))}
        </ul>
      </section>
      <div className="student-grades-table hidden medium:block">
        <PublishedGradesTable courses={courses} includeGradePoints />
      </div>
    </>
  );
}
