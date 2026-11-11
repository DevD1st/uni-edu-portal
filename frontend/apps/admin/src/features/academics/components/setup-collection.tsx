import { useState, type ReactNode } from "react";
import { Button, Surface } from "@uemp/ui";
import { ActionNotice, StaffDialog } from "../../portal/components/staff-controls";
import { StaffRecords } from "../../portal/components/staff-records";
import { useStaffAction } from "../../portal/staff-data";

type Base = { id: string };
type Edit<Row> = { kind: "create" } | { kind: "edit"; row: Row };

export function SetupCollection<Row extends Base>({
  title,
  singular,
  records,
  label,
  details,
  canCreate,
  canEdit,
  fields,
  save,
  reload,
  extraActions,
}: {
  title: string;
  singular: string;
  records: Row[];
  label: (row: Row) => string;
  details: (row: Row) => { label: string; value: ReactNode }[];
  canCreate: boolean;
  canEdit: (row: Row) => boolean;
  fields: (row: Row | undefined) => ReactNode;
  save: (form: FormData, row: Row | undefined) => Promise<unknown>;
  reload: () => void;
  extraActions?: (row: Row) => ReactNode;
}) {
  const [editor, setEditor] = useState<Edit<Row>>();
  const action = useStaffAction();
  const row = editor?.kind === "edit" ? editor.row : undefined;
  return (
    <Surface className="u-stack" aria-label={title}>
      <div className="u-actions">
        <h2>{title}</h2>
        {canCreate && (
          <Button
            onClick={() => {
              action.reset();
              setEditor({ kind: "create" });
            }}
          >
            Add {singular}
          </Button>
        )}
      </div>
      {!editor && <ActionNotice error={action.error} success={action.success} />}
      <StaffRecords
        empty={"No " + title.toLowerCase() + " are configured"}
        items={records.map((item) => ({
          id: item.id,
          title: label(item),
          details: details(item),
          actions: (
            <>
              {canEdit(item) && (
                <Button
                  variant="secondary"
                  aria-label={"Edit " + label(item)}
                  onClick={() => {
                    action.reset();
                    setEditor({ kind: "edit", row: item });
                  }}
                >
                  Edit
                </Button>
              )}
              {extraActions?.(item)}
            </>
          ),
        }))}
      />
      {editor && (row ? canEdit(row) : canCreate) && (
        <StaffDialog
          title={(row ? "Edit " : "Add ") + singular}
          close={() => setEditor(undefined)}
          label={row ? "Save changes" : "Create " + singular}
          pending={action.pending}
          error={action.error}
          submit={(form) =>
            void action.run(
              () => save(form, row),
              "Changes saved.",
              () => {
                setEditor(undefined);
                reload();
              },
            )
          }
        >
          {fields(row)}
        </StaffDialog>
      )}
    </Surface>
  );
}
