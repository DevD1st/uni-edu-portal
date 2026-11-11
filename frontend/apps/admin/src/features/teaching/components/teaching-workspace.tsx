import { useState } from "react";
import { Link, Route, Routes, useParams } from "react-router";
import { Badge, Button, DataTable, PageHeader, ResourceState, Surface } from "@uemp/ui";
import { isUuid, type Dto } from "@uemp/api-contracts/response";
import { hasPrivilege } from "../../access/policy";
import {
  ActionNotice,
  CursorControls,
  StaffDialog,
  StaffResource,
} from "../../portal/components/staff-controls";
import {
  staffPath,
  useCursor,
  useStaffAccess,
  useStaffAction,
  useStaffResource,
  writeStaff,
} from "../../portal/staff-data";
import { TeachingMarks } from "./teaching-marks";
import { StaffNotFound } from "../../portal/components/staff-not-found";
import { studentLabel } from "./result-marks";

const root = "/workspaces/teaching";
const offeringsPath = "/v1/lecturer/offerings";
type Offering = Dto<"TeachingOfferingDto">;

function Offerings() {
  const resource = useStaffResource(offeringsPath, "TeachingOfferingsResponseDto");
  return (
    <Surface>
      <StaffResource resource={resource} title="assigned course offerings">
        {({ offerings }) =>
          offerings.length ? (
            <DataTable
              caption="Your course offerings"
              columns={[
                { label: "Code" },
                { label: "Course" },
                { label: "Units", numeric: true },
                { label: "Registration" },
              ]}
            >
              {offerings.map((offering) => (
                <tr key={offering.offeringId}>
                  <th scope="row">
                    <Link className="u-text-link" to={root + "/" + offering.offeringId}>
                      {offering.code}
                    </Link>
                  </th>
                  <td>{offering.name}</td>
                  <td data-numeric>{offering.units}</td>
                  <td>
                    <Badge
                      tone={
                        offering.registrationStatus === "opened" ? "success" : "neutral"
                      }
                    >
                      {offering.registrationStatus === "opened" ? "Open" : "Closed"}
                    </Badge>
                  </td>
                </tr>
              ))}
            </DataTable>
          ) : (
            <ResourceState state="empty" title="No course offerings assigned" />
          )
        }
      </StaffResource>
    </Surface>
  );
}

