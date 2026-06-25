"use client";

import { motion } from "framer-motion";
import { BarChart3, Download, Calendar } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from "recharts";

const monthlyData = [
  { month: "Jan", revenue: 32000, orders: 890 },
  { month: "Fév", revenue: 38000, orders: 1050 },
  { month: "Mar", revenue: 45000, orders: 1280 },
  { month: "Avr", revenue: 41000, orders: 1100 },
  { month: "Mai", revenue: 52000, orders: 1450 },
  { month: "Juin", revenue: 48700, orders: 1239 },
];

const categoryData = [
  { name: "Boissons", value: 38 },
  { name: "Cuisine", value: 32 },
  { name: "Pâtisseries", value: 18 },
  { name: "Autres", value: 12 },
];

const COLORS = ["#D95D39", "#3B82F6", "#8B5CF6", "#6B7280"];

export default function ReportsPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-heading text-2xl font-black text-white flex items-center gap-2">
            <BarChart3 className="w-7 h-7 text-purple-400" />
            Rapports & Analyses
          </h1>
          <p className="text-sm text-white/40 mt-1">Performance sur 6 mois</p>
        </div>
        <div className="flex gap-2">
          <button className="flex items-center gap-2 text-xs font-bold text-white/50 hover:text-white bg-white/5 border border-white/8 hover:bg-white/8 rounded-xl px-3 py-2 transition-all">
            <Calendar className="w-3.5 h-3.5" />
            Période
          </button>
          <button className="flex items-center gap-2 text-xs font-bold text-zen-500 bg-zen-500/10 border border-zen-500/20 hover:bg-zen-500/15 rounded-xl px-3 py-2 transition-all">
            <Download className="w-3.5 h-3.5" />
            Exporter PDF
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue trend */}
        <div className="bg-zen-800 border border-white/6 rounded-2xl p-6">
          <h2 className="font-heading text-base font-bold text-white mb-1">Évolution du CA</h2>
          <p className="text-xs text-white/30 mb-5">Chiffre d&apos;affaires mensuel (TND)</p>
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={monthlyData} margin={{ top: 0, right: 0, left: -25, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" vertical={false} />
                <XAxis dataKey="month" stroke="rgba(255,255,255,0.2)" fontSize={11} tickLine={false} axisLine={false} />
                <YAxis stroke="rgba(255,255,255,0.2)" fontSize={11} tickLine={false} axisLine={false} />
                <Tooltip contentStyle={{ backgroundColor: "#1C2128", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "12px", color: "#fff", fontSize: "12px" }} />
                <Line type="monotone" dataKey="revenue" stroke="#D95D39" strokeWidth={2.5} dot={{ fill: "#D95D39", r: 4 }} activeDot={{ r: 6 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Category pie */}
        <div className="bg-zen-800 border border-white/6 rounded-2xl p-6">
          <h2 className="font-heading text-base font-bold text-white mb-1">Ventes par catégorie</h2>
          <p className="text-xs text-white/30 mb-5">Répartition des revenus</p>
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={categoryData} cx="50%" cy="50%" innerRadius={55} outerRadius={90} paddingAngle={3} dataKey="value">
                  {categoryData.map((_, i) => <Cell key={i} fill={COLORS[i]} />)}
                </Pie>
                <Legend formatter={(value) => <span style={{ color: "rgba(255,255,255,0.6)", fontSize: 11 }}>{value}</span>} />
                <Tooltip contentStyle={{ backgroundColor: "#1C2128", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "12px", color: "#fff", fontSize: "12px" }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Monthly table */}
      <div className="bg-zen-800 border border-white/6 rounded-2xl overflow-hidden">
        <div className="px-5 py-4 border-b border-white/6">
          <h2 className="font-heading text-base font-bold text-white">Résumé mensuel</h2>
        </div>
        <div className="grid grid-cols-4 gap-4 px-5 py-3 border-b border-white/6">
          {["Mois", "Revenus", "Commandes", "Panier Moy."].map((h) => (
            <p key={h} className="text-[10px] font-bold text-white/30 uppercase tracking-wider">{h}</p>
          ))}
        </div>
        {monthlyData.map((row, i) => (
          <motion.div key={row.month} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.05 }}
            className="grid grid-cols-4 gap-4 px-5 py-4 border-b border-white/4 hover:bg-white/2 transition-colors">
            <p className="text-sm font-bold text-white">{row.month}</p>
            <p className="text-sm text-white/80">{row.revenue.toLocaleString()} TND</p>
            <p className="text-sm text-white/80">{row.orders.toLocaleString()}</p>
            <p className="text-sm text-white/80">{Math.round(row.revenue / row.orders).toLocaleString()} TND</p>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
