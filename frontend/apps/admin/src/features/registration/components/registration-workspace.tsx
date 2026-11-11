import { useState } from "react";
import { Link, Route, Routes, useParams } from "react-router";
import { StaffNotFound } from "../../portal/components/staff-not-found";
import {
  Banner,
  Button,
  Checkbox,
  DataTable,
  DescriptionList,
  PageHeader,
  ResourceState,
  Surface,
  TextField,
} from "@uemp/ui";
import { isUuid, type Dto } from "@uemp/api-contracts/response";
import {
  hasPrivilege,
  permits,
  permitsSomewhere,
  registrationOversight,
} from "../../access/policy";
import {
  ActionNotice,
  ChoiceField,
  CursorControls,
  StaffDialog,
  StaffResource,
  namedOptions,
} from "../../portal/components/staff-controls";
import {
  staffPath,
  useCursor,
  useStaffAccess,
  useStaffAction,
  useStaffResource,
  writeStaff,
} from "../../portal/staff-data";
import { studentLabel } from "../../teaching/components/result-marks";

const root = "/workspaces/registration";
const api = "/v1/admin/registrations";
const delegateRule = { anyOf: [["register_student_courses"]] } as const;

function DepartmentRoster({
  semesterId,
  departmentId,
}: {
  semesterId: string;
  departmentId: string;
}) {
  const cursor = useCursor();
  const resource = useStaffResource(
    staffPath(api, { semesterId, departmentId, cursor: cursor.value }),
    "RegistrationRosterResponseDto",
  );
  return (
    <StaffResource resource={resource} title="department registrations">
      {({ items, nextCursor }) => (
        <>
          {items.length ? (
            <DataTable
              caption="Department registrations"
              columns={[
                { label: "Student" },
                { label: "Matriculation number" },
                { label: "Course" },
                { label: "Units", numeric: true },
              ]}
            >
              {items.map((row) => (
                <tr key={row.id}>
                  <th scope="row">{studentLabel(row)}</th>
                  <td>{row.matricNumber ?? "—"}</td>
                  <td>
                    {row.code} · {row.name}
                  </td>
                  <td data-numeric>{row.units}</td>
                </tr>
              ))}
            </DataTable>
          ) : (
            <ResourceState
              state="empty"
              title="No registrations for this department and semester"
            />
          )}
          <CursorControls cursor={cursor} next={nextCursor} />
        </>
      )}
    </StaffResource>
  );
}

function DepartmentRegistration() {
  const { grants } = useStaffAccess();
  const resource = useStaffResource("/v1/admin/academic", "AcademicSetupResponseDto");
  const [department, setDepartment] = useState("");
  const [semester, setSemester] = useState("");
  return (
    <Surface className="u-stack">
      <h2>Department registrations</h2>
      <StaffResource resource={resource} title="registration filters">
        {({ departments, semesters, sessions, faculties }) => {
          const allowed = departments.filter(({ id }) =>
            permits(grants, registrationOversight, id),
          );
          const selected = allowed.find(({ id }) => id === department) ?? allowed[0];
          const currentId = faculties.find(
            ({ id }) => id === selected?.facultyId,
          )?.currentSemesterId;
          const semesterId =
            semesters.find(({ id }) => id === semester)?.id ??
            currentId ??
            semesters[0]?.id;
          if (!selected || !semesterId)
            return (
              <ResourceState
                state="empty"
                title="No department or semester is available"
              />
            );
          const options = semesters.map(({ id, name, academicSessionId }) => {
            const session = sessions.find((row) => row.id === academicSessionId);
            return {
              value: id,
              label: session
                ? name + " · " + session.startYear + "/" + session.endYear
                : name,
            };
          });
          return (
            <>
              <div className="staff-fields">
                <ChoiceField
                  label="Department"
                  options={namedOptions(allowed)}
                  emptyLabel={null}
                  value={selected.id}
                  onChange={(event) => {
                    setDepartment(event.target.value);
                    setSemester("");
                  }}
                />
                <ChoiceField
                  label="Semester"
                  options={options}
                  emptyLabel={null}
                  value={semesterId}
                  onChange={(event) => setSemester(event.target.value)}
                />
              </div>
              <DepartmentRoster
                key={selected.id + ":" + semesterId}
                departmentId={selected.id}
                semesterId={semesterId}
              />
            </>
          );
        }}
      </StaffResource>
    </Surface>
  );
}

