import {
  createContext,
  useContext,
  useCallback,
  useEffect,
  useState,
  useSyncExternalStore,
  type ReactNode,
} from "react";
import { ApiError, readableError } from "@uemp/web-client";
import { loadStaffAccess, staffSession } from "./api";

type StaffAccess = Awaited<ReturnType<typeof loadStaffAccess>>;
type AccessState =
  | { id: string; access: StaffAccess; error?: never }
  | { id: string; error: string; access?: never };

const Auth = createContext<{
  signedIn: boolean;
  access: StaffAccess | null;
  error: string | null;
  revalidate: () => void;
} | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const id = useSyncExternalStore(staffSession.subscribe, staffSession.get)?.id;
  const [version, setVersion] = useState(0);
  const [state, setState] = useState<AccessState | null>(null);
  const current = state?.id === id ? state : null;

  useEffect(() => {
    if (!id) return;
    const controller = new AbortController();
    void loadStaffAccess(controller.signal).then(
      (access) => {
        if (!controller.signal.aborted && staffSession.get()?.id === id)
          setState({ id, access });
      },
      (error: unknown) => {
        if (controller.signal.aborted || staffSession.get()?.id !== id) return;
        if (
          error instanceof ApiError &&
          (error.status === 401 || error.status === 403)
        ) {
          staffSession.set(null);
          return;
        }
        setState({ id, error: readableError(error) });
      },
    );
    return () => controller.abort();
  }, [id, version]);

  const revalidate = useCallback(() => {
    setVersion((value) => value + 1);
  }, []);

  return (
    <Auth.Provider
      value={{
        signedIn: Boolean(id),
        access: current?.access ?? null,
        error: current?.error ?? null,
        revalidate,
      }}
    >
      {children}
    </Auth.Provider>
  );
}

export function useAuth() {
  const value = useContext(Auth);
  if (!value) throw new Error("The staff session provider is missing.");
  return value;
}
