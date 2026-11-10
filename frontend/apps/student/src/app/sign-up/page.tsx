import Link from "next/link";
import { AuthLayout, Banner } from "@uemp/ui";
import { SignupForm } from "../../features/auth/components/signup-form";
import { publicApi } from "../../features/portal/server/student-api";
import { readReferences } from "../../features/auth/signup-contract";

export const metadata = { title: "Create student account" };

export default async function SignupPage() {
  const references = await publicApi()
    .request("/v1/academic-references", readReferences)
    .catch(() => null);
  return (
    <AuthLayout
      portal="Student portal"
      title="Create a student account"
      description="Use an email address you can access."
      asideTitle="Start your university record."
      asideDescription="Your account gives you access to course registration and published results."
    >
      {!references && (
        <Banner tone="warning">
          Academic choices are temporarily unavailable. You can create an account and
          ask your university to assign your placement.
        </Banner>
      )}
      <SignupForm references={references} />
      <p className="mt-4">
        Already have an account?{" "}
        <Link className="u-text-link" href="/sign-in">
          Sign in
        </Link>
      </p>
    </AuthLayout>
  );
}
