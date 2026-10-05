import { createContext, useContext, useState, useCallback, useEffect } from "react";
import { db } from "../services/db";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem("tams_token"));
  const [isAuthenticated, setIsAuthenticated] = useState(
    () => localStorage.getItem("tams_auth") === "true" && Boolean(localStorage.getItem("tams_token")),
  );
  const [user, setUser] = useState(() => {
    try {
      const saved = localStorage.getItem("tams_user");
      return saved ? JSON.parse(saved) : null;
    } catch (e) {
      console.error("Error parsing tams_user from localStorage:", e);
      localStorage.removeItem("tams_user");
      return null;
    }
  });

  const logout = useCallback(() => {
    localStorage.removeItem("tams_auth");
    localStorage.removeItem("tams_user");
    localStorage.removeItem("tams_token");
    setToken(null);
    setUser(null);
    setIsAuthenticated(false);
  }, []);

  useEffect(() => {
    const savedToken = localStorage.getItem("tams_token");
    if (savedToken) {
      db.verifyToken()
        .then((res) => {
          if (res && res.success) {
            setIsAuthenticated(true);
            if (res.user) setUser(res.user);
          } else {
            logout();
          }
        })
        .catch(() => {
          // Retain state if network glitch
        });
    }
  }, [logout]);

  const login = useCallback(async (username, password) => {
    const res = await db.loginUser(username.trim().toLowerCase(), password);
    if (res && res.success) {
      const activeUser = res.user || { username: 'admin', role: 'Administrator', name: 'Temple Administrator' };
      localStorage.setItem("tams_auth", "true");
      localStorage.setItem("tams_user", JSON.stringify(activeUser));
      if (res.token) {
        localStorage.setItem("tams_token", res.token);
        setToken(res.token);
      }
      setIsAuthenticated(true);
      setUser(activeUser);
      return true;
    }
    return false;
  }, []);

  const loginWithOAuth = useCallback(async (provider, profile = {}) => {
    const res = await db.loginOAuth(provider, profile);
    if (res && res.success) {
      const activeUser = res.user;
      localStorage.setItem("tams_auth", "true");
      localStorage.setItem("tams_user", JSON.stringify(activeUser));
      if (res.token) {
        localStorage.setItem("tams_token", res.token);
        setToken(res.token);
      }
      setIsAuthenticated(true);
      setUser(activeUser);
      return true;
    }
    return false;
  }, []);

  const getDecodedToken = useCallback(() => {
    const activeToken = token || localStorage.getItem("tams_token");
    if (!activeToken) return null;
    try {
      const parts = activeToken.split(".");
      if (parts.length === 3) {
        return JSON.parse(atob(parts[1]));
      }
    } catch (e) {
      console.error("Error decoding JWT token:", e);
    }
    return null;
  }, [token]);

  return (
    <AuthContext.Provider value={{ isAuthenticated, user, token, login, loginWithOAuth, logout, getDecodedToken }}>
      {children}
    </AuthContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within an AuthProvider");
  return ctx;
}
