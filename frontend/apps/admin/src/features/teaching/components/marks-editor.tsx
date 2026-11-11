import { useState, type FormEvent } from "react";
import { Banner, Button, TextField } from "@uemp/ui";
import { ApiError } from "@uemp/web-client";
import type { Dto } from "@uemp/api-contracts/response";
import { markText } from "./result-status";
import { studentLabel } from "./result-marks";

type Group = Dto<"ResultGroupDetailDto">;
type Field = "caScore" | "examScore";
type Draft = Record<string, Partial<Record<Field, string>>>;
const columns = ["caScore", "examScore"] as const;

function score(raw: string, maximum: number) {
  if (raw === "") return null;
  const value = Number(raw);
  if (!/^(?:\d+|\d*\.\d{1,2})$/.test(raw) || !Number.isFinite(value) || value > maximum)
    throw new ApiError(
      "Enter scores within the stated limits with up to two decimal places.",
      400,
    );
  return value;
}

export function MarksEditor({
  group,
  pending,
  save,
  onDirty,
}: {
  group: Group;
  pending: boolean;
  save: (input: Dto<"SaveResultMarksDto">) => void;
  onDirty: (dirty: boolean) => void;
}) {
  const [draft, setDraft] = useState<Draft>({});
  const [validation, setValidation] = useState<string>();
  const limits = { caScore: group.maxCaScore, examScore: group.maxExamScore };
  const dirty = Object.keys(draft).length > 0;

  function change(id: string, field: Field, value: string, stored: number | null) {
    const storedText = stored === null ? "" : String(stored);
    const row = Object.fromEntries(
      Object.entries({ ...draft[id], [field]: value }).filter(
        ([key]) => key !== field || value !== storedText,
      ),
    );
    const next = Object.fromEntries(
      Object.entries({ ...draft, [id]: row }).filter(
        ([, values]) => Object.keys(values).length > 0,
      ),
    );
    setDraft(next);
    onDirty(Object.keys(next).length > 0);
    setValidation(undefined);
  }

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!dirty || pending) return;
    try {
      const marks = Object.entries(draft).map(([enrollmentId, values]) => {
        const row: Dto<"ResultMarkInputDto"> = { enrollmentId };
        // Send only edited components. A blank edited field clears its stored mark.
        for (const field of columns) {
          if (values[field] !== undefined)
            row[field] = score(values[field], limits[field]);
        }
        return row;
      });
      save({ marks });
    } catch (error) {
      setValidation(
        error instanceof ApiError ? error.message : "Check the marks and try again.",
      );
    }
  }

  return (
    <form className="u-stack" onSubmit={submit}>
      <p className="u-muted">
        CA is out of {group.maxCaScore} and the exam is out of {group.maxExamScore}.
        Clear a score to remove it.
      </p>
      <ul className="staff-mark-list">
        {group.marks.map((mark) => (
          <li key={mark.id} className="staff-mark-row">
            <div className="staff-mark-person">
              <strong>{studentLabel(mark)}</strong>
              <p className="u-muted">
                {mark.matricNumber ?? "Matriculation number unavailable"}
              </p>
            </div>
            {columns.map((field) => {
              const label = field === "caScore" ? "CA" : "Exam";
              return (
                <TextField
                  key={field}
                  label={label}
                  aria-label={
                    label + " for " + (mark.matricNumber ?? studentLabel(mark))
                  }
                  type="number"
                  inputMode="decimal"
                  min={0}
                  max={limits[field]}
                  step="0.01"
                  disabled={pending}
                  value={draft[mark.id]?.[field] ?? mark[field] ?? ""}
                  onChange={(event) =>
                    change(mark.id, field, event.target.value, mark[field])
                  }
                />
              );
            })}
            <p className="self-center u-muted">
              Saved total {markText(mark.totalScore)} · {mark.grade ?? "No grade"}
            </p>
          </li>
        ))}
      </ul>
      {validation && <Banner tone="danger">{validation}</Banner>}
      <div className="u-actions">
        <Button type="submit" disabled={!dirty} pending={pending}>
          Save marks
        </Button>
        {dirty && (
          <Button
            variant="secondary"
            disabled={pending}
            onClick={() => {
              setDraft({});
              setValidation(undefined);
              onDirty(false);
            }}
          >
            Discard edits
          </Button>
        )}
      </div>
    </form>
  );
}
