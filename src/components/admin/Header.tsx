"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  Bell,
  Menu,
  ChevronDown,
  LogOut,
  User,
  Settings,
  ShoppingBag,
  Package,
  AlertTriangle,
  Info,
  Building2,
  RefreshCw,
  Sun,
  Moon,
  Columns,
  Layout,
  X,
} from "lucide-react";
import { useAuthStore } from "@/lib/useAuthStore";
import { useRealtimeStore } from "@/components/RealtimeProvider";
import {
  ROLE_LABELS,
  ROLE_COLORS,
  DEMO_RESTAURANTS,
  hasPermission,
} from "@/lib/auth";
import { NAV_ITEMS } from "@/components/admin/Sidebar";
import { cn } from "@/lib/utils";

const NOTIF_ICONS: Record<string, React.ReactNode> = {
  order: <ShoppingBag className="w-4 h-4 text-emerald-500" />,
  stock: <Package className="w-4 h-4 text-amber-500" />,
  staff: <AlertTriangle className="w-4 h-4 text-orange-500" />,
  system: <Info className="w-4 h-4 text-blue-500" />,
};

export function AdminHeader() {
  const router = useRouter();
  const pathname = usePathname();
  const { 
    user, 
    notifications, 
    markNotificationsRead, 
    toggleSidebar, 
    logout,
    sidebarOrientation,
    theme,
    toggleTheme,
    toggleSidebarOrientation
  } = useAuthStore();
  
  const isConnected = useRealtimeStore((state) => state.isConnected);

  const [notifOpen, setNotifOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  const notifRef = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);

  const unreadCount = notifications.filter((n) => !n.read).length;
  const roleColors = user ? ROLE_COLORS[user.role] : null;
  const restaurant =
    user?.restaurantId
      ? DEMO_RESTAURANTS.find((r) => r.id === user.restaurantId)
      : null;

  const canSwitchRestaurant = user
    ? hasPermission(user, "multi_restaurant")
    : false;

  // Close dropdowns on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setNotifOpen(false);
      }
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) {
        setProfileOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  if (!user) return null;

  const handleLogout = () => {
    logout();
    router.push("/login");
  };

  const allowedItems = NAV_ITEMS.filter((item) => hasPermission(user, item.permission));
  const isHorizontal = sidebarOrientation === "horizontal";

  return (
    <header className={cn(
      "h-16 border-b transition-all duration-300 z-30",
      theme === "dark" 
        ? "bg-zen-850/90 border-zen-800/60 text-zen-100" 
        : "bg-white/80 border-zen-200/60 text-zen-900",
      isHorizontal
        ? "fixed top-0 left-0 right-0 backdrop-blur-md px-4 md:px-8"
        : "sticky top-0 backdrop-blur-md px-4 md:px-6"
    )}>
      <div className="h-full max-w-7xl mx-auto flex items-center justify-between gap-4">
        
        {/* Left: Hamburger (vertical) / Logo (horizontal) */}
        <div className="flex items-center gap-4 shrink-0">
          {!isHorizontal ? (
            <button
              onClick={toggleSidebar}
              className="w-9 h-9 rounded-xl bg-zen-100 dark:bg-zen-800 border border-zen-200 dark:border-zen-700 flex items-center justify-center text-zen-500 hover:text-zen-700 hover:bg-zen-200 dark:hover:bg-zen-750 transition-all lg:hidden"
            >
              <Menu className="w-4 h-4" />
            </button>
          ) : (
            // Logo when horizontal
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-zen-500 to-zen-400 flex items-center justify-center text-white font-black text-lg shadow-md shadow-zen-500/20">
                I
              </div>
              <div className="hidden sm:block">
                <span className="font-heading font-black text-base tracking-tight leading-none block">Ija Digital</span>
                <span className="text-[9px] text-zen-400 font-semibold leading-none block mt-0.5">Restaurant OS</span>
              </div>
            </div>
          )}

          {/* Restaurant switcher */}
          {!isHorizontal && (restaurant || canSwitchRestaurant) && (
            <div className="hidden sm:flex items-center gap-2 bg-zen-50 dark:bg-zen-800/40 border border-zen-200 dark:border-zen-700/60 rounded-xl px-3 py-1.5">
              <span className="text-sm">{restaurant?.avatar ?? "🌐"}</span>
              <div>
                <p className="text-[10px] font-bold leading-tight">
                  {restaurant?.name ?? "Tous les restaurants"}
                </p>
                <p className="text-[9px] text-zen-500 leading-tight">
                  {restaurant?.location ?? "Vue globale"}
                </p>
              </div>
              {canSwitchRestaurant && (
                <RefreshCw className="w-3 h-3 text-zen-400 ml-1" />
              )}
            </div>
          )}
        </div>

        {/* Center: Horizontal Navigation (only when orientation is horizontal and screen is lg+) */}
        {isHorizontal && (
          <nav className="hidden lg:flex items-center gap-1.5 overflow-x-auto py-1 scrollbar-none">
            {allowedItems.map((item) => {
              const isActive =
                pathname === item.href ||
                (item.href !== "/" && pathname.startsWith(item.href));

              return (
                <Link key={item.href} href={item.href}>
                  <div
                    className={cn(
                      "flex items-center gap-1.5 rounded-xl px-3 py-2 text-xs font-bold transition-all duration-150 cursor-pointer min-h-[36px]",
                      isActive
                        ? "bg-zen-500/10 dark:bg-zen-500/20 text-zen-600 dark:text-zen-400 border border-zen-500/20 dark:border-zen-500/40"
                        : "text-zen-700/70 dark:text-zen-300/70 hover:text-zen-900 dark:hover:text-white hover:bg-zen-100/60 dark:hover:bg-zen-800/60 border border-transparent"
                    )}
                  >
                    <span className="shrink-0 scale-90 opacity-75">{item.icon}</span>
                    <span>{item.label}</span>
                  </div>
                </Link>
              );
            })}
          </nav>
        )}

        {/* Right: Actions (Theme, Layout, Realtime, Notifications, Profile) */}
        <div className="flex items-center gap-2">
          
          {/* Mobile menu button when horizontal & small screen */}
          {isHorizontal && (
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden w-9 h-9 rounded-xl bg-zen-100 dark:bg-zen-800 border border-zen-200 dark:border-zen-700 flex items-center justify-center text-zen-500 hover:text-zen-700 hover:bg-zen-200 dark:hover:bg-zen-750 transition-all"
            >
              {mobileMenuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
            </button>
          )}

          {/* Theme switcher */}
          <button
            onClick={toggleTheme}
            className="w-9 h-9 rounded-xl bg-zen-100 dark:bg-zen-800 border border-zen-200 dark:border-zen-700 flex items-center justify-center text-zen-500 hover:text-zen-700 dark:text-zen-350 dark:hover:text-white hover:bg-zen-200 dark:hover:bg-zen-750 transition-all"
            title={theme === "dark" ? "Mode clair" : "Mode sombre"}
          >
            {theme === "dark" ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>

          {/* Layout Orientation switcher */}
          <button
            onClick={toggleSidebarOrientation}
            className="w-9 h-9 rounded-xl bg-zen-100 dark:bg-zen-800 border border-zen-200 dark:border-zen-700 flex items-center justify-center text-zen-500 hover:text-zen-700 dark:text-zen-350 dark:hover:text-white hover:bg-zen-200 dark:hover:bg-zen-750 transition-all"
            title={isHorizontal ? "Menu latéral" : "Menu horizontal"}
          >
            {isHorizontal ? <Columns className="w-4 h-4" /> : <Layout className="w-4 h-4" />}
          </button>

          {/* Realtime Status */}
          <div className="hidden sm:flex items-center gap-1.5 bg-zen-50 dark:bg-zen-800/40 border border-zen-200 dark:border-zen-700/60 rounded-xl px-2.5 py-1.5 text-[10px] font-bold">
            <span
              className={cn(
                "w-2 h-2 rounded-full shadow-sm animate-pulse",
                isConnected
                  ? "bg-emerald-500 shadow-emerald-500/50"
                  : "bg-red-500 shadow-red-500/50"
              )}
            />
            {isConnected ? "En Ligne" : "Hors Ligne"}
          </div>

          {/* Notification Bell */}
          <div ref={notifRef} className="relative">
            <button
              onClick={() => {
                setNotifOpen((v) => !v);
                setProfileOpen(false);
              }}
              className="relative w-9 h-9 rounded-xl bg-zen-100 dark:bg-zen-800 border border-zen-200 dark:border-zen-700 flex items-center justify-center text-zen-500 hover:text-zen-700 dark:text-zen-350 dark:hover:text-white hover:bg-zen-200 dark:hover:bg-zen-750 transition-all"
            >
              <Bell className="w-4 h-4" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-zen-500 rounded-full text-white text-[9px] font-black flex items-center justify-center border-2 border-white dark:border-zen-900">
                  {unreadCount}
                </span>
              )}
            </button>

            <AnimatePresence>
              {notifOpen && (
                <motion.div
                  initial={{ opacity: 0, y: 8, scale: 0.96 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 8, scale: 0.96 }}
                  transition={{ duration: 0.18 }}
                  className="absolute right-0 top-full mt-2 w-80 bg-white dark:bg-zen-800 border border-zen-200 dark:border-zen-700 rounded-2xl shadow-2xl overflow-hidden z-50 text-zen-800 dark:text-zen-100"
                >
                  <div className="flex items-center justify-between px-4 py-3 border-b border-zen-100 dark:border-zen-700">
                    <span className="text-xs font-bold text-zen-500 dark:text-zen-400 uppercase tracking-wider">
                      Notifications
                    </span>
                    {unreadCount > 0 && (
                      <button
                        onClick={markNotificationsRead}
                        className="text-[10px] text-zen-500 dark:text-zen-400 font-bold hover:underline"
                      >
                        Tout marquer lu
                      </button>
                    )}
                  </div>

                  <div className="max-h-72 overflow-y-auto">
                    {notifications.map((notif) => (
                      <div
                        key={notif.id}
                        className={cn(
                          "flex items-start gap-3 px-4 py-3 border-b border-zen-100/60 dark:border-zen-700 hover:bg-zen-50 dark:hover:bg-zen-750 transition-colors",
                          !notif.read && "bg-zen-50/60 dark:bg-zen-800/60"
                        )}
                      >
                        <div className="w-8 h-8 rounded-lg bg-zen-100 dark:bg-zen-750 border border-zen-200 dark:border-zen-700 flex items-center justify-center shrink-0 mt-0.5">
                          {NOTIF_ICONS[notif.type]}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p
                            className={cn(
                              "text-xs leading-snug",
                              notif.read
                                ? "text-zen-400 dark:text-zen-500"
                                : "text-zen-800 dark:text-zen-100 font-medium"
                            )}
                          >
                            {notif.message}
                          </p>
                          <p className="text-[10px] text-zen-400 dark:text-zen-550 mt-0.5">
                            {notif.time}
                          </p>
                        </div>
                        {!notif.read && (
                          <div className="w-2 h-2 rounded-full bg-zen-500 mt-1.5 shrink-0" />
                        )}
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Profile dropdown */}
          <div ref={profileRef} className="relative">
            <button
              onClick={() => {
                setProfileOpen((v) => !v);
                setNotifOpen(false);
              }}
              className={cn(
                "flex items-center gap-2 rounded-xl px-2.5 py-1.5 border transition-all",
                profileOpen
                  ? "bg-zen-100 dark:bg-zen-800 border-zen-300 dark:border-zen-700"
                  : "bg-zen-50 dark:bg-zen-800/40 border-zen-200 dark:border-zen-700/60 hover:bg-zen-100 dark:hover:bg-zen-800 hover:border-zen-300"
              )}
            >
              <div
                className={cn(
                  "w-7 h-7 rounded-lg flex items-center justify-center font-bold text-xs border",
                  roleColors?.bg,
                  roleColors?.text,
                  roleColors?.border
                )}
              >
                {user.initials}
              </div>
              <div className="hidden md:block text-left">
                <p className="text-xs font-bold leading-tight">
                  {user.name}
                </p>
                <p className={cn("text-[10px] font-semibold", roleColors?.text)}>
                  {ROLE_LABELS[user.role]}
                </p>
              </div>
              <ChevronDown
                className={cn(
                  "w-3.5 h-3.5 text-zen-400 transition-transform hidden md:block",
                  profileOpen && "rotate-180"
                )}
              />
            </button>

            <AnimatePresence>
              {profileOpen && (
                <motion.div
                  initial={{ opacity: 0, y: 8, scale: 0.96 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 8, scale: 0.96 }}
                  transition={{ duration: 0.18 }}
                  className="absolute right-0 top-full mt-2 w-56 bg-white dark:bg-zen-800 border border-zen-200 dark:border-zen-700 rounded-2xl shadow-2xl overflow-hidden z-50 text-zen-700 dark:text-zen-200"
                >
                  {/* User info */}
                  <div className="px-4 py-3 border-b border-zen-100 dark:border-zen-700">
                    <div className="flex items-center gap-2.5">
                      <div
                        className={cn(
                          "w-9 h-9 rounded-xl flex items-center justify-center font-bold text-sm border",
                          roleColors?.bg,
                          roleColors?.text,
                          roleColors?.border
                        )}
                      >
                        {user.initials}
                      </div>
                      <div>
                        <p className="text-xs font-bold text-zen-900 dark:text-white leading-tight">
                          {user.name}
                        </p>
                        <p className="text-[10px] text-zen-555">{user.email}</p>
                      </div>
                    </div>
                  </div>

                  {/* Menu items */}
                  <div className="p-1.5 space-y-0.5">
                    <button className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-zen-600 dark:text-zen-300 hover:text-zen-900 dark:hover:text-white hover:bg-zen-100 dark:hover:bg-zen-750 transition-all text-xs font-medium">
                      <User className="w-4 h-4" />
                      Mon Profil
                    </button>
                    {hasPermission(user, "settings") && (
                      <button className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-zen-600 dark:text-zen-300 hover:text-zen-900 dark:hover:text-white hover:bg-zen-100 dark:hover:bg-zen-750 transition-all text-xs font-medium">
                        <Settings className="w-4 h-4" />
                        Paramètres
                      </button>
                    )}
                    {canSwitchRestaurant && (
                      <button className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-zen-600 dark:text-zen-300 hover:text-zen-900 dark:hover:text-white hover:bg-zen-100 dark:hover:bg-zen-750 transition-all text-xs font-medium">
                        <Building2 className="w-4 h-4" />
                        Changer de resto
                      </button>
                    )}
                  </div>

                  <div className="p-1.5 border-t border-zen-100 dark:border-zen-700">
                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-red-500/80 hover:text-red-650 hover:bg-red-50 dark:hover:bg-red-950/20 transition-all text-xs font-medium"
                    >
                      <LogOut className="w-4 h-4" />
                      Déconnexion
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* Mobile Drawer (visible on mobile only when horizontal is on and mobile menu is toggled) */}
      <AnimatePresence>
        {isHorizontal && mobileMenuOpen && (
          <>
            {/* Background overlay */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 top-16 bg-black/50 z-20 lg:hidden"
              onClick={() => setMobileMenuOpen(false)}
            />

            {/* Menu Drawer */}
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", bounce: 0, duration: 0.3 }}
              className={cn(
                "fixed top-16 right-0 bottom-0 w-64 border-l z-30 lg:hidden flex flex-col p-4 space-y-3",
                theme === "dark" ? "bg-zen-900 border-zen-800" : "bg-white border-zen-200"
              )}
            >
              <h3 className="text-[10px] font-bold text-zen-400 uppercase tracking-wider mb-2">Navigation</h3>
              <nav className="flex-1 space-y-1">
                {allowedItems.map((item) => {
                  const isActive =
                    pathname === item.href ||
                    (item.href !== "/" && pathname.startsWith(item.href));

                  return (
                    <Link key={item.href} href={item.href} onClick={() => setMobileMenuOpen(false)}>
                      <div
                        className={cn(
                          "flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold transition-all duration-150 cursor-pointer min-h-[44px]",
                          isActive
                            ? "bg-zen-500/10 dark:bg-zen-500/20 text-zen-600 dark:text-zen-400 border border-zen-500/20 dark:border-zen-500/40"
                            : "text-zen-700/70 dark:text-zen-300/70 hover:text-zen-900 dark:hover:text-white hover:bg-zen-100/60 dark:hover:bg-zen-800/60 border border-transparent"
                        )}
                      >
                        <span className="shrink-0">{item.icon}</span>
                        <span>{item.label}</span>
                      </div>
                    </Link>
                  );
                })}
              </nav>

              {/* Collapsed logout info */}
              <div className="border-t border-zen-100 dark:border-zen-800 pt-3">
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    handleLogout();
                  }}
                  className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 text-sm font-semibold transition-all"
                >
                  <LogOut className="w-4 h-4" />
                  Déconnexion
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </header>
  );
}
