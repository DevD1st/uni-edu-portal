"use client";

import { useEffect, useId, useRef, type ReactNode } from "react";
import { X } from "lucide-react";
import { IconButton } from "./controls";

export function Dialog({
  open,
  onClose,
  title,
  children,
  drawer = false,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  drawer?: boolean;
}) {
  const ref = useRef<HTMLDialogElement>(null);
  const titleId = useId();
  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
  }, [open]);

  return (
    <dialog
      ref={ref}
      aria-labelledby={titleId}
      className={drawer ? "u-dialog u-drawer" : "u-dialog"}
      onClose={() => {
        if (open) onClose();
      }}
      onClick={(event) => {
        if (event.currentTarget === event.target) onClose();
      }}
    >
      <div className="u-dialog-inner">
        <header className="u-dialog-header">
          <h2 id={titleId}>{title}</h2>
          <IconButton
            label={drawer ? "Close navigation" : "Close dialog"}
            onClick={onClose}
          >
            <X size={21} aria-hidden />
          </IconButton>
        </header>
        {children}
      </div>
    </dialog>
  );
}
