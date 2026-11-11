import { ChevronLeft, ChevronRight, Inbox, LoaderCircle } from "lucide-react";
import type { ComponentPropsWithoutRef, ReactNode } from "react";
import { Banner, IconButton } from "./controls";

export function Surface({ className, ...props }: ComponentPropsWithoutRef<"section">) {
  return (
    <section
      {...props}
      className={["u-surface", className].filter(Boolean).join(" ")}
    />
  );
}

export function PageHeader({
  eyebrow,
  title,
  description,
  actions,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  actions?: ReactNode;
}) {
  return (
    <header className="u-page-header">
      <div>
        {eyebrow && <p className="u-eyebrow">{eyebrow}</p>}
        <h1>{title}</h1>
        {description && <p className="u-page-description">{description}</p>}
      </div>
      {actions && <div className="u-actions">{actions}</div>}
    </header>
  );
}

export function ResourceState({
  state,
  title,
  detail,
  action,
}: {
  state: "loading" | "empty" | "error" | "restricted";
  title: string;
  detail?: string;
  action?: ReactNode;
}) {
  const content = (
    <div className="u-resource-copy">
      <strong>{title}</strong>
      {detail && <p>{detail}</p>}
      {action && <div className="u-actions">{action}</div>}
    </div>
  );
  if (state === "error" || state === "restricted")
    return <Banner tone={state === "error" ? "danger" : "warning"}>{content}</Banner>;
  const Icon = state === "loading" ? LoaderCircle : Inbox;
  return (
    <div className="u-resource" role="status" data-state={state}>
      <Icon
        size={22}
        className={state === "loading" ? "u-spin" : undefined}
        aria-hidden
      />
      {content}
    </div>
  );
}

export function DescriptionList({
  items,
}: {
  items: readonly { label: string; value: ReactNode }[];
}) {
  return (
    <dl className="u-description">
      {items.map(({ label, value }) => (
        <div key={label}>
          <dt>{label}</dt>
          <dd>{value}</dd>
        </div>
      ))}
    </dl>
  );
}

export function DataTable({
  caption,
  columns,
  children,
}: {
  caption: string;
  columns: readonly { label: string; numeric?: boolean }[];
  children: ReactNode;
}) {
  return (
    <div className="u-table-region" role="region" aria-label={caption} tabIndex={0}>
      <table className="u-table">
        <caption>{caption}</caption>
        <thead>
          <tr>
            {columns.map(({ label, numeric }) => (
              <th key={label} scope="col" data-numeric={numeric || undefined}>
                {label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>{children}</tbody>
      </table>
    </div>
  );
}

export function Pagination({
  label,
  previous,
  next,
  busy = false,
}: {
  label: string;
  previous?: () => void;
  next?: () => void;
  busy?: boolean;
}) {
  return (
    <nav aria-label="Pagination" className="u-pagination">
      <IconButton
        label="Previous page"
        disabled={!previous || busy}
        {...(previous ? { onClick: previous } : {})}
      >
        <ChevronLeft size={18} aria-hidden />
      </IconButton>
      <span aria-live="polite">{label}</span>
      <IconButton
        label="Next page"
        disabled={!next || busy}
        {...(next ? { onClick: next } : {})}
      >
        <ChevronRight size={18} aria-hidden />
      </IconButton>
    </nav>
  );
}
