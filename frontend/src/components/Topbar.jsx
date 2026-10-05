import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useTheme } from "../context/ThemeContext";
import { useSettings } from "../context/SettingsContext";
import { useLanguage } from "../context/LanguageContext";
import { useAuth } from "../context/AuthContext";
import { useRecentlyAccessed } from "../context/RecentlyAccessedContext";
import { translations } from "../data/translations";

const LANGUAGE_LABELS = {
  en: "English 🇬🇧",
  ta: "தமிழ் 🇮🇳",
  hi: "हिन्दी 🇮🇳",
  ml: "മലയാളം 🇮🇳",
  kn: "ಕನ್ನಡ 🇮🇳",
  te: "తెలుగు 🇮🇳",
};

function useClickOutside(ref, onOutside) {
  useEffect(() => {
    function handle(e) {
      if (ref.current && !ref.current.contains(e.target)) onOutside();
    }
    document.addEventListener("mousedown", handle);
    return () => document.removeEventListener("mousedown", handle);
  }, [ref, onOutside]);
}

function PaletteIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 22a10 10 0 1 1 10-10c0 2-1 3-3 3h-2a2 2 0 0 0-2 2c0 1 1 2 1 3 0 1-1 2-4 2Z" />
      <circle cx="7.5" cy="10.5" r="1.2" fill="currentColor" />
      <circle cx="12" cy="7" r="1.2" fill="currentColor" />
      <circle cx="16.5" cy="10.5" r="1.2" fill="currentColor" />
    </svg>
  );
}

function SettingsIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="3" />
      <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.6 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.6a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1Z" />
    </svg>
  );
}

function ClockIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <polyline points="12 6 12 12 16 14" />
    </svg>
  );
}

function ShieldCheckIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
      <path d="m9 12 2 2 4-4" />
    </svg>
  );
}

