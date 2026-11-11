import { PrintViewLink } from "./print-view-link";

export function RecordPrintAction({ href, label }: { href: string; label: string }) {
  return (
    <div className="student-record-actions">
      <div>
        <strong>A copy for your records</strong>
        <p>Open a clean print view in a new tab.</p>
      </div>
      <PrintViewLink href={href} label={label} />
    </div>
  );
}
