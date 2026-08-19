import "@fontsource/anonymous-pro/400.css";
import "@fontsource/anonymous-pro/700.css";
import "../app/globals.css";

import { StrictMode } from "react";
import { createRoot } from "react-dom/client";

import Home from "../app/page";

const root = document.getElementById("root");

if (!root) {
  throw new Error("Root element was not found");
}

createRoot(root).render(
  <StrictMode>
    <Home />
  </StrictMode>,
);
