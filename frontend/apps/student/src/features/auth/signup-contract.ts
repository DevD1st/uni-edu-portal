import type { AcademicReferences, components } from "@uemp/api-contracts";
import { isArrayOf, isRecord, isText, isUnits, isUuid } from "../portal/validation";

export type SignupInput = components["schemas"]["CreateStudentDto"];
export type { AcademicReferences };

function named(value: unknown): value is Record<string, unknown> {
  return isRecord(value) && isUuid(value["id"]) && isText(value["name"]);
}

export function readReferences(value: unknown): AcademicReferences {
  if (
    isRecord(value) &&
    isArrayOf(value["faculties"], named) &&
    isArrayOf(
      value["departments"],
      (item) => named(item) && isUuid(item["facultyId"]),
    ) &&
    isArrayOf(
      value["programmes"],
      (item) =>
        named(item) && isUuid(item["departmentId"]) && isText(item["programType"]),
    ) &&
    isArrayOf(
      value["levels"],
      (item) =>
        isRecord(item) &&
        isUuid(item["id"]) &&
        isText(item["displayName"]) &&
        isUnits(item["stage"]) &&
        isText(item["programType"]) &&
        isText(item["selectionLabel"]) &&
        typeof item["isGraduate"] === "boolean",
    )
  )
    return value as AcademicReferences;
  throw new Error("Invalid academic references");
}
