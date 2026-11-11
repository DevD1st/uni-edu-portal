import Link from "next/link";
import { ArrowUpRight, CalendarDays, History } from "lucide-react";
import { Badge, ResourceState, Surface } from "@uemp/ui";
import { StudentSectionHeading } from "./student-section-heading";

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
      <StudentSectionHeading
        title={title}
        icon={History}
        description="Open a semester to view its full record and print a copy."
        meta={
          records.length > 0 ? (
            <Badge>
              {records.length} {records.length === 1 ? "semester" : "semesters"}
            </Badge>
          ) : undefined
        }
      />
      {records.length > 0 ? (
        <ul className="student-record-list">
          {records.map(({ href, label, detail }) => (
            <li key={href}>
              <Link className="student-term-link" href={href} prefetch={false}>
                <span className="student-term-icon">
                  <CalendarDays size={19} aria-hidden />
                </span>
                <span className="student-term-copy">
                  <strong>{label}</strong>
                  <span>{detail}</span>
                </span>
                <ArrowUpRight className="student-term-arrow" size={18} aria-hidden />
              </Link>
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
