import { Link } from "react-router";
import { ResourceState } from "@uemp/ui";

export function StaffNotFound({ to, label }: { to: string; label: string }) {
  return (
    <ResourceState
      state="empty"
      title="Page not found"
      detail="This staff page is unavailable. Return to the workspace to choose a record."
      action={
        <Link className="u-text-link" to={to}>
          {label}
        </Link>
      }
    />
  );
}
