import { useState } from "react";
import { Link, Route, Routes, useParams } from "react-router";
import { StaffNotFound } from "../../portal/components/staff-not-found";
import {
  Badge,
  Button,
  DataTable,
  DescriptionList,
  PageHeader,
  ResourceState,
  Surface,
  TextField,
} from "@uemp/ui";
import { isUuid } from "@uemp/api-contracts/response";
import {
  ChoiceField,
  CursorControls,
  StaffResource,
  textField,
} from "../../portal/components/staff-controls";
import { staffPath, useCursor, useStaffResource } from "../../portal/staff-data";

const root = "/workspaces/audit";
const api = "/v1/admin/audit-events";
const categories = ["access", "users", "academic", "results", "operations"];
const outcomes = ["succeeded", "denied", "failed"];
const choices = (values: string[]) =>
  values.map((value) => ({ value, label: value[0]?.toUpperCase() + value.slice(1) }));
const time = (date: string) => new Date(date).toLocaleString();
type Filters = Record<string, string>;

function AuditRecords({ filters }: { filters: Filters }) {
  const cursor = useCursor();
  const resource = useStaffResource(
    staffPath(api, { ...filters, cursor: cursor.value }),
    "AuditEventPageResponseDto",
  );
  return (
    <StaffResource resource={resource} title="audit events">
      {({ items, nextCursor }) => (
        <>
          {items.length ? (
            <DataTable
              caption="Administrative audit events"
              columns={[
                { label: "Action" },
                { label: "Category" },
                { label: "Outcome" },
                { label: "Time" },
              ]}
            >
              {items.map((event) => (
                <tr key={event.id}>
                  <th scope="row">
                    <Link className="u-text-link" to={root + "/" + event.id}>
                      {event.action}
                    </Link>
                  </th>
                  <td>{event.category}</td>
                  <td>
                    <Badge tone={event.outcome === "succeeded" ? "success" : "warning"}>
                      {event.outcome}
                    </Badge>
                  </td>
                  <td>{time(event.occurredAt)}</td>
                </tr>
              ))}
            </DataTable>
          ) : (
            <ResourceState state="empty" title="No audit events match these filters" />
          )}
          <CursorControls cursor={cursor} next={nextCursor} />
        </>
      )}
    </StaffResource>
  );
}

function AuditList() {
  const [filters, setFilters] = useState<Filters>({});
  return (
    <Surface className="u-stack">
      <form
        className="u-stack staff-filter-panel"
        onSubmit={(event) => {
          event.preventDefault();
          const form = new FormData(event.currentTarget);
          const from = textField(form, "from");
          const to = textField(form, "to");
          setFilters({
            category: textField(form, "category"),
            outcome: textField(form, "outcome"),
            action: textField(form, "action"),
            from: from ? new Date(from).toISOString() : "",
            to: to ? new Date(to).toISOString() : "",
          });
        }}
      >
        <div className="staff-fields">
          <ChoiceField
            name="category"
            label="Category"
            emptyLabel="All categories"
            options={choices(categories)}
          />
          <ChoiceField
            name="outcome"
            label="Outcome"
            emptyLabel="All outcomes"
            options={choices(outcomes)}
          />
          <TextField name="action" label="Action" placeholder="result.approve" />
          <TextField name="from" label="From" type="datetime-local" />
          <TextField name="to" label="To" type="datetime-local" />
        </div>
        <div className="u-actions">
          <Button type="submit">Apply filters</Button>
          <Button type="reset" variant="secondary" onClick={() => setFilters({})}>
            Clear filters
          </Button>
        </div>
      </form>
      <AuditRecords key={JSON.stringify(filters)} filters={filters} />
    </Surface>
  );
}

function AuditDetail() {
  const { eventId } = useParams();
  const path = isUuid(eventId) ? api + "/" + eventId : null;
  const resource = useStaffResource(path, "AuditEventResponseDto");
  if (!path)
    return (
      <ResourceState
        state="restricted"
        title="Choose an audit event from the audit trail"
      />
    );
  return (
    <>
      <Link className="u-text-link" to={root}>
        Back to audit trail
      </Link>
      <StaffResource resource={resource} title="audit event">
        {(event) => (
          <>
            <PageHeader title={event.action} description={time(event.occurredAt)} />
            <Surface className="u-stack">
              <DescriptionList
                items={[
                  { label: "Category", value: event.category },
                  { label: "Outcome", value: event.outcome },
                  { label: "Actor account ID", value: event.actorUserId ?? "—" },
                  { label: "Actor staff ID", value: event.actorAdminId ?? "—" },
                  {
                    label: "Target",
                    value: [event.targetType, event.targetId]
                      .filter(Boolean)
                      .join(" · "),
                  },
                  { label: "Reason", value: event.reason ?? "—" },
                  { label: "Request ID", value: event.requestId ?? "—" },
                  { label: "Trace ID", value: event.traceId ?? "—" },
                ]}
              />
              {event.changes && (
                <details className="staff-audit-disclosure">
                  <summary>Changes</summary>
                  <pre className="staff-audit-json">
                    {JSON.stringify(event.changes, null, 2)}
                  </pre>
                </details>
              )}
              {event.metadata && (
                <details className="staff-audit-disclosure">
                  <summary>Metadata</summary>
                  <pre className="staff-audit-json">
                    {JSON.stringify(event.metadata, null, 2)}
                  </pre>
                </details>
              )}
            </Surface>
          </>
        )}
      </StaffResource>
    </>
  );
}

export function AuditWorkspace() {
  return (
    <Routes>
      <Route index element={<AuditList />} />
      <Route path=":eventId" element={<AuditDetail />} />
      <Route
        path="*"
        element={<StaffNotFound to="/workspaces/audit" label="Back to audit trail" />}
      />
    </Routes>
  );
}
