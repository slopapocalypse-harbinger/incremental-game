import { StrictMode } from "react";
import { createRoot } from "react-dom/client";

import { Game } from "../app/game/Game";
import "../app/globals.css";

const root = document.getElementById("root");

if (!root) {
  throw new Error("The game root element is missing.");
}

createRoot(root).render(
  <StrictMode>
    <Game />
  </StrictMode>,
);
