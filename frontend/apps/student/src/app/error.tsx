"use client";

import Link from "next/link";
import { Button, PageHeader, ResourceState, Surface } from "@uemp/ui";

export default function ErrorPage({ reset }: { reset: () => void }) {
  return (
    <main className="student-recovery u-stack">
      <PageHeader
        eyebrow="Student workspace"
        title="We couldn't load the student portal"
        description="Check your connection and try again."
      />
      <Surface>
        <ResourceState
          state="error"
          title="Try loading this page again"
          detail="If the problem continues, return to your overview and choose another page."
          action={
            <div className="u-actions">
              <Button variant="secondary" onClick={reset}>
                Try again
              </Button>
              <Link className="u-text-link" href="/overview">
                Return to overview
              </Link>
            </div>
          }
        />
      </Surface>
    </main>
  );
}
