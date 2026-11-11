import type { ReactNode } from "react";
import { DescriptionList } from "@uemp/ui";

export function StaffMetrics({
  items,
  label,
}: {
  items: readonly { label: string; value: ReactNode }[];
  label?: string;
}) {
  return (
    <div className="staff-metrics" {...(label ? { "aria-label": label } : {})}>
      <DescriptionList items={items} />
    </div>
  );
}
