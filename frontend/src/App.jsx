import React, { useEffect } from "react";
import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
  useLocation,
} from "react-router-dom";
import Layout from "./components/Layout";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Activities from "./pages/Activities";
import Festivals from "./pages/Festivals";
import Annadhanam from "./pages/Annadhanam";
import Priests from "./pages/Priests";
import Staff from "./pages/Staff";
import Donations from "./pages/Donations";
import Inventory from "./pages/Inventory";
import Reports from "./pages/Reports";
import { LanguageProvider } from "./context/LanguageContext";
import { ThemeProvider } from "./context/ThemeContext";
import { SettingsProvider } from "./context/SettingsContext";
import { ToastProvider } from "./context/ToastContext";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { RecentlyAccessedProvider, useRecentlyAccessed } from "./context/RecentlyAccessedContext";

import { isPageAllowed, getDefaultRouteForRole } from "./utils/rbac";

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("Uncaught error:", error, errorInfo);
  }

  handleReset = () => {
    localStorage.clear();
    window.location.href = "/login";
  };

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          minHeight: "100vh",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          padding: "20px",
          fontFamily: "sans-serif",
          background: "#fbf7ee",
          color: "#2a1f17",
          textAlign: "center"
        }}>
          <h2>Something went wrong</h2>
          <p style={{ maxWidth: "500px", color: "#6b5d4f", marginBottom: "20px" }}>
            An unhandled application error occurred. Clearing temporary cache will resolve it.
          </p>
          <button
            onClick={this.handleReset}
            style={{
              padding: "10px 20px",
              background: "#9a2b25",
              color: "#fff",
              border: "none",
              borderRadius: "8px",
              cursor: "pointer",
              fontSize: "14px"
            }}
          >
            Reset Session & Login
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

function RequireAuth({ children }) {
  const { isAuthenticated } = useAuth();
  const location = useLocation();
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }
  return children;
}

function RequireRole({ page, children }) {
  const { user } = useAuth();
  const userRole = user?.role || "Administrator";
  if (!isPageAllowed(userRole, page)) {
    return <Navigate to={getDefaultRouteForRole(userRole)} replace />;
  }
  return children;
}

function RoleDefaultRedirect() {
  const { user } = useAuth();
  const userRole = user?.role || "Administrator";
  return <Navigate to={getDefaultRouteForRole(userRole)} replace />;
}

function RecentRouteTracker() {
  const location = useLocation();
  const { addRecentItem } = useRecentlyAccessed();

  useEffect(() => {
    const routeMap = {
      "/dashboard": { title: "Dashboard Overview", icon: "📊", category: "Navigation" },
      "/activities": { title: "Temple Rituals & Activities", icon: "🔱", category: "Activity" },
      "/festivals": { title: "Festivals & Utsavams", icon: "🕉️", category: "Festival" },
      "/annadhanam": { title: "Annadhanam Seva Record", icon: "🍛", category: "Seva" },
      "/priests": { title: "Priests & Archakas Roster", icon: "🛕", category: "Staff" },
      "/staff": { title: "Devasthanam Staff Management", icon: "👥", category: "Staff" },
      "/donations": { title: "Devotee Donations & Receipts", icon: "🪙", category: "Finance" },
      "/inventory": { title: "Pooja & Kitchen Inventory", icon: "📦", category: "Inventory" },
      "/reports": { title: "Temple Analytics & Reports", icon: "📈", category: "Analytics" },
    };

    const current = routeMap[location.pathname];
    if (current) {
      addRecentItem({
        title: current.title,
        path: location.pathname,
        icon: current.icon,
        category: current.category
      });
    }
  }, [location.pathname, addRecentItem]);

  return null;
}

export default function App() {
  return (
    <ErrorBoundary>
      <LanguageProvider>
        <ThemeProvider>
          <SettingsProvider>
            <ToastProvider>
              <AuthProvider>
                <RecentlyAccessedProvider>
                  <BrowserRouter>
                    <RecentRouteTracker />
                    <Routes>
                      <Route path="/login" element={<Login />} />
                      <Route
                        element={
                          <RequireAuth>
                            <Layout />
                          </RequireAuth>
                        }
                      >
                        <Route
                          path="/"
                          element={<RoleDefaultRedirect />}
                        />
                        <Route path="/dashboard" element={<RequireRole page="dashboard"><Dashboard /></RequireRole>} />
                        <Route path="/activities" element={<RequireRole page="activities"><Activities /></RequireRole>} />
                        <Route path="/festivals" element={<RequireRole page="festivals"><Festivals /></RequireRole>} />
                        <Route path="/annadhanam" element={<RequireRole page="annadhanam"><Annadhanam /></RequireRole>} />
                        <Route path="/priests" element={<RequireRole page="priests"><Priests /></RequireRole>} />
                        <Route path="/staff" element={<RequireRole page="staff"><Staff /></RequireRole>} />
                        <Route path="/donations" element={<RequireRole page="donations"><Donations /></RequireRole>} />
                        <Route path="/inventory" element={<RequireRole page="inventory"><Inventory /></RequireRole>} />
                        <Route path="/reports" element={<RequireRole page="reports"><Reports /></RequireRole>} />
                        <Route
                          path="*"
                          element={<RoleDefaultRedirect />}
                        />
                      </Route>
                    </Routes>
                  </BrowserRouter>
                </RecentlyAccessedProvider>
              </AuthProvider>
            </ToastProvider>
          </SettingsProvider>
        </ThemeProvider>
      </LanguageProvider>
    </ErrorBoundary>
  );
}
