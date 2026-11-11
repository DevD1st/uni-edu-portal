import { useLocation } from "react-router";
import { PageHeader } from "@uemp/ui";
import { AcademicWorkspace } from "../academics/components/academic-workspace";
import { AuditWorkspace } from "../audit/components/audit-workspace";
import { PeopleWorkspace } from "../people/components/people-workspace";
import { RegistrationWorkspace } from "../registration/components/registration-workspace";
import { ReportWorkspace } from "../reporting/components/report-workspace";
import { ReviewWorkspace } from "../review/components/review-workspace";
import { RolesWorkspace } from "../roles/components/roles-workspace";
import { TeachingWorkspace } from "../teaching/components/teaching-workspace";
import { workspacePath, type Workspace } from "./workspaces";

const views = {
  teaching: TeachingWorkspace,
  "result-review": ReviewWorkspace,
  academics: AcademicWorkspace,
  registration: RegistrationWorkspace,
  reports: ReportWorkspace,
  accounts: PeopleWorkspace,
  roles: RolesWorkspace,
  audit: AuditWorkspace,
};

export function WorkspaceEntry({ workspace }: { workspace: Workspace }) {
  const { pathname } = useLocation();
  const View = views[workspace.slug];
  return (
    <>
      {pathname.replace(/\/$/, "") === workspacePath(workspace) && (
        <PageHeader title={workspace.label} />
      )}
      <View />
    </>
  );
}
