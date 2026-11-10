import Link from "next/link";
import { ResourceState, Surface } from "@uemp/ui";

export function AcademicTermList({
  title,
  records,
  emptyTitle,
  emptyDetail,
}: {
  title: string;
  records: readonly { href: string; label: string; detail: string }[];
  emptyTitle: string;
  emptyDetail?: string;
}) {
  return (
    <Surface className="u-stack" aria-label={title}>
      <h2>{title}</h2>
      {records.length > 0 ? (
        <ul className="student-record-list">
          {records.map(({ href, label, detail }) => (
            <li key={href}>
              <Link className="u-text-link" href={href} prefetch={false}>
                {label}
              </Link>
              <span>{detail}</span>
            </li>
          ))}
        </ul>
      ) : (
        <ResourceState
          state="empty"
          title={emptyTitle}
          {...(emptyDetail ? { detail: emptyDetail } : {})}
        />
      )}
    </Surface>
  );
}
