"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function LandingPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/login");
  }, [router]);

  return (
    <div className="min-h-screen bg-zen-50 flex items-center justify-center">
      <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-zen-500 to-zen-400 flex items-center justify-center text-white font-black text-xl shadow-lg animate-pulse">
        I
      </div>
    </div>
  );
}
