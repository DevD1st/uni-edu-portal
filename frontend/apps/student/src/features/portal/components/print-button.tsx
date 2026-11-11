"use client";

import { Printer } from "lucide-react";
import { Button } from "@uemp/ui";

export function PrintButton() {
  return (
    <Button onClick={() => window.print()}>
      <Printer size={18} aria-hidden /> Print
    </Button>
  );
}
