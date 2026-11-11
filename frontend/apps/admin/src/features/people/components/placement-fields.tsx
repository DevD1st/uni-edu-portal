import { useState } from "react";
import type { Dto } from "@uemp/api-contracts/response";
import {
  ChoiceField,
  namedOptions,
  textField,
} from "../../portal/components/staff-controls";

type References = Dto<"AcademicReferencesResponseDto">;
type Placement = Dto<"PlacementDto">;

export function readPlacement(form: FormData): Placement {
  return {
    facultyId: textField(form, "facultyId") || null,
    departmentId: textField(form, "departmentId") || null,
    courseOfStudyId: textField(form, "courseOfStudyId") || null,
    academicLevelId: textField(form, "academicLevelId") || null,
  };
}

export function PlacementFields({
  references,
  allowed,
  initial,
  allowUnassigned,
}: {
  references: References;
  allowed: (department: string) => boolean;
  initial?: Placement;
  allowUnassigned: boolean;
}) {
  const departments = references.departments.filter(({ id }) => allowed(id));
  const faculties = references.faculties.filter(({ id }) =>
    departments.some((department) => department.facultyId === id),
  );
  const [faculty, setFaculty] = useState(initial?.facultyId ?? "");
  const [department, setDepartment] = useState(initial?.departmentId ?? "");
  const [programme, setProgramme] = useState(initial?.courseOfStudyId ?? "");
  const [level, setLevel] = useState(initial?.academicLevelId ?? "");
  const programmes = references.programmes.filter(
    ({ departmentId }) => departmentId === department,
  );
  const selectedProgramme = programmes.find(({ id }) => id === programme);
  const levels = selectedProgramme
    ? references.levels.filter(
        ({ programType }) => programType === selectedProgramme.programType,
      )
    : [];
  return (
    <fieldset className="u-stack min-w-0">
      <legend>Academic placement</legend>
      <ChoiceField
        name="facultyId"
        label="Faculty"
        value={faculty}
        options={namedOptions(faculties)}
        required={!allowUnassigned}
        onChange={(event) => {
          setFaculty(event.target.value);
          setDepartment("");
          setProgramme("");
          setLevel("");
        }}
      />
      <ChoiceField
        name="departmentId"
        label="Department"
        value={department}
        disabled={!faculty}
        options={namedOptions(
          departments.filter(({ facultyId }) => facultyId === faculty),
        )}
        required={Boolean(faculty) || !allowUnassigned}
        onChange={(event) => {
          setDepartment(event.target.value);
          setProgramme("");
          setLevel("");
        }}
      />
      <ChoiceField
        name="courseOfStudyId"
        label="Programme"
        value={programme}
        options={namedOptions(programmes)}
        disabled={!department}
        onChange={(event) => {
          setProgramme(event.target.value);
          setLevel("");
        }}
      />
      <ChoiceField
        name="academicLevelId"
        label="Academic level"
        value={level}
        disabled={!selectedProgramme}
        options={levels.map(({ id, selectionLabel }) => ({
          value: id,
          label: selectionLabel,
        }))}
        onChange={(event) => setLevel(event.target.value)}
      />
    </fieldset>
  );
}
