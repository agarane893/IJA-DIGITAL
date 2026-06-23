"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Users, Phone, Clock, UserCheck, UserX, Plane, Plus, X } from "lucide-react";
import { useRHStore, Employee } from "@/lib/useRHStore";

const DAYS = ["Lun", "Mar", "Mer", "Jeu", "Ven", "Sam", "Dim"];

const STATUS_CONFIG = {
  present: { label: "Présent", color: "text-emerald-400", bg: "bg-emerald-500/15 border-emerald-500/20", dot: "bg-emerald-400" },
  absent:  { label: "Absent",  color: "text-red-400",     bg: "bg-red-500/15 border-red-500/20",     dot: "bg-red-400" },
  leave:   { label: "Congé",   color: "text-amber-400",   bg: "bg-amber-500/15 border-amber-500/20", dot: "bg-amber-400" },
};

function AddEmployeeModal({ onClose }: { onClose: () => void }) {
  const { addEmployee } = useRHStore();
  const [form, setForm] = useState({ name: "", role: "", phone: "" });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.role) return;
    addEmployee({
      id: `e${Date.now()}`,
      name: form.name,
      role: form.role,
      phone: form.phone,
      status: "present",
      shifts: Object.fromEntries(DAYS.map((d) => [d, "Off"])),
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-[#161B22] border border-white/10 rounded-2xl p-6 w-full max-w-sm"
      >
        <div className="flex items-center justify-between mb-5">
          <h2 className="font-bold text-white">Nouvel employé</h2>
          <button onClick={onClose} className="text-white/40 hover:text-white transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-3">
          {[
            { key: "name", label: "Nom complet", placeholder: "Ahmed Ben Ali" },
            { key: "role", label: "Poste", placeholder: "Caissier" },
            { key: "phone", label: "Téléphone", placeholder: "+216 XX XXX XXX" },
          ].map(({ key, label, placeholder }) => (
            <div key={key}>
              <label className="block text-xs text-white/40 mb-1">{label}</label>
              <input
                type="text"
                placeholder={placeholder}
                value={form[key as keyof typeof form]}
                onChange={(e) => setForm((f) => ({ ...f, [key]: e.target.value }))}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-sm text-white placeholder-white/20 focus:outline-none focus:border-[#D95D39]/50"
              />
            </div>
          ))}
          <button
            type="submit"
            className="w-full mt-2 bg-[#D95D39] hover:bg-[#C04D2C] text-white font-bold py-2.5 rounded-xl transition-colors text-sm"
          >
            Ajouter
          </button>
        </form>
      </motion.div>
    </div>
  );
}

export default function RHPage() {
  const { employees, checkIn, checkOut, updateEmployee } = useRHStore();
  const [showAdd, setShowAdd] = useState(false);

  const present = employees.filter((e) => e.status === "present").length;
  const absent  = employees.filter((e) => e.status === "absent").length;
  const leave   = employees.filter((e) => e.status === "leave").length;

  return (
    <div className="space-y-6">
      {showAdd && <AddEmployeeModal onClose={() => setShowAdd(false)} />}

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-heading text-2xl font-black text-white flex items-center gap-2">
            <Users className="w-7 h-7 text-cyan-400" />
            RH & Personnel
          </h1>
          <p className="text-sm text-white/40 mt-1">Gestion des équipes et des plannings</p>
        </div>
        <button
          onClick={() => setShowAdd(true)}
          className="flex items-center gap-2 bg-[#D95D39] hover:bg-[#C04D2C] text-white text-sm font-bold px-4 py-2 rounded-xl transition-colors"
        >
          <Plus className="w-4 h-4" />
          Ajouter
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: "Présents",  value: present, icon: <UserCheck className="w-5 h-5" />, color: "text-emerald-400", bg: "bg-emerald-500/10 border-emerald-500/20" },
          { label: "Absents",   value: absent,  icon: <UserX className="w-5 h-5" />,    color: "text-red-400",     bg: "bg-red-500/10 border-red-500/20" },
          { label: "En congé",  value: leave,   icon: <Plane className="w-5 h-5" />,    color: "text-amber-400",   bg: "bg-amber-500/10 border-amber-500/20" },
        ].map((s) => (
          <div key={s.label} className={`rounded-2xl border p-4 ${s.bg}`}>
            <div className={`mb-2 ${s.color}`}>{s.icon}</div>
            <p className={`font-heading text-2xl font-black ${s.color}`}>{s.value}</p>
            <p className="text-xs text-white/40 mt-1">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Employee cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {employees.map((emp: Employee, i) => {
          const cfg = STATUS_CONFIG[emp.status];
          return (
            <motion.div
              key={emp.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.07 }}
              className="bg-[#161B22] border border-white/6 rounded-2xl p-5 hover:border-white/12 transition-all flex flex-col gap-4"
            >
              {/* Top row */}
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-[#D95D39]/15 border border-[#D95D39]/20 flex items-center justify-center font-black text-[#D95D39] text-sm">
                    {emp.name.split(" ").map((n) => n[0]).join("").slice(0, 2)}
                  </div>
                  <div>
                    <p className="font-bold text-white text-sm">{emp.name}</p>
                    <p className="text-xs text-white/40">{emp.role}</p>
                  </div>
                </div>
                <span className={`flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-lg border ${cfg.bg} ${cfg.color}`}>
                  <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
                  {cfg.label}
                </span>
              </div>

              {/* Phone */}
              {emp.phone && (
                <a href={`tel:${emp.phone}`} className="flex items-center gap-2 text-xs text-white/40 hover:text-white transition-colors">
                  <Phone className="w-3.5 h-3.5" />
                  {emp.phone}
                </a>
              )}

              {/* Weekly schedule */}
              <div>
                <p className="text-[10px] text-white/30 uppercase tracking-wide mb-2 flex items-center gap-1">
                  <Clock className="w-3 h-3" /> Planning semaine
                </p>
                <div className="grid grid-cols-7 gap-1">
                  {DAYS.map((day) => {
                    const shift = emp.shifts[day] ?? "Off";
                    const isOff = shift === "Off";
                    return (
                      <div key={day} className="flex flex-col items-center gap-1">
                        <span className="text-[9px] text-white/30">{day.slice(0, 1)}</span>
                        <div className={`w-full text-center text-[8px] py-1 rounded-md font-medium ${isOff ? "bg-white/5 text-white/20" : "bg-cyan-500/15 text-cyan-400"}`}>
                          {isOff ? "–" : "✓"}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-2 pt-1">
                <button
                  onClick={() => checkIn(emp.id)}
                  disabled={emp.status === "present"}
                  className="flex-1 text-xs font-bold py-1.5 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 hover:bg-emerald-500/20 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                >
                  Arrivée
                </button>
                <button
                  onClick={() => checkOut(emp.id)}
                  disabled={emp.status === "absent"}
                  className="flex-1 text-xs font-bold py-1.5 rounded-lg bg-red-500/10 text-red-400 border border-red-500/20 hover:bg-red-500/20 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                >
                  Départ
                </button>
                <button
                  onClick={() => updateEmployee(emp.id, { status: "leave" })}
                  disabled={emp.status === "leave"}
                  className="flex-1 text-xs font-bold py-1.5 rounded-lg bg-amber-500/10 text-amber-400 border border-amber-500/20 hover:bg-amber-500/20 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                >
                  Congé
                </button>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
