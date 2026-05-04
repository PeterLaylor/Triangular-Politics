import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import NewQuestionApp from "./newquestionapp";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <NewQuestionApp />
  </StrictMode>
);