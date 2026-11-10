import type { Metadata } from "next";
import type { ReactNode } from "react";
import { themeInitScript } from "@uemp/ui/theme-init";
import "@uemp/theme/font.css";
import "./globals.css";

export const metadata: Metadata = {
  title: { default: "UEMP Student Portal", template: "%s | UEMP Student Portal" },
  description: "University Education Management Portal for students.",
  robots: { index: false, follow: false },
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
      </head>
      <body>{children}</body>
    </html>
  );
}
