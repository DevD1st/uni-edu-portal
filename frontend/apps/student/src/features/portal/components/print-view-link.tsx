import Link from "next/link";
import { Printer } from "lucide-react";

export function PrintViewLink({ href, label }: { href: string; label: string }) {
  return (
    <div className="u-actions">
      <Link
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        prefetch={false}
        className="u-button"
        data-variant="secondary"
      >
        <Printer size={18} aria-hidden /> {label}
        <span className="sr-only"> (opens in a new tab)</span>
      </Link>
    </div>
  );
}
