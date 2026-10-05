import { createContext, useContext, useState, useCallback, useEffect } from "react";

const RecentlyAccessedContext = createContext(null);
const RECENT_KEY = "tams_recently_accessed";

const DEFAULT_RECENT = [
  { id: "dash", title: "Dashboard Overview", path: "/dashboard", icon: "📊", category: "Navigation", time: "Just now" },
  { id: "act", title: "Viswaroopa Darshan Seva", path: "/activities", icon: "🔱", category: "Activity", time: "10m ago" },
  { id: "don", title: "Annadhanam Endowment Record", path: "/donations", icon: "🪙", category: "Donation", time: "1h ago" },
  { id: "fest", title: "Skanda Sashti Utsavam 2026", path: "/festivals", icon: "🕉️", category: "Festival", time: "2h ago" }
];

export function RecentlyAccessedProvider({ children }) {
  const [recentlyAccessed, setRecentlyAccessed] = useState(() => {
    try {
      const saved = localStorage.getItem(RECENT_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {
      console.error("Error reading recently accessed from localStorage:", e);
    }
    return DEFAULT_RECENT;
  });

  useEffect(() => {
    try {
      localStorage.setItem(RECENT_KEY, JSON.stringify(recentlyAccessed));
    } catch (e) {
      console.error("Error saving recently accessed to localStorage:", e);
    }
  }, [recentlyAccessed]);

  const addRecentItem = useCallback((item) => {
    if (!item || !item.title || !item.path) return;
    setRecentlyAccessed((prev) => {
      // Remove existing matching entry by path or title
      const filtered = prev.filter((i) => i.path !== item.path && i.title !== item.title);
      const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      const newEntry = {
        id: item.id || `rec_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
        title: item.title,
        path: item.path,
        icon: item.icon || "📌",
        category: item.category || "Module",
        time: timestamp
      };
      // Keep up to 10 recent items
      return [newEntry, ...filtered].slice(0, 10);
    });
  }, []);

  const clearRecent = useCallback(() => {
    setRecentlyAccessed([]);
    localStorage.removeItem(RECENT_KEY);
  }, []);

  return (
    <RecentlyAccessedContext.Provider value={{ recentlyAccessed, addRecentItem, clearRecent }}>
      {children}
    </RecentlyAccessedContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export function useRecentlyAccessed() {
  const ctx = useContext(RecentlyAccessedContext);
  if (!ctx) throw new Error("useRecentlyAccessed must be used within RecentlyAccessedProvider");
  return ctx;
}
