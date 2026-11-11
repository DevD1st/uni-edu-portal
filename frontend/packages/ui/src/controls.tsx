import { useId, type ComponentPropsWithoutRef, type ReactNode } from "react";
import { CheckCircle2, CircleAlert, Info, LoaderCircle } from "lucide-react";

export type Tone = "neutral" | "info" | "success" | "warning" | "danger";

export function Button({
  variant = "primary",
  pending = false,
  disabled,
  children,
  className,
  ...props
}: ComponentPropsWithoutRef<"button"> & {
  variant?: "primary" | "secondary" | "ghost" | "danger";
  pending?: boolean;
}) {
  return (
    <button
      {...props}
      type={props.type ?? "button"}
      data-variant={variant}
      className={["u-button", className].filter(Boolean).join(" ")}
      aria-busy={pending || undefined}
      disabled={disabled || pending}
    >
      {pending && <LoaderCircle className="u-spin" size={18} aria-hidden />}
      {children}
    </button>
  );
}

export function IconButton({
  label,
  children,
  className,
  ...props
}: ComponentPropsWithoutRef<"button"> & { label: string }) {
  return (
    <Button
      {...props}
      variant="ghost"
      className={["u-icon-button", className].filter(Boolean).join(" ")}
      aria-label={label}
      title={label}
    >
      {children}
    </Button>
  );
}

export function Badge({
  tone = "neutral",
  children,
}: {
  tone?: Tone;
  children: ReactNode;
}) {
  return (
    <span className="u-badge" data-tone={tone}>
      {children}
    </span>
  );
}

export function Banner({
  tone = "info",
  children,
}: {
  tone?: Tone;
  children: ReactNode;
}) {
  const Icon =
    tone === "success"
      ? CheckCircle2
      : tone === "warning" || tone === "danger"
        ? CircleAlert
        : Info;
  return (
    <div
      className="u-banner"
      data-tone={tone}
      role={tone === "danger" ? "alert" : "status"}
    >
      <Icon size={19} aria-hidden />
      <div>{children}</div>
    </div>
  );
}

type FieldDescription = { label: string; hint?: string; error?: string };

function Field({
  id,
  label,
  hint,
  error,
  children,
  required,
}: FieldDescription & { id: string; children: ReactNode; required?: boolean }) {
  return (
    <div className="u-field">
      <div className="u-field-label">
        <label htmlFor={id}>{label}</label>
        {required && (
          <span className="u-required-mark" aria-hidden="true">
            *
          </span>
        )}
      </div>
      {children}
      {hint && (
        <span className="u-field-hint" id={id + "-hint"}>
          {hint}
        </span>
      )}
      {error && (
        <span className="u-field-error" id={id + "-error"}>
          {error}
        </span>
      )}
    </div>
  );
}

function fieldDescription(id: string, hint?: string, error?: string, other?: string) {
  return (
    [other, hint && id + "-hint", error && id + "-error"].filter(Boolean).join(" ") ||
    undefined
  );
}

export function TextField({
  label,
  hint,
  error,
  id: suppliedId,
  className,
  trailingAction,
  ...props
}: ComponentPropsWithoutRef<"input"> &
  FieldDescription & { trailingAction?: ReactNode }) {
  const fallback = useId();
  const id = suppliedId ?? fallback;
  const input = (
    <input
      {...props}
      id={id}
      className={["u-input", className].filter(Boolean).join(" ")}
      aria-invalid={error ? true : props["aria-invalid"]}
      aria-describedby={fieldDescription(id, hint, error, props["aria-describedby"])}
    />
  );
  return (
    <Field
      id={id}
      label={label}
      {...(props.required ? { required: true } : {})}
      {...(hint ? { hint } : {})}
      {...(error ? { error } : {})}
    >
      {trailingAction ? (
        <div className="u-input-with-action">
          {/* Help and errors sit outside this wrapper so the action stays on the input. */}
          {input}
          <div className="u-input-action">{trailingAction}</div>
        </div>
      ) : (
        input
      )}
    </Field>
  );
}

export function SelectField({
  label,
  hint,
  error,
  id: suppliedId,
  children,
  className,
  ...props
}: ComponentPropsWithoutRef<"select"> & FieldDescription) {
  const fallback = useId();
  const id = suppliedId ?? fallback;
  return (
    <Field
      id={id}
      label={label}
      {...(props.required ? { required: true } : {})}
      {...(hint ? { hint } : {})}
      {...(error ? { error } : {})}
    >
      <select
        {...props}
        id={id}
        className={["u-input", className].filter(Boolean).join(" ")}
        aria-invalid={error ? true : props["aria-invalid"]}
        aria-describedby={fieldDescription(id, hint, error, props["aria-describedby"])}
      >
        {children}
      </select>
    </Field>
  );
}

export function Checkbox({
  label,
  ...props
}: Omit<ComponentPropsWithoutRef<"input">, "type"> & { label: ReactNode }) {
  return (
    <label className="u-checkbox">
      <input {...props} type="checkbox" /> <span>{label}</span>
    </label>
  );
}
