import "server-only";

import { readCampusLabels, type Account } from "@uemp/api-contracts";
import { createApiClient } from "@uemp/web-client";
import { studentConfig } from "../../auth/server/config";

export function accountName(account: Account) {
  return (
    [account.firstName, account.lastName].filter(Boolean).join(" ") || account.email
  );
}

export async function academicDetails(account: Account) {
  const profile = account.student;
  const api = createApiClient({ baseUrl: studentConfig().api.origin, timeoutMs: 3000 });
  const reference = await api
    .request("/v1/academic-references", readCampusLabels)
    .catch(() => null);
  return [
    {
      label: "Matriculation number",
      value: profile?.matricNumber ?? "Pending assignment",
    },
    {
      label: "Faculty",
      value:
        reference?.faculties.find(({ id }) => id === profile?.facultyId)?.name ??
        "Unavailable",
    },
    {
      label: "Department",
      value:
        reference?.departments.find(({ id }) => id === profile?.departmentId)?.name ??
        "Unavailable",
    },
    {
      label: "Programme",
      value:
        reference?.programmes.find(({ id }) => id === profile?.courseOfStudyId)?.name ??
        "Unavailable",
    },
    {
      label: "Academic level",
      value:
        reference?.levels.find(({ id }) => id === profile?.academicLevelId)
          ?.displayName ?? "Unavailable",
    },
  ];
}
