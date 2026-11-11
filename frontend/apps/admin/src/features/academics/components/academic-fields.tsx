import { TextField } from "@uemp/ui";
import { ChoiceField, type Choice } from "../../portal/components/staff-controls";
import type { Dto } from "@uemp/api-contracts/response";

export const programTypes = [
  { value: "undergrad", label: "Undergraduate" },
  { value: "postgrad", label: "Postgraduate" },
  { value: "masters", label: "Master’s" },
  { value: "doctorate", label: "Doctorate" },
] as const;
type Status = "active" | "inactive";

export function StatusField({ value = "active" }: { value?: Status }) {
  return (
    <ChoiceField
      name="status"
      label="Status"
      emptyLabel={null}
      defaultValue={value}
      options={[
        { value: "active", label: "Active" },
        { value: "inactive", label: "Inactive" },
      ]}
      required
    />
  );
}

export function NameField({
  label,
  value,
  maxLength = 160,
}: {
  label: string;
  value?: string | undefined;
  maxLength?: number;
}) {
  return (
    <TextField
      name="name"
      label={label}
      defaultValue={value}
      maxLength={maxLength}
      required
    />
  );
}

export function semesterOptions(data: Dto<"AcademicSetupResponseDto">): Choice[] {
  return data.semesters.map(({ id, name, academicSessionId }) => {
    const session = data.sessions.find((item) => item.id === academicSessionId);
    return {
      value: id,
      label: session ? name + " · " + session.startYear + "/" + session.endYear : name,
    };
  });
}

export function recordName(items: readonly { id: string; name: string }[], id: string) {
  return items.find((item) => item.id === id)?.name ?? "Unavailable";
}

export const statusLabel = (status: Status) =>
  status === "active" ? "Active" : "Inactive";
