import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";

// Suppress AbortError (e.g. play() interrupted by pause() from browser/extension) so it doesn't break the UI
window.addEventListener("unhandledrejection", (event) => {
  if (event?.reason?.name === "AbortError") {
    event.preventDefault();
    event.stopPropagation();
  }
});

createRoot(document.getElementById("root")!).render(<App />);
