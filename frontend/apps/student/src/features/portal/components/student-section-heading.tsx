import type { ReactNode } from "react";
import type { LucideIcon } from "lucide-react";

export function StudentSectionHeading({
  title,
  description,
  icon: Icon,
  meta,
}: {
  title: string;
  description?: string;
  icon?: LucideIcon;
  meta?: ReactNode;
}) {
  return (
    <div className="student-section-heading">
      {Icon && (
        <span className="student-section-icon">
          <Icon size={21} strokeWidth={1.8} aria-hidden />
        </span>
      )}
      <div className="student-section-copy">
        <h2>{title}</h2>
        {description && <p>{description}</p>}
      </div>
      {meta && <div className="student-section-meta">{meta}</div>}
    </div>
  );
}
