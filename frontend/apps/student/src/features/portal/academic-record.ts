import { isRecord, isText, isUnits, isUuid } from "./validation";

export function isAcademicTerm(value: unknown): value is Record<string, unknown> {
  return (
    isRecord(value) &&
    isUuid(value["id"]) &&
    isUuid(value["semesterId"]) &&
    isText(value["semesterName"]) &&
    isText(value["academicSession"]) &&
    isText(value["department"]) &&
    isText(value["programme"]) &&
    isText(value["academicLevel"])
  );
}

export function hasStudentIdentity(value: Record<string, unknown>) {
  return (["firstName", "lastName", "matricNumber"] as const).every(
    (key) => value[key] === null || isText(value[key]),
  );
}

export function isCourseRecord(value: unknown): value is Record<string, unknown> {
  return (
    isRecord(value) &&
    isText(value["code"]) &&
    isText(value["name"]) &&
    isUnits(value["units"])
  );
}
