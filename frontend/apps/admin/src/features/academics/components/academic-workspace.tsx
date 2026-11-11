import { useState } from "react";
import { Button, Surface } from "@uemp/ui";
import { StaffResource } from "../../portal/components/staff-controls";
import { useStaffResource } from "../../portal/staff-data";
import { AcademicRecords, type AcademicSection } from "./academic-records";
import { CourseManagement, type CourseSection } from "./course-management";

const sections: { id: AcademicSection | CourseSection; label: string }[] = [
  { id: "faculties", label: "Faculties" },
  { id: "departments", label: "Departments" },
  { id: "programmes", label: "Programmes" },
  { id: "sessions", label: "Sessions" },
  { id: "semesters", label: "Semesters" },
  { id: "levels", label: "Academic levels" },
  { id: "catalog", label: "Course catalog" },
  { id: "curriculum", label: "Curriculum" },
  { id: "offerings", label: "Offerings" },
];

export function AcademicWorkspace() {
  const [section, setSection] = useState<AcademicSection | CourseSection>("faculties");
  const academic = useStaffResource("/v1/admin/academic", "AcademicSetupResponseDto");
  const courseSection =
    section === "catalog" || section === "curriculum" || section === "offerings"
      ? section
      : null;
  const courses = useStaffResource(
    courseSection ? "/v1/admin/courses" : null,
    "CourseSetupResponseDto",
  );
  return (
    <>
      <Surface>
        <div
          className="staff-filter-tabs staff-academic-sections"
          role="group"
          aria-label="Academic setup sections"
        >
          {sections.map(({ id, label }) => (
            <Button
              key={id}
              variant={id === section ? "primary" : "secondary"}
              aria-pressed={section === id}
              onClick={() => setSection(id)}
            >
              {label}
            </Button>
          ))}
        </div>
      </Surface>
      <StaffResource resource={academic} title="academic setup">
        {(data) =>
          section === "catalog" ||
          section === "curriculum" ||
          section === "offerings" ? (
            <StaffResource resource={courses} title="course setup">
              {(catalog) => (
                <CourseManagement
                  key={section}
                  section={section}
                  academic={data}
                  courses={catalog}
                  reload={courses.reload}
                />
              )}
            </StaffResource>
          ) : (
            <AcademicRecords
              key={section}
              section={section}
              data={data}
              reload={academic.reload}
            />
          )
        }
      </StaffResource>
    </>
  );
}
