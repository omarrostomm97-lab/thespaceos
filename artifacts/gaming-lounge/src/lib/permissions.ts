export type UserRole = "platform_owner" | "owner" | "manager" | "cashier" | "buffet_worker";

const ALL_MGMT: UserRole[] = ["platform_owner", "owner", "manager"];
const ALL_STAFF: UserRole[] = ["platform_owner", "owner", "manager", "cashier"];
const ALL_AUTHENTICATED: UserRole[] = ["platform_owner", "owner", "manager", "cashier", "buffet_worker"];

export const ROLE_DEFAULTS: Record<UserRole, string> = {
  platform_owner: "/dashboard",
  owner: "/dashboard",
  manager: "/dashboard",
  cashier: "/sessions",
  buffet_worker: "/kds",
};

export const ROUTE_ALLOWED_ROLES: Record<string, UserRole[]> = {
  "/dashboard":   ALL_MGMT,
  "/assets":      [...ALL_MGMT, "cashier"],
  "/assets/:id/history": ALL_MGMT,
  "/sessions":    ALL_STAFF,
  "/sessions/:id": ALL_STAFF,
  "/pos":         ALL_STAFF,
  "/kds":         ["platform_owner", "owner", "manager", "buffet_worker"],
  "/orders":      ALL_AUTHENTICATED,
  "/menu":        ALL_MGMT,
  "/inventory":   ALL_MGMT,
  "/shifts":      ALL_STAFF,
  "/payments":    ALL_STAFF,
  "/recipes":     ALL_MGMT,
  "/bookings":    ALL_MGMT,
  "/performance": ALL_MGMT,
  "/users":       ALL_MGMT,
  "/audit":       ALL_MGMT,
  "/settings":    ALL_MGMT,
  "/admin/tenants": ["platform_owner"],
  "/admin/users":   ["platform_owner"],
};

export function canAccess(role: UserRole | undefined, routePath: string): boolean {
  if (!role) return false;
  const allowed = ROUTE_ALLOWED_ROLES[routePath];
  if (!allowed) return true;
  return allowed.includes(role);
}

export function defaultRedirect(role: UserRole | undefined): string {
  if (!role) return "/login";
  return ROLE_DEFAULTS[role] ?? "/dashboard";
}
