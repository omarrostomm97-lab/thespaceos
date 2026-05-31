import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";
import "@heroui/styles/css";

const savedTheme = (() => {
  try { return localStorage.getItem("gl-theme") ?? "dark"; } catch { return "dark"; }
})();
document.documentElement.classList.add(savedTheme);

const savedLang = (() => {
  try { return localStorage.getItem("gl-lang") ?? "ar"; } catch { return "ar"; }
})();
document.documentElement.setAttribute("dir", savedLang === "ar" ? "rtl" : "ltr");
document.documentElement.setAttribute("lang", savedLang);

createRoot(document.getElementById("root")!).render(<App />);
