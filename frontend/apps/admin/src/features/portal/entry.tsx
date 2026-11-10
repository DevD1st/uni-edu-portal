import { useEffect, useState } from "react";
import {
  Badge,
  Button,
  DataTable,
  PageHeader,
  Pagination,
  ResourceState,
  SelectField,
  Surface,
} from "@uemp/ui";
import { readReviewQueue, readTeachingOfferings } from "@uemp/api-contracts";
import { ApiError, readableError } from "@uemp/web-client";
import { permits, reviewRule } from "../access/policy";
import { loadDepartmentLabels, staffApi } from "../auth/api";
import { useAuth } from "../auth/provider";
import type { Workspace } from "./workspaces";

type Resource<T> =
  | { key: string; value: T; error?: never }
  | { key: string; error: string; value?: never };

function useResource<T>(key: string, load: (signal: AbortSignal) => Promise<T>) {
  const [resource, setResource] = useState<Resource<T>>();
  const [attempt, setAttempt] = useState(0);
  const { revalidate } = useAuth();
  useEffect(() => {
    if (!key) return;
    const controller = new AbortController();
    void load(controller.signal).then(
      (value) => {
        if (!controller.signal.aborted) setResource({ key, value });
      },
      (error: unknown) => {
        if (controller.signal.aborted) return;
        setResource({ key, error: readableError(error) });
        if (
          error instanceof ApiError &&
          (error.status === 401 || error.status === 403)
        ) {
          // Refresh the grants if the API denies a request the shell expected to allow.
          revalidate();
        }
      },
    );
    return () => controller.abort();
    // The key identifies the exact resource, including route arguments.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key, attempt]);
  const current = resource?.key === key ? resource : undefined;
  return {
    value: current?.value,
    error: current?.error,
    retry: () => {
      setResource(undefined);
      setAttempt((value) => value + 1);
    },
  };
}

function listTeaching(signal: AbortSignal) {
  return staffApi.request("/v1/lecturer/offerings", readTeachingOfferings, {
    authenticated: true,
    signal,
  });
}

function Teaching() {
  const { value, error, retry } = useResource("teaching", listTeaching);
  if (error) return <RequestError error={error} retry={retry} />;
  if (!value)
    return <ResourceState state="loading" title="Loading your course offerings" />;
  if (!value.offerings.length)
    return <ResourceState state="empty" title="No course offerings assigned" />;
  return (
    <DataTable
      caption="Your course offerings"
      columns={[
        { label: "Code" },
        { label: "Course" },
        { label: "Units", numeric: true },
        { label: "Registration" },
      ]}
    >
      {value.offerings.map((offering) => (
        <tr key={offering.offeringId}>
          <th scope="row">{offering.code}</th>
          <td>{offering.name}</td>
          <td data-numeric>{offering.units}</td>
          <td>
            <Badge
              tone={offering.registrationStatus === "opened" ? "success" : "neutral"}
            >
              {offering.registrationStatus === "opened" ? "Open" : "Closed"}
            </Badge>
          </td>
        </tr>
      ))}
    </DataTable>
  );
}

function RequestError({ error, retry }: { error: string; retry: () => void }) {
  return (
    <ResourceState
      state="error"
      title="We couldn’t load this workspace"
      detail={error}
      action={
        <Button variant="secondary" onClick={retry}>
          Try again
        </Button>
      }
    />
  );
}

const resultLabel = {
  pending: "Pending",
  submitted: "Submitted",
  approved: "Approved",
  correction_requested: "Corrections requested",
};

function Queue({ department }: { department: string }) {
  const [cursors, setCursors] = useState<string[]>([]);
  const cursor = cursors.at(-1);
  const { value, error, retry } = useResource(
    department + ":" + (cursor ?? ""),
    (signal) => {
      const query = new URLSearchParams({ departmentId: department });
      if (cursor) query.set("cursor", cursor);
      return staffApi.request("/v1/admin/results?" + query, readReviewQueue, {
        authenticated: true,
        signal,
      });
    },
  );
  if (error) return <RequestError error={error} retry={retry} />;
  const next = value?.nextCursor;
  return (
    <>
      {!value ? (
        <ResourceState state="loading" title="Loading submitted results" />
      ) : value.items.length === 0 ? (
        <ResourceState state="empty" title="No submitted results to show" />
      ) : (
        <DataTable
          caption="Departmental results"
          columns={[
            { label: "Code" },
            { label: "Course" },
            { label: "Status" },
            { label: "Enrolled", numeric: true },
            { label: "Marked", numeric: true },
          ]}
        >
          {value.items.map((item) => (
            <tr key={item.id}>
              <th scope="row">{item.code}</th>
              <td>{item.name}</td>
              <td>
                <Badge tone={item.status === "approved" ? "success" : "neutral"}>
                  {resultLabel[item.status]}
                </Badge>
              </td>
              <td data-numeric>{item.enrolledCount}</td>
              <td data-numeric>{item.markedCount}</td>
            </tr>
          ))}
        </DataTable>
      )}
      {(next || cursor) && (
        <Pagination
          label={"Page " + (cursors.length + 1)}
          busy={!value}
          {...(cursor ? { previous: () => setCursors(cursors.slice(0, -1)) } : {})}
          {...(next ? { next: () => setCursors([...cursors, next]) } : {})}
        />
      )}
    </>
  );
}

function Review() {
  const { access } = useAuth();
  const { value, error, retry } = useResource("departments", loadDepartmentLabels);
  const [selected, setSelected] = useState("");
  if (error) return <RequestError error={error} retry={retry} />;
  if (!value || !access)
    return <ResourceState state="loading" title="Loading your departments" />;
  const departments = value.departments.filter(({ id }) =>
    permits(access.authorization.grants, reviewRule, id),
  );
  const department =
    departments.find(({ id }) => id === selected)?.id ?? departments[0]?.id;
  if (!department)
    return <ResourceState state="empty" title="No departments available to review" />;
  return (
    <div className="u-stack">
      <SelectField
        label="Department"
        value={department}
        onChange={(event) => setSelected(event.target.value)}
      >
        {departments.map(({ id, name }) => (
          <option key={id} value={id}>
            {name}
          </option>
        ))}
      </SelectField>
      <Queue key={department} department={department} />
    </div>
  );
}

export function WorkspaceEntry({ workspace }: { workspace: Workspace }) {
  return (
    <>
      <PageHeader
        eyebrow="Staff workspace"
        title={workspace.label}
        description={workspace.description}
      />
      <Surface>
        {workspace.slug === "teaching" ? (
          <Teaching />
        ) : workspace.slug === "result-review" ? (
          <Review />
        ) : (
          <ResourceState
            state="empty"
            title="This workspace is ready for its next phase"
            detail="You have access to this area. Its tools will appear here as they are added."
          />
        )}
      </Surface>
    </>
  );
}
