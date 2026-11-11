import { useState } from "react";
import { Button, TextField } from "@uemp/ui";
import type { Dto } from "@uemp/api-contracts/response";
import { hasPrivilege } from "../../access/policy";
import {
  ActionNotice,
  ChoiceField,
  StaffDialog,
  StaffResource,
  namedOptions,
  requiredText,
  statusField,
  textField,
} from "../../portal/components/staff-controls";
import {
  changeStaff,
  staffPath,
  useStaffAccess,
  useStaffAction,
  useStaffResource,
  writeStaff,
} from "../../portal/staff-data";
import {
  NameField,
  StatusField,
  recordName,
  semesterOptions,
  statusLabel,
} from "./academic-fields";
import { SetupCollection } from "./setup-collection";

const api = "/v1/admin/courses";
type Setup = Dto<"AcademicSetupResponseDto">;
type Courses = Dto<"CourseSetupResponseDto">;
type Props = { academic: Setup; courses: Courses; reload: () => void };
export type CourseSection = "catalog" | "curriculum" | "offerings";

function CourseCatalog({ courses, reload }: Props) {
  const { grants } = useStaffAccess();
  const university = hasPrivilege(grants, "manage_university", null);
  return (
    <SetupCollection
      title="Course catalog"
      singular="course"
      records={courses.courses}
      label={(row) => row.code + " · " + row.name}
      details={(row) => [
        { label: "Credit units", value: row.units },
        { label: "Status", value: statusLabel(row.status) },
      ]}
      canCreate={university}
      canEdit={() => university}
      fields={(row) => (
        <>
          <TextField
            name="code"
            label="Course code"
            defaultValue={row?.code}
            maxLength={32}
            required
          />
          <NameField label="Course title" value={row?.name} />
          <TextField
            name="units"
            label="Credit units"
            type="number"
            min={1}
            max={32767}
            defaultValue={row?.units}
            required
          />
          <StatusField value={row?.status ?? "active"} />
        </>
      )}
      save={(form, row) =>
        writeStaff(
          api + (row ? "/" + row.id : ""),
          row ? "PUT" : "POST",
          "CourseResponseDto",
          {
            code: requiredText(form, "code", "a course code"),
            name: requiredText(form, "name", "a course title"),
            units: Number(form.get("units")),
            status: statusField(form),
          } satisfies Dto<"CourseWriteDto">,
        )
      }
      reload={reload}
    />
  );
}

function Curriculum({ academic, courses, reload }: Props) {
  const { grants } = useStaffAccess();
  const [removing, setRemoving] = useState<Courses["curriculum"][number]>();
  const action = useStaffAction();
  const canManage = (programmeId: string) =>
    academic.programmes.some(
      (item) =>
        item.id === programmeId &&
        hasPrivilege(grants, "manage_department", item.departmentId),
    );
  const programmes = academic.programmes.filter(
    (item) => item.status === "active" && canManage(item.id),
  );
  const catalog = courses.courses.filter(({ status }) => status === "active");
  return (
    <>
      <SetupCollection
        title="Programme curriculum"
        singular="curriculum link"
        records={courses.curriculum}
        label={(row) => recordName(courses.courses, row.courseId)}
        details={(row) => [
          {
            label: "Programme",
            value: recordName(academic.programmes, row.courseOfStudyId),
          },
        ]}
        canCreate={programmes.length > 0 && catalog.length > 0}
        canEdit={() => false}
        fields={() => (
          <>
            <ChoiceField
              name="courseOfStudyId"
              label="Programme"
              options={namedOptions(programmes)}
              required
            />
            <ChoiceField
              name="courseId"
              label="Course"
              options={catalog.map(({ id, code, name }) => ({
                value: id,
                label: code + " · " + name,
              }))}
              required
            />
          </>
        )}
        save={(form) =>
          writeStaff(api + "/curriculum", "POST", "CurriculumResponseDto", {
            courseOfStudyId: requiredText(form, "courseOfStudyId", "a programme"),
            courseId: requiredText(form, "courseId", "a course"),
          } satisfies Dto<"CurriculumWriteDto">)
        }
        reload={reload}
        extraActions={(row) =>
          canManage(row.courseOfStudyId) && (
            <Button
              variant="secondary"
              onClick={() => {
                action.reset();
                setRemoving(row);
              }}
            >
              Remove link
            </Button>
          )
        }
      />
      {!removing && <ActionNotice error={action.error} success={action.success} />}
      {removing && canManage(removing.courseOfStudyId) && (
        <StaffDialog
          title="Remove curriculum link"
          label="Remove link"
          danger
          close={() => setRemoving(undefined)}
          pending={action.pending}
          error={action.error}
          submit={() =>
            void action.run(
              () => changeStaff(api + "/curriculum/" + removing.id, "DELETE"),
              "Curriculum link removed.",
              () => {
                setRemoving(undefined);
                reload();
              },
            )
          }
        >
          <p>
            Remove {recordName(courses.courses, removing.courseId)} from{" "}
            {recordName(academic.programmes, removing.courseOfStudyId)}?
          </p>
        </StaffDialog>
      )}
    </>
  );
}

