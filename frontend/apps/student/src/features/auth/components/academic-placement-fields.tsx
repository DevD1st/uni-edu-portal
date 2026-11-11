"use client";

import { useState } from "react";
import { SelectField } from "@uemp/ui";
import type { AcademicReferences } from "../signup-contract";

export function AcademicPlacementFields({
  references,
  disabled,
}: {
  references: AcademicReferences;
  disabled: boolean;
}) {
  const [facultyId, setFaculty] = useState("");
  const [departmentId, setDepartment] = useState("");
  const [courseOfStudyId, setProgramme] = useState("");
  const [academicLevelId, setLevel] = useState("");
  const departments = references.departments.filter(
    (department) => department.facultyId === facultyId,
  );
  const programmes = references.programmes.filter(
    (programme) => programme.departmentId === departmentId,
  );
  const programme = programmes.find(({ id }) => id === courseOfStudyId);
  const levels = references.levels.filter(
    (level) => !level.isGraduate && level.programType === programme?.programType,
  );

  return (
    <fieldset className="student-signup-section u-stack min-w-0" disabled={disabled}>
      <legend>Academic placement (optional)</legend>
      <p className="u-muted">
        Course registration requires a faculty, department, programme, and academic
        level.
      </p>
      <div className="student-field-grid">
        <SelectField
          label="Faculty"
          name="facultyId"
          value={facultyId}
          onChange={(event) => {
            setFaculty(event.target.value);
            setDepartment("");
            setProgramme("");
            setLevel("");
          }}
        >
          <option value="">Select a faculty</option>
          {references.faculties.map(({ id, name }) => (
            <option key={id} value={id}>
              {name}
            </option>
          ))}
        </SelectField>
        <SelectField
          label="Department"
          name="departmentId"
          value={departmentId}
          disabled={!facultyId}
          {...(!facultyId ? { hint: "Choose your faculty first." } : {})}
          onChange={(event) => {
            setDepartment(event.target.value);
            setProgramme("");
            setLevel("");
          }}
        >
          <option value="">Select a department</option>
          {departments.map(({ id, name }) => (
            <option key={id} value={id}>
              {name}
            </option>
          ))}
        </SelectField>
        <SelectField
          label="Programme"
          name="courseOfStudyId"
          value={courseOfStudyId}
          disabled={!departmentId}
          {...(!departmentId ? { hint: "Choose your department first." } : {})}
          onChange={(event) => {
            setProgramme(event.target.value);
            setLevel("");
          }}
        >
          <option value="">Select a programme</option>
          {programmes.map(({ id, name }) => (
            <option key={id} value={id}>
              {name}
            </option>
          ))}
        </SelectField>
        <SelectField
          label="Academic level"
          name="academicLevelId"
          value={academicLevelId}
          disabled={!programme}
          {...(!programme ? { hint: "Choose your programme first." } : {})}
          onChange={(event) => setLevel(event.target.value)}
        >
          <option value="">Select a level</option>
          {levels.map(({ id, selectionLabel }) => (
            <option key={id} value={id}>
              {selectionLabel}
            </option>
          ))}
        </SelectField>
      </div>
    </fieldset>
  );
}
