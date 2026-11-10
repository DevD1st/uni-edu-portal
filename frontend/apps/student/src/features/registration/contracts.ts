import type { components } from "@uemp/api-contracts";
import {
  hasStudentIdentity,
  isAcademicTerm,
  isCourseRecord,
} from "../portal/academic-record";
import { isArrayOf, isRecord, isText, isUnits, isUuid } from "../portal/validation";

type Schema = components["schemas"];
export type RegistrationInput = Schema["RegistrationWriteDto"];
export type AvailableCourses = Schema["AvailableCoursesResponseDto"];
export type RegistrationHistory = Schema["RegisteredTermsResponseDto"];
export type RegistrationSummary = Schema["RegistrationSummaryResponseDto"];

function isAvailableCourse(value: unknown): value is Record<string, unknown> {
  return (
    isCourseRecord(value) && isUuid(value["courseId"]) && isUuid(value["offeringId"])
  );
}

function isRegisteredTerm(value: unknown): value is Record<string, unknown> {
  return (
    isAcademicTerm(value) && isText(value["faculty"]) && isUnits(value["totalUnits"])
  );
}

export function readAvailableCourses(value: unknown): AvailableCourses {
  if (
    isRecord(value) &&
    isUuid(value["semesterId"]) &&
    isUnits(value["maxUnits"]) &&
    isUnits(value["registeredUnits"]) &&
    isArrayOf(value["courses"], isAvailableCourse)
  )
    return value as AvailableCourses;
  throw new Error("Invalid available courses");
}

export function readRegistrationHistory(value: unknown): RegistrationHistory {
  if (isRecord(value) && isArrayOf(value["terms"], isRegisteredTerm))
    return value as RegistrationHistory;
  throw new Error("Invalid registration history");
}

export function readRegistrationSummary(value: unknown): RegistrationSummary {
  if (
    isRegisteredTerm(value) &&
    hasStudentIdentity(value) &&
    isArrayOf(
      value["courses"],
      (item) =>
        isAvailableCourse(item) && isUuid(item["id"]) && isUuid(item["resultGroupId"]),
    )
  )
    return value as RegistrationSummary;
  throw new Error("Invalid registration summary");
}
