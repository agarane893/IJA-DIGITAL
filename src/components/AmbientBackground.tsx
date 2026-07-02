"use client";

import { cn } from "@/lib/utils";

interface AmbientBackgroundProps {
  variant?: "dark" | "light";
}

export function AmbientBackground({ variant = "dark" }: AmbientBackgroundProps) {
  const isDark = variant === "dark";

  return (
    <div aria-hidden="true" className="fixed inset-0 overflow-hidden pointer-events-none z-[-1]">
      <div className={cn("absolute inset-0", isDark ? "bg-zen-900" : "bg-zen-50")} />

      <div className={cn("ambient-orb ambient-orb-1", isDark ? "bg-zen-700/40" : "bg-zen-300/50")} />
      <div className={cn("ambient-orb ambient-orb-2", isDark ? "bg-zen-600/25" : "bg-zen-200/60")} />
      <div className={cn("ambient-orb ambient-orb-3", isDark ? "bg-zen-500/15" : "bg-zen-400/20")} />

      <div
        className="absolute inset-0 opacity-[0.04]"
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")",
        }}
      />
    </div>
  );
}
