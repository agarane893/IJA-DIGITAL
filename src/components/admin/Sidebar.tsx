"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard,
  ShoppingCart,
  ChefHat,
  Truck,
  Package,
  Users,
  MenuSquare,
  BarChart3,
  Globe,
  Settings,
  LogOut,
  ChevronLeft,
  ChevronRight,
  UtensilsCrossed,
} from "lucide-react";
import { useAuthStore } from "@/lib/useAuthStore";
import { Permission, ROLE_LABELS, ROLE_COLORS, hasPermission } from "@/lib/auth";
import { cn } from "@/lib/utils";

interface NavItem {
  label: string;
  href: string;
  icon: React.ReactNode;
  permission: Permission;
  badge?: string;
}

const NAV_ITEMS: NavItem[] = [
  {
    label: "Dashboard",
    href: "/dashboard",
    icon: <LayoutDashboard className="w-5 h-5" />,
    permission: "dashboard",
  },
  {
    label: "Stats Globales",
    href: "/global",
    icon: <Globe className="w-5 h-5" />,
    permission: "global_stats",
  },
  {
    label: "Caisse POS",
    href: "/pos",
    icon: <ShoppingCart className="w-5 h-5" />,
    permission: "pos",
  },
  {
    label: "Commandes",
    href: "/orders",
    icon: <UtensilsCrossed className="w-5 h-5" />,
    permission: "orders",
    badge: "5",
  },
  {
    label: "Préparation",
    href: "/kitchen",
    icon: <ChefHat className="w-5 h-5" />,
    permission: "kitchen",
    badge: "3",
  },
  {
    label: "Menu & Produits",
    href: "/menu",
    icon: <MenuSquare className="w-5 h-5" />,
    permission: "menu",
  },
  {
    label: "Livraisons",
    href: "/delivery",
    icon: <Truck className="w-5 h-5" />,
    permission: "delivery",
  },
  {
    label: "Stocks",
    href: "/stocks",
    icon: <Package className="w-5 h-5" />,
    permission: "stocks",
  },
  {
    label: "RH & Personnel",
    href: "/rh",
    icon: <Users className="w-5 h-5" />,
    permission: "rh",
  },
  {
    label: "Rapports",
    href: "/reports",
    icon: <BarChart3 className="w-5 h-5" />,
    permission: "reports",
  },
  {
    label: "Paramètres",
    href: "/settings",
    icon: <Settings className="w-5 h-5" />,
    permission: "settings",
  },
];

