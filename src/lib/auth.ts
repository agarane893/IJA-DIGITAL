// ─── Role & Permission Types ──────────────────────────────────────────────────

export type Permission =
  | "dashboard"
  | "pos"
  | "orders"
  | "kitchen"
  | "delivery"
  | "inventory"
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
  | "cashier"
  | "chef"
  | "delivery_driver";

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
}

// ─── Role → Permissions Map ───────────────────────────────────────────────────

export const ROLE_PERMISSIONS: Record<UserRole, Permission[]> = {
  super_admin: [
    "dashboard",
    "pos",
    "orders",
    "kitchen",
    "delivery",
    "inventory",
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
    "inventory",
    "stocks",
    "staff",
    "rh",
    "menu",
    "reports",
  ],
  cashier: [
    "pos",
    "orders",
  ],
  chef: [
    "kitchen",
    "orders",
  ],
  delivery_driver: [
    "delivery",
    "orders",
  ],
};

// ─── Role Labels ──────────────────────────────────────────────────────────────

export const ROLE_LABELS: Record<UserRole, string> = {
  super_admin: "Super Admin",
  manager: "Manager",
  cashier: "Caissier",
  chef: "Cuisinier",
  delivery_driver: "Livreur",
};

export const ROLE_DESCRIPTIONS: Record<UserRole, string> = {
  super_admin: "Accès complet à tous les restaurants et toutes les données",
  manager: "Dashboard, stocks, RH et rapports de performance",
  cashier: "Caisse POS et gestion des commandes",
  chef: "Vue préparation cuisine en temps réel",
  delivery_driver: "Gestion et suivi des livraisons",
};

export const ROLE_COLORS: Record<UserRole, { bg: string; text: string; border: string }> = {
  super_admin: { bg: "bg-purple-500/15", text: "text-purple-400", border: "border-purple-500/30" },
  manager:     { bg: "bg-blue-500/15",   text: "text-blue-400",   border: "border-blue-500/30" },
  cashier:     { bg: "bg-emerald-500/15",text: "text-emerald-400",border: "border-emerald-500/30" },
  chef:        { bg: "bg-amber-500/15",  text: "text-amber-400",  border: "border-amber-500/30" },
  delivery_driver: { bg: "bg-orange-500/15", text: "text-orange-400", border: "border-orange-500/30" },
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
  },
  {
    id: "u3",
    name: "Karim Tlili",
    email: "karim@ija.digital",
    role: "cashier",
    avatar: "KT",
    restaurantId: "r1",
    permissions: ROLE_PERMISSIONS.cashier,
    initials: "KT",
  },
  {
    id: "u4",
    name: "Sonia Hamdi",
    email: "sonia@ija.digital",
    role: "chef",
    avatar: "SH",
    restaurantId: "r1",
    permissions: ROLE_PERMISSIONS.chef,
    initials: "SH",
  },
  {
    id: "u5",
    name: "Fares Gharbi",
    email: "fares@ija.digital",
    role: "delivery_driver",
    avatar: "FG",
    restaurantId: "r1",
    permissions: ROLE_PERMISSIONS.delivery_driver,
    initials: "FG",
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
    cashier: "/pos",
    chef: "/kitchen",
    delivery_driver: "/delivery",
  };
  return map[role];
}
