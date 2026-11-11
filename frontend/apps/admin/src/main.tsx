import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { createBrowserRouter, RouterProvider } from "react-router";
import { App } from "./app";
import {
  StaffErrorBoundary,
  StaffRecovery,
} from "./features/portal/components/staff-error-boundary";
import "@uemp/theme/font.css";
import "./styles.css";

const root = document.getElementById("root");
if (!root) throw new Error("The portal root is missing.");

// A data router provides supported navigation blocking, including browser back/forward.
const router = createBrowserRouter([
  {
    path: "*",
    element: <App />,
    errorElement: <StaffRecovery fullPage retry={() => window.location.reload()} />,
  },
]);

function reportRenderFailure() {
  // Error objects and component stacks may contain record values; keep browser diagnostics generic.
  console.error("A staff page could not be displayed. Try reopening the page.");
}

createRoot(root, {
  onCaughtError: reportRenderFailure,
  onUncaughtError: reportRenderFailure,
}).render(
  <StrictMode>
    <StaffErrorBoundary fullPage>
      <RouterProvider router={router} onError={reportRenderFailure} />
    </StaffErrorBoundary>
  </StrictMode>,
);
