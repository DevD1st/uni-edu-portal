import type { components, paths } from "./generated";

export type { components, paths } from "./generated";

type Schema = components["schemas"];
export type Account = Schema["UserResponseDto"];
export type Session = Schema["SessionResponseDto"];
export type SignInInput = Schema["SignInDto"];
export type RefreshInput = Schema["RefreshDto"];
export type AdminAuthorization = Schema["AdminAuthorizationResponseDto"];
export type AdminGrant = Schema["AdminAuthorizationGrantResponseDto"];
export type ErrorPayload = Schema["ErrorResponseDto"];
export type AcademicReferences = Schema["AcademicReferencesResponseDto"];
export type TeachingOfferings = Schema["TeachingOfferingsResponseDto"];
export type ReviewQueue = Pick<Schema["ResultGroupPageDto"], "nextCursor"> & {
  items: Pick<
    Schema["ResultGroupSummaryDto"],
    "id" | "code" | "name" | "status" | "enrolledCount" | "markedCount"
  >[];
};

export type SignInPayload =
  paths["/v1/auth/sign-in"]["post"]["requestBody"]["content"]["application/json"];

function record(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}
const string = (value: unknown): value is string => typeof value === "string";
const nullableString = (value: unknown): value is string | null =>
  value === null || string(value);
const numeric = (value: unknown): value is number =>
  typeof value === "number" && Number.isSafeInteger(value);
function strings(value: unknown): value is string[] {
  return Array.isArray(value) && value.every(string);
}

function token(value: unknown): value is Session["access"] {
  return (
    record(value) &&
    string(value["token"]) &&
    value["token"].length > 0 &&
    numeric(value["expiresAt"]) &&
    value["expiresAt"] > 0
  );
}

export function readSession(value: unknown): Session {
  if (record(value) && token(value["access"]) && token(value["refresh"]))
    return { access: value["access"], refresh: value["refresh"] };
  throw new Error("Invalid session response");
}

export function readAccount(value: unknown): Account {
  if (
    !record(value) ||
    !string(value["id"]) ||
    !string(value["email"]) ||
    !nullableString(value["firstName"]) ||
    !nullableString(value["lastName"]) ||
    !string(value["createdAt"]) ||
    (value["role"] !== "student" && value["role"] !== "admin") ||
    (value["status"] !== "active" && value["status"] !== "suspended")
  )
    throw new Error("Invalid account response");

  const result: Account = {
    id: value["id"],
    email: value["email"],
    role: value["role"],
    firstName: value["firstName"],
    lastName: value["lastName"],
    status: value["status"],
    createdAt: value["createdAt"],
  };
  const student = value["student"];
  if (student !== undefined && student !== null) {
    if (
      !record(student) ||
      !string(student["id"]) ||
      !nullableString(student["matricNumber"]) ||
      !nullableString(student["facultyId"]) ||
      !nullableString(student["departmentId"]) ||
      !nullableString(student["courseOfStudyId"]) ||
      !nullableString(student["academicLevelId"])
    )
      throw new Error("Invalid student profile");
    result.student = {
      id: student["id"],
      matricNumber: student["matricNumber"],
      facultyId: student["facultyId"],
      departmentId: student["departmentId"],
      courseOfStudyId: student["courseOfStudyId"],
      academicLevelId: student["academicLevelId"],
    };
  }
  const admin = value["admin"];
  if (admin !== undefined && admin !== null) {
    if (!record(admin) || !string(admin["id"]))
      throw new Error("Invalid admin profile");
    result.admin = { id: admin["id"] };
  }
  return result;
}

function grant(value: unknown): value is AdminGrant {
  return (
    record(value) &&
    string(value["id"]) &&
    string(value["roleId"]) &&
    string(value["name"]) &&
    nullableString(value["departmentId"]) &&
    strings(value["privileges"]) &&
    (value["systemKey"] === null ||
      value["systemKey"] === "super_admin" ||
      value["systemKey"] === "hod" ||
      value["systemKey"] === "lecturer")
  );
}

