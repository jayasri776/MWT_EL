import {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
} from "react";

const SettingsContext = createContext(null);

export const FONT_OPTIONS = [
  { name: "Inter", value: "'Inter', 'Noto Sans Tamil', 'Noto Sans Devanagari', 'Noto Sans Malayalam', 'Noto Sans Kannada', 'Noto Sans Telugu', sans-serif" },
  { name: "Poppins", value: "'Poppins', 'Noto Sans Tamil', 'Noto Sans Devanagari', 'Noto Sans Malayalam', 'Noto Sans Kannada', 'Noto Sans Telugu', sans-serif" },
  { name: "Roboto", value: "'Roboto', 'Noto Sans Tamil', 'Noto Sans Devanagari', 'Noto Sans Malayalam', 'Noto Sans Kannada', 'Noto Sans Telugu', sans-serif" },
  { name: "Merriweather", value: "'Merriweather', 'Noto Sans Tamil', 'Noto Sans Devanagari', 'Noto Sans Malayalam', 'Noto Sans Kannada', 'Noto Sans Telugu', serif" },
  { name: "Lora", value: "'Lora', 'Noto Sans Tamil', 'Noto Sans Devanagari', 'Noto Sans Malayalam', 'Noto Sans Kannada', 'Noto Sans Telugu', serif" },
  { name: "Fira Code", value: "'Fira Code', 'Noto Sans Tamil', 'Noto Sans Devanagari', 'Noto Sans Malayalam', 'Noto Sans Kannada', 'Noto Sans Telugu', monospace" },
];

export const SIZE_OPTIONS = [
  { name: "Small", value: "small", baseFontSize: "13px" },
  { name: "Medium", value: "medium", baseFontSize: "15px" },
  { name: "Large", value: "large", baseFontSize: "18px" },
];

const FONT_KEY = "tams-app-font";
const SIZE_KEY = "tams-app-size";

export function SettingsProvider({ children }) {
  const [font, setFontState] = useState(
    () => localStorage.getItem(FONT_KEY) || FONT_OPTIONS[0].value,
  );
  const [size, setSizeState] = useState(
    () => localStorage.getItem(SIZE_KEY) || "medium",
  );

  useEffect(() => {
    document.documentElement.style.setProperty("--app-font", font);
    document.body.style.fontFamily = font;
    localStorage.setItem(FONT_KEY, font);
  }, [font]);

  useEffect(() => {
    const opt = SIZE_OPTIONS.find((s) => s.value === size) || SIZE_OPTIONS[1];
    document.documentElement.style.setProperty(
      "--app-base-font-size",
      opt.baseFontSize,
    );
    document.documentElement.setAttribute("data-size", size);
    localStorage.setItem(SIZE_KEY, size);
  }, [size]);

  const setFont = useCallback((value) => setFontState(value), []);
  const setSize = useCallback((value) => setSizeState(value), []);

  return (
    <SettingsContext.Provider
      value={{ font, setFont, size, setSize, FONT_OPTIONS, SIZE_OPTIONS }}
    >
      {children}
    </SettingsContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export function useSettings() {
  const ctx = useContext(SettingsContext);
  if (!ctx)
    throw new Error("useSettings must be used within a SettingsProvider");
  return ctx;
}
