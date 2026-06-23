"use client";

import { motion } from "framer-motion";
import { Truck, MapPin, Clock, Phone, CheckCircle2, Navigation } from "lucide-react";

const DELIVERIES = [
  { id: "#D045", client: "Mohamed Triki", address: "12 Rue de Carthage, Tunis", zone: "Centre-ville", items: "1x Tajine + 2x Citronnade", total: "32.500 TND", status: "pickup", eta: "5 min", phone: "+216 20 123 456" },
  { id: "#D044", client: "Sarra Ben Ali", address: "Résidence Ennahli, Bloc B", zone: "Ennahli", items: "3x Brik + 1x Café", total: "28.000 TND", status: "transit", eta: "15 min", phone: "+216 55 987 654" },
  { id: "#D043", client: "Bilel Chaabani", address: "45 Av. Habib Bourguiba, Lac", zone: "Les Berges du Lac", items: "1x Chajra Tunisienne", total: "19.500 TND", status: "delivered", eta: "Livré", phone: "+216 93 456 789" },
];

const STATUS_CONFIG = {
  pickup: { badge: "bg-blue-500/15 text-blue-400 border-blue-500/20", label: "À récupérer", dot: "bg-blue-400" },
  transit: { badge: "bg-amber-500/15 text-amber-400 border-amber-500/20", label: "En route", dot: "bg-amber-400 animate-pulse" },
  delivered: { badge: "bg-emerald-500/15 text-emerald-400 border-emerald-500/20", label: "Livré", dot: "bg-emerald-400" },
};

export default function DeliveryPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-heading text-2xl font-black text-white flex items-center gap-2">
          <Truck className="w-7 h-7 text-orange-400" />
          Vue Livraisons
        </h1>
        <p className="text-sm text-white/40 mt-1">Suivez et gérez vos livraisons en cours</p>
      </div>

      {/* Quick stats */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: "À récupérer", value: "1", color: "text-blue-400", bg: "bg-blue-500/10 border-blue-500/20" },
          { label: "En transit", value: "1", color: "text-amber-400", bg: "bg-amber-500/10 border-amber-500/20" },
          { label: "Livrées aujourd'hui", value: "12", color: "text-emerald-400", bg: "bg-emerald-500/10 border-emerald-500/20" },
        ].map((s) => (
          <div key={s.label} className={`rounded-2xl border p-4 ${s.bg}`}>
            <p className={`font-heading text-2xl font-black ${s.color}`}>{s.value}</p>
            <p className="text-xs text-white/40 mt-1">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Deliveries list */}
      <div className="space-y-4">
        {DELIVERIES.map((d, i) => {
          const cfg = STATUS_CONFIG[d.status as keyof typeof STATUS_CONFIG];
          return (
            <motion.div
              key={d.id}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="bg-[#161B22] border border-white/6 rounded-2xl p-5"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="space-y-2 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-[#D95D39] text-sm">{d.id}</span>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-lg border ${cfg.badge} flex items-center gap-1`}>
                      <div className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
                      {cfg.label}
                    </span>
                  </div>
                  <p className="font-bold text-white">{d.client}</p>
                  <p className="text-sm text-white/50 flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 shrink-0" />
                    {d.address}
                  </p>
                  <p className="text-xs text-white/35">{d.items}</p>
                </div>
                <div className="flex flex-col items-end gap-3 shrink-0">
                  <p className="font-bold text-white">{d.total}</p>
                  <div className="flex items-center gap-1 text-xs text-white/40">
                    <Clock className="w-3.5 h-3.5" />
                    ETA: {d.eta}
                  </div>
                  <div className="flex gap-2">
                    <a href={`tel:${d.phone}`} className="flex items-center gap-1.5 text-xs font-bold text-white/50 hover:text-white bg-white/5 border border-white/8 hover:bg-white/8 rounded-xl px-3 py-2 transition-all">
                      <Phone className="w-3.5 h-3.5" />
                      Appeler
                    </a>
                    {d.status !== "delivered" && (
                      <button className="flex items-center gap-1.5 text-xs font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 hover:bg-emerald-500/15 rounded-xl px-3 py-2 transition-all">
                        {d.status === "pickup" ? <><Navigation className="w-3.5 h-3.5" />Récupéré</> : <><CheckCircle2 className="w-3.5 h-3.5" />Livré</>}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
