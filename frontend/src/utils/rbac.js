export const ALLOWED_PAGES_BY_ROLE = {
  administrator: ["dashboard", "panchangam", "abharanam", "activities", "festivals", "annadhanam", "priests", "staff", "donations", "inventory", "reports", "audit"],
  admin: ["dashboard", "panchangam", "abharanam", "activities", "festivals", "annadhanam", "priests", "staff", "donations", "inventory", "reports", "audit"],
  priest: ["panchangam", "abharanam", "activities", "festivals"],
  treasurer: ["donations", "reports", "inventory", "abharanam"],
  staff: ["dashboard", "panchangam", "activities", "inventory"],
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
  if (normRole === "priest") return "/panchangam";
  if (normRole === "treasurer") return "/donations";
  return "/dashboard";
}

