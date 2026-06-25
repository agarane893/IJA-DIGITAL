// ─── Role & Permission Types ──────────────────────────────────────────────────

export type Permission =
  | "dashboard"
  | "pos"
  | "orders"
  | "stocks"
  | "staff"
  | "rh"
  | "menu"
  | "reports"
  | "global_stats"
  | "multi_restaurant"
  | "settings";

export type UserRole =
  | "super_admin"
  | "manager"
  | "serveur";

export interface Restaurant {
  id: string;
  name: string;
  location: string;
  avatar: string;
}

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar: string;
  restaurantId: string | null; // null for super_admin (all restaurants)
  permissions: Permission[];
  initials: string;
  pin: string;
}

// ─── Role → Permissions Map ───────────────────────────────────────────────────

export const ROLE_PERMISSIONS: Record<UserRole, Permission[]> = {
  super_admin: [
    "dashboard",
    "pos",
    "orders",
    "stocks",
    "staff",
    "rh",
    "menu",
    "reports",
    "global_stats",
    "multi_restaurant",
    "settings",
  ],
  manager: [
    "dashboard",
    "orders",
    "stocks",
    "staff",
    "rh",
    "menu",
    "reports",
    "settings"
  ],
  serveur: [
    "pos",
    "orders",
    "stocks"
  ],
};

// ─── Role Labels ──────────────────────────────────────────────────────────────

export const ROLE_LABELS: Record<UserRole, string> = {
  super_admin: "Super Admin",
  manager: "Manager",
  serveur: "Serveur",
};

export const ROLE_DESCRIPTIONS: Record<UserRole, string> = {
  super_admin: "Accès complet à tous les restaurants et toutes les données",
  manager: "Vue globale, gestion des stocks et de l'équipe",
  serveur: "Prise de commande et suivi du service",
};

export const ROLE_COLORS: Record<UserRole, { bg: string; text: string; border: string }> = {
  super_admin: { bg: "bg-purple-500/15", text: "text-purple-400", border: "border-purple-500/30" },
  manager:     { bg: "bg-blue-500/15",   text: "text-blue-400",   border: "border-blue-500/30" },
  serveur:     { bg: "bg-emerald-500/15",text: "text-emerald-400",border: "border-emerald-500/30" },
};

// ─── Demo Restaurants ─────────────────────────────────────────────────────────

export const DEMO_RESTAURANTS: Restaurant[] = [
  { id: "r1", name: "Ija Tunis", location: "Centre-Ville, Tunis", avatar: "🏛️" },
  { id: "r2", name: "Ija Lac", location: "Les Berges du Lac, Tunis", avatar: "🌊" },
  { id: "r3", name: "Ija Carthage", location: "Carthage, Tunis", avatar: "🏺" },
];

// ─── Demo Users ───────────────────────────────────────────────────────────────

export const DEMO_USERS: AuthUser[] = [
  {
    id: "u1",
    name: "Ahmed Zine",
    email: "ahmed@ija.digital",
    role: "super_admin",
    avatar: "AZ",
    restaurantId: null,
    permissions: ROLE_PERMISSIONS.super_admin,
    initials: "AZ",
    pin: "9999",
  },
  {
    id: "u2",
    name: "Mariem Bouaziz",
    email: "mariem@ija.digital",
    role: "manager",
    avatar: "MB",
    restaurantId: "r1",
    permissions: ROLE_PERMISSIONS.manager,
    initials: "MB",
    pin: "1234",
  },
  {
    id: "u3",
    name: "Karim Tlili",
    email: "karim@ija.digital",
    role: "serveur",
    avatar: "KT",
    restaurantId: "r1",
    permissions: ROLE_PERMISSIONS.serveur,
    initials: "KT",
    pin: "5678",
  },
];

// ─── Permission Guard ─────────────────────────────────────────────────────────

export function hasPermission(user: AuthUser | null, permission: Permission): boolean {
  if (!user) return false;
  return user.permissions.includes(permission);
}

export function getDefaultRoute(role: UserRole): string {
  const map: Record<UserRole, string> = {
    super_admin: "/dashboard",
    manager: "/dashboard",
    serveur: "/pos",
  };
  return map[role];
}
