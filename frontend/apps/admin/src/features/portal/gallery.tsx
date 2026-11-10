import { useState } from "react";
import {
  Badge,
  Banner,
  Button,
  Checkbox,
  DataTable,
  Dialog,
  PageHeader,
  ResourceState,
  SelectField,
  Surface,
  TextField,
} from "@uemp/ui";

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