export function AdminSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, sidebarCollapsed, toggleSidebar, logout } = useAuthStore();

  if (!user) return null;

  const allowedItems = NAV_ITEMS.filter((item) => hasPermission(user, item.permission));
  const roleColors = ROLE_COLORS[user.role];

  const handleLogout = () => {
    logout();
    router.push("/login");
  };

  return (
    <>
      {/* Mobile overlay */}
      <AnimatePresence>
        {!sidebarCollapsed && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-30 lg:hidden"
            onClick={toggleSidebar}
          />
        )}
      </AnimatePresence>

      <motion.aside
        animate={{ width: sidebarCollapsed ? 72 : 260 }}
        transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
        className={cn(
          "fixed left-0 top-0 h-full z-40 flex flex-col",
          "bg-[#0D1117] border-r border-white/6",
          "shadow-2xl"
        )}
      >
        {/* Logo header */}
        <div className="h-16 flex items-center justify-between px-4 border-b border-white/6 shrink-0">
          <AnimatePresence mode="wait">
            {!sidebarCollapsed ? (
              <motion.div
                key="full"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                transition={{ duration: 0.2 }}
                className="flex items-center gap-2.5 overflow-hidden"
              >
                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#D95D39] to-[#E68867] flex items-center justify-center text-white font-black text-lg shadow-lg shadow-[#D95D39]/20 shrink-0">
                  I
                </div>
                <div>
                  <div className="font-heading font-black text-white text-sm leading-tight">
                    Ija Digital
                  </div>
                  <div className="text-[10px] text-[#D95D39] font-semibold">
                    Restaurant OS
                  </div>
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="icon"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                transition={{ duration: 0.2 }}
                className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#D95D39] to-[#E68867] flex items-center justify-center text-white font-black text-lg shadow-lg mx-auto"
              >
                I
              </motion.div>
            )}
          </AnimatePresence>

          {!sidebarCollapsed && (
            <button
              onClick={toggleSidebar}
              className="w-7 h-7 rounded-lg bg-white/5 border border-white/8 flex items-center justify-center text-white/40 hover:text-white hover:bg-white/10 transition-all shrink-0"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Collapsed toggle */}
        {sidebarCollapsed && (
          <button
            onClick={toggleSidebar}
            className="mx-auto mt-3 w-8 h-8 rounded-lg bg-white/5 border border-white/8 flex items-center justify-center text-white/40 hover:text-white hover:bg-white/10 transition-all"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        )}

        {/* User profile pill */}
        <div
          className={cn(
            "mx-3 mt-4 mb-2 rounded-xl border p-3 shrink-0",
            roleColors.bg,
            roleColors.border
          )}
        >
          <div className={cn("flex items-center", sidebarCollapsed ? "justify-center" : "gap-3")}>
            <div
              className={cn(
                "w-8 h-8 rounded-lg flex items-center justify-center font-bold text-xs shrink-0 border",
                roleColors.bg,
                roleColors.text,
                roleColors.border
              )}
            >
              {user.initials}
            </div>
            {!sidebarCollapsed && (
              <AnimatePresence>
                <motion.div
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0 }}
                  className="overflow-hidden"
                >
                  <p className="text-xs font-bold text-white leading-tight truncate">
                    {user.name}
                  </p>
                  <p className={cn("text-[10px] font-semibold", roleColors.text)}>
                    {ROLE_LABELS[user.role]}
                  </p>
                </motion.div>
              </AnimatePresence>
            )}
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto overflow-x-hidden px-3 py-2 space-y-0.5 scrollbar-thin">
          {allowedItems.map((item) => {
            const isActive =
              pathname === item.href ||
              (item.href !== "/" && pathname.startsWith(item.href));

            return (
              <Link key={item.href} href={item.href}>
                <div
                  className={cn(
                    "flex items-center rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-150 cursor-pointer group relative",
                    isActive
                      ? "bg-[#D95D39]/15 text-[#D95D39] border border-[#D95D39]/20"
                      : "text-white/50 hover:text-white/90 hover:bg-white/5 border border-transparent"
                  )}
                >
                  {/* Active indicator */}
                  {isActive && (
                    <motion.div
                      layoutId="activeNav"
                      className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-5 bg-[#D95D39] rounded-r-full"
                      transition={{ type: "spring", stiffness: 400, damping: 30 }}
                    />
                  )}

                  <span
                    className={cn(
                      "shrink-0 transition-colors",
                      sidebarCollapsed ? "mx-auto" : "mr-3",
                      isActive ? "text-[#D95D39]" : "text-white/40 group-hover:text-white/70"
                    )}
                  >
                    {item.icon}
                  </span>

                  {!sidebarCollapsed && (
                    <>
                      <span className="flex-1 truncate">{item.label}</span>
                      {item.badge && (
                        <span className="ml-auto bg-[#D95D39] text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full min-w-[20px] text-center">
                          {item.badge}
                        </span>
                      )}
                    </>
                  )}

                  {/* Tooltip on collapsed */}
                  {sidebarCollapsed && (
                    <div className="absolute left-full ml-3 px-2.5 py-1.5 bg-[#1C2128] border border-white/10 rounded-lg text-white text-xs font-medium whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none shadow-xl z-50">
                      {item.label}
                      {item.badge && (
                        <span className="ml-1.5 bg-[#D95D39] text-white text-[10px] px-1 rounded-full">
                          {item.badge}
                        </span>
                      )}
                    </div>
                  )}
                </div>
              </Link>
            );
          })}
        </nav>

        {/* Logout */}
        <div className="px-3 py-3 border-t border-white/6 shrink-0">
          <button
            onClick={handleLogout}
            className={cn(
              "w-full flex items-center rounded-xl px-3 py-2.5 text-sm font-medium text-white/40 hover:text-red-400 hover:bg-red-500/8 transition-all border border-transparent hover:border-red-500/15 group"
            )}
          >
            <LogOut
              className={cn(
                "w-5 h-5 shrink-0 transition-colors",
                sidebarCollapsed ? "mx-auto" : "mr-3"
              )}
            />
            {!sidebarCollapsed && <span>Déconnexion</span>}

            {sidebarCollapsed && (
              <div className="absolute left-full ml-3 px-2.5 py-1.5 bg-[#1C2128] border border-white/10 rounded-lg text-white text-xs font-medium whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none shadow-xl z-50">
                Déconnexion
              </div>
            )}
          </button>
        </div>
      </motion.aside>
    </>
  );
}