export default function Topbar() {
  const navigate = useNavigate();
  const { user, token, logout, getDecodedToken } = useAuth();
  const { lang, tr, setLanguage } = useLanguage();
  const { accentColor, setAccentColor, THEME_COLORS } = useTheme();
  const { font, setFont, size, setSize, FONT_OPTIONS, SIZE_OPTIONS } = useSettings();
  const { recentlyAccessed, clearRecent } = useRecentlyAccessed();

  const languageCodes = Object.keys(translations);

  const [colorOpen, setColorOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [recentOpen, setRecentOpen] = useState(false);
  const [jwtOpen, setJwtOpen] = useState(false);
  const [settingsTab, setSettingsTab] = useState("font");

  const colorRef = useRef(null);
  const settingsRef = useRef(null);
  const recentRef = useRef(null);
  const jwtRef = useRef(null);

  useClickOutside(colorRef, () => setColorOpen(false));
  useClickOutside(settingsRef, () => setSettingsOpen(false));
  useClickOutside(recentRef, () => setRecentOpen(false));
  useClickOutside(jwtRef, () => setJwtOpen(false));

  const decoded = getDecodedToken();

  function handleLogout() {
    logout();
    navigate("/login");
  }

  function handleNavigateRecent(path) {
    setRecentOpen(false);
    navigate(path);
  }

  return (
    <header className="topbar">
      {/* Language Selector */}
      <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
        <span style={{ fontSize: "0.85rem", fontWeight: "600", color: "var(--text-muted)" }}>🌐</span>
        <select
          className="lang-select"
          value={lang}
          onChange={(e) => setLanguage(e.target.value)}
          title={tr("Change Application Language")}
        >
          {languageCodes.map((code) => (
            <option key={code} value={code}>
              {LANGUAGE_LABELS[code] || code.toUpperCase()}
            </option>
          ))}
        </select>
      </div>

      {/* Recently Accessed Dropdown Popover */}
      <div className="topbar-popover" ref={recentRef}>
        <button
          type="button"
          className="icon-btn"
          aria-label="Recently Accessed"
          title={tr("Recently Accessed Views")}
          onClick={() => {
            setRecentOpen((v) => !v);
            setColorOpen(false);
            setSettingsOpen(false);
            setJwtOpen(false);
          }}
          style={{ position: "relative" }}
        >
          <ClockIcon />
          {recentlyAccessed.length > 0 && (
            <span style={{
              position: "absolute",
              top: "-2px",
              right: "-2px",
              background: "var(--accent-color, #f59e0b)",
              color: "#fff",
              borderRadius: "50%",
              width: "14px",
              height: "14px",
              fontSize: "10px",
              fontWeight: "bold",
              display: "flex",
              alignItems: "center",
              justifyContent: "center"
            }}>
              {recentlyAccessed.length}
            </span>
          )}
        </button>

        {recentOpen && (
          <div className="popover-panel recent-panel" style={{ width: "320px", padding: "12px", right: 0 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px", borderBottom: "1px solid var(--border-color, #e2e8f0)", paddingBottom: "6px" }}>
              <p className="popover-title" style={{ margin: 0, fontSize: "0.9rem", fontWeight: "bold" }}>
                🕒 {tr("Recently Accessed")}
              </p>
              {recentlyAccessed.length > 0 && (
                <button
                  type="button"
                  onClick={clearRecent}
                  style={{ background: "none", border: "none", color: "#ef4444", fontSize: "0.75rem", cursor: "pointer" }}
                >
                  {tr("Clear All")}
                </button>
              )}
            </div>

            {recentlyAccessed.length === 0 ? (
              <p style={{ fontSize: "0.85rem", color: "var(--text-muted)", margin: "12px 0", textAlign: "center" }}>
                {tr("No recently accessed pages yet.")}
              </p>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: "6px", maxHeight: "280px", overflowY: "auto" }}>
                {recentlyAccessed.map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => handleNavigateRecent(item.path)}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "10px",
                      padding: "8px 10px",
                      borderRadius: "6px",
                      background: "var(--bg-hover, #f8fafc)",
                      border: "1px solid var(--border-color, #cbd5e1)",
                      cursor: "pointer",
                      textAlign: "left",
                      transition: "all 0.15s"
                    }}
                  >
                    <span style={{ fontSize: "1.2rem" }}>{item.icon}</span>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{ margin: 0, fontSize: "0.85rem", fontWeight: "600", color: "var(--text-main, #1e293b)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                        {tr(item.title)}
                      </p>
                      <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.72rem", color: "var(--text-muted)" }}>
                        <span>{tr(item.category)}</span>
                        <span>{item.time}</span>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Theme Color Picker */}
      <div className="topbar-popover" ref={colorRef}>
        <button
          type="button"
          className="icon-btn"
          aria-label="Choose theme color"
          title={tr("Theme Color")}
          onClick={() => {
            setColorOpen((v) => !v);
            setSettingsOpen(false);
            setRecentOpen(false);
            setJwtOpen(false);
          }}
        >
          <PaletteIcon />
        </button>
        {colorOpen && (
          <div className="popover-panel color-panel">
            <p className="popover-title">{tr("Theme color")}</p>
            <div className="color-grid">
              {THEME_COLORS.map((c) => (
                <button
                  key={c.value}
                  type="button"
                  className={`color-swatch${accentColor === c.value ? " active" : ""}`}
                  style={{ background: c.value }}
                  title={c.name}
                  aria-label={c.name}
                  onClick={() => {
                    setAccentColor(c);
                    setColorOpen(false);
                  }}
                />
              ))}
            </div>
          </div>
        )}
      </div>

      {/* App Settings Popover (Fonts & Sizes) */}
      <div className="topbar-popover" ref={settingsRef}>
        <button
          type="button"
          className="icon-btn"
          aria-label="Settings"
          title={tr("Settings")}
          onClick={() => {
            setSettingsOpen((v) => !v);
            setColorOpen(false);
            setRecentOpen(false);
            setJwtOpen(false);
          }}
        >
          <SettingsIcon />
        </button>
        {settingsOpen && (
          <div className="popover-panel settings-panel">
            <div className="settings-tabs">
              <button
                type="button"
                className={settingsTab === "font" ? "active" : ""}
                onClick={() => setSettingsTab("font")}
              >
                {tr("Fonts")}
              </button>
              <button
                type="button"
                className={settingsTab === "size" ? "active" : ""}
                onClick={() => setSettingsTab("size")}
              >
                {tr("Size")}
              </button>
            </div>

            {settingsTab === "font" && (
              <div className="settings-options">
                {FONT_OPTIONS.map((f) => (
                  <button
                    key={f.value}
                    type="button"
                    className={`option-row${font === f.value ? " active" : ""}`}
                    style={{ fontFamily: f.value }}
                    onClick={() => setFont(f.value)}
                  >
                    {f.name}
                  </button>
                ))}
              </div>
            )}

            {settingsTab === "size" && (
              <div className="settings-options">
                {SIZE_OPTIONS.map((s) => (
                  <button
                    key={s.value}
                    type="button"
                    className={`option-row${size === s.value ? " active" : ""}`}
                    onClick={() => setSize(s.value)}
                  >
                    {tr(s.name)}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* JWT & OAuth Status Badge / Inspector */}
      <div className="topbar-popover" ref={jwtRef}>
        <button
          type="button"
          className="jwt-badge-btn"
          onClick={() => {
            setJwtOpen((v) => !v);
            setColorOpen(false);
            setSettingsOpen(false);
            setRecentOpen(false);
          }}
          title={tr("Inspect Active JWT Session Token")}
          style={{
            display: "flex",
            alignItems: "center",
            gap: "6px",
            background: "rgba(16, 185, 129, 0.12)",
            border: "1px solid rgba(16, 185, 129, 0.3)",
            color: "#059669",
            padding: "4px 10px",
            borderRadius: "20px",
            fontSize: "0.78rem",
            fontWeight: "600",
            cursor: "pointer"
          }}
        >
          <ShieldCheckIcon />
          <span>{user?.auth_provider || "JWT Active"}</span>
        </button>

        {jwtOpen && (
          <div className="popover-panel jwt-panel" style={{ width: "340px", padding: "14px", right: 0 }}>
            <p className="popover-title" style={{ margin: 0, marginBottom: "8px", color: "#059669", display: "flex", alignItems: "center", gap: "6px" }}>
              <ShieldCheckIcon /> {tr("JWT Session Inspector")}
            </p>
            <div style={{ fontSize: "0.8rem", background: "#f8fafc", padding: "10px", borderRadius: "6px", border: "1px solid #e2e8f0" }}>
              <div style={{ marginBottom: "6px" }}>
                <strong>{tr("Authenticated User:")}</strong> {user?.name || decoded?.name || "Temple Administrator"}
              </div>
              <div style={{ marginBottom: "6px" }}>
                <strong>{tr("Role / Grant:")}</strong> <span style={{ color: "#2563eb", fontWeight: "600" }}>{user?.role || decoded?.role || "Administrator"}</span>
              </div>
              <div style={{ marginBottom: "6px" }}>
                <strong>{tr("Auth Method:")}</strong> <span style={{ color: "#059669", fontWeight: "600" }}>{user?.auth_provider || decoded?.auth_provider || "Google OAuth 2.0 / JWT"}</span>
              </div>
              <div style={{ marginBottom: "6px" }}>
                <strong>{tr("JWT Token Format:")}</strong> <code style={{ fontSize: "0.7rem", wordBreak: "break-all", color: "#475569" }}>{token ? `${token.substring(0, 24)}...${token.substring(token.length - 12)}` : "Verified Bearer"}</code>
              </div>
              <div>
                <strong>{tr("Status:")}</strong> <span style={{ color: "#16a34a", fontWeight: "bold" }}>✓ {tr("Verified Active (24h validity)")}</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Logout Button */}
      <button type="button" className="btn-outline" onClick={handleLogout}>
        {tr("Log out")}
      </button>
    </header>
  );
}
