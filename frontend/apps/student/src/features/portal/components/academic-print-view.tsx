import Link from "next/link";
import type { ReactNode } from "react";
import { PrintButton } from "./print-button";

export function AcademicPrintView({
  title,
  semesterName,
  academicSession,
  backHref,
  children,
}: {
  title: string;
  semesterName: string;
  academicSession: string;
  backHref: string;
  children: ReactNode;
}) {
  const generatedAt = new Date();
  return (
    <main className="student-print-view u-stack">
      <div className="student-print-actions u-actions">
        <Link href={backHref} className="u-text-link" prefetch={false}>
          Back to {title.toLowerCase()}
        </Link>
        <PrintButton />
      </div>
      <header className="student-print-heading u-stack">
        <p className="u-eyebrow">University Education Management Portal</p>
        <h1>{title}</h1>
        <p>
          {semesterName} · {academicSession}
        </p>
      </header>
      {children}
      <footer className="student-print-footer">
        Generated{" "}
        <time dateTime={generatedAt.toISOString()}>
          {new Intl.DateTimeFormat("en-GB", {
            dateStyle: "long",
            timeStyle: "short",
            timeZone: "Africa/Lagos",
          }).format(generatedAt)}{" "}
          WAT
        </time>
      </footer>
    </main>
  );
}
