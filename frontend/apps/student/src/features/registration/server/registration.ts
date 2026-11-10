import "server-only";

import { ApiError } from "@uemp/web-client";
import { readStudent, readStudentTerm } from "../../portal/server/student-api";
import {
  readAvailableCourses,
  readRegistrationHistory,
  readRegistrationSummary,
} from "../contracts";

export async function currentAvailability() {
  try {
    return {
      available: await readStudent(
        "/v1/student/registrations/available",
        readAvailableCourses,
      ),
    };
  } catch (error) {
    if (error instanceof ApiError && error.status === 409)
      return { unavailable: error.message };
    throw error;
  }
}

export function registrationHistory() {
  return readStudent("/v1/student/registrations", readRegistrationHistory);
}

export function registrationSummary(semesterId: string) {
  return readStudentTerm(
    semesterId,
    "/v1/student/registrations/" + semesterId,
    readRegistrationSummary,
  );
}
