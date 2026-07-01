"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard,
  ShoppingCart,
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
  TableProperties,
  History,
} from "lucide-react";
import { useAuthStore } from "@/lib/useAuthStore";
import { Permission, ROLE_LABELS, ROLE_COLORS, hasPermission } from "@/lib/auth";
import { cn } from "@/lib/utils";

export interface NavItem {
  label: string;
  href: string;
  icon: React.ReactNode;
  permission: Permission;
  badge?: string;
}

export const NAV_ITEMS: NavItem[] = [
  {
    label: "Dashboard",
    href: "/dashboard",
    icon: <LayoutDashboard className="w-6 h-6" />,
    permission: "dashboard",
  },
  {
    label: "Stats Globales",
    href: "/global",
    icon: <Globe className="w-6 h-6" />,
    permission: "global_stats",
  },
  {
    label: "Gestion Commandes",
    href: "/tables",
    icon: <TableProperties className="w-6 h-6" />,
    permission: "pos",
  },
  {
    label: "Historique des Commandes",
    href: "/orders",
    icon: <History className="w-6 h-6" />,
    permission: "orders",
  },
  {
    label: "Gestion Menu",
    href: "/menu",
    icon: <MenuSquare className="w-6 h-6" />,
    permission: "menu",
  },
  {
    label: "Stocks",
    href: "/stocks",
    icon: <Package className="w-6 h-6" />,
    permission: "stocks",
  },
  {
    label: "Équipe",
    href: "/rh",
    icon: <Users className="w-6 h-6" />,
    permission: "rh",
  },
  {
    label: "Rapports",
    href: "/reports",
    icon: <BarChart3 className="w-6 h-6" />,
    permission: "reports",
  },
  {
    label: "Paramètres",
    href: "/settings",
    icon: <Settings className="w-6 h-6" />,
    permission: "settings",
  },
];

