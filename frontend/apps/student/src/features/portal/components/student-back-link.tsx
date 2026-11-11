import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export function StudentBackLink({
  href,
  children,
}: {
  href: string;
  children: string;
}) {
  return (
    <Link href={href} className="student-back-link u-text-link" prefetch={false}>
      <ArrowLeft size={16} aria-hidden /> {children}
    </Link>
  );
}
