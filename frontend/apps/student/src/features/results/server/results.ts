import "server-only";

import { readStudent, readStudentTerm } from "../../portal/server/student-api";
import { readResultHistory, readResultStatement } from "../contracts";

export function resultHistory() {
  return readStudent("/v1/student/results", readResultHistory);
}

export function resultStatement(semesterId: string) {
  return readStudentTerm(
    semesterId,
    "/v1/student/results/" + semesterId,
    readResultStatement,
  );
}
