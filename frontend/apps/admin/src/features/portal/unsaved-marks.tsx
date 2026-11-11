import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { useBlocker, type BlockerFunction } from "react-router";
import { Button, Dialog } from "@uemp/ui";
import { useAuth } from "../auth/provider";

type Draft = { dirty: boolean; pending: boolean };
const clean: Draft = { dirty: false, pending: false };
const UnsavedMarks = createContext<{
  setDraft: (draft: Draft) => void;
  requestLeave: (action: () => Promise<void>) => void;
} | null>(null);

export function UnsavedMarksProvider({ children }: { children: ReactNode }) {
  const { signedIn } = useAuth();
  const [draft, setDraft] = useState(clean);
  const [leaving, setLeaving] = useState<{ action: () => Promise<void> }>();
  const protectedDraft = signedIn && (draft.dirty || draft.pending);
  const blocker = useBlocker(
    useCallback<BlockerFunction>(
      ({ currentLocation, nextLocation }) =>
        protectedDraft && currentLocation.pathname !== nextLocation.pathname,
      [protectedDraft],
    ),
  );

  useEffect(() => {
    if (!protectedDraft) return;
    function warn(event: BeforeUnloadEvent) {
      event.preventDefault();
      // Browsers supply their own message for reloads, tab closure, and full-page links.
      event.returnValue = "";
    }
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [protectedDraft]);

  useEffect(() => {
    // A completed save makes the originally requested navigation safe to resume.
    if (!protectedDraft && blocker.state === "blocked") blocker.proceed();
  }, [protectedDraft, blocker]);

  useEffect(() => {
    if (!protectedDraft && leaving) {
      setLeaving(undefined);
      if (signedIn) void leaving.action();
    }
  }, [protectedDraft, leaving, signedIn]);

  function cancel() {
    setLeaving(undefined);
    if (blocker.state === "blocked") blocker.reset();
  }

  function proceed() {
    if (draft.pending) return;
    const action = leaving?.action;
    setLeaving(undefined);
    if (action) void action();
    else if (blocker.state === "blocked") blocker.proceed();
  }

  return (
    <UnsavedMarks.Provider
      value={{
        setDraft,
        requestLeave: (action) => {
          if (protectedDraft) setLeaving({ action });
          else void action();
        },
      }}
    >
      {children}
      <Dialog
        open={Boolean(leaving) || (protectedDraft && blocker.state === "blocked")}
        title="Leave unsaved marks?"
        onClose={cancel}
      >
        <div className="u-stack">
          <p>
            {draft.pending
              ? "Your marks are being saved. Wait for saving to finish before leaving."
              : "You have unsaved marks. Leaving this page will discard those edits."}
          </p>
          <div className="u-actions">
            <Button variant="secondary" onClick={cancel}>
              Keep editing
            </Button>
            <Button variant="danger" disabled={draft.pending} onClick={proceed}>
              {draft.dirty ? "Leave without saving" : "Leave page"}
            </Button>
          </div>
        </div>
      </Dialog>
    </UnsavedMarks.Provider>
  );
}

export function useLeaveStaffPage() {
  const context = useContext(UnsavedMarks);
  if (!context) throw new Error("The staff navigation provider is missing.");
  return context.requestLeave;
}

export function useUnsavedMarks(dirty: boolean, pending: boolean) {
  const context = useContext(UnsavedMarks);
  if (!context) throw new Error("The staff navigation provider is missing.");
  const { setDraft } = context;
  useEffect(() => {
    setDraft({ dirty, pending });
    return () => setDraft(clean);
  }, [dirty, pending, setDraft]);
}
