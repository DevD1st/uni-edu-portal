import { AuthLayout } from "@uemp/ui";
import { StudentSignIn } from "../../features/auth/sign-in";

export const metadata = { title: "Sign in" };

export default function SignInPage() {
  return (
    <AuthLayout
      portal="Student portal"
      title="Sign in to your account"
      description="Use your student account to access your university workspace."
      asideTitle="Your studies, in one place."
      asideDescription="Keep your academic profile and university information close at hand."
    >
      <StudentSignIn />
    </AuthLayout>
  );
}
