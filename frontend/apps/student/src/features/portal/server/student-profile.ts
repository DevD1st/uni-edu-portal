import "server-only";

import type { Account } from "@uemp/api-contracts";

export function accountName(account: Account) {
  return (
    [account.firstName, account.lastName].filter(Boolean).join(" ") || account.email
  );
}

export function academicDetails(account: Account) {
  const profile = account.student;
  // The authenticated profile retains assigned labels after records leave signup choices.
  return [
    {
      label: "Matriculation number",
      value: profile?.matricNumber ?? "Pending assignment",
    },
    {
      label: "Faculty",
      value: profile?.facultyName ?? "Unavailable",
    },
    {
      label: "Department",
      value: profile?.departmentName ?? "Unavailable",
    },
    {
      label: "Programme",
      value: profile?.programmeName ?? "Unavailable",
    },
    {
      label: "Academic level",
      value: profile?.academicLevelDisplayName ?? "Unavailable",
    },
  ];
}
