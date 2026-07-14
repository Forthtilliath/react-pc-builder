import { createRoot } from "react-dom/client";
import { App } from "./app.tsx";
import "./index.css";

const appElement = document.getElementById("app");
if (!appElement) {
	throw new Error("No app element found");
}

createRoot(appElement).render(<App />);
