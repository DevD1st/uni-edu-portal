"use client";

import { Button, ResourceState } from "@uemp/ui";

export default function ErrorPage({ reset }: { reset: () => void }) {
  return (
    <main className="u-portal-content">
      <ResourceState
        state="error"
        title="We couldn't load the student portal"
        detail="Check your connection and try again."
        action={
          <Button variant="secondary" onClick={reset}>
            Try again
          </Button>
        }
      />
    </main>
  );
}
