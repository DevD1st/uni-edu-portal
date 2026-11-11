import { Badge, type Tone } from "@uemp/ui";
import type { Dto } from "@uemp/api-contracts/response";

export type ResultStatusValue = Dto<"ResultGroupSummaryDto">["status"];
export const resultLabels: Record<ResultStatusValue, string> = {
  pending: "Draft",
  submitted: "Awaiting review",
  correction_requested: "Corrections requested",
  approved: "Published",
};

const tones: Record<ResultStatusValue, Tone> = {
  pending: "neutral",
  submitted: "info",
  correction_requested: "warning",
  approved: "success",
};

export function ResultStatus({ status }: { status: ResultStatusValue }) {
  return <Badge tone={tones[status]}>{resultLabels[status]}</Badge>;
}

export function markText(mark: number | null) {
  return mark === null ? "—" : mark.toFixed(2);
}
