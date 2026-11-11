import Link from "next/link";
import { Suspense } from "react";
import { redirect } from "next/navigation";
import { ArrowRight, GraduationCap, UserRound } from "lucide-react";
import {
  Badge,
  Banner,
  DescriptionList,
  PageHeader,
  ResourceState,
  Surface,
} from "@uemp/ui";
import { studentAccount } from "../../../features/auth/server/session";
import { academicDetails } from "../../../features/portal/server/student-profile";
import { StudentSectionHeading } from "../../../features/portal/components/student-section-heading";
import {
  RegistrationDashboard,
  ResultsDashboard,
} from "../../../features/dashboard/components/student-summary";

export const metadata = { title: "Overview" };

export default async function Overview() {
  const account = await studentAccount();
  if (!account) redirect("/sign-in");
  const academic = academicDetails(account);
  const placement = account.student;
  const needsPlacement =
    !placement?.facultyId ||
    !placement.departmentId ||
    !placement.courseOfStudyId ||
    !placement.academicLevelId;
  return (
    <>
      <PageHeader
        eyebrow="My studies"
        title={account.firstName ? "Welcome, " + account.firstName : "Student overview"}
        description="Your registration, published results, and university profile in one place."
      />
      <div className="student-overview-grid">
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
        <Surface className="u-stack" aria-label="Academic placement">
          <StudentSectionHeading
            title="Academic placement"
            icon={GraduationCap}
            description="The university details linked to your student account."
          />
          <DescriptionList items={academic} />
          {needsPlacement && (
            <Banner tone="warning">
              Ask your department to complete your academic placement before registering
              for courses.
            </Banner>
          )}
        </Surface>
        <Surface className="u-stack" aria-label="Student account">
          <StudentSectionHeading
            title="Your account"
            icon={UserRound}
            description="Keep your personal details up to date."
          />
          <div>
            <Badge tone={account.status === "active" ? "success" : "warning"}>
              {account.status === "active" ? "Active account" : "Suspended account"}
            </Badge>
          </div>
          <DescriptionList items={[{ label: "Email address", value: account.email }]} />
          <Link href="/account" className="student-card-action u-text-link">
            View my profile <ArrowRight size={17} aria-hidden />
          </Link>
        </Surface>
      </div>
    </>
  );
}
