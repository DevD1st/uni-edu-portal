import { Route, Routes, useNavigate, useParams } from "react-router";
import { DescriptionList, PageHeader, ResourceState, Surface } from "@uemp/ui";
import { isUuid } from "@uemp/api-contracts/response";
import { hasPrivilege, permitsSomewhere } from "../../access/policy";
import { StaffResource } from "../../portal/components/staff-controls";
import { staffPath, useStaffAccess, useStaffResource } from "../../portal/staff-data";
import { PeopleDirectory, accountName, peopleRoot } from "./people-directory";
import { BackToPeople, PersonActions } from "./person-actions";
import { StaffRoleAssignments } from "./staff-role-assignments";
import { StaffNotFound } from "../../portal/components/staff-not-found";

function StudentProfile() {
  const { userId } = useParams();
  const { grants } = useStaffAccess();
  const navigate = useNavigate();
  const path =
    isUuid(userId) && permitsSomewhere(grants, { anyOf: [["read_user"]] })
      ? staffPath("/v1/admin/users/" + userId, { populate: "student" })
      : null;
  const resource = useStaffResource(path, "UserResponseDto");
  const references = useStaffResource(
    path ? "/v1/academic-references" : null,
    "AcademicReferencesResponseDto",
  );
  if (!path)
    return (
      <ResourceState
        state="restricted"
        title="Student records are outside your permissions"
      />
    );
  return (
    <>
      <BackToPeople />
      <StaffResource resource={resource} title="student profile">
        {(student) => {
          if (
            student.role !== "student" ||
            !hasPrivilege(grants, "read_user", student.student?.departmentId ?? null)
          )
            return (
              <ResourceState
                state="restricted"
                title="Student record is outside your permissions"
              />
            );
          const placement = student.student;
          const data = references.data;
          return (
            <>
              <PageHeader title={accountName(student)} />
              <Surface className="u-stack">
                <DescriptionList
                  items={[
                    { label: "Email address", value: student.email },
                    { label: "Status", value: student.status },
                    {
                      label: "Matriculation number",
                      value: placement?.matricNumber ?? "Pending assignment",
                    },
                    {
                      label: "Faculty",
                      value:
                        data?.faculties.find(({ id }) => id === placement?.facultyId)
                          ?.name ?? "—",
                    },
                    {
                      label: "Department",
                      value:
                        data?.departments.find(
                          ({ id }) => id === placement?.departmentId,
                        )?.name ?? "—",
                    },
                    {
                      label: "Programme",
                      value:
                        data?.programmes.find(
                          ({ id }) => id === placement?.courseOfStudyId,
                        )?.name ?? "—",
                    },
                    {
                      label: "Academic level",
                      value:
                        data?.levels.find(({ id }) => id === placement?.academicLevelId)
                          ?.displayName ?? "—",
                    },
                  ]}
                />
                <PersonActions
                  person={student}
                  student={placement ?? null}
                  updated={(deleted) =>
                    deleted ? void navigate(peopleRoot) : resource.reload()
                  }
                />
              </Surface>
            </>
          );
        }}
      </StaffResource>
    </>
  );
}

function StaffProfile() {
  const { adminId } = useParams();
  const { grants } = useStaffAccess();
  const navigate = useNavigate();
  const path =
    isUuid(adminId) && permitsSomewhere(grants, { anyOf: [["read_admin"]] })
      ? staffPath("/v1/admin/admins/" + adminId, { populate: "user roles" })
      : null;
  const resource = useStaffResource(path, "AdminResponseDto");
  if (!path)
    return (
      <ResourceState
        state="restricted"
        title="Staff records are outside your permissions"
      />
    );
  return (
    <>
      <BackToPeople />
      <StaffResource resource={resource} title="staff profile">
        {(admin) => (
          <>
            <PageHeader
              title={admin.user ? accountName(admin.user) : "Staff account"}
            />
            <Surface className="u-stack">
              <DescriptionList
                items={[
                  { label: "Email address", value: admin.user?.email ?? "Unavailable" },
                  { label: "Status", value: admin.user?.status ?? "Unavailable" },
                ]}
              />
              {admin.user && (
                <PersonActions
                  person={admin.user}
                  editStaff={
                    Boolean(admin.canUpdateProfile) ||
                    hasPrivilege(grants, "update_user", null)
                  }
                  updated={(deleted) =>
                    deleted ? void navigate(peopleRoot) : resource.reload()
                  }
                />
              )}
            </Surface>
            <StaffRoleAssignments admin={admin} updated={resource.reload} />
          </>
        )}
      </StaffResource>
    </>
  );
}

export function PeopleWorkspace() {
  return (
    <Routes>
      <Route index element={<PeopleDirectory />} />
      <Route path="students/:userId" element={<StudentProfile />} />
      <Route path="staff/:adminId" element={<StaffProfile />} />
      <Route
        path="*"
        element={<StaffNotFound to={peopleRoot} label="Back to accounts" />}
      />
    </Routes>
  );
}
