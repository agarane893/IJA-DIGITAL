"use client";

import { motion } from "framer-motion";
import { Users, Clock, Star, Phone } from "lucide-react";

const STAFF = [
  { name: "Mariem Bouaziz", role: "Manager", shift: "08h - 17h", status: "active", rating: 4.9, phone: "+216 20 111 222" },
  { name: "Karim Tlili", role: "Caissier", shift: "09h - 18h", status: "active", rating: 4.7, phone: "+216 25 333 444" },
  { name: "Sonia Hamdi", role: "Cuisinière", shift: "10h - 19h", status: "active", rating: 4.8, phone: "+216 98 555 666" },
  { name: "Fares Gharbi", role: "Livreur", shift: "11h - 20h", status: "active", rating: 4.6, phone: "+216 55 777 888" },
  { name: "Nadia Saad", role: "Serveuse", shift: "12h - 21h", status: "off", rating: 4.5, phone: "+216 23 999 000" },
];

export default function StaffPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-heading text-2xl font-black text-white flex items-center gap-2">
          <Users className="w-7 h-7 text-cyan-400" />
          RH & Personnel
        </h1>
        <p className="text-sm text-white/40 mt-1">Gestion des équipes et des plannings</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: "En service", value: "4", color: "text-emerald-400", bg: "bg-emerald-500/10 border-emerald-500/20" },
          { label: "Hors service", value: "1", color: "text-white/40", bg: "bg-white/5 border-white/8" },
          { label: "Total employés", value: "5", color: "text-cyan-400", bg: "bg-cyan-500/10 border-cyan-500/20" },
        ].map((s) => (
          <div key={s.label} className={`rounded-2xl border p-4 ${s.bg}`}>
            <p className={`font-heading text-2xl font-black ${s.color}`}>{s.value}</p>
            <p className="text-xs text-white/40 mt-1">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Staff cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {STAFF.map((s, i) => (
          <motion.div key={s.name} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.07 }}
            className="bg-[#161B22] border border-white/6 rounded-2xl p-5 hover:border-white/12 transition-all">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#D95D39]/15 border border-[#D95D39]/20 flex items-center justify-center font-bold text-[#D95D39] text-sm">
                  {s.name.split(" ").map((n) => n[0]).join("")}
                </div>
                <div>
                  <p className="font-bold text-white text-sm">{s.name}</p>
                  <p className="text-xs text-white/40">{s.role}</p>
                </div>
              </div>
              <div className={`flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-lg border ${s.status === "active" ? "bg-emerald-500/15 text-emerald-400 border-emerald-500/20" : "bg-white/5 text-white/25 border-white/10"}`}>
                <div className={`w-1.5 h-1.5 rounded-full ${s.status === "active" ? "bg-emerald-400" : "bg-white/20"}`} />
                {s.status === "active" ? "En service" : "Off"}
              </div>
            </div>
            <div className="space-y-2 text-xs">
              <div className="flex items-center gap-2 text-white/50">
                <Clock className="w-3.5 h-3.5" />
                Shift: {s.shift}
              </div>
              <div className="flex items-center gap-2 text-white/50">
                <Star className="w-3.5 h-3.5 text-amber-400" />
                Note: {s.rating}/5
              </div>
              <a href={`tel:${s.phone}`} className="flex items-center gap-2 text-white/50 hover:text-white transition-colors">
                <Phone className="w-3.5 h-3.5" />
                {s.phone}
              </a>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
