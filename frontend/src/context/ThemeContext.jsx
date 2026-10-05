import {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
} from "react";

const ThemeContext = createContext(null);

export const THEME_COLORS = [
  { name: "Crimson", value: "#9a2b25", dark: "#701e1a", tint: "#f6e4e1" },
  { name: "Saffron", value: "#d97706", dark: "#92400e", tint: "#fdecd8" },
  { name: "Emerald", value: "#0f9d58", dark: "#0b6b3c", tint: "#d9f2e6" },
  { name: "Royal Blue", value: "#1a56db", dark: "#1339a6", tint: "#dbe6fb" },
  { name: "Amethyst", value: "#7c3aed", dark: "#5b21b6", tint: "#ece3fb" },
  { name: "Slate", value: "#334155", dark: "#1e293b", tint: "#e2e8f0" },
  { name: "Rose Gold", value: "#c2703d", dark: "#92501f", tint: "#f6e3d3" },
  { name: "Teal", value: "#0d9488", dark: "#0f766e", tint: "#d7f2ef" },
];

const STORAGE_KEY = "tams-accent";
const DEFAULT_COLOR = THEME_COLORS[0];

function applyAccent(color) {
  const root = document.documentElement.style;
  root.setProperty("--sindoor", color.value);
  root.setProperty("--sindoor-dark", color.dark);
  root.setProperty("--sindoor-tint", color.tint);
  root.setProperty("--accent-color", color.value);
  root.setProperty("--teal", color.value);
  root.setProperty("--teal-dark", color.dark);
  root.setProperty("--teal-tint", color.tint);
  root.setProperty("--gold", color.value);
  document.documentElement.setAttribute("data-theme-color", color.name);
}

export function ThemeProvider({ children }) {
  const [accent, setAccentState] = useState(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (!saved) return DEFAULT_COLOR;
    try {
      return JSON.parse(saved);
    } catch {
      return DEFAULT_COLOR;
    }
  });

  useEffect(() => {
    applyAccent(accent);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(accent));
  }, [accent]);

  const setAccentColor = useCallback((color) => {
    setAccentState(color);
  }, []);

  return (
    <ThemeContext.Provider
      value={{ accentColor: accent.value, setAccentColor, THEME_COLORS }}
    >
      {children}
    </ThemeContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useTheme must be used within a ThemeProvider");
  return ctx;
}