function StudentChooser() {
  const { grants } = useStaffAccess();
  const canRead = permitsSomewhere(grants, {
    anyOf: [["read_user", "register_student_courses"]],
  });
  const cursor = useCursor();
  const [typedId, setTypedId] = useState("");
  const resource = useStaffResource(
    canRead
      ? staffPath("/v1/admin/users", { populate: "student", cursor: cursor.value })
      : null,
    "UserPageResponseDto",
  );
  return (
    <Surface className="u-stack">
      <h2>Register courses for a student</h2>
      {canRead && (
        <StaffResource resource={resource} title="student accounts">
          {({ items, nextCursor }) => {
            const students = items.filter(
              (item) =>
                item.role === "student" &&
                item.status === "active" &&
                item.student &&
                hasPrivilege(
                  grants,
                  "register_student_courses",
                  item.student.departmentId,
                ),
            );
            return (
              <>
                {students.length ? (
                  <DataTable
                    caption="Students eligible for delegated registration"
                    columns={[{ label: "Student" }, { label: "Matriculation number" }]}
                  >
                    {students.map((student) => (
                      <tr key={student.id}>
                        <th scope="row">
                          <Link
                            className="u-text-link"
                            to={root + "/students/" + student.id}
                          >
                            {[student.firstName, student.lastName]
                              .filter(Boolean)
                              .join(" ") || student.email}
                          </Link>
                        </th>
                        <td>{student.student?.matricNumber ?? "—"}</td>
                      </tr>
                    ))}
                  </DataTable>
                ) : (
                  <ResourceState
                    state="empty"
                    title="No eligible student accounts on this page"
                  />
                )}
                <CursorControls cursor={cursor} next={nextCursor} />
              </>
            );
          }}
        </StaffResource>
      )}
      {!canRead && (
        <div className="staff-fields">
          <TextField
            label="Student account ID"
            value={typedId}
            onChange={(event) => setTypedId(event.target.value.trim())}
          />
          {isUuid(typedId) && (
            <Link
              className="u-text-link self-center"
              to={root + "/students/" + typedId}
            >
              Open course selection
            </Link>
          )}
        </div>
      )}
    </Surface>
  );
}

