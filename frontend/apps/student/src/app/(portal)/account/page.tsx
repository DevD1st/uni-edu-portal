import { redirect } from "next/navigation";
import { Badge, DescriptionList, PageHeader, Surface } from "@uemp/ui";
import { GraduationCap, UserRound } from "lucide-react";
import { studentAccount } from "../../../features/auth/server/session";
import { academicDetails } from "../../../features/portal/server/student-profile";
import { ProfileForm } from "../../../features/account/components/profile-form";
import { StudentSectionHeading } from "../../../features/portal/components/student-section-heading";

export const metadata = { title: "My profile" };

export default async function AccountPage() {
  const account = await studentAccount();
  if (!account) redirect("/sign-in");
  const academic = academicDetails(account);
  return (
    <>
      <PageHeader
        eyebrow="My studies"
        title="My profile"
        description="The identity and placement recorded for your account."
      />
      <div className="u-panel-grid">
        <Surface className="u-stack" aria-label="Account details">
          <StudentSectionHeading
            title="Account details"
            icon={UserRound}
            description="Manage the name shown on your student profile."
            meta={<Badge>Student account</Badge>}
          />
          <DescriptionList items={[{ label: "Email address", value: account.email }]} />
          <ProfileForm firstName={account.firstName} lastName={account.lastName} />
        </Surface>
        <Surface className="u-stack" aria-label="Academic details">
          <StudentSectionHeading
            title="Academic details"
            icon={GraduationCap}
            description="Your placement and matriculation number are managed by your department."
          />
          <DescriptionList items={academic} />
          <p className="student-card-note">
            If these details need to change, contact your department.
          </p>
        </Surface>
      </div>
    </>
  );
}
