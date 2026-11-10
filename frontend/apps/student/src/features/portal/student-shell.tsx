"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BookOpen, LogOut, UserRound } from "lucide-react";
import { useState, type ReactNode } from "react";
import { Banner, Button, PortalShell } from "@uemp/ui";

export function StudentShell({
  name,
  children,
}: {
  name: string;
  children: ReactNode;
}) {
  const path = usePathname();
  const [signingOut, setSigningOut] = useState(false);
  const [error, setError] = useState(false);
  async function signOut() {
    setSigningOut(true);
    setError(false);
    try {
      const response = await fetch("/api/auth/sign-out", {
        method: "POST",
        signal: AbortSignal.timeout(10_000),
      });
      if (!response.ok) throw new Error("Sign-out failed");
      window.location.replace("/sign-in");
    } catch {
      setError(true);
      setSigningOut(false);
    }
  }
  return (
    <PortalShell
      portal="Student portal"
      account={{ name, label: "Student workspace" }}
      groups={[
        {
          label: "My studies",
          items: [
            {
              href: "/overview",
              label: "Overview",
              icon: BookOpen,
              active: path === "/overview",
            },
            {
              href: "/account",
              label: "My profile",
              icon: UserRound,
              active: path === "/account",
            },
          ],
        },
      ]}
      link={({ href, className, active, onNavigate, children: label }) => (
        <Link
          href={href}
          className={className}
          aria-current={active ? "page" : undefined}
          {...(onNavigate ? { onNavigate } : {})}
        >
          {label}
        </Link>
      )}
      actions={
        <Button variant="ghost" pending={signingOut} onClick={() => void signOut()}>
          <LogOut size={18} aria-hidden /> Sign out
        </Button>
      }
    >
      {error && <Banner tone="danger">We couldn't sign you out. Try again.</Banner>}
      {children}
    </PortalShell>
  );
}
