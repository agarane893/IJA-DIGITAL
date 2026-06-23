"use client";

import { motion } from "framer-motion";
import { ChefHat, Clock, CheckCircle2, AlertCircle, Flame } from "lucide-react";

const ORDERS = [
  { id: "#1024", table: "Table 4", items: ["2x Café Espresso", "1x Citronnade Menthe"], time: "Il y a 3 min", status: "urgent", ticket: "En attente" },
  { id: "#1023", table: "Table 12", items: ["1x Brik au Thon", "1x Thé Vert à la Menthe", "1x Baklawa"], time: "Il y a 8 min", status: "cooking", ticket: "En préparation" },
  { id: "#1022", table: "À emporter", items: ["3x Croissant Beurre", "1x Double Espresso"], time: "Il y a 12 min", status: "ready", ticket: "Prêt" },
  { id: "#1019", table: "Table 9", items: ["1x Chajra Tunisienne Complète"], time: "Il y a 18 min", status: "cooking", ticket: "En préparation" },
];

const STATUS_CONFIG = {
  urgent: { color: "border-red-500/30 bg-red-500/5", badge: "bg-red-500/15 text-red-400 border-red-500/25", label: "Urgent" },
  cooking: { color: "border-amber-500/30 bg-amber-500/5", badge: "bg-amber-500/15 text-amber-400 border-amber-500/25", label: "En cuisine" },
  ready: { color: "border-emerald-500/30 bg-emerald-500/5", badge: "bg-emerald-500/15 text-emerald-400 border-emerald-500/25", label: "Prêt à servir" },
};

export default function KitchenPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-heading text-2xl font-black text-white flex items-center gap-2">
            <ChefHat className="w-7 h-7 text-amber-400" />
            Vue Préparation Cuisine
          </h1>
          <p className="text-sm text-white/40 mt-1">Tickets en temps réel — actualisé automatiquement</p>
        </div>
        <div className="flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/20 rounded-xl px-3 py-2">
          <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-xs font-bold text-emerald-400">En ligne</span>
        </div>
      </div>

      {/* Kanban columns */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {(["urgent", "cooking", "ready"] as const).map((status) => {
          const items = ORDERS.filter((o) => o.status === status);
          const cfg = STATUS_CONFIG[status];
          return (
            <div key={status} className="space-y-3">
              <div className="flex items-center justify-between">
                <span className={`text-xs font-bold px-3 py-1 rounded-lg border ${cfg.badge}`}>
                  {cfg.label}
                </span>
                <span className="text-xs text-white/30 font-bold">{items.length} ticket{items.length > 1 ? "s" : ""}</span>
              </div>
              {items.map((order, i) => (
                <motion.div
                  key={order.id}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.08 }}
                  className={`rounded-2xl p-4 border ${cfg.color} space-y-3`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-black text-white">{order.table}</span>
                    <span className="text-xs font-bold text-[#D95D39]">{order.id}</span>
                  </div>
                  <ul className="space-y-1">
                    {order.items.map((item, j) => (
                      <li key={j} className="flex items-center gap-2 text-xs text-white/60">
                        <div className="w-1 h-1 rounded-full bg-white/30" />
                        {item}
                      </li>
                    ))}
                  </ul>
                  <div className="flex items-center justify-between pt-1 border-t border-white/6">
                    <span className="flex items-center gap-1 text-[10px] text-white/25">
                      <Clock className="w-3 h-3" /> {order.time}
                    </span>
                    {status === "ready" ? (
                      <button className="flex items-center gap-1 text-[10px] font-bold text-emerald-400 hover:text-emerald-300 transition-colors">
                        <CheckCircle2 className="w-3.5 h-3.5" /> Confirmer
                      </button>
                    ) : status === "urgent" ? (
                      <button className="flex items-center gap-1 text-[10px] font-bold text-amber-400 hover:text-amber-300 transition-colors">
                        <Flame className="w-3.5 h-3.5" /> Commencer
                      </button>
                    ) : (
                      <button className="flex items-center gap-1 text-[10px] font-bold text-blue-400 hover:text-blue-300 transition-colors">
                        <AlertCircle className="w-3.5 h-3.5" /> Marquer prêt
                      </button>
                    )}
                  </div>
                </motion.div>
              ))}
              {items.length === 0 && (
                <div className="rounded-2xl border border-white/5 bg-white/2 p-8 flex flex-col items-center gap-2">
                  <ChefHat className="w-8 h-8 text-white/10" />
                  <p className="text-xs text-white/20">Aucun ticket</p>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
