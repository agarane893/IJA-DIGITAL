"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Lock, Delete, ArrowRight, Sparkles, AlertCircle } from "lucide-react";
import { useAuthStore } from "@/lib/useAuthStore";

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuthStore();
  const [pin, setPin] = useState("");
  const [error, setError] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleNumber = (num: string) => {
    if (pin.length < 4) {
      setPin((prev) => prev + num);
      setError(false);
    }
  };

  const handleDelete = () => {
    setPin((prev) => prev.slice(0, -1));
    setError(false);
  };

  const handleSubmit = async () => {
    if (pin.length !== 4) {
      setError(true);
      return;
    }

    setIsLoading(true);
    await new Promise((r) => setTimeout(r, 500)); // Fake delay
    
    const result = login(pin);
    if (result.success) {
      router.push(result.redirectTo);
    } else {
      setError(true);
      setPin("");
    }
    setIsLoading(false);
  };

  return (
    <div className="min-h-screen bg-zen-900 relative overflow-hidden flex items-center justify-center px-4">
      {/* Ambient blobs */}
      <div className="absolute top-[-20%] left-[-15%] w-[55vw] h-[55vw] bg-zen-500/8 rounded-full filter blur-[140px] pointer-events-none" />
      <div className="absolute bottom-[-20%] right-[-15%] w-[50vw] h-[50vw] bg-purple-700/8 rounded-full filter blur-[140px] pointer-events-none" />

      {/* Grid texture overlay */}
      <div
        className="absolute inset-0 pointer-events-none opacity-[0.025]"
        style={{
          backgroundImage:
            "linear-gradient(#D95D39 1px, transparent 1px), linear-gradient(90deg, #D95D39 1px, transparent 1px)",
          backgroundSize: "48px 48px",
        }}
      />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-sm z-10"
      >
        {/* Logo Section */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-zen-500 to-zen-400 text-white font-black text-3xl shadow-xl shadow-zen-500/30 mb-4">
            I
          </div>
          <h1 className="font-heading font-black text-3xl text-white tracking-tight mb-1">
            Ija Digital
          </h1>
          <p className="text-zen-500 font-semibold text-sm flex items-center justify-center gap-1">
            <Sparkles className="w-4 h-4" />
            Espace Employé
          </p>
        </div>

        {/* Main Card */}
        <div className="bg-zen-800/90 backdrop-blur-xl border border-white/8 rounded-3xl p-8 shadow-2xl">
          <div className="text-center mb-8">
            <p className="text-white/60 text-sm font-medium mb-6">
              Entrez votre code PIN
            </p>
            
            {/* PIN Display */}
            <div className="flex justify-center gap-4 mb-2">
              {[0, 1, 2, 3].map((i) => (
                <div
                  key={i}
                  className={`w-4 h-4 rounded-full transition-all duration-200 ${
                    pin.length > i
                      ? "bg-zen-500 shadow-[0_0_10px_rgba(217,93,57,0.5)] scale-110"
                      : "bg-white/10"
                  } ${error ? "bg-red-500 shadow-none animate-bounce" : ""}`}
                />
              ))}
            </div>
            
            <AnimatePresence>
              {error && (
                <motion.p
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="text-red-400 text-xs font-bold mt-4 flex items-center justify-center gap-1"
                >
                  <AlertCircle className="w-3 h-3" />
                  Code incorrect
                </motion.p>
              )}
            </AnimatePresence>
          </div>

          {/* Keypad */}
          <div className="grid grid-cols-3 gap-3 mb-6">
            {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
              <button
                key={num}
                onClick={() => handleNumber(num.toString())}
                className="h-16 rounded-2xl bg-white/5 border border-white/5 text-white text-2xl font-bold hover:bg-white/10 active:bg-white/20 transition-colors flex items-center justify-center"
              >
                {num}
              </button>
            ))}
            <button
              onClick={handleDelete}
              className="h-16 rounded-2xl bg-white/5 border border-white/5 text-white/50 hover:text-white hover:bg-white/10 active:bg-white/20 transition-colors flex items-center justify-center"
            >
              <Delete className="w-6 h-6" />
            </button>
            <button
              onClick={() => handleNumber("0")}
              className="h-16 rounded-2xl bg-white/5 border border-white/5 text-white text-2xl font-bold hover:bg-white/10 active:bg-white/20 transition-colors flex items-center justify-center"
            >
              0
            </button>
            <button
              onClick={handleSubmit}
              disabled={pin.length !== 4 || isLoading}
              className="h-16 rounded-2xl bg-gradient-to-r from-zen-500 to-zen-400 text-white hover:shadow-lg hover:shadow-zen-500/25 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
            >
              {isLoading ? (
                <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <ArrowRight className="w-6 h-6" />
              )}
            </button>
          </div>
        </div>

        {/* Hints */}
        <div className="mt-8 text-center space-y-2">
          <p className="text-white/30 text-xs font-medium">
            Demo Manager: <span className="text-white/60 font-bold bg-white/5 px-2 py-0.5 rounded">1234</span>
          </p>
          <p className="text-white/30 text-xs font-medium">
            Demo Serveur: <span className="text-white/60 font-bold bg-white/5 px-2 py-0.5 rounded">5678</span>
          </p>
          <p className="text-white/30 text-xs font-medium">
            Super Admin: <span className="text-white/60 font-bold bg-white/5 px-2 py-0.5 rounded">9999</span>
          </p>
        </div>
      </motion.div>
    </div>
  );
}
