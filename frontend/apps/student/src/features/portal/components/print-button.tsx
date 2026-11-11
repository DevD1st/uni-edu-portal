"use client";

import { Printer } from "lucide-react";
import { Button, useClientReady } from "@uemp/ui";

export function PrintButton() {
  const ready = useClientReady();
  return (
    <Button disabled={!ready} onClick={() => window.print()}>
      <Printer size={18} aria-hidden /> Print
    </Button>
  );
}
