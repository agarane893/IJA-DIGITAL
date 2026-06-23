"use client";

import React, { useState } from "react";
import {
  TrendingUp,
  ShoppingBag,
  Layers,
  DollarSign,
  ArrowUpRight,
  Users,
  Star,
} from "lucide-react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { useAuthStore } from "@/lib/useAuthStore";
import { hasPermission } from "@/lib/auth";
import { useOrderStore } from "@/lib/useOrderStore";

const revenueData = [
  { name: "Lun", revenue: 1200 },
  { name: "Mar", revenue: 1450 },
  { name: "Mer", revenue: 1100 },
  { name: "Jeu", revenue: 1850 },
  { name: "Ven", revenue: 2400 },
  { name: "Sam", revenue: 3200 },
  { name: "Dim", revenue: 2800 },
];

const recentOrders = [
  { id: "#1024", table: "Table 4", items: "2x Café, 1x Citronnade", total: "15.500", status: "Prêt", time: "5 min" },
  { id: "#1023", table: "Table 12", items: "1x Brik Thon, 1x Thé Vert", total: "10.000", status: "En cuisine", time: "8 min" },
  { id: "#1022", table: "À emporter", items: "3x Croissant, 1x Double Espresso", total: "19.500", status: "Servi", time: "12 min" },
  { id: "#1021", table: "Table 9", items: "1x Chajra Tunisienne", total: "12.500", status: "Nouveau", time: "15 min" },
];

const STATUS_STYLES: Record<string, string> = {
  Nouveau: "bg-blue-500/15 text-blue-400 border-blue-500/20",
  "En cuisine": "bg-amber-500/15 text-amber-400 border-amber-500/20",
  Prêt: "bg-emerald-500/15 text-emerald-400 border-emerald-500/20",
  Servi: "bg-white/8 text-white/40 border-white/10",
};

