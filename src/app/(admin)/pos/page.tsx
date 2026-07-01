"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function ReceptionPOSPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/tables");
  }, [router]);

  return (
    <div className="min-h-screen bg-zen-50 flex items-center justify-center font-sans">
      <div className="flex flex-col items-center gap-3">
        <span className="w-8 h-8 rounded-full border-2 border-zen-600 border-t-transparent animate-spin"></span>
        <p className="text-sm font-bold text-zen-600">Redirection vers Gestion Commandes...</p>
      </div>
    </div>
  );
}
