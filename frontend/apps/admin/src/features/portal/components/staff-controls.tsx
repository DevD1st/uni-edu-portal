import {
  useId,
  type ComponentPropsWithoutRef,
  type FormEvent,
  type ReactNode,
} from "react";
import { ApiError } from "@uemp/web-client";
import {
  Banner,
  Button,
  Dialog,
  Pagination,
  ResourceState,
  SelectField,
} from "@uemp/ui";

type Resource<T> = {
  data: T | undefined;
  error: string | undefined;
  reload: () => void;
};

export function StaffResource<T>({
  resource,
  title,
  children,
}: {
  resource: Resource<T>;
  title: string;
  children: (data: T) => ReactNode;
}) {
  if (resource.error)
    return (
      <ResourceState
        state="error"
        title={"Couldn’t load " + title}
        detail={resource.error}
        action={
          <Button variant="secondary" onClick={resource.reload}>
            Try again
          </Button>
        }
      />
    );
  if (resource.data === undefined)
    return <ResourceState state="loading" title={"Loading " + title} />;
  return children(resource.data);
}

export function ActionNotice({
  error,
  success,
}: {
  error: string | undefined;
  success?: string | undefined;
}) {
  if (error) return <Banner tone="danger">{error}</Banner>;
  if (success) return <Banner tone="success">{success}</Banner>;
  return null;
}

export type Choice = { value: string; label: string };

export function ChoiceField({
  options,
  emptyLabel = "Select an option",
  ...props
}: Omit<ComponentPropsWithoutRef<typeof SelectField>, "children"> & {
  options: readonly Choice[];
  emptyLabel?: string | null;
}) {
  return (
    <SelectField {...props}>
      {emptyLabel !== null && <option value="">{emptyLabel}</option>}
      {options.map(({ value, label }) => (
        <option key={value} value={value}>
          {label}
        </option>
      ))}
    </SelectField>
  );
}

export function NoteField({
  label,
  name,
  required = false,
}: {
  label: string;
  name: string;
  required?: boolean;
}) {
  const id = useId();
  return (
    <div className="u-field">
      <label htmlFor={id}>{label}</label>
      <textarea
        id={id}
        name={name}
        className="u-input staff-note"
        rows={3}
        maxLength={1000}
        required={required}
      />
    </div>
  );
}

export function StaffDialog({
  title,
  close,
  submit,
  label,
  pending,
  error,
  danger = false,
  children,
}: {
  title: string;
  close: () => void;
  submit: (data: FormData) => void;
  label: string;
  pending: boolean;
  error: string | undefined;
  danger?: boolean;
  children: ReactNode;
}) {
  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!pending) submit(new FormData(event.currentTarget));
  }
  return (
    <Dialog
      open
      title={title}
      onClose={() => {
        if (!pending) close();
      }}
      lockClose={pending}
    >
      <form className="u-stack" onSubmit={handleSubmit}>
        <fieldset className="u-stack min-w-0" disabled={pending}>
          {children}
        </fieldset>
        <ActionNotice error={error} />
        <div className="u-actions">
          <Button variant="secondary" disabled={pending} onClick={close}>
            Cancel
          </Button>
          <Button
            variant={danger ? "danger" : "primary"}
            type="submit"
            pending={pending}
          >
            {label}
          </Button>
        </div>
      </form>
    </Dialog>
  );
}

export function CursorControls({
  cursor,
  next,
  disabled = false,
}: {
  cursor: {
    page: number;
    previous: (() => void) | undefined;
    next: (cursor: string) => void;
  };
  next: string | null;
  disabled?: boolean;
}) {
  if (!next && cursor.page === 1) return null;
  return (
    <Pagination
      label={"Page " + cursor.page}
      busy={disabled}
      {...(cursor.previous ? { previous: cursor.previous } : {})}
      {...(next ? { next: () => cursor.next(next) } : {})}
    />
  );
}

export const textField = (form: FormData, key: string) =>
  String(form.get(key) ?? "").trim();
export const statusField = (form: FormData) =>
  form.get("status") === "inactive" ? ("inactive" as const) : ("active" as const);

export function requiredText(form: FormData, key: string, label: string) {
  const value = textField(form, key);
  if (!value) throw new ApiError("Enter " + label + ".", 400);
  return value;
}

export const namedOptions = (items: readonly { id: string; name: string }[]) =>
  items.map(({ id, name }) => ({ value: id, label: name }));