function Roster({ offering }: { offering: Offering }) {
  const { grants } = useStaffAccess();
  const cursor = useCursor();
  const path = offeringsPath + "/" + offering.offeringId;
  const resource = useStaffResource(
    staffPath(path + "/roster", { cursor: cursor.value }),
    "RegistrationRosterResponseDto",
  );
  const action = useStaffAction();
  const [confirm, setConfirm] = useState(false);
  const [closed, setClosed] = useState(false);
  const [dirty, setDirty] = useState(false);
  const [tab, setTab] = useState<"roster" | "marks">("roster");
  const opened = !closed && offering.registrationStatus === "opened";
  return (
    <div className="u-stack">
      <Link className="u-text-link" to={root}>
        Back to my teaching
      </Link>
      <PageHeader title={offering.code + " · " + offering.name} />
      <Surface className="u-stack">
        <StaffResource resource={resource} title="class roster">
          {(roster) => {
            const resultGroupId = roster.items[0]?.resultGroupId;
            return (
              <>
                <div className="staff-filter-tabs">
                  <Button
                    variant={tab === "roster" ? "primary" : "secondary"}
                    aria-pressed={tab === "roster"}
                    onClick={() => setTab("roster")}
                  >
                    Class roster
                  </Button>
                  {resultGroupId && (
                    <Button
                      variant={tab === "marks" ? "primary" : "secondary"}
                      aria-pressed={tab === "marks"}
                      onClick={() => setTab("marks")}
                    >
                      Marks
                    </Button>
                  )}
                </div>
                <div hidden={tab === "marks"} className="u-stack staff-tab-panel">
                  <div className="u-actions">
                    <h2>Class roster</h2>
                    <Badge tone={opened ? "success" : "neutral"}>
                      Registration {opened ? "open" : "closed"}
                    </Badge>
                  </div>
                  {!confirm && (
                    <ActionNotice error={action.error} success={action.success} />
                  )}
                  {roster.items.length ? (
                    <DataTable
                      caption="Enrolled students"
                      columns={[
                        { label: "Student" },
                        { label: "Matriculation number" },
                      ]}
                    >
                      {roster.items.map((row) => (
                        <tr key={row.id}>
                          <th scope="row">{studentLabel(row)}</th>
                          <td>{row.matricNumber ?? "—"}</td>
                        </tr>
                      ))}
                    </DataTable>
                  ) : (
                    <ResourceState
                      state="empty"
                      title="No students registered on this page"
                    />
                  )}
                  {/* Changing the roster page remounts its marks panel, so keep drafts on this page. */}
                  <CursorControls
                    cursor={cursor}
                    next={roster.nextCursor}
                    disabled={dirty}
                  />
                  {opened &&
                    resultGroupId &&
                    hasPrivilege(grants, "teach_course", offering.departmentId) && (
                      <div>
                        {dirty && (
                          <p className="u-muted">
                            Save or discard your marks before closing registration.
                          </p>
                        )}
                        <Button
                          variant="secondary"
                          disabled={dirty}
                          onClick={() => setConfirm(true)}
                        >
                          Close registration
                        </Button>
                      </div>
                    )}
                </div>
                {resultGroupId && (
                  <div hidden={tab !== "marks"} className="staff-tab-panel">
                    <TeachingMarks
                      registrationClosed={!opened}
                      dirty={dirty}
                      onDirty={setDirty}
                      groupId={resultGroupId}
                      offeringId={offering.offeringId}
                      departmentId={offering.departmentId}
                    />
                  </div>
                )}
                {confirm && (
                  <StaffDialog
                    title="Close course registration"
                    label="Close registration"
                    danger
                    close={() => setConfirm(false)}
                    pending={action.pending}
                    error={action.error}
                    submit={() => {
                      void action.run(
                        () =>
                          writeStaff(
                            path + "/close-registration",
                            "POST",
                            "RosterClosureResponseDto",
                            {},
                          ),
                        "Registration closed.",
                        () => {
                          setClosed(true);
                          setConfirm(false);
                          resource.reload();
                        },
                      );
                    }}
                  >
                    <p>
                      Closing this roster is permanent. Students will no longer be able
                      to register for this offering.
                    </p>
                  </StaffDialog>
                )}
              </>
            );
          }}
        </StaffResource>
      </Surface>
    </div>
  );
}

function AssignedRoster() {
  const { offeringId } = useParams();
  const { grants } = useStaffAccess();
  const resource = useStaffResource(
    isUuid(offeringId) ? offeringsPath : null,
    "TeachingOfferingsResponseDto",
  );
  if (!isUuid(offeringId))
    return (
      <ResourceState state="restricted" title="Choose a course from My teaching" />
    );
  return (
    <StaffResource resource={resource} title="teaching assignment">
      {({ offerings }) => {
        const offering = offerings.find(
          (item) =>
            item.offeringId === offeringId &&
            hasPrivilege(grants, "teach_course", item.departmentId),
        );
        return offering ? (
          <Roster key={offeringId} offering={offering} />
        ) : (
          <ResourceState
            state="restricted"
            title="This roster is outside your teaching assignment"
          />
        );
      }}
    </StaffResource>
  );
}

export function TeachingWorkspace() {
  return (
    <Routes>
      <Route index element={<Offerings />} />
      <Route path=":offeringId" element={<AssignedRoster />} />
      <Route
        path="*"
        element={<StaffNotFound to={root} label="Back to my teaching" />}
      />
    </Routes>
  );
}
