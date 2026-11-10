import Link from "next/link";
import { AuthLayout, Banner } from "@uemp/ui";
import { StudentSignIn } from "../../features/auth/components/sign-in-form";

export const metadata = { title: "Sign in" };

export default async function SignInPage({ searchParams }: PageProps<"/sign-in">) {
  const { created } = await searchParams;
  return (
    <AuthLayout
      portal="Student portal"
      title="Sign in to your account"
      description="Use your student account to access your university workspace."
      asideTitle="Your studies, in one place."
      asideDescription="Keep your academic profile and university information close at hand."
    >
      {created === "1" && (
        <Banner tone="success">
          Your account is ready. Sign in with your email and password.
        </Banner>
      )}
      <StudentSignIn />
      <p className="mt-4">
        New student?{" "}
        <Link className="u-text-link" href="/sign-up">
          Create an account
        </Link>
      </p>
    </AuthLayout>
  );
}
