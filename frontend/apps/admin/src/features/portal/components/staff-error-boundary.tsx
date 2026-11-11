import { Component, type ReactNode } from "react";
import { Button, PageHeader, ResourceState } from "@uemp/ui";

export function StaffRecovery({
  retry,
  fullPage = false,
}: {
  retry: () => void;
  fullPage?: boolean;
}) {
  const Container = fullPage ? "main" : "div";
  return (
    <Container className={fullPage ? "u-portal-content u-stack" : "u-stack"}>
      <PageHeader title="We couldn’t display this page" />
      <ResourceState
        state="error"
        title="Open the page again"
        detail="Try again, or return to your staff overview to choose another workspace."
        action={
          <div className="u-actions">
            <Button onClick={retry}>Try again</Button>
            <a className="u-text-link" href="/overview">
              Return to overview
            </a>
          </div>
        }
      />
    </Container>
  );
}

export class StaffErrorBoundary extends Component<
  { children: ReactNode; fullPage?: boolean },
  { failed: boolean }
> {
  override state = { failed: false };

  static getDerivedStateFromError() {
    // Rendering errors can include record values; the recovery screen never displays the error object.
    return { failed: true };
  }

  override render() {
    return this.state.failed ? (
      <StaffRecovery
        fullPage={Boolean(this.props.fullPage)}
        retry={() => this.setState({ failed: false })}
      />
    ) : (
      this.props.children
    );
  }
}