export default function AdminDashboardPage() {
  const [timeRange, setTimeRange] = useState("Semaine");
  const { user } = useAuthStore();
  const isGlobal = user ? hasPermission(user, "global_stats") : false;

  const { orders } = useOrderStore();
  const incomingOrders = orders.map(o => ({
    id: o.id,
    table: `Table ${o.tableId}`,
    items: `${o.items.length} article(s)`,
    total: o.total.toFixed(3),
    status: o.status === "new" ? "Nouveau" : o.status === "cooking" ? "En cuisine" : "Prêt",
    time: "À l'instant",
  }));
  const displayOrders = [...incomingOrders, ...recentOrders].slice(0, 5);

  const stats = [
    {
      label: "Chiffre d'Affaires",
      value: isGlobal ? "48,700 TND" : "14,900 TND",
      change: "+12%",
      up: true,
      icon: <TrendingUp className="w-5 h-5" />,
      sub: "depuis hier",
      color: "text-[#D95D39]",
      glow: "shadow-[#D95D39]/20",
    },
    {
      label: "Commandes",
      value: isGlobal ? "547" : "184",
      change: "+8%",
      up: true,
      icon: <ShoppingBag className="w-5 h-5" />,
      sub: "ce midi",
      color: "text-blue-400",
      glow: "shadow-blue-500/20",
    },
    {
      label: "Taux d'occupation",
      value: "78%",
      change: "14 / 18",
      up: null,
      icon: <Layers className="w-5 h-5" />,
      sub: "tables occupées",
      color: "text-purple-400",
      glow: "shadow-purple-500/20",
    },
    {
      label: "Panier Moyen",
      value: "24.500 TND",
      change: "-2%",
      up: false,
      icon: <DollarSign className="w-5 h-5" />,
      sub: "ce mois-ci",
      color: "text-emerald-400",
      glow: "shadow-emerald-500/20",
    },
  ];

  if (isGlobal) {
    stats.push(
      {
        label: "Restaurants actifs",
        value: "3",
        change: "+1",
        up: true,
        icon: <Star className="w-5 h-5" />,
        sub: "ce trimestre",
        color: "text-amber-400",
        glow: "shadow-amber-500/20",
      },
      {
        label: "Employés en service",
        value: "24",
        change: "aujourd'hui",
        up: null,
        icon: <Users className="w-5 h-5" />,
        sub: "sur 3 établissements",
        color: "text-cyan-400",
        glow: "shadow-cyan-500/20",
      }
    );
  }

  return (
    <div className="space-y-8">
      {/* Title */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="font-heading text-2xl md:text-3xl font-black text-white">
            {isGlobal ? "Vue Globale · Tous Restaurants" : "Tableau de Bord"}
          </h1>
          <p className="text-sm text-white/40 mt-1">
            {isGlobal
              ? "Performances consolidées de votre réseau de restaurants"
              : "Suivez vos performances en temps réel"}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {["Jour", "Semaine", "Mois"].map((r) => (
            <button
              key={r}
              onClick={() => setTimeRange(r)}
              className={`rounded-xl h-9 px-4 text-xs font-bold transition-all ${
                timeRange === r
                  ? "bg-[#D95D39] text-white shadow-lg shadow-[#D95D39]/25"
                  : "bg-white/5 border border-white/8 text-white/50 hover:text-white hover:bg-white/10"
              }`}
            >
              {r}
            </button>
          ))}
        </div>
      </div>

      {/* Stats Grid */}
      <div className={`grid gap-4 ${isGlobal ? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3" : "grid-cols-1 sm:grid-cols-2 lg:grid-cols-4"}`}>
        {stats.map((stat, i) => (
          <div
            key={i}
            className={`bg-[#161B22] border border-white/6 rounded-2xl p-5 relative overflow-hidden group hover:border-white/12 transition-all shadow-lg ${stat.glow}`}
          >
            <div className="flex items-start justify-between mb-3">
              <div className={`w-10 h-10 rounded-xl bg-white/5 border border-white/8 flex items-center justify-center ${stat.color}`}>
                {stat.icon}
              </div>
              <span className={`text-xs font-bold px-2 py-1 rounded-lg border ${
                stat.up === true
                  ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                  : stat.up === false
                  ? "bg-red-500/10 text-red-400 border-red-500/20"
                  : "bg-white/5 text-white/30 border-white/8"
              }`}>
                {stat.change}
              </span>
            </div>
            <p className="text-xs text-white/40 font-semibold uppercase tracking-wider mb-1">
              {stat.label}
            </p>
            <p className="font-heading text-2xl font-black text-white">
              {stat.value}
            </p>
            <p className="text-xs text-white/30 mt-1">{stat.sub}</p>

            {/* Subtle glow */}
            <div className={`absolute -bottom-6 -right-6 w-20 h-20 rounded-full blur-2xl opacity-20 ${stat.color.replace("text-", "bg-")}`} />
          </div>
        ))}
      </div>

      {/* Charts + Orders */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Revenue Chart */}
        <div className="bg-[#161B22] border border-white/6 rounded-2xl p-6 lg:col-span-2">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="font-heading text-lg font-bold text-white">
                Évolution des revenus
              </h2>
              <p className="text-xs text-white/30 mt-0.5">
                Chiffre d&apos;affaires — {timeRange.toLowerCase()} (en TND)
              </p>
            </div>
            <div className="flex items-center gap-1.5 text-xs font-bold text-[#D95D39] bg-[#D95D39]/10 px-3 py-1.5 rounded-xl border border-[#D95D39]/20">
              Performance Max
              <ArrowUpRight className="w-3.5 h-3.5" />
            </div>
          </div>

          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={revenueData} margin={{ top: 5, right: 5, left: -25, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#D95D39" stopOpacity={0.25} />
                    <stop offset="95%" stopColor="#D95D39" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" vertical={false} />
                <XAxis dataKey="name" stroke="rgba(255,255,255,0.2)" fontSize={11} tickLine={false} axisLine={false} />
                <YAxis stroke="rgba(255,255,255,0.2)" fontSize={11} tickLine={false} axisLine={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#1C2128",
                    border: "1px solid rgba(255,255,255,0.08)",
                    borderRadius: "12px",
                    color: "#fff",
                    fontFamily: "var(--font-sans)",
                    fontSize: "12px",
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="revenue"
                  stroke="#D95D39"
                  strokeWidth={2.5}
                  fillOpacity={1}
                  fill="url(#colorRev)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Recent Orders */}
        <div className="bg-[#161B22] border border-white/6 rounded-2xl p-5">
          <h2 className="font-heading text-lg font-bold text-white mb-1">
            Commandes en cours
          </h2>
          <p className="text-xs text-white/30 mb-5">Suivi instantané des tables actives</p>

          <div className="space-y-2.5">
            {displayOrders.map((order) => (
              <div
                key={order.id}
                className={`p-3 border rounded-xl hover:border-white/10 hover:bg-white/5 transition-all ${
                  order.status === "Nouveau" 
                    ? "bg-[#D95D39]/5 border-[#D95D39]/20" 
                    : "bg-white/3 border-white/5"
                }`}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-xs font-bold text-[#D95D39]">{order.id}</span>
                  <span className="text-[10px] text-white/25">{order.time}</span>
                </div>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-bold text-white/85">{order.table}</span>
                  <span className="text-xs font-bold text-white/70">{order.total} TND</span>
                </div>
                <p className="text-[11px] text-white/35 mb-2 leading-snug">{order.items}</p>
                <span
                  className={`inline-block px-2 py-0.5 rounded-lg text-[10px] font-bold border ${STATUS_STYLES[order.status] ?? "bg-white/8 text-white/40 border-white/10"}`}
                >
                  {order.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
