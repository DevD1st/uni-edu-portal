import { AuthSupportLinks } from "@uemp/ui";

export function StudentReviewLinks() {
  return (
    <AuthSupportLinks
      otherPortal={{
        href: "https://uemp-admin.onrender.com/sign-in",
        label: "Staff / admin portal",
      }}
      demoCredentialsHref="https://github.com/DevD1st/uni-edu-portal#demo-access-and-walkthrough"
      backendDocsHref="https://uemp-backend.onrender.com/docs"
      backendNote={
        <>
          Before you continue, open the backend API docs and confirm they load. Use{" "}
          <code>uemp</code> for both the username and password. If Render is waking up,
          wait for the documentation page to load, then return here.
        </>
      }
    />
  );
}
