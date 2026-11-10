import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router";
import { App } from "./app";
import "@uemp/theme/font.css";
import "./styles.css";

const root = document.getElementById("root");
if (!root) throw new Error("The portal root is missing.");

createRoot(root).render(
  <StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </StrictMode>,
);