function LecturerField({
  departmentId,
  current,
}: {
  departmentId: string;
  current: string | null;
}) {
  const resource = useStaffResource(
    departmentId ? staffPath(api + "/lecturers", { departmentId }) : null,
    "LecturerChoicesResponseDto",
  );
  if (!departmentId)
    return (
      <ChoiceField
        name="lecturerId"
        label="Lecturer"
        options={[]}
        emptyLabel="Choose a department first"
        disabled
      />
    );
  return (
    <StaffResource resource={resource} title="eligible lecturers">
      {({ lecturers }) => {
        const choices = lecturers.map(({ id, firstName, lastName }) => ({
          value: id,
          label:
            [firstName, lastName].filter(Boolean).join(" ") ||
            "Lecturer " + id.slice(0, 8),
        }));
        if (current && !choices.some(({ value }) => value === current))
          choices.push({ value: current, label: "Current lecturer (unavailable)" });
        return (
          <ChoiceField
            name="lecturerId"
            label="Lecturer"
            defaultValue={current ?? ""}
            options={choices}
            emptyLabel="Unassigned"
          />
        );
      }}
    </StaffResource>
  );
}

function OfferingFields({
  academic,
  courses,
  departments,
  row,
}: Props & {
  departments: Setup["departments"];
  row: Courses["offerings"][number] | undefined;
}) {
  const [department, select] = useState(row?.departmentId ?? "");
  const terms = semesterOptions(academic);
  if (row)
    return (
      <>
        <p>
          {recordName(academic.departments, row.departmentId)} ·{" "}
          {terms.find(({ value }) => value === row.semesterId)?.label}
        </p>
        <LecturerField departmentId={row.departmentId} current={row.lecturerId} />
        <StatusField value={row.status} />
      </>
    );
  return (
    <>
      <ChoiceField
        name="departmentId"
        label="Department"
        options={namedOptions(departments)}
        required
        value={department}
        onChange={(event) => select(event.target.value)}
      />
      <ChoiceField
        name="courseId"
        label="Course"
        options={courses.courses
          .filter(({ status }) => status === "active")
          .map(({ id, code, name }) => ({ value: id, label: code + " · " + name }))}
        required
      />
      <ChoiceField name="semesterId" label="Semester" options={terms} required />
      <ChoiceField
        name="academicLevelId"
        label="Academic level"
        options={academic.levels
          .filter(({ status, stage }) => status === "active" && stage > 0)
          .map(({ id, displayName, programType }) => ({
            value: id,
            label: displayName + " · " + programType,
          }))}
        required
      />
      <LecturerField key={department} departmentId={department} current={null} />
      <StatusField value="inactive" />
    </>
  );
}

function Offerings(props: Props) {
  const { academic, courses, reload } = props;
  const { grants } = useStaffAccess();
  const departments = academic.departments.filter(
    ({ id, status }) =>
      status === "active" && hasPrivilege(grants, "manage_department", id),
  );
  const terms = semesterOptions(academic);
  return (
    <SetupCollection
      title="Course offerings"
      singular="offering"
      records={courses.offerings}
      label={(row) => {
        const course = courses.courses.find(({ id }) => id === row.courseId);
        return course ? course.code + " · " + course.name : "Course offering";
      }}
      details={(row) => [
        {
          label: "Department",
          value: recordName(academic.departments, row.departmentId),
        },
        {
          label: "Semester",
          value:
            terms.find(({ value }) => value === row.semesterId)?.label ?? "Unavailable",
        },
        {
          label: "Level",
          value:
            academic.levels.find(({ id }) => id === row.academicLevelId)?.displayName ??
            "Unavailable",
        },
        { label: "Lecturer", value: row.lecturerId ? "Assigned" : "Unassigned" },
        { label: "Credit units", value: row.units },
        { label: "Status", value: statusLabel(row.status) },
      ]}
      canCreate={
        departments.length > 0 &&
        courses.courses.some(({ status }) => status === "active") &&
        academic.semesters.length > 0 &&
        academic.levels.some(({ stage, status }) => stage > 0 && status === "active")
      }
      canEdit={(row) => hasPrivilege(grants, "manage_department", row.departmentId)}
      fields={(row) => (
        <OfferingFields {...props} departments={departments} row={row} />
      )}
      save={(form, row) => {
        const lecturerId = form.has("lecturerId")
          ? textField(form, "lecturerId") || null
          : undefined;
        const status = statusField(form);
        if (row)
          return writeStaff(
            api + "/offerings/" + row.id,
            "PATCH",
            "OfferingResponseDto",
            {
              status,
              ...(lecturerId !== undefined ? { lecturerId } : {}),
            } satisfies Dto<"OfferingUpdateDto">,
          );
        return writeStaff(api + "/offerings", "POST", "OfferingResponseDto", {
          departmentId: requiredText(form, "departmentId", "a department"),
          courseId: requiredText(form, "courseId", "a course"),
          semesterId: requiredText(form, "semesterId", "a semester"),
          academicLevelId: requiredText(form, "academicLevelId", "an academic level"),
          status,
          lecturerId: lecturerId ?? null,
        } satisfies Dto<"OfferingWriteDto">);
      }}
      reload={reload}
    />
  );
}

export function CourseManagement({
  section,
  ...props
}: Props & { section: CourseSection }) {
  if (section === "catalog") return <CourseCatalog {...props} />;
  if (section === "curriculum") return <Curriculum {...props} />;
  return <Offerings {...props} />;
}
