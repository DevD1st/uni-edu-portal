import { useState } from "react";
import {
  Badge,
  Banner,
  Button,
  Checkbox,
  DataTable,
  DescriptionList,
  Dialog,
  PageHeader,
  Pagination,
  ResourceState,
  SelectField,
  Surface,
  TextField,
} from "@uemp/ui";
import { StaffMetrics } from "./components/staff-metrics";

export function DesignGallery() {
  const [open, setOpen] = useState(false);
  return (
    <>
      <PageHeader
        eyebrow="Development"
        title="Design system"
        description="Shared components and their common states."
      />
      <div className="u-panel-grid">
        <Surface className="u-stack" aria-label="Form controls">
          <h2>Form controls</h2>
          <TextField
            label="Course title"
            hint="Use the title shown in the course catalog."
          />
          <TextField
            label="Course code"
            defaultValue="CS"
            error="Enter the full course code."
          />
          <SelectField label="Academic level">
            <option>100 level</option>
            <option>200 level</option>
          </SelectField>
          <Checkbox label="Show assigned courses only" />
          <div className="u-actions">
            <Button onClick={() => setOpen(true)}>Open example dialog</Button>
            <Button variant="secondary" disabled>
              Disabled action
            </Button>
            <Button pending>Saving changes</Button>
          </div>
        </Surface>
        <Surface className="u-stack" aria-label="Feedback">
          <h2>Feedback</h2>
          <div className="u-actions">
            <Badge>Draft</Badge>
            <Badge tone="info">Submitted</Badge>
            <Badge tone="warning">Corrections requested</Badge>
            <Badge tone="success">Published</Badge>
          </div>
          <Banner tone="success">The roster was saved.</Banner>
          <ResourceState
            state="empty"
            title="No course offerings"
            detail="Choose a different department or semester."
          />
        </Surface>
      </div>
      <div className="u-panel-grid">
        <Surface className="u-stack" aria-label="Action hierarchy">
          <h2>Action hierarchy</h2>
          <p className="u-muted">
            Use a clear primary action and reserve danger styling for destructive
            decisions.
          </p>
          <div className="u-actions">
            <Button>Save changes</Button>
            <Button variant="secondary">Cancel</Button>
            <Button variant="ghost">Refresh</Button>
            <Button variant="danger">Delete record</Button>
          </div>
          <DescriptionList
            items={[
              { label: "Academic session", value: "2026/2027" },
              { label: "Department", value: "Computer Science" },
            ]}
          />
        </Surface>
        <Surface className="u-stack" aria-label="Summary metrics">
          <h2>Summary metrics</h2>
          <StaffMetrics
            items={[
              { label: "Registered students", value: 124 },
              { label: "Course offerings", value: 8 },
              { label: "Awaiting review", value: 3 },
            ]}
          />
        </Surface>
      </div>
      <Surface className="u-stack" aria-label="Resource states">
        <h2>Resource states</h2>
        <div className="u-panel-grid">
          <ResourceState state="loading" title="Loading course offerings" />
          <ResourceState
            state="restricted"
            title="This workspace is outside your access"
            detail="Choose a workspace from your overview."
          />
          <ResourceState
            state="error"
            title="We couldn't load the records"
            detail="Check your connection and try again."
            action={<Button variant="secondary">Try again</Button>}
          />
        </div>
        <Pagination label="Page 2" previous={() => undefined} next={() => undefined} />
      </Surface>
      <Surface>
        <DataTable
          caption="Example course list"
          columns={[
            { label: "Code" },
            { label: "Course" },
            { label: "Units", numeric: true },
            { label: "Status" },
          ]}
        >
          <tr>
            <th scope="row">CSC 101</th>
            <td>Foundations of Computing</td>
            <td data-numeric>3</td>
            <td>
              <Badge tone="success">Open</Badge>
            </td>
          </tr>
        </DataTable>
      </Surface>
      <Dialog open={open} onClose={() => setOpen(false)} title="Example dialog">
        <p>Keyboard focus stays inside the dialog until it closes.</p>
      </Dialog>
    </>
  );
}
