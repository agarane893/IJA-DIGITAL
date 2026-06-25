"use client";

import { motion } from "framer-motion";
import { Globe, TrendingUp, Store, ArrowUpRight, Users, Star } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { DEMO_RESTAURANTS } from "@/lib/auth";

const weeklyData = [
  { name: "Lun", tunis: 1200, lac: 980, carthage: 750 },
  { name: "Mar", tunis: 1450, lac: 1100, carthage: 820 },
  { name: "Mer", tunis: 1100, lac: 870, carthage: 690 },
  { name: "Jeu", tunis: 1850, lac: 1400, carthage: 950 },
  { name: "Ven", tunis: 2400, lac: 1900, carthage: 1200 },
  { name: "Sam", tunis: 3200, lac: 2600, carthage: 1800 },
  { name: "Dim", tunis: 2800, lac: 2100, carthage: 1500 },
];

const RESTAURANT_STATS = [
  { id: "r1", revenue: "48,700 TND", orders: 547, growth: "+14%", rating: 4.8, staff: 12, up: true },
  { id: "r2", revenue: "36,200 TND", orders: 403, growth: "+8%", rating: 4.6, staff: 9, up: true },
  { id: "r3", revenue: "22,500 TND", orders: 289, growth: "-3%", rating: 4.4, staff: 7, up: false },
];

export default function GlobalStatsPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-heading text-2xl font-black text-white flex items-center gap-2">
          <Globe className="w-7 h-7 text-purple-400" />
          Statistiques Globales
        </h1>
        <p className="text-sm text-white/40 mt-1">Vue consolidée de tous vos établissements</p>
      </div>

      {/* Network total stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Réseau total", value: "107,400 TND", sub: "ce mois", icon: <TrendingUp className="w-5 h-5" />, color: "text-purple-400" },
          { label: "Commandes totales", value: "1,239", sub: "ce mois", icon: <Store className="w-5 h-5" />, color: "text-blue-400" },
          { label: "Employés actifs", value: "28", sub: "sur 3 sites", icon: <Users className="w-5 h-5" />, color: "text-cyan-400" },
          { label: "Note moyenne", value: "4.6 ★", sub: "tous restos", icon: <Star className="w-5 h-5" />, color: "text-amber-400" },
        ].map((s, i) => (
          <motion.div key={i} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.07 }}
            className="bg-zen-800 border border-white/6 rounded-2xl p-5">
            <div className={`w-9 h-9 rounded-xl bg-white/5 border border-white/8 flex items-center justify-center mb-3 ${s.color}`}>
              {s.icon}
            </div>
            <p className="text-xs text-white/40 font-semibold uppercase tracking-wider mb-1">{s.label}</p>
            <p className="font-heading text-xl font-black text-white">{s.value}</p>
            <p className="text-xs text-white/30 mt-1">{s.sub}</p>
          </motion.div>
        ))}
      </div>

      {/* Comparative chart */}
      <div className="bg-zen-800 border border-white/6 rounded-2xl p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="font-heading text-lg font-bold text-white">Revenus par Restaurant</h2>
            <p className="text-xs text-white/30 mt-0.5">Comparaison hebdomadaire (en TND)</p>
          </div>
          <div className="flex items-center gap-3 text-[11px] font-semibold">
            <span className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 rounded-full bg-zen-500" />Tunis</span>
            <span className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 rounded-full bg-blue-500" />Lac</span>
            <span className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 rounded-full bg-purple-500" />Carthage</span>
          </div>
        </div>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={weeklyData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" vertical={false} />
              <XAxis dataKey="name" stroke="rgba(255,255,255,0.2)" fontSize={11} tickLine={false} axisLine={false} />
              <YAxis stroke="rgba(255,255,255,0.2)" fontSize={11} tickLine={false} axisLine={false} />
              <Tooltip contentStyle={{ backgroundColor: "#1C2128", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "12px", color: "#fff", fontSize: "12px" }} />
              <Bar dataKey="tunis" fill="#D95D39" radius={[4, 4, 0, 0]} />
              <Bar dataKey="lac" fill="#3B82F6" radius={[4, 4, 0, 0]} />
              <Bar dataKey="carthage" fill="#8B5CF6" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Per-restaurant breakdown */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {DEMO_RESTAURANTS.map((resto, i) => {
          const stats = RESTAURANT_STATS.find((s) => s.id === resto.id)!;
          return (
            <motion.div key={resto.id} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 + i * 0.08 }}
              className="bg-zen-800 border border-white/6 rounded-2xl p-5">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/8 flex items-center justify-center text-xl">
                  {resto.avatar}
                </div>
                <div>
                  <p className="font-bold text-white text-sm">{resto.name}</p>
                  <p className="text-[11px] text-white/40">{resto.location}</p>
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-xs text-white/40">Revenus</span>
                  <span className="text-sm font-bold text-white">{stats.revenue}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs text-white/40">Commandes</span>
                  <span className="text-sm font-bold text-white">{stats.orders}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs text-white/40">Croissance</span>
                  <span className={`text-sm font-bold flex items-center gap-1 ${stats.up ? "text-emerald-400" : "text-red-400"}`}>
                    <ArrowUpRight className={`w-3.5 h-3.5 ${!stats.up && "rotate-180"}`} />
                    {stats.growth}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs text-white/40">Note</span>
                  <span className="text-sm font-bold text-amber-400">★ {stats.rating}</span>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
