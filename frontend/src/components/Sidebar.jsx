import { NavLink, useNavigate } from "react-router-dom";
import { useLanguage } from "../context/LanguageContext";
import { useAuth } from "../context/AuthContext";
import { useRecentlyAccessed } from "../context/RecentlyAccessedContext";
import { isPageAllowed, getDefaultRouteForRole } from "../utils/rbac";

const NAV_GROUPS = [
  {
    labelKey: "navOverview",
    items: [
      {
        page: "dashboard",
        labelKey: "navDashboard",
        icon: (
          <svg className="ic" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.6">
            <rect x="2.5" y="2.5" width="6.5" height="6.5" rx="1.3" />
            <rect x="11" y="2.5" width="6.5" height="9.5" rx="1.3" />
            <rect x="2.5" y="11.5" width="6.5" height="6" rx="1.3" />
            <rect x="11" y="14.5" width="6.5" height="3" rx="1.3" />
          </svg>
        ),
      },
    ],
  },
  {
    labelKey: "navSacredRites",
    items: [
      {
        page: "panchangam",
        labelKey: "navPanchangam",
        badge: "Today",
        icon: (
          <svg className="ic" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.6">
            <path d="M10 2L12 7.5H18L13 11L15 17.5L10 13.5L5 17.5L7 11L2 7.5H8L10 2Z" />
          </svg>
        ),
      },
      {
        page: "activities",
        labelKey: "navActivities",
        icon: (
          <svg className="ic" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.6">
            <rect x="2.5" y="3.5" width="15" height="14" rx="2" />
            <path d="M2.5 7.5H17.5" />
            <path d="M6 2V5" />
            <path d="M14 2V5" />
          </svg>
        ),
      },
      {
        page: "festivals",
        labelKey: "navFestivals",
        badge: "2",
        icon: (
          <svg className="ic" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.6">
            <circle cx="10" cy="10" r="7" />
            <path d="M10 6V10L13 12" />
          </svg>
        ),
      },
      {
        page: "annadhanam",
        labelKey: "navAnnadhanam",
        icon: (
          <svg className="ic" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.6">
            <path d="M4 8C4 8 4 4 10 4C16 4 16 8 16 8" />
            <path d="M3 8H17L16 17H4L3 8Z" />
          </svg>
        ),
      },
    ],
  },
  {
    labelKey: "navPeople",
    items: [
      {
        page: "priests",
        labelKey: "navPriests",
        icon: (
          <svg className="ic" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.6">
            <circle cx="10" cy="6.5" r="3.5" />
            <path d="M3 17c0-3.5 3-6 7-6s7 2.5 7 6" />
          </svg>
        ),
      },
      {
        page: "staff",
        labelKey: "navStaff",
        icon: (
          <svg className="ic" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.6">
            <circle cx="7" cy="6" r="2.6" />
            <circle cx="14" cy="7.5" r="2.2" />
            <path d="M2 17c0-3 2.2-5 5-5s5 2 5 5" />
            <path d="M11.5 12.3c2.4.2 4 2 4 4.7" />
          </svg>
        ),
      },
      {
        page: "donations",
        labelKey: "navDonations",
        icon: (
          <svg className="ic" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.6">
            <path d="M10 3v14M6 6.5h5.5a2.2 2.2 0 010 4.4H7M6 10.9h6a2.2 2.2 0 010 4.4H6" />
          </svg>
        ),
      },
    ],
  },
  {
    labelKey: "navResources",
    items: [
      {
        page: "inventory",
        labelKey: "navInventory",
        badge: "3",
        icon: (
          <svg className="ic" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.6">
            <path d="M2.5 6L10 2.5L17.5 6L10 9.5L2.5 6Z" />
            <path d="M2.5 6V14L10 17.5L17.5 14V6" />
            <path d="M10 9.5V17.5" />
          </svg>
        ),
      },
      {
        page: "reports",
        labelKey: "navReports",
        icon: (
          <svg className="ic" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.6">
            <path d="M5 2.5H12L16 6.5V17.5H5V2.5Z" />
            <path d="M12 2.5V6.5H16" />
            <path d="M7.5 11H13.5M7.5 14H13.5" />
          </svg>
        ),
      },
    ],
  },
];


