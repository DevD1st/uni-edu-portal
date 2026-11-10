import type { components } from "@uemp/api-contracts";
import {
  hasStudentIdentity,
  isAcademicTerm,
  isCourseRecord,
} from "../portal/academic-record";
import {
  isArrayOf,
  isNumber,
  isRecord,
  isText,
  isUnits,
  isUuid,
} from "../portal/validation";

type Schema = components["schemas"];
export type ResultHistory = Schema["StudentResultHistoryDto"];
export type ResultStatement = Schema["StudentResultStatementDto"];

const isAverage = (value: unknown) => value === null || isNumber(value);

function isResultTerm(value: unknown): value is Record<string, unknown> {
  return (
    isAcademicTerm(value) && isUnits(value["approvedUnits"]) && isAverage(value["gpa"])
  );
}

function isPublishedCourse(value: unknown) {
  return (
    isCourseRecord(value) &&
    isUuid(value["id"]) &&
    isNumber(value["caScore"]) &&
    isNumber(value["examScore"]) &&
    isNumber(value["totalScore"]) &&
    isNumber(value["gradePoint"]) &&
    isText(value["approvedAt"]) &&
    isText(value["grade"]) &&
    /^[A-F]$/.test(value["grade"])
  );
}

export function readResultHistory(value: unknown): ResultHistory {
  if (
    isRecord(value) &&
    isAverage(value["cgpa"]) &&
    isArrayOf(value["terms"], isResultTerm)
  )
    return value as ResultHistory;
  throw new Error("Invalid result history");
}

export function readResultStatement(value: unknown): ResultStatement {
  if (
    isResultTerm(value) &&
    hasStudentIdentity(value) &&
    isAverage(value["cgpa"]) &&
    isArrayOf(value["courses"], isPublishedCourse)
  )
    return value as ResultStatement;
  throw new Error("Invalid result statement");
}
