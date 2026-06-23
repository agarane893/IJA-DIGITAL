"use client";

import { motion } from "framer-motion";
import { Package, AlertTriangle, TrendingDown, RefreshCw } from "lucide-react";

const ITEMS = [
  { name: "Café Arabica", category: "Boissons", unit: "g", stock: 450, min: 500, max: 5000, status: "low" },
  { name: "Farine T55", category: "Boulangerie", unit: "kg", stock: 12, min: 5, max: 50, status: "ok" },
  { name: "Lait entier", category: "Laitier", unit: "L", stock: 8, min: 10, max: 40, status: "low" },
  { name: "Huile d'olive", category: "Épicerie", unit: "L", stock: 24, min: 5, max: 30, status: "ok" },
  { name: "Thon en conserve", category: "Épicerie", unit: "boîtes", stock: 2, min: 10, max: 50, status: "critical" },
  { name: "Menthe fraîche", category: "Herbes", unit: "bouquets", stock: 15, min: 5, max: 30, status: "ok" },
];

const STATUS_CFG = {
  ok: { badge: "bg-emerald-500/15 text-emerald-400 border-emerald-500/20", bar: "bg-emerald-500", label: "OK" },
  low: { badge: "bg-amber-500/15 text-amber-400 border-amber-500/20", bar: "bg-amber-500", label: "Faible" },
  critical: { badge: "bg-red-500/15 text-red-400 border-red-500/20", bar: "bg-red-500", label: "Critique" },
};

export default function InventoryPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-heading text-2xl font-black text-white flex items-center gap-2">
            <Package className="w-7 h-7 text-blue-400" />
            Gestion des Stocks
          </h1>
          <p className="text-sm text-white/40 mt-1">Suivi des ingrédients et fournitures</p>
        </div>
        <button className="flex items-center gap-2 text-xs font-bold text-white/50 hover:text-white bg-white/5 border border-white/8 hover:bg-white/8 rounded-xl px-3 py-2 transition-all">
          <RefreshCw className="w-3.5 h-3.5" />
          Actualiser
        </button>
      </div>

      {/* Alert badges */}
      <div className="flex flex-wrap gap-3">
        <div className="flex items-center gap-2 bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-2">
          <AlertTriangle className="w-4 h-4 text-red-400" />
          <span className="text-xs font-bold text-red-400">1 article critique</span>
        </div>
        <div className="flex items-center gap-2 bg-amber-500/10 border border-amber-500/20 rounded-xl px-4 py-2">
          <TrendingDown className="w-4 h-4 text-amber-400" />
          <span className="text-xs font-bold text-amber-400">2 articles en stock faible</span>
        </div>
      </div>

      {/* Items table */}
      <div className="bg-[#161B22] border border-white/6 rounded-2xl overflow-hidden">
        <div className="grid grid-cols-[2fr_1fr_1fr_1fr_1fr] gap-4 px-5 py-3 border-b border-white/6">
          {["Article", "Catégorie", "Stock actuel", "Statut", "Niveau"].map((h) => (
            <p key={h} className="text-[10px] font-bold text-white/30 uppercase tracking-wider">{h}</p>
          ))}
        </div>
        {ITEMS.map((item, i) => {
          const cfg = STATUS_CFG[item.status as keyof typeof STATUS_CFG];
          const pct = Math.round((item.stock / item.max) * 100);
          return (
            <motion.div
              key={item.name}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: i * 0.06 }}
              className="grid grid-cols-[2fr_1fr_1fr_1fr_1fr] gap-4 px-5 py-4 border-b border-white/4 hover:bg-white/2 transition-colors items-center"
            >
              <p className="text-sm font-bold text-white">{item.name}</p>
              <p className="text-xs text-white/40">{item.category}</p>
              <p className="text-sm font-bold text-white/80">{item.stock} {item.unit}</p>
              <span className={`inline-block text-[10px] font-bold px-2 py-0.5 rounded-lg border w-fit ${cfg.badge}`}>{cfg.label}</span>
              <div className="space-y-1">
                <div className="h-2 bg-white/8 rounded-full overflow-hidden">
                  <div className={`h-full rounded-full ${cfg.bar}`} style={{ width: `${pct}%` }} />
                </div>
                <p className="text-[10px] text-white/25">{pct}%</p>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
