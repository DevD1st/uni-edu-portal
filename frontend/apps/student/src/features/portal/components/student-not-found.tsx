import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { PageHeader, ResourceState, Surface } from "@uemp/ui";

export function StudentNotFound() {
  return (
    <>
      <PageHeader
        eyebrow="Student records"
        title="Record not found"
        description="This page or record is unavailable for your student account."
      />
      <Surface>
        <ResourceState
          state="empty"
          title="Let's get you back to your studies"
          detail="Choose a saved semester from your registration history or results."
          action={
            <div className="u-actions">
              <Link href="/registration" className="u-button" data-variant="secondary">
                Course registration <ArrowRight size={16} aria-hidden />
              </Link>
              <Link href="/results" className="u-text-link">
                Results
              </Link>
            </div>
          }
        />
      </Surface>
    </>
  );
}
