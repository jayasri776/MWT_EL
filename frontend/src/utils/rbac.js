export const ALLOWED_PAGES_BY_ROLE = {
  administrator: ["dashboard", "activities", "festivals", "annadhanam", "priests", "staff", "donations", "inventory", "reports"],
  admin: ["dashboard", "activities", "festivals", "annadhanam", "priests", "staff", "donations", "inventory", "reports"],
  priest: ["activities", "festivals"],
  treasurer: ["donations", "reports"],
};

export function isPageAllowed(role, page) {
  const normRole = (role || "").toLowerCase();
  const allowed = ALLOWED_PAGES_BY_ROLE[normRole];
  if (!allowed) {
    return true; // default to full access if unassigned
  }
  return allowed.includes(page);
}

export function getDefaultRouteForRole(role) {
  const normRole = (role || "").toLowerCase();
  if (normRole === "priest") return "/activities";
  if (normRole === "treasurer") return "/donations";
  return "/dashboard";
}
