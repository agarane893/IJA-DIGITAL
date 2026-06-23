"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuthStore } from "@/lib/useAuthStore";
import { Permission, hasPermission } from "@/lib/auth";

const PUBLIC_ROUTES = ["/login", "/", "/table"];

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [mounted, setMounted] = useState(false);
  const { isAuthenticated, user } = useAuthStore();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;

    const isPublic =
      pathname === "/" ||
      pathname === "/login" ||
      pathname.startsWith("/table");

    if (!isAuthenticated && !isPublic) {
      router.replace("/login");
      return;
    }

    if (isAuthenticated && pathname === "/login") {
      const { getDefaultRoute } = require("@/lib/auth");
      router.replace(getDefaultRoute(user!.role));
    }
  }, [mounted, isAuthenticated, pathname, router, user]);

  // Prevent flash of wrong content during hydration
  if (!mounted) {
    return (
      <div className="min-h-screen bg-[#131924] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-[#D95D39] flex items-center justify-center text-white font-bold text-xl shadow-lg animate-pulse">
            I
          </div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}

// ─── Hook: useRequirePermission ────────────────────────────────────────────────

export function useRequirePermission(permission: Permission): boolean {
  const { user } = useAuthStore();
  return hasPermission(user, permission);
}
