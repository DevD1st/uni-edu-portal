import { Badge } from "@uemp/ui";

export function AccountStatus({ status }: { status: string }) {
  const labels: Record<string, string> = {
    active: "Active",
    suspended: "Suspended",
    deleted: "Deleted",
    inactive: "Inactive",
  };
  return (
    <Badge
      tone={
        status === "active" ? "success" : status === "suspended" ? "warning" : "neutral"
      }
    >
      {labels[status] ?? "Unavailable"}
    </Badge>
  );
}