export default function Sidebar() {
  const { t, tr } = useLanguage();
  const { user } = useAuth();
  const { recentlyAccessed } = useRecentlyAccessed();
  const navigate = useNavigate();

  const userRole = user?.role || "Administrator";

  const allowedRecent = recentlyAccessed.filter((item) => {
    const pageName = item.path.replace(/^\//, "");
    return isPageAllowed(userRole, pageName);
  });

  return (
    <aside className="sidebar">
      <div className="brand">
        <div className="brand-mark">
          <svg className="gopuram-icon" viewBox="0 0 32 32" fill="none">
            <path d="M16 2L21 8H11L16 2Z" fill="#C08829" />
            <path d="M8 8H24L26 13H6L8 8Z" fill="#C08829" fillOpacity="0.85" />
            <path d="M4 13H28L29.5 18H2.5L4 13Z" fill="#C08829" fillOpacity="0.7" />
            <rect x="7" y="18" width="18" height="11" rx="1" fill="#EFEBE1" fillOpacity="0.9" />
            <rect x="14" y="22" width="4" height="7" fill="#0D3A34" />
          </svg>
          <div className="brand-name">TAMS</div>
        </div>
        <div className="brand-sub">{t.brandSub || tr("Temple Activity Mgmt.")}</div>
      </div>

      <div
        className="temple-switch"
        onClick={() => navigate(getDefaultRouteForRole(userRole))}
        title="Subramaniya Swamy Temple"
      >
        <div>
          <div className="tname">{tr("Subramaniya Swamy Temple")}</div>
          <div className="tloc">{t.templeLoc || tr("Tiruchendur, Tamil Nadu")}</div>
        </div>
        <span>⌄</span>
      </div>

      {NAV_GROUPS.map((group) => {
        const items = group.items.filter((item) => isPageAllowed(userRole, item.page));
        if (items.length === 0) return null;
        return (
          <div key={group.labelKey}>
            <div className="nav-group-label">{t[group.labelKey] || group.labelKey}</div>
            <ul className="nav">
              {items.map((item) => (
                <li key={item.page}>
                  <NavLink
                    to={`/${item.page}`}
                    className={({ isActive }) => (isActive ? "active" : undefined)}
                  >
                    {item.icon}
                    <span>{t[item.labelKey] || item.page}</span>
                    {item.badge && <span className="badge">{item.badge}</span>}
                  </NavLink>
                </li>
              ))}
            </ul>
          </div>
        );
      })}

      {/* Recently Accessed Sidebar Quick Section */}
      {allowedRecent.length > 0 && (
        <div style={{ marginTop: "1rem", padding: "0 12px" }}>
          <div className="nav-group-label" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span>🕒 {tr("Recently Accessed")}</span>
            <span style={{ fontSize: "0.7rem", opacity: 0.7 }}>({allowedRecent.length})</span>
          </div>
          <ul className="nav" style={{ gap: "2px" }}>
            {allowedRecent.slice(0, 4).map((item) => (
              <li key={`side_${item.id}`}>
                <NavLink
                  to={item.path}
                  style={({ isActive }) => ({
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                    padding: "6px 10px",
                    fontSize: "0.82rem",
                    borderRadius: "6px",
                    opacity: isActive ? 1 : 0.85,
                    background: isActive ? "rgba(192, 136, 41, 0.15)" : "transparent"
                  })}
                >
                  <span style={{ fontSize: "0.95rem" }}>{item.icon}</span>
                  <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {tr(item.title)}
                  </span>
                </NavLink>
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="sidebar-foot">
        <div className="admin-chip">
          <div className="admin-avatar">
            {user?.name ? user.name.charAt(0).toUpperCase() : "A"}
          </div>
          <div style={{ overflow: "hidden" }}>
            <div className="admin-name" style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
              {user?.name || "Temple Administrator"}
            </div>
            <div className="admin-role" style={{ fontSize: "0.72rem", color: "var(--accent-color, #c08829)" }}>
              {user?.role || t.templeAdmin} · {user?.auth_provider || "JWT"}
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
}
