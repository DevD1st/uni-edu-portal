import { useState } from "react";
import { Button, TextField } from "@uemp/ui";
import type { Dto, DtoName } from "@uemp/api-contracts/response";
import { hasPrivilege, permitsSomewhere } from "../../access/policy";
import {
  ActionNotice,
  ChoiceField,
  StaffDialog,
  namedOptions,
  requiredText,
  statusField,
  textField,
} from "../../portal/components/staff-controls";
import { useStaffAccess, useStaffAction, writeStaff } from "../../portal/staff-data";
import {
  NameField,
  StatusField,
  programTypes,
  recordName,
  semesterOptions,
  statusLabel,
} from "./academic-fields";
import { SetupCollection } from "./setup-collection";

const api = "/v1/admin/academic";
type Setup = Dto<"AcademicSetupResponseDto">;
export type AcademicSection =
  "faculties" | "departments" | "programmes" | "sessions" | "semesters" | "levels";
type Props = { data: Setup; reload: () => void };

function saveRecord<Name extends DtoName>(
  section: string,
  id: string | undefined,
  schema: Name,
  body: unknown,
) {
  return writeStaff(
    api + "/" + section + (id ? "/" + id : ""),
    id ? "PUT" : "POST",
    schema,
    body,
  );
}

function FacultyRecords({ data, reload, university }: Props & { university: boolean }) {
  const [selected, select] = useState<Setup["faculties"][number]>();
  const action = useStaffAction();
  const terms = semesterOptions(data);
  const activeTerms = terms.filter(({ value }) =>
    data.semesters.some(
      (term) =>
        term.id === value &&
        term.status === "active" &&
        data.sessions.some(
          (session) =>
            session.id === term.academicSessionId && session.status === "active",
        ),
    ),
  );
  return (
    <>
      <SetupCollection
        title="Faculties"
        singular="faculty"
        records={data.faculties}
        label={(row) => row.name}
        details={(row) => [
          { label: "Status", value: statusLabel(row.status) },
          {
            label: "Registration semester",
            value:
              terms.find(({ value }) => value === row.currentSemesterId)?.label ??
              "None selected",
          },
        ]}
        canCreate={university}
        canEdit={() => university}
        fields={(row) => (
          <>
            <NameField label="Faculty name" value={row?.name} />
            <StatusField value={row?.status ?? "active"} />
          </>
        )}
        save={(form, row) =>
          saveRecord("faculties", row?.id, "FacultySetupResponseDto", {
            name: requiredText(form, "name", "a faculty name"),
            status: statusField(form),
          } satisfies Dto<"FacultyWriteDto">)
        }
        reload={reload}
        extraActions={(row) =>
          university && (
            <Button
              variant="secondary"
              onClick={() => {
                action.reset();
                select(row);
              }}
            >
              Set registration semester
            </Button>
          )
        }
      />
      {!selected && <ActionNotice error={action.error} success={action.success} />}
      {selected && university && (
        <StaffDialog
          title="Set registration semester"
          label="Save semester"
          close={() => select(undefined)}
          pending={action.pending}
          error={action.error}
          submit={(form) => {
            const input: Dto<"SetCurrentSemesterDto"> = {
              semesterId: textField(form, "semesterId") || null,
            };
            void action.run(
              () =>
                writeStaff(
                  api + "/faculties/" + selected.id + "/current-semester",
                  "PUT",
                  "FacultySetupResponseDto",
                  input,
                ),
              "Registration semester updated.",
              () => {
                select(undefined);
                reload();
              },
            );
          }}
        >
          <p>{selected.name}</p>
          <ChoiceField
            name="semesterId"
            label="Registration semester"
            options={selected.status === "active" ? activeTerms : []}
            emptyLabel="No open semester"
            defaultValue={selected.currentSemesterId ?? ""}
          />
        </StaffDialog>
      )}
    </>
  );
}

