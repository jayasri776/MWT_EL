import {
  createContext,
  useContext,
  useState,
  useMemo,
  useCallback,
} from "react";
import { translations } from "../data/translations";

const LanguageContext = createContext(null);

const LANG_KEY = "tams-lang";

export function LanguageProvider({ children }) {
  const [lang, setLang] = useState(
    () => localStorage.getItem(LANG_KEY) || "en"
  );

  const t = useMemo(() => {
    const current = translations[lang] || translations.en;
    return new Proxy(current, {
      get(target, prop) {
        if (typeof prop === "string" && prop in target && target[prop] !== undefined) {
          return target[prop];
        }
        if (typeof prop === "string" && prop in translations.en) {
          return translations.en[prop];
        }
        return typeof prop === "string" ? target[prop] : undefined;
      },
    });
  }, [lang]);

  const tr = useCallback(
    (str) => {
      if (str === null || str === undefined) return str;
      const key = String(str).trim();
      if (!key) return str;
      const dict = translations[lang] || translations.en;
      if (dict[key] !== undefined) return dict[key];
      if (translations.en[key] !== undefined && dict[translations.en[key]] !== undefined) {
        return dict[translations.en[key]];
      }
      return str;
    },
    [lang]
  );

  const setLanguage = useCallback((next) => {
    const selected = translations[next] ? next : "en";
    setLang(selected);
    localStorage.setItem(LANG_KEY, selected);
  }, []);

  const value = useMemo(
    () => ({ lang, t, tr, setLanguage }),
    [lang, t, tr, setLanguage],
  );

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export function useLanguage() {
  const ctx = useContext(LanguageContext);
  if (!ctx)
    throw new Error("useLanguage must be used within a LanguageProvider");
  return ctx;
}
