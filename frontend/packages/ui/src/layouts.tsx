"use client";

import { useEffect, useState, useSyncExternalStore, type ReactNode } from "react";
import {
  BookOpen,
  GraduationCap,
  Menu,
  PanelLeftClose,
  PanelLeftOpen,
  ShieldCheck,
  type LucideIcon,
} from "lucide-react";
import { IconButton } from "./controls";
import { Dialog } from "./dialog";
import { ThemeSwitch } from "./theme-switch";
import { useClientReady } from "./use-client-ready";

export function Brand({ portal }: { portal: string }) {
  return (
    <div className="u-brand">
      <span className="u-brand-mark">
        <GraduationCap size={25} aria-hidden />
      </span>
      <div>
        <strong>UEMP</strong>
        <span>{portal}</span>
      </div>
    </div>
  );
}

export type NavigationItem = {
  href: string;
  label: string;
  icon: LucideIcon;
  active?: boolean;
};
export type NavigationGroup = { label: string; items: readonly NavigationItem[] };
export type NavigationLink = (props: {
  href: string;
  className: string;
  active: boolean;
  onNavigate?: () => void;
  children: ReactNode;
}) => ReactNode;

function Navigation({
  groups,
  link,
  onNavigate,
}: {
  groups: readonly NavigationGroup[];
  link: NavigationLink;
  onNavigate?: () => void;
}) {
  return (
    <nav aria-label="Primary navigation" className="u-nav">
      {groups.map(({ label, items }) => (
        <div className="u-nav-group" key={label}>
          <p className="u-nav-caption">{label}</p>
          <ul>
            {items.map(({ href, label: itemLabel, icon: Icon, active }) => (
              <li key={href} title={itemLabel}>
                {link({
                  href,
                  className: "u-nav-link",
                  active: Boolean(active),
                  ...(onNavigate ? { onNavigate } : {}),
                  children: (
                    <>
                      <Icon size={19} aria-hidden />
                      <span className="u-nav-label">{itemLabel}</span>
                    </>
                  ),
                })}
              </li>
            ))}
          </ul>
        </div>
      ))}
    </nav>
  );
}

const sidebarEvent = "uemp-sidebar-change";

function sidebarSubscription(callback: () => void) {
  window.addEventListener(sidebarEvent, callback);
  window.addEventListener("storage", callback);
  return () => {
    window.removeEventListener(sidebarEvent, callback);
    window.removeEventListener("storage", callback);
  };
}

export function PortalShell({
  portal,
  groups,
  link,
  account,
  actions,
  children,
}: {
  portal: string;
  groups: readonly NavigationGroup[];
  link: NavigationLink;
  account: { name: string; label: string };
  actions?: ReactNode;
  children: ReactNode;
}) {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const ready = useClientReady();
  const storageKey = "uemp:sidebar:" + portal;
  const collapsed = useSyncExternalStore(
    sidebarSubscription,
    () => {
      try {
        return localStorage.getItem(storageKey) === "collapsed";
      } catch {
        return false;
      }
    },
    () => false,
  );
  const [temporaryCollapse, setTemporaryCollapse] = useState<boolean>();
  const compact = temporaryCollapse ?? collapsed;
  const names = account.name.trim().split(/\s+/).filter(Boolean);
  const initials = [names[0], names.length > 1 ? names.at(-1) : undefined]
    .filter((name): name is string => Boolean(name))
    .map((name) => Array.from(name)[0])
    .join("")
    .toLocaleUpperCase();

  useEffect(() => {
    const desktop = window.matchMedia("(min-width: 64rem)");
    function closeOnExpand() {
      if (desktop.matches) setDrawerOpen(false);
    }
    desktop.addEventListener("change", closeOnExpand);
    return () => desktop.removeEventListener("change", closeOnExpand);
  }, []);

  function toggleSidebar() {
    const next = !compact;
    try {
      localStorage.setItem(storageKey, next ? "collapsed" : "expanded");
      window.dispatchEvent(new Event(sidebarEvent));
    } catch {
      setTemporaryCollapse(next);
    }
  }

  return (
    <div className="u-portal" data-collapsed={compact}>
      <a className="u-skip" href="#portal-content">
        Skip to content
      </a>
      <header className="u-mobile-header">
        <Brand portal={portal} />
        <IconButton
          label="Open navigation"
          aria-haspopup="dialog"
          aria-expanded={drawerOpen}
          disabled={!ready}
          onClick={() => setDrawerOpen(true)}
        >
          <Menu size={23} aria-hidden />
        </IconButton>
      </header>
      <aside className="u-sidebar">
        <div className="u-sidebar-brand">
          <Brand portal={portal} />
        </div>
        <div className="u-sidebar-toggle">
          <IconButton
            label={compact ? "Expand sidebar" : "Collapse sidebar"}
            aria-expanded={!compact}
            disabled={!ready}
            onClick={toggleSidebar}
          >
            {compact ? (
              <PanelLeftOpen size={20} aria-hidden />
            ) : (
              <PanelLeftClose size={20} aria-hidden />
            )}
          </IconButton>
        </div>
        <Navigation groups={groups} link={link} />
        <div className="u-sidebar-footer">University Education Management Portal</div>
      </aside>
      <Dialog
        drawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        title="Navigation"
      >
        <Navigation
          groups={groups}
          link={link}
          onNavigate={() => setDrawerOpen(false)}
        />
      </Dialog>
      <div className="u-portal-main">
        <div className="u-workbar">
          <div className="u-account-brief">
            <div className="u-account-avatar" aria-hidden="true">
              {initials || "U"}
            </div>
            <div>
              <strong>{account.name}</strong>
              <span>{account.label}</span>
            </div>
          </div>
          <div className="u-actions">
            <ThemeSwitch />
            {actions}
          </div>
        </div>
        <main id="portal-content" tabIndex={-1} className="u-portal-content">
          {children}
        </main>
      </div>
    </div>
  );
}

export function AuthLayout({
  portal,
  title,
  description,
  asideTitle,
  asideDescription,
  children,
}: {
  portal: string;
  title: string;
  description: string;
  asideTitle: string;
  asideDescription: string;
  children: ReactNode;
}) {
  return (
    <div className="u-auth">
      <header className="u-auth-header">
        <Brand portal={portal} />
        <ThemeSwitch />
      </header>
      <main className="u-auth-grid">
        <section className="u-auth-form">
          <p className="u-eyebrow">{portal}</p>
          <h1>{title}</h1>
          <p className="u-page-description">{description}</p>
          <noscript>
            <p className="u-page-description">
              Enable JavaScript in your browser to use this form.
            </p>
          </noscript>
          {children}
        </section>
        <aside className="u-auth-aside">
          <div className="u-auth-aside-icon">
            <BookOpen size={29} aria-hidden />
          </div>
          <p className="u-auth-aside-tag">Campus workspace</p>
          <h2>{asideTitle}</h2>
          <p>{asideDescription}</p>
          <div className="u-auth-aside-foot">
            <ShieldCheck size={19} aria-hidden /> University Education Management Portal
          </div>
        </aside>
      </main>
    </div>
  );
}