export function AcademicRecords({
  section,
  data,
  reload,
}: Props & { section: AcademicSection }) {
  const { grants } = useStaffAccess();
  const university = hasPrivilege(grants, "manage_university", null);
  const manages = (id: string) => hasPrivilege(grants, "manage_department", id);
  const managedDepartments = data.departments.filter(
    (department) => manages(department.id) && department.status === "active",
  );
  if (section === "faculties")
    return <FacultyRecords data={data} reload={reload} university={university} />;
  if (section === "departments")
    return (
      <SetupCollection
        title="Departments"
        singular="department"
        records={data.departments}
        label={(row) => row.name}
        details={(row) => [
          { label: "Faculty", value: recordName(data.faculties, row.facultyId) },
          { label: "Status", value: statusLabel(row.status) },
        ]}
        canCreate={
          university && data.faculties.some(({ status }) => status === "active")
        }
        canEdit={() => university}
        fields={(row) => (
          <>
            {row ? (
              <p>Faculty · {recordName(data.faculties, row.facultyId)}</p>
            ) : (
              <ChoiceField
                name="facultyId"
                label="Faculty"
                required
                options={namedOptions(
                  data.faculties.filter(({ status }) => status === "active"),
                )}
              />
            )}
            <NameField label="Department name" value={row?.name} />
            <StatusField value={row?.status ?? "active"} />
          </>
        )}
        save={(form, row) =>
          saveRecord("departments", row?.id, "DepartmentSetupResponseDto", {
            facultyId: row?.facultyId ?? requiredText(form, "facultyId", "a faculty"),
            name: requiredText(form, "name", "a department name"),
            status: statusField(form),
          } satisfies Dto<"DepartmentWriteDto">)
        }
        reload={reload}
      />
    );
  if (section === "programmes")
    return (
      <SetupCollection
        title="Programmes"
        singular="programme"
        records={data.programmes}
        label={(row) => row.name}
        details={(row) => [
          {
            label: "Department",
            value: recordName(data.departments, row.departmentId),
          },
          {
            label: "Programme type",
            value: programTypes.find(({ value }) => value === row.programType)?.label,
          },
          { label: "Status", value: statusLabel(row.status) },
        ]}
        canCreate={managedDepartments.length > 0}
        canEdit={(row) => manages(row.departmentId)}
        fields={(row) => (
          <>
            {row ? (
              <p>
                {recordName(data.departments, row.departmentId)} ·{" "}
                {programTypes.find(({ value }) => value === row.programType)?.label}
              </p>
            ) : (
              <>
                <ChoiceField
                  name="departmentId"
                  label="Department"
                  options={namedOptions(managedDepartments)}
                  required
                />
                <ChoiceField
                  name="programType"
                  label="Programme type"
                  options={programTypes}
                  required
                />
              </>
            )}
            <NameField label="Programme name" value={row?.name} />
            <StatusField value={row?.status ?? "active"} />
          </>
        )}
        save={(form, row) => {
          const programType =
            row?.programType ??
            programTypes.find(({ value }) => value === form.get("programType"))?.value;
          if (!programType) throw new Error("Choose a programme type.");
          return saveRecord("programmes", row?.id, "ProgrammeSetupResponseDto", {
            departmentId:
              row?.departmentId ?? requiredText(form, "departmentId", "a department"),
            name: requiredText(form, "name", "a programme name"),
            programType,
            status: statusField(form),
          } satisfies Dto<"ProgrammeWriteDto">);
        }}
        reload={reload}
      />
    );
  if (section === "sessions")
    return (
      <SetupCollection
        title="Academic sessions"
        singular="academic session"
        records={data.sessions}
        label={(row) => row.startYear + "/" + row.endYear}
        details={(row) => [{ label: "Status", value: statusLabel(row.status) }]}
        canCreate={university}
        canEdit={() => university}
        fields={(row) => (
          <>
            <TextField
              name="startYear"
              label="First year"
              type="number"
              min={1000}
              max={9999}
              defaultValue={row?.startYear}
              required
            />
            <TextField
              name="endYear"
              label="Last year"
              type="number"
              min={1000}
              max={9999}
              defaultValue={row?.endYear}
              required
            />
            <StatusField value={row?.status ?? "inactive"} />
          </>
        )}
        save={(form, row) =>
          saveRecord("sessions", row?.id, "SessionSetupResponseDto", {
            startYear: Number(form.get("startYear")),
            endYear: Number(form.get("endYear")),
            status: statusField(form),
          } satisfies Dto<"SessionWriteDto">)
        }
        reload={reload}
      />
    );
  if (section === "semesters")
    return (
      <SetupCollection
        title="Semesters"
        singular="semester"
        records={data.semesters}
        label={(row) =>
          semesterOptions(data).find(({ value }) => value === row.id)?.label ?? row.name
        }
        details={(row) => [
          { label: "Term", value: row.termNumber },
          { label: "Credit limit", value: row.maxUnits },
          { label: "Status", value: statusLabel(row.status) },
        ]}
        canCreate={university && data.sessions.length > 0}
        canEdit={() => university}
        fields={(row) => (
          <>
            {!row && (
              <ChoiceField
                name="academicSessionId"
                label="Academic session"
                options={data.sessions.map((session) => ({
                  value: session.id,
                  label: session.startYear + "/" + session.endYear,
                }))}
                required
              />
            )}
            <NameField label="Semester name" value={row?.name} />
            <TextField
              name="termNumber"
              label="Term number"
              type="number"
              min={1}
              max={32767}
              defaultValue={row?.termNumber}
              required
            />
            <TextField
              name="maxUnits"
              label="Credit unit limit"
              type="number"
              min={1}
              max={32767}
              defaultValue={row?.maxUnits}
              required
            />
            <StatusField value={row?.status ?? "inactive"} />
          </>
        )}
        save={(form, row) =>
          saveRecord("semesters", row?.id, "SemesterSetupResponseDto", {
            academicSessionId:
              row?.academicSessionId ??
              requiredText(form, "academicSessionId", "an academic session"),
            name: requiredText(form, "name", "a semester name"),
            termNumber: Number(form.get("termNumber")),
            maxUnits: Number(form.get("maxUnits")),
            status: statusField(form),
          } satisfies Dto<"SemesterWriteDto">)
        }
        reload={reload}
      />
    );

  return (
    <SetupCollection
      title="Academic levels"
      singular="academic level"
      records={data.levels}
      label={(row) => row.displayName}
      details={(row) => [
        {
          label: "Programme type",
          value: programTypes.find(({ value }) => value === row.programType)?.label,
        },
        { label: "Status", value: statusLabel(row.status) },
      ]}
      canCreate={false}
      canEdit={() => university}
      fields={(row) => <StatusField value={row?.status ?? "inactive"} />}
      save={(form, row) => {
        if (
          !row ||
          !permitsSomewhere(grants, { anyOf: [["manage_university"]], global: true })
        )
          throw new Error("Choose an academic level.");
        return writeStaff(
          api + "/levels/" + row.id + "/status",
          "PUT",
          "AcademicLevelSetupDto",
          { status: statusField(form) } satisfies Dto<"SetAcademicLevelStatusDto">,
        );
      }}
      reload={reload}
    />
  );
}
