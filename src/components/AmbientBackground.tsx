"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface AmbientBackgroundProps {
  variant?: "dark" | "light";
}

export function AmbientBackground({ variant = "dark" }: AmbientBackgroundProps) {
  const isDark = variant === "dark";

  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none z-[-1]">
      <div className={cn("absolute inset-0", isDark ? "bg-zen-900" : "bg-zen-50")} />
      
      {/* Orb 1 – Top Left */}
      <motion.div
        animate={{ x: [0, 50, -20, 0], y: [0, -30, 40, 0], scale: [1, 1.1, 0.9, 1] }}
        transition={{ duration: 18, repeat: Infinity, ease: "easeInOut" }}
        className={cn(
          "absolute -top-[20%] -left-[15%] w-[55vw] h-[55vw] rounded-full filter blur-[120px]",
          isDark ? "bg-zen-700/40" : "bg-zen-300/50"
        )}
      />

      {/* Orb 2 – Bottom Right */}
      <motion.div
        animate={{ x: [0, -40, 30, 0], y: [0, 50, -20, 0], scale: [1, 1.2, 0.85, 1] }}
        transition={{ duration: 22, repeat: Infinity, ease: "easeInOut", delay: 3 }}
        className={cn(
          "absolute -bottom-[20%] -right-[15%] w-[65vw] h-[65vw] rounded-full filter blur-[140px]",
          isDark ? "bg-zen-600/25" : "bg-zen-200/60"
        )}
      />

      {/* Orb 3 – Center */}
      <motion.div
        animate={{ x: [0, 25, -15, 0], y: [0, -25, 35, 0], scale: [1, 0.95, 1.05, 1] }}
        transition={{ duration: 25, repeat: Infinity, ease: "easeInOut", delay: 6 }}
        className={cn(
          "absolute top-[30%] left-[30%] w-[40vw] h-[40vw] rounded-full filter blur-[100px]",
          isDark ? "bg-zen-500/15" : "bg-zen-400/20"
        )}
      />

      {/* Subtle Grain Texture */}
      <div
        className="absolute inset-0 opacity-[0.04]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
        }}
      />
    </div>
  );
}
