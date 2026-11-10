"use client";

import { useState } from "react";
import { Download } from "lucide-react";
import { Banner, Button } from "@uemp/ui";
import { portalApi, studentError } from "../student-request";

export function DownloadButton({
  path,
  filename,
  label,
}: {
  path: string;
  filename: string;
  label: string;
}) {
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string>();

  async function download() {
    setPending(true);
    setError(undefined);
    try {
      const blob = await portalApi.download(path);
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = filename;
      document.body.append(link);
      link.click();
      link.remove();
      // The browser needs time to consume the object URL after the click.
      window.setTimeout(() => URL.revokeObjectURL(url), 30_000);
    } catch (cause) {
      setError(studentError(cause));
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="u-stack">
      <Button variant="secondary" pending={pending} onClick={() => void download()}>
        <Download size={18} aria-hidden /> {label}
      </Button>
      {error && <Banner tone="danger">{error}</Banner>}
    </div>
  );
}
