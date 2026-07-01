"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/lib/useAuthStore";
import { AdminSidebar } from "@/components/admin/Sidebar";
import { AdminHeader } from "@/components/admin/Header";
import { AmbientBackground } from "@/components/AmbientBackground";
import { cn } from "@/lib/utils";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [mounted, setMounted] = useState(false);
  const { isAuthenticated, sidebarCollapsed, sidebarOrientation, theme } = useAuthStore();
  const router = useRouter();

  useEffect(() => {
    setMounted(true);
  }, []);

  // Update HTML class list for Tailwind darkMode class-strategy
  useEffect(() => {
    if (mounted) {
      const root = window.document.documentElement;
      if (theme === "dark") {
        root.classList.add("dark");
      } else {
        root.classList.remove("dark");
      }
    }
  }, [mounted, theme]);

  useEffect(() => {
    if (mounted && !isAuthenticated) {
      router.replace("/login");
    }
  }, [mounted, isAuthenticated, router]);

  if (!mounted || !isAuthenticated) {
    return (
      <div className="min-h-screen bg-zen-50 dark:bg-zen-900 flex items-center justify-center relative">
        <AmbientBackground variant={theme === "dark" ? "dark" : "light"} />
        <div className="flex flex-col items-center gap-4 relative z-10">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-zen-500 to-zen-400 flex items-center justify-center text-white font-black text-xl shadow-lg animate-pulse">
            I
          </div>
          <div className="flex gap-1">
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                className="w-1.5 h-1.5 rounded-full bg-zen-500/40 animate-bounce"
                style={{ animationDelay: `${i * 0.15}s` }}
              />
            ))}
          </div>
        </div>
      </div>
    );
  }

  const isHorizontal = sidebarOrientation === "horizontal";

  return (
    <div className={cn(
      "min-h-screen font-sans relative transition-colors duration-300",
      theme === "dark" ? "bg-zen-900 text-zen-100" : "bg-zen-50 text-zen-900"
    )}>
      <AmbientBackground variant={theme === "dark" ? "dark" : "light"} />
      
      {/* Sidebar / Navigation */}
      <AdminSidebar />

      {/* Main content area */}
      <div
        className={cn(
          "flex flex-col min-h-screen transition-all duration-300 ease-[cubic-bezier(.4,0,.2,1)] relative z-10",
          isHorizontal 
            ? "ml-0 pt-16" // Space for horizontal top navbar
            : sidebarCollapsed 
              ? "lg:ml-[72px]" 
              : "lg:ml-[260px]"
        )}
      >
        <AdminHeader />
        <main className="flex-1 p-4 md:p-6 lg:p-8 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
