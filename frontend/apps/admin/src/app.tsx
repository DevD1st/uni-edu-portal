import { LayoutDashboard, LogOut } from "lucide-react";
import { lazy, Suspense, useState } from "react";
import { Link, Navigate, Outlet, Route, Routes, useLocation } from "react-router";
import { Banner, Button, PageHeader, PortalShell, ResourceState } from "@uemp/ui";
import { readableError } from "@uemp/web-client";
import { permitsSomewhere } from "./features/access/policy";
import { signOut } from "./features/auth/api";
import { AuthProvider, useAuth } from "./features/auth/provider";
import { StaffSignIn } from "./features/auth/sign-in";
import { WorkspaceEntry } from "./features/portal/entry";
import { StaffOverview } from "./features/dashboard/components/staff-overview";
import { StaffErrorBoundary } from "./features/portal/components/staff-error-boundary";
import {
  UnsavedMarksProvider,
  useLeaveStaffPage,
} from "./features/portal/unsaved-marks";
import {
  workspaceGroups,
  workspacePath,
  type Workspace,
} from "./features/portal/workspaces";

const DesignGallery = import.meta.env.DEV
  ? lazy(() =>
      import("./features/portal/gallery").then(({ DesignGallery }) => ({
        default: DesignGallery,
      })),
    )
  : null;

function StaffPortal() {
  const { signedIn, access, error, revalidate } = useAuth();
  const { pathname } = useLocation();
  const requestLeave = useLeaveStaffPage();
  const [signingOut, setSigningOut] = useState(false);
  const [signOutError, setSignOutError] = useState<string | null>(null);

  if (!signedIn) return <Navigate to="/sign-in" state={{ from: pathname }} replace />;

  async function leave() {
    setSignOutError(null);
    setSigningOut(true);
    try {
      await signOut();
    } catch (cause) {
      setSignOutError(readableError(cause));
    } finally {
      setSigningOut(false);
    }
  }

  const groups = access
    ? workspaceGroups
        .map(({ label, items }) => ({
          label,
          items: items
            .filter(({ rule }) => permitsSomewhere(access.authorization.grants, rule))
            .map((workspace) => ({
              href: workspacePath(workspace),
              label: workspace.label,
              icon: workspace.icon,
              active:
                pathname === workspacePath(workspace) ||
                pathname.startsWith(workspacePath(workspace) + "/"),
            })),
        }))
        .filter(({ items }) => items.length)
    : [];
  const name =
    [access?.account.firstName, access?.account.lastName].filter(Boolean).join(" ") ||
    access?.account.email ||
    "Staff workspace";

  return (
    <PortalShell
      portal="Staff portal"
      account={{ name, label: "Staff workspace" }}
      groups={[
        {
          label: "Home",
          items: [
            {
              href: "/overview",
              label: "Overview",
              icon: LayoutDashboard,
              active: pathname === "/overview",
            },
          ],
        },
        ...groups,
      ]}
      link={({ href, className, active, onNavigate, children }) => (
        <Link
          to={href}
          className={className}
          aria-current={active ? "page" : undefined}
          {...(onNavigate ? { onClick: onNavigate } : {})}
        >
          {children}
        </Link>
      )}
      actions={
        <Button
          variant="ghost"
          pending={signingOut}
          onClick={() => requestLeave(leave)}
        >
          <LogOut size={18} aria-hidden /> Sign out
        </Button>
      }
    >
      {signOutError && <Banner tone="danger">{signOutError}</Banner>}
      {access ? (
        <StaffErrorBoundary key={pathname}>
          <Outlet />
        </StaffErrorBoundary>
      ) : (
        <>
          <PageHeader title="Staff workspace" />
          {error ? (
            <ResourceState
              state="error"
              title="We couldn’t load your workspace"
              detail={error}
              action={
                <Button variant="secondary" onClick={revalidate}>
                  Try again
                </Button>
              }
            />
          ) : (
            <ResourceState state="loading" title="Checking your workspace access" />
          )}
        </>
      )}
    </PortalShell>
  );
}

function GuardedWorkspace({ workspace }: { workspace: Workspace }) {
  const { access } = useAuth();
  if (access && permitsSomewhere(access.authorization.grants, workspace.rule)) {
    return <WorkspaceEntry workspace={workspace} />;
  }
  return (
    <>
      <PageHeader title="Access restricted" />
      <ResourceState
        state="restricted"
        title="You don’t have access to this workspace"
        detail="Choose one of the workspaces listed in your overview."
        action={
          <Link className="u-text-link" to="/overview">
            Return to overview
          </Link>
        }
      />
    </>
  );
}

export function App() {
  return (
    <AuthProvider>
      <UnsavedMarksProvider>
        <Routes>
          <Route path="/sign-in" element={<StaffSignIn />} />
          <Route element={<StaffPortal />}>
            <Route index element={<Navigate to="/overview" replace />} />
            <Route path="/overview" element={<StaffOverview />} />
            {DesignGallery && (
              <Route
                path="/design-system"
                element={
                  <Suspense
                    fallback={
                      <ResourceState
                        state="loading"
                        title="Loading the design system"
                      />
                    }
                  >
                    <DesignGallery />
                  </Suspense>
                }
              />
            )}
            {workspaceGroups.flatMap(({ items }) =>
              items.map((workspace) => (
                <Route
                  key={workspace.slug}
                  path={workspacePath(workspace) + (workspace.details ? "/*" : "")}
                  element={<GuardedWorkspace workspace={workspace} />}
                />
              )),
            )}
            <Route
              path="*"
              element={
                <>
                  <PageHeader
                    title="Page not found"
                    description="This page is unavailable. Return to your overview to choose a workspace."
                  />
                  <div className="u-actions">
                    <Link className="u-button" data-variant="secondary" to="/overview">
                      Return to overview
                    </Link>
                  </div>
                </>
              }
            />
          </Route>
        </Routes>
      </UnsavedMarksProvider>
    </AuthProvider>
  );
}
