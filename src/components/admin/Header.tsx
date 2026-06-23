"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
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
} from "lucide-react";
import { useAuthStore } from "@/lib/useAuthStore";
import { useRealtimeStore } from "@/components/RealtimeProvider";
import {
  ROLE_LABELS,
  ROLE_COLORS,
  DEMO_RESTAURANTS,
  hasPermission,
} from "@/lib/auth";
import { cn } from "@/lib/utils";

const NOTIF_ICONS: Record<string, React.ReactNode> = {
  order: <ShoppingBag className="w-4 h-4 text-emerald-400" />,
  stock: <Package className="w-4 h-4 text-amber-400" />,
  staff: <AlertTriangle className="w-4 h-4 text-orange-400" />,
  system: <Info className="w-4 h-4 text-blue-400" />,
};

export function AdminHeader() {
  const router = useRouter();
  const { user, notifications, markNotificationsRead, toggleSidebar, logout } =
    useAuthStore();
  const isConnected = useRealtimeStore((state) => state.isConnected);

  const [notifOpen, setNotifOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
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

  return (
    <header className="h-16 bg-[#0D1117]/95 backdrop-blur-md border-b border-white/6 flex items-center justify-between px-4 md:px-6 sticky top-0 z-30">
      {/* Left: Hamburger + Title */}
      <div className="flex items-center gap-3">
        <button
          onClick={toggleSidebar}
          className="w-9 h-9 rounded-xl bg-white/5 border border-white/8 flex items-center justify-center text-white/50 hover:text-white hover:bg-white/10 transition-all lg:hidden"
        >
          <Menu className="w-4 h-4" />
        </button>

        {/* Restaurant badge */}
        {restaurant || canSwitchRestaurant ? (
          <div className="hidden sm:flex items-center gap-2 bg-white/5 border border-white/8 rounded-xl px-3 py-2">
            <span className="text-base">
              {restaurant?.avatar ?? "🌐"}
            </span>
            <div>
              <p className="text-xs font-bold text-white leading-tight">
                {restaurant?.name ?? "Tous les restaurants"}
              </p>
              <p className="text-[10px] text-white/40 leading-tight">
                {restaurant?.location ?? "Vue globale"}
              </p>
            </div>
            {canSwitchRestaurant && (
              <RefreshCw className="w-3.5 h-3.5 text-white/20 ml-1" />
            )}
          </div>
        ) : null}
      </div>

      {/* Right: Realtime + Notifications + Profile */}
      <div className="flex items-center gap-2">
        {/* Realtime Status */}
        <div className="flex items-center gap-1.5 bg-white/5 border border-white/8 rounded-xl px-2.5 py-1.5 text-[10px] font-bold text-white/50 mr-2">
           <span className={cn(
             "w-2 h-2 rounded-full shadow-sm animate-pulse",
             isConnected ? "bg-emerald-500 shadow-emerald-500/50" : "bg-red-500 shadow-red-500/50"
           )} />
           {isConnected ? "En Ligne" : "Hors Ligne"}
        </div>

        {/* Notification Bell */}
        <div ref={notifRef} className="relative">
          <button
            onClick={() => {
              setNotifOpen((v) => !v);
              setProfileOpen(false);
            }}
            className="relative w-9 h-9 rounded-xl bg-white/5 border border-white/8 flex items-center justify-center text-white/50 hover:text-white hover:bg-white/10 transition-all"
          >
            <Bell className="w-4 h-4" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-[#D95D39] rounded-full text-white text-[9px] font-black flex items-center justify-center border border-[#0D1117]">
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
                className="absolute right-0 top-full mt-2 w-80 bg-[#161B22] border border-white/8 rounded-2xl shadow-2xl overflow-hidden z-50"
              >
                <div className="flex items-center justify-between px-4 py-3 border-b border-white/6">
                  <span className="text-xs font-bold text-white/60 uppercase tracking-wider">
                    Notifications
                  </span>
                  {unreadCount > 0 && (
                    <button
                      onClick={() => {
                        markNotificationsRead();
                      }}
                      className="text-[10px] text-[#D95D39] font-bold hover:underline"
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
                        "flex items-start gap-3 px-4 py-3 border-b border-white/4 hover:bg-white/3 transition-colors",
                        !notif.read && "bg-white/2"
                      )}
                    >
                      <div className="w-8 h-8 rounded-lg bg-white/5 border border-white/8 flex items-center justify-center shrink-0 mt-0.5">
                        {NOTIF_ICONS[notif.type]}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p
                          className={cn(
                            "text-xs leading-snug",
                            notif.read ? "text-white/40" : "text-white/80 font-medium"
                          )}
                        >
                          {notif.message}
                        </p>
                        <p className="text-[10px] text-white/25 mt-0.5">{notif.time}</p>
                      </div>
                      {!notif.read && (
                        <div className="w-2 h-2 rounded-full bg-[#D95D39] mt-1.5 shrink-0" />
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
                ? "bg-white/8 border-white/15"
                : "bg-white/4 border-white/8 hover:bg-white/8 hover:border-white/12"
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
              <p className="text-xs font-bold text-white/85 leading-tight">
                {user.name}
              </p>
              <p className={cn("text-[10px] font-semibold", roleColors?.text)}>
                {ROLE_LABELS[user.role]}
              </p>
            </div>
            <ChevronDown
              className={cn(
                "w-3.5 h-3.5 text-white/30 transition-transform hidden md:block",
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
                className="absolute right-0 top-full mt-2 w-56 bg-[#161B22] border border-white/8 rounded-2xl shadow-2xl overflow-hidden z-50"
              >
                {/* User info */}
                <div className="px-4 py-3 border-b border-white/6">
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
                      <p className="text-xs font-bold text-white">{user.name}</p>
                      <p className="text-[10px] text-white/40">{user.email}</p>
                    </div>
                  </div>
                </div>

                {/* Menu items */}
                <div className="p-1.5 space-y-0.5">
                  <button className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-white/60 hover:text-white hover:bg-white/5 transition-all text-xs font-medium">
                    <User className="w-4 h-4" />
                    Mon Profil
                  </button>
                  {hasPermission(user, "settings") && (
                    <button className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-white/60 hover:text-white hover:bg-white/5 transition-all text-xs font-medium">
                      <Settings className="w-4 h-4" />
                      Paramètres
                    </button>
                  )}
                  {canSwitchRestaurant && (
                    <button className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-white/60 hover:text-white hover:bg-white/5 transition-all text-xs font-medium">
                      <Building2 className="w-4 h-4" />
                      Changer de resto
                    </button>
                  )}
                </div>

                <div className="p-1.5 border-t border-white/6">
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-red-400/80 hover:text-red-400 hover:bg-red-500/8 transition-all text-xs font-medium"
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
    </header>
  );
}
