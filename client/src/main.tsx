import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";

window.addEventListener("unhandledrejection", (e) => {
  if (e.reason?.message?.includes("play() request was interrupted")) {
    e.preventDefault();
  }
});

createRoot(document.getElementById("root")!).render(<App />);