export function AdminSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, sidebarCollapsed, sidebarOrientation, toggleSidebar, logout } = useAuthStore();

  if (!user || sidebarOrientation === "horizontal") return null;

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
        animate={{ width: sidebarCollapsed ? 80 : 280 }}
        transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
        className={cn(
          "fixed left-0 top-0 h-full z-40 flex flex-col",
          "bg-white/80 backdrop-blur-xl border-r border-zen-200/60",
          "shadow-xl shadow-zen-200/40"
        )}
      >
        {/* Logo header */}
        <div className="h-20 flex items-center justify-between px-5 border-b border-zen-200/60 shrink-0">
          <AnimatePresence mode="wait">
            {!sidebarCollapsed ? (
              <motion.div
                key="full"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                transition={{ duration: 0.2 }}
                className="flex items-center gap-3 overflow-hidden"
              >
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-zen-500 to-zen-400 flex items-center justify-center text-white font-black text-xl shadow-lg shadow-zen-500/20 shrink-0">
                  I
                </div>
                <div>
                  <div className="font-heading font-black text-zen-900 text-base leading-tight">
                    Ija Digital
                  </div>
                  <div className="text-xs text-zen-500 font-semibold">
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
                className="w-10 h-10 rounded-xl bg-gradient-to-br from-zen-500 to-zen-400 flex items-center justify-center text-white font-black text-xl shadow-lg mx-auto"
              >
                I
              </motion.div>
            )}
          </AnimatePresence>

          {!sidebarCollapsed && (
            <button
              onClick={toggleSidebar}
              className="w-10 h-10 min-w-[40px] rounded-lg bg-zen-100 border border-zen-200 flex items-center justify-center text-zen-500 hover:text-zen-700 hover:bg-zen-200 transition-all shrink-0"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Collapsed toggle */}
        {sidebarCollapsed && (
          <button
            onClick={toggleSidebar}
            className="mx-auto mt-4 w-10 h-10 min-w-[40px] rounded-lg bg-zen-100 border border-zen-200 flex items-center justify-center text-zen-500 hover:text-zen-700 hover:bg-zen-200 transition-all"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        )}

        {/* User profile pill */}
        <div
          className={cn(
            "mx-4 mt-5 mb-3 rounded-xl border p-4 shrink-0",
            roleColors.bg,
            roleColors.border
          )}
        >
          <div className={cn("flex items-center", sidebarCollapsed ? "justify-center" : "gap-4")}>
            <div
              className={cn(
                "w-10 h-10 rounded-lg flex items-center justify-center font-bold text-sm shrink-0 border",
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
                  <p className="text-sm font-bold text-zen-900 leading-tight truncate">
                    {user.name}
                  </p>
                  <p className={cn("text-xs font-semibold mt-0.5", roleColors.text)}>
                    {ROLE_LABELS[user.role]}
                  </p>
                </motion.div>
              </AnimatePresence>
            )}
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto overflow-x-hidden px-4 py-2 space-y-2 scrollbar-thin">
          {allowedItems.map((item) => {
            const isActive =
              pathname === item.href ||
              (item.href !== "/" && pathname.startsWith(item.href));

            return (
              <Link key={item.href} href={item.href}>
                <div
                  className={cn(
                    "flex items-center rounded-xl px-4 py-3.5 text-base font-medium transition-all duration-150 cursor-pointer group relative min-h-[44px]",
                    isActive
                      ? "bg-zen-500/10 text-zen-600 border border-zen-500/20"
                      : "text-zen-700/70 hover:text-zen-900 hover:bg-zen-100/60 border border-transparent"
                  )}
                >
                  {/* Active indicator */}
                  {isActive && (
                    <motion.div
                      layoutId="activeNav"
                      className="absolute left-0 top-1/2 -translate-y-1/2 w-1.5 h-6 bg-zen-500 rounded-r-full"
                      transition={{ type: "spring", stiffness: 400, damping: 30 }}
                    />
                  )}

                  <span
                    className={cn(
                      "shrink-0 transition-colors",
                      sidebarCollapsed ? "mx-auto" : "mr-4",
                      isActive ? "text-zen-600" : "text-zen-400 group-hover:text-zen-700"
                    )}
                  >
                    {item.icon}
                  </span>

                  {!sidebarCollapsed && (
                    <>
                      <span className="flex-1 truncate">{item.label}</span>
                      {item.badge && (
                        <span className="ml-auto bg-zen-500 text-white text-xs font-bold px-2 py-0.5 rounded-full min-w-[24px] text-center">
                          {item.badge}
                        </span>
                      )}
                    </>
                  )}

                  {/* Tooltip on collapsed */}
                  {sidebarCollapsed && (
                    <div className="absolute left-full ml-3 px-3 py-2 bg-white border border-zen-200 rounded-lg text-zen-900 text-sm font-medium whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none shadow-xl z-50">
                      {item.label}
                      {item.badge && (
                        <span className="ml-2 bg-zen-500 text-white text-xs px-1.5 rounded-full">
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
        <div className="px-4 py-4 border-t border-zen-200/60 shrink-0">
          <button
            onClick={handleLogout}
            className={cn(
              "w-full flex items-center rounded-xl px-4 py-3.5 text-base font-medium text-zen-500 hover:text-red-500 hover:bg-red-50 transition-all border border-transparent hover:border-red-200 group min-h-[44px]"
            )}
          >
            <LogOut
              className={cn(
                "w-6 h-6 shrink-0 transition-colors",
                sidebarCollapsed ? "mx-auto" : "mr-4"
              )}
            />
            {!sidebarCollapsed && <span>Déconnexion</span>}

            {sidebarCollapsed && (
              <div className="absolute left-full ml-3 px-3 py-2 bg-white border border-zen-200 rounded-lg text-zen-900 text-sm font-medium whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none shadow-xl z-50">
                Déconnexion
              </div>
            )}
          </button>
        </div>
      </motion.aside>
    </>
  );
}
