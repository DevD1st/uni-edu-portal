import type { ReactNode } from "react";
import { DescriptionList, ResourceState, Surface } from "@uemp/ui";

export function StaffRecords({
  items,
  empty,
}: {
  items: readonly {
    id: string;
    title: ReactNode;
    details?: { label: string; value: ReactNode }[];
    actions?: ReactNode;
  }[];
  empty: string;
}) {
  if (!items.length) return <ResourceState state="empty" title={empty} />;
  return (
    <ul className="staff-record-grid">
      {items.map(({ id, title, details, actions }) => (
        <li key={id}>
          <Surface className="u-stack staff-record">
            <h3 className="staff-record-title">{title}</h3>
            {details?.length ? <DescriptionList items={details} /> : null}
            {actions && <div className="u-actions staff-record-actions">{actions}</div>}
          </Surface>
        </li>
      ))}
    </ul>
  );
}
