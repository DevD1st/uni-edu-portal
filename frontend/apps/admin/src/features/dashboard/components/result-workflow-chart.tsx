import { BarChart, ResourceState, type ChartDatum } from "@uemp/ui";
import type { Dto } from "@uemp/api-contracts/response";

export function ResultWorkflowChart({
  summary,
}: {
  summary: Dto<"AcademicOverviewDto">;
}) {
  const states: ChartDatum[] = [
    {
      id: "pending",
      label: "Draft",
      value: summary.pendingCount,
      detail: "Result groups with marks being prepared, including reopened drafts.",
    },
    {
      id: "submitted",
      label: "Awaiting review",
      shortLabel: "Review",
      value: summary.submittedCount,
      detail: "Complete submissions waiting for a departmental decision.",
    },
    {
      id: "correction_requested",
      label: "Corrections requested",
      shortLabel: "Corrections",
      value: summary.correctionRequestedCount,
      detail: "Submissions returned to the lecturer to correct and resubmit.",
    },
    {
      id: "approved",
      label: "Approved",
      value: summary.approvedCount,
      detail: "Approved result groups whose grades are currently published.",
    },
  ];
  if (states.every(({ value }) => value === 0))
    return (
      <ResourceState
        state="empty"
        title="No result groups in this reporting scope yet"
        detail="A result group is created when students register for a course offering."
      />
    );
  return (
    <BarChart
      title="Result workflow"
      description="Current group status for the semester and reporting scope selected above."
      categoryLabel="Workflow state"
      valueLabel="Result groups"
      data={states}
    />
  );
}
