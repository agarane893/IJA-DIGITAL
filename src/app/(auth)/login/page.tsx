"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  ChefHat,
  Truck,
  LayoutDashboard,
  ShoppingCart,
  Crown,
  ArrowRight,
  Sparkles,
  CheckCircle2,
} from "lucide-react";
import { useAuthStore } from "@/lib/useAuthStore";
import {
  DEMO_USERS,
  ROLE_LABELS,
  ROLE_DESCRIPTIONS,
  ROLE_COLORS,
  UserRole,
  getDefaultRoute,
} from "@/lib/auth";

const ROLE_ICONS: Record<UserRole, React.ReactNode> = {
  super_admin: <Crown className="w-5 h-5" />,
  manager: <LayoutDashboard className="w-5 h-5" />,
  cashier: <ShoppingCart className="w-5 h-5" />,
  chef: <ChefHat className="w-5 h-5" />,
  delivery_driver: <Truck className="w-5 h-5" />,
};

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuthStore();
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const selectedUser = DEMO_USERS.find((u) => u.id === selectedUserId);

  const handleLogin = async () => {
    if (!selectedUserId) return;
    setIsLoading(true);

    await new Promise((r) => setTimeout(r, 700));
    const result = login(selectedUserId);
    if (result.success) {
      setShowSuccess(true);
      await new Promise((r) => setTimeout(r, 600));
      router.push(getDefaultRoute(selectedUser!.role));
    }
    setIsLoading(false);
  };

  return (
    <div className="min-h-screen bg-[#0D1117] relative overflow-hidden flex items-center justify-center px-4">
      {/* Ambient blobs */}
      <div className="absolute top-[-20%] left-[-15%] w-[55vw] h-[55vw] bg-[#D95D39]/8 rounded-full filter blur-[140px] pointer-events-none" />
      <div className="absolute bottom-[-20%] right-[-15%] w-[50vw] h-[50vw] bg-purple-700/8 rounded-full filter blur-[140px] pointer-events-none" />
      <div className="absolute top-[40%] left-[40%] w-[30vw] h-[30vw] bg-[#D95D39]/5 rounded-full filter blur-[100px] pointer-events-none" />

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
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="w-full max-w-5xl"
      >
        {/* Top Logo */}
        <div className="text-center mb-10">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.1, type: "spring", stiffness: 200 }}
            className="inline-flex items-center gap-3 mb-4"
          >
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#D95D39] to-[#E68867] flex items-center justify-center text-white font-black text-2xl shadow-2xl shadow-[#D95D39]/30">
              I
            </div>
            <div className="text-left">
              <div className="font-heading font-black text-2xl text-white tracking-tight">
                Ija Digital
              </div>
              <div className="text-xs text-[#D95D39] font-semibold flex items-center gap-1">
                <Sparkles className="w-3 h-3" />
                Plateforme de Gestion
              </div>
            </div>
          </motion.div>
          <motion.h1
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-white/80 text-sm font-medium"
          >
            Sélectionnez votre profil pour accéder à votre espace
          </motion.h1>
        </div>

        {/* Main card */}
        <div className="bg-[#161B22]/80 backdrop-blur-xl border border-white/8 rounded-3xl p-6 md:p-8 shadow-2xl">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Left: Role Selector */}
            <div className="space-y-3">
              <p className="text-xs font-bold text-white/40 uppercase tracking-widest mb-4">
                Choisir un rôle
              </p>
              {DEMO_USERS.map((user, i) => {
                const colors = ROLE_COLORS[user.role];
                const isSelected = selectedUserId === user.id;
                return (
                  <motion.button
                    key={user.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.1 + i * 0.06 }}
                    onClick={() => setSelectedUserId(user.id)}
                    className={`w-full flex items-center gap-4 p-4 rounded-2xl border transition-all duration-200 text-left cursor-pointer ${
                      isSelected
                        ? `${colors.bg} ${colors.border} border shadow-lg`
                        : "bg-white/3 border-white/6 hover:border-white/15 hover:bg-white/5"
                    }`}
                  >
                    {/* Avatar */}
                    <div
                      className={`w-11 h-11 rounded-xl flex items-center justify-center font-bold text-sm shrink-0 border ${
                        isSelected
                          ? `${colors.bg} ${colors.text} ${colors.border}`
                          : "bg-white/8 text-white/60 border-white/10"
                      }`}
                    >
                      {user.initials}
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span
                          className={`font-bold text-sm ${isSelected ? "text-white" : "text-white/75"}`}
                        >
                          {user.name}
                        </span>
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                            isSelected
                              ? `${colors.bg} ${colors.text} ${colors.border}`
                              : "bg-white/6 text-white/40 border-white/10"
                          }`}
                        >
                          {ROLE_LABELS[user.role]}
                        </span>
                      </div>
                      <p className="text-[11px] text-white/40 mt-0.5 truncate">
                        {user.email}
                      </p>
                    </div>

                    {/* Role icon */}
                    <div
                      className={`shrink-0 transition-colors ${isSelected ? colors.text : "text-white/20"}`}
                    >
                      {ROLE_ICONS[user.role]}
                    </div>
                  </motion.button>
                );
              })}
            </div>

            {/* Right: Selected user details + CTA */}
            <div className="flex flex-col">
              <AnimatePresence mode="wait">
                {selectedUser ? (
                  <motion.div
                    key={selectedUser.id}
                    initial={{ opacity: 0, y: 20, scale: 0.97 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -20, scale: 0.97 }}
                    transition={{ duration: 0.25 }}
                    className="flex flex-col h-full"
                  >
                    {/* Role spotlight */}
                    <div
                      className={`rounded-2xl p-6 border mb-4 ${ROLE_COLORS[selectedUser.role].bg} ${ROLE_COLORS[selectedUser.role].border}`}
                    >
                      <div className="flex items-center gap-3 mb-4">
                        <div
                          className={`w-12 h-12 rounded-xl flex items-center justify-center font-black text-lg ${ROLE_COLORS[selectedUser.role].bg} ${ROLE_COLORS[selectedUser.role].text} border ${ROLE_COLORS[selectedUser.role].border}`}
                        >
                          {selectedUser.initials}
                        </div>
                        <div>
                          <p className="font-bold text-white">
                            {selectedUser.name}
                          </p>
                          <p
                            className={`text-xs font-semibold ${ROLE_COLORS[selectedUser.role].text}`}
                          >
                            {ROLE_LABELS[selectedUser.role]}
                          </p>
                        </div>
                      </div>
                      <p className="text-sm text-white/60 leading-relaxed">
                        {ROLE_DESCRIPTIONS[selectedUser.role]}
                      </p>
                    </div>

                    {/* Permissions */}
                    <div className="bg-white/3 border border-white/6 rounded-2xl p-4 mb-4 flex-1">
                      <p className="text-xs font-bold text-white/30 uppercase tracking-widest mb-3">
                        Accès autorisés
                      </p>
                      <div className="space-y-2">
                        {selectedUser.permissions.map((perm) => (
                          <div key={perm} className="flex items-center gap-2">
                            <CheckCircle2
                              className={`w-3.5 h-3.5 shrink-0 ${ROLE_COLORS[selectedUser.role].text}`}
                            />
                            <span className="text-xs text-white/60 capitalize">
                              {perm.replace("_", " ")}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Login button */}
                    <motion.button
                      whileHover={{ scale: 1.02, y: -2 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={handleLogin}
                      disabled={isLoading || showSuccess}
                      className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-[#D95D39] to-[#E68867] text-white font-bold py-4 rounded-2xl shadow-lg shadow-[#D95D39]/25 hover:shadow-xl hover:shadow-[#D95D39]/35 transition-all disabled:opacity-70 disabled:cursor-not-allowed"
                    >
                      {showSuccess ? (
                        <>
                          <CheckCircle2 className="w-5 h-5" />
                          Connexion réussie…
                        </>
                      ) : isLoading ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                          Connexion en cours…
                        </>
                      ) : (
                        <>
                          Accéder à mon espace
                          <ArrowRight className="w-4 h-4" />
                        </>
                      )}
                    </motion.button>
                  </motion.div>
                ) : (
                  <motion.div
                    key="empty"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="flex flex-col items-center justify-center h-full min-h-[320px] text-center"
                  >
                    <div className="w-16 h-16 rounded-2xl bg-white/5 border border-white/8 flex items-center justify-center mb-4">
                      <Crown className="w-7 h-7 text-white/20" />
                    </div>
                    <p className="text-white/30 text-sm font-medium">
                      Sélectionnez un profil
                    </p>
                    <p className="text-white/15 text-xs mt-1">
                      pour voir les détails et accéder
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>

        {/* Footer note */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="text-center text-[11px] text-white/20 mt-6"
        >
          🔒 Mode démo — aucun mot de passe requis · Données simulées uniquement
        </motion.p>
      </motion.div>
    </div>
  );
}
