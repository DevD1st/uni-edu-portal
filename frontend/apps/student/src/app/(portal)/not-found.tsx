import Link from "next/link";
import { PageHeader, Surface } from "@uemp/ui";

export default function StudentRecordNotFound() {
  return (
    <>
      <PageHeader
        title="Record not found"
        description="This record is unavailable for your student account."
      />
      <Surface className="u-actions">
        <Link href="/registration" className="u-text-link">
          Course registration
        </Link>
        <Link href="/results" className="u-text-link">
          Results
        </Link>
      </Surface>
    </>
  );
}