function Selection({
  studentId,
  available,
  updated,
}: {
  studentId: string;
  available: Dto<"AvailableCoursesResponseDto">;
  updated: () => void;
}) {
  const action = useStaffAction();
  const [chosen, setChosen] = useState<string[]>([]);
  const [confirm, setConfirm] = useState(false);
  const [saved, setSaved] = useState<Dto<"RegistrationSummaryResponseDto">>();
  const selected = available.courses.filter(({ offeringId }) =>
    chosen.includes(offeringId),
  );
  const units = selected.reduce((sum, course) => sum + course.units, 0);
  const remaining = Math.max(0, available.maxUnits - available.registeredUnits);
  const canSubmit = selected.length > 0 && units <= remaining && selected.length <= 100;
  if (saved)
    return (
      <Surface className="u-stack">
        <Banner tone="success">Courses registered for the student.</Banner>
        <DescriptionList
          items={[
            { label: "Student", value: studentLabel(saved) },
            {
              label: "Semester",
              value: saved.semesterName + " · " + saved.academicSession,
            },
            { label: "Registered units", value: saved.totalUnits },
          ]}
        />
        <div>
          <Button variant="secondary" onClick={updated}>
            Refresh available courses
          </Button>
        </div>
      </Surface>
    );

  return (
    <Surface className="u-stack">
      <DescriptionList
        items={[
          { label: "Registered units", value: available.registeredUnits },
          { label: "Semester limit", value: available.maxUnits },
          { label: "Remaining units", value: remaining },
        ]}
      />
      {available.courses.length === 0 ? (
        <ResourceState
          state="empty"
          title="No courses are available for this student"
        />
      ) : (
        <fieldset className="u-stack min-w-0">
          <legend>Available courses</legend>
          {available.courses.map((course) => {
            const checked = chosen.includes(course.offeringId);
            return (
              <Checkbox
                key={course.offeringId}
                checked={checked}
                label={
                  course.code + " · " + course.name + " (" + course.units + " units)"
                }
                disabled={
                  !checked &&
                  (selected.length >= 100 ||
                    selected.some((item) => item.courseId === course.courseId))
                }
                onChange={(event) =>
                  setChosen(
                    event.target.checked
                      ? [...chosen, course.offeringId]
                      : chosen.filter((id) => id !== course.offeringId),
                  )
                }
              />
            );
          })}
        </fieldset>
      )}
      <p role="status">{units} selected credit units</p>
      {units > remaining && (
        <Banner tone="warning">
          Remove courses to stay within the student's credit limit.
        </Banner>
      )}
      <div className="u-actions">
        <Button disabled={!canSubmit} onClick={() => setConfirm(true)}>
          Review selection
        </Button>
        <Button variant="secondary" onClick={updated}>
          Refresh available courses
        </Button>
      </div>
      {confirm && (
        <StaffDialog
          title="Confirm student registration"
          label="Register courses"
          close={() => setConfirm(false)}
          pending={action.pending}
          error={action.error}
          submit={() => {
            if (!canSubmit) return;
            const input: Dto<"RegistrationWriteDto"> = {
              semesterId: available.semesterId,
              offeringIds: selected.map(({ offeringId }) => offeringId),
            };
            void action.run(
              () =>
                writeStaff(
                  api + "/students/" + studentId,
                  "POST",
                  "RegistrationSummaryResponseDto",
                  input,
                ),
              "Courses registered.",
              (summary) => {
                setSaved(summary);
                setConfirm(false);
              },
            );
          }}
        >
          <ul className="u-stack">
            {selected.map((course) => (
              <li key={course.offeringId}>
                {course.code} · {course.name}
              </li>
            ))}
          </ul>
          <p>
            {available.registeredUnits + units} of {available.maxUnits} credit units
            after registration.
          </p>
        </StaffDialog>
      )}
      {!confirm && <ActionNotice error={action.error} />}
    </Surface>
  );
}

function DelegatedRegistration() {
  const { studentId } = useParams();
  const { grants } = useStaffAccess();
  const path =
    isUuid(studentId) && permitsSomewhere(grants, delegateRule)
      ? api + "/students/" + studentId + "/available"
      : null;
  const resource = useStaffResource(path, "AvailableCoursesResponseDto");
  if (!path || !studentId)
    return (
      <ResourceState state="restricted" title="Student registration is unavailable" />
    );
  return (
    <>
      <Link className="u-text-link" to={root}>
        Back to registration oversight
      </Link>
      <PageHeader title="Register courses for a student" />
      <StaffResource resource={resource} title="eligible courses">
        {(available) => (
          <Selection
            key={studentId + ":" + available.semesterId}
            studentId={studentId}
            available={available}
            updated={resource.reload}
          />
        )}
      </StaffResource>
    </>
  );
}

function RegistrationHome() {
  const { grants } = useStaffAccess();
  return (
    <>
      {permitsSomewhere(grants, registrationOversight) && <DepartmentRegistration />}
      {permitsSomewhere(grants, delegateRule) && <StudentChooser />}
    </>
  );
}

export function RegistrationWorkspace() {
  return (
    <Routes>
      <Route index element={<RegistrationHome />} />
      <Route path="students/:studentId" element={<DelegatedRegistration />} />
      <Route
        path="*"
        element={<StaffNotFound to={root} label="Back to registration oversight" />}
      />
    </Routes>
  );
}
