import type { ReactNode } from "react";
import {
  ArrowLeftRight,
  ArrowRight,
  ExternalLink,
  KeyRound,
  Server,
} from "lucide-react";

export type AuthSupportLinksProps = {
  otherPortal: { href: string; label: string };
  demoCredentialsHref: string;
  backendDocsHref: string;
  /** Each app supplies service guidance without coupling shared UI to its hosting setup. */
  backendNote?: ReactNode;
};

function ExternalSupportLink({ href, label }: { href: string; label: string }) {
  return (
    <a
      className="u-auth-support-link u-text-link"
      href={href}
      target="_blank"
      rel="noopener noreferrer"
    >
      <span className="u-auth-support-link-title">
        {label} <ExternalLink size={14} aria-hidden />
      </span>
      <span className="u-auth-support-hint"> (opens in a new tab)</span>
    </a>
  );
}

export function AuthSupportLinks({
  otherPortal,
  demoCredentialsHref,
  backendDocsHref,
  backendNote,
}: AuthSupportLinksProps) {
  return (
    <section className="u-auth-support" aria-label="Demo access and service check">
      <h2>Trying the demo?</h2>
      <ul className="u-auth-support-list">
        <li>
          <span className="u-auth-support-icon">
            <ArrowLeftRight size={16} aria-hidden />
          </span>
          <div className="u-auth-support-content">
            <a className="u-auth-support-link u-text-link" href={otherPortal.href}>
              <span className="u-auth-support-link-title">
                {otherPortal.label} <ArrowRight size={15} aria-hidden />
              </span>
            </a>
          </div>
        </li>
        <li>
          <span className="u-auth-support-icon">
            <KeyRound size={16} aria-hidden />
          </span>
          <div className="u-auth-support-content">
            <ExternalSupportLink
              href={demoCredentialsHref}
              label="View demo credentials"
            />
          </div>
        </li>
        <li>
          <span className="u-auth-support-icon">
            <Server size={16} aria-hidden />
          </span>
          <div className="u-auth-support-content">
            <ExternalSupportLink
              href={backendDocsHref}
              label="Open API documentation"
            />
            {backendNote && <div className="u-auth-support-note">{backendNote}</div>}
          </div>
        </li>
      </ul>
    </section>
  );
}
