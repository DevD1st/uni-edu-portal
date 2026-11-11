import Link from "next/link";
import { Suspense } from "react";
import { redirect } from "next/navigation";
import { Badge, DescriptionList, PageHeader, ResourceState, Surface } from "@uemp/ui";
import { studentAccount } from "../../../features/auth/server/session";
import { academicDetails } from "../../../features/portal/server/student-profile";
import {
  RegistrationDashboard,
  ResultsDashboard,
} from "../../../features/dashboard/components/student-summary";

export const metadata = { title: "Overview" };

export default async function Overview() {
  const account = await studentAccount();
  if (!account) redirect("/sign-in");
  const academic = await academicDetails(account);
  return (
    <>
      <PageHeader
        eyebrow="My studies"
        title={account.firstName ? "Welcome, " + account.firstName : "Student overview"}
        description="Your registration, published results, and university profile in one place."
      />
      <div className="u-panel-grid">
        <Suspense
          fallback={
            <Surface>
              <ResourceState state="loading" title="Loading registration summary" />
            </Surface>
          }
        >
          <RegistrationDashboard />
        </Suspense>
        <Suspense
          fallback={
            <Surface>
              <ResourceState state="loading" title="Loading results summary" />
            </Surface>
          }
        >
          <ResultsDashboard />
        </Suspense>
        <Surface aria-label="Academic placement">
          <Badge tone="info">Student record</Badge>
          <h2 className="mt-3">Academic placement</h2>
          <DescriptionList items={academic} />
        </Surface>
        <Surface aria-label="Student account">
          <Badge tone={account.status === "active" ? "success" : "warning"}>
            {account.status === "active" ? "Active account" : "Suspended account"}
          </Badge>
          <h2 className="mt-3">Your account</h2>
          <p className="u-muted mt-2">
            Check the name and email linked to your university profile.
          </p>
          <Link href="/account" className="u-text-link mt-4 inline-block">
            View my profile
          </Link>
        </Surface>
      </div>
    </>
  );
}