export function readAuthorization(value: unknown): AdminAuthorization {
  if (
    record(value) &&
    string(value["adminId"]) &&
    Array.isArray(value["grants"]) &&
    value["grants"].every(grant)
  )
    return { adminId: value["adminId"], grants: value["grants"] };
  throw new Error("Invalid authorization response");
}

export function readError(value: unknown): ErrorPayload | null {
  if (!record(value) || !numeric(value["statusCode"]) || !string(value["message"]))
    return null;
  return {
    statusCode: value["statusCode"],
    message: value["message"],
    ...(strings(value["errors"]) ? { errors: value["errors"] } : {}),
    ...(string(value["requestId"]) ? { requestId: value["requestId"] } : {}),
    ...(string(value["traceId"]) ? { traceId: value["traceId"] } : {}),
  };
}

type CampusLabels = {
  faculties: { id: string; name: string }[];
  departments: { id: string; name: string }[];
  programmes: { id: string; name: string }[];
  levels: { id: string; displayName: string }[];
};

function labels(value: unknown) {
  if (!Array.isArray(value)) throw new Error("Invalid academic reference list");
  return value.map((item: unknown) => {
    if (!record(item) || !string(item["id"]) || !string(item["name"]))
      throw new Error("Invalid academic reference");
    return { id: item["id"], name: item["name"] };
  });
}

export function readCampusLabels(value: unknown): CampusLabels {
  if (!record(value) || !Array.isArray(value["levels"]))
    throw new Error("Invalid academic references");
  return {
    faculties: labels(value["faculties"]),
    departments: labels(value["departments"]),
    programmes: labels(value["programmes"]),
    levels: value["levels"].map((item: unknown) => {
      if (!record(item) || !string(item["id"]) || !string(item["displayName"]))
        throw new Error("Invalid academic level");
      return { id: item["id"], displayName: item["displayName"] };
    }),
  };
}

export function readTeachingOfferings(value: unknown): TeachingOfferings {
  if (!record(value) || !Array.isArray(value["offerings"]))
    throw new Error("Invalid assigned offerings response");
  return {
    offerings: value["offerings"].map((item: unknown) => {
      if (
        !record(item) ||
        !string(item["offeringId"]) ||
        !string(item["courseId"]) ||
        !string(item["code"]) ||
        !string(item["name"]) ||
        !numeric(item["units"]) ||
        !string(item["departmentId"]) ||
        !string(item["semesterId"]) ||
        (item["registrationStatus"] !== "opened" &&
          item["registrationStatus"] !== "closed")
      )
        throw new Error("Invalid assigned offering");
      return {
        offeringId: item["offeringId"],
        courseId: item["courseId"],
        code: item["code"],
        name: item["name"],
        units: item["units"],
        departmentId: item["departmentId"],
        semesterId: item["semesterId"],
        registrationStatus: item["registrationStatus"],
      };
    }),
  };
}

export function readReviewQueue(value: unknown): ReviewQueue {
  if (
    !record(value) ||
    !Array.isArray(value["items"]) ||
    !nullableString(value["nextCursor"])
  )
    throw new Error("Invalid result queue response");
  return {
    nextCursor: value["nextCursor"],
    items: value["items"].map((item: unknown) => {
      if (
        !record(item) ||
        !string(item["id"]) ||
        !string(item["code"]) ||
        !string(item["name"]) ||
        !numeric(item["enrolledCount"]) ||
        !numeric(item["markedCount"]) ||
        (item["status"] !== "pending" &&
          item["status"] !== "submitted" &&
          item["status"] !== "approved" &&
          item["status"] !== "correction_requested")
      )
        throw new Error("Invalid result queue item");
      return {
        id: item["id"],
        code: item["code"],
        name: item["name"],
        status: item["status"],
        enrolledCount: item["enrolledCount"],
        markedCount: item["markedCount"],
      };
    }),
  };
}
