import { useState } from "react";
import { Navigate, useLocation } from "react-router";
import { AuthLayout, AuthSupportLinks, SignInForm } from "@uemp/ui";
import { readableError } from "@uemp/web-client";
import { signIn } from "./api";
import { useAuth } from "./provider";

export function StaffSignIn() {
  const { signedIn } = useAuth();
  const { state } = useLocation();
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const destination =
    state &&
    typeof state.from === "string" &&
    /^\/(overview|workspaces)(\/|$)/.test(state.from)
      ? state.from
      : "/overview";

  async function submit(input: { email: string; password: string }) {
    setPending(true);
    setError(null);
    try {
      await signIn(input);
    } catch (cause) {
      setError(readableError(cause));
    } finally {
      setPending(false);
    }
  }

  if (signedIn) return <Navigate to={destination} replace />;
  return (
    <AuthLayout
      portal="Staff portal"
      title="Staff sign in"
      description="Use your university staff account to open your workspace."
      asideTitle="Teach, review, and administer in one place."
      asideDescription="Your workspace reflects the privileges and departments assigned to your account."
    >
      <SignInForm onSubmit={submit} error={error} pending={pending} />
      <AuthSupportLinks
        otherPortal={{
          href: "https://uemp-student.onrender.com/sign-in",
          label: "Student portal",
        }}
        demoCredentialsHref="https://github.com/DevD1st/uni-edu-portal#demo-access-and-walkthrough"
        backendDocsHref="https://uemp-backend.onrender.com/docs"
        backendNote={
          <>
            Before you continue, open the backend API docs and confirm they load. Use{" "}
            <code>uemp</code> for both the username and password. If Render is waking
            up, wait for the documentation page to load, then return here.
          </>
        }
      />
    </AuthLayout>
  );
}
