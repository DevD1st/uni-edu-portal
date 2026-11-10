import { redirect } from "next/navigation";
import { DescriptionList, PageHeader, Surface } from "@uemp/ui";
import { studentAccount } from "../../../features/auth/server/session";
import { academicDetails } from "../../../features/portal/server/student-profile";
import { ProfileForm } from "../../../features/account/components/profile-form";

export const metadata = { title: "My profile" };

export default async function AccountPage() {
  const account = await studentAccount();
  if (!account) redirect("/sign-in");
  const academic = await academicDetails(account);
  return (
    <>
      <PageHeader
        eyebrow="My studies"
        title="My profile"
        description="The identity and placement recorded for your account."
      />
      <div className="u-panel-grid">
        <Surface className="u-stack" aria-label="Account details">
          <h2>Account details</h2>
          <DescriptionList
            items={[
              { label: "Email address", value: account.email },
              { label: "Account type", value: "Student" },
            ]}
          />
          <ProfileForm firstName={account.firstName} lastName={account.lastName} />
        </Surface>
        <Surface aria-label="Academic details">
          <h2>Academic details</h2>
          <DescriptionList items={academic} />
        </Surface>
      </div>
    </>
  );
}
