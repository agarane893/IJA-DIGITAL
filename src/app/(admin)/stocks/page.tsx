"use client";
import React, { useState } from "react";
import { motion } from "framer-motion";
import { useStocksStore } from "@/lib/useStocksStore";
import { Plus, Upload, Download } from "lucide-react";

export default function AdminStocksPage() {
  const { items, movements, updateStock, updateThreshold } = useStocksStore();
  const [selectedItem, setSelectedItem] = useState<string>("");
  const [qty, setQty] = useState(0);
  const [type, setType] = useState<"in" | "out">("in");
  const [threshold, setThreshold] = useState(0);

  const handleAddMovement = () => {
    if (!selectedItem || qty <= 0) return;
    const note = type === "in" ? "Entrée manuelle" : "Sortie manuelle";
    updateStock(selectedItem, qty, type, note);
    setQty(0);
  };

  const handleThresholdChange = (id: string) => {
    if (threshold <= 0) return;
    updateThreshold(id, threshold);
    setThreshold(0);
  };

  return (
    <div className="p-6 space-y-8">
      <h1 className="text-3xl font-black text-white">📦 Stocks (admin)</h1>

      {/* Stock table */}
      <section className="bg-[#0D1117] p-4 rounded-xl">
        <h2 className="text-xl font-bold text-[#D95D39] mb-4">🔧 Composants</h2>
        <table className="w-full text-left border-collapse">
          <thead className="bg-[#161B22] text-white/40">
            <tr>
              <th className="px-4 py-2">Nom</th>
              <th className="px-4 py-2">Niveau</th>
              <th className="px-4 py-2">Seuil</th>
              <th className="px-4 py-2">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {items.map((it) => {
              const percent = Math.round((it.currentLevel / it.maxCapacity) * 100);
              const alert = it.currentLevel <= it.minThreshold;
              return (
                <tr key={it.id} className="hover:bg-white/5 transition-colors">
                  <td className="px-4 py-2 text-white">{it.name}</td>
                  <td className="px-4 py-2">
                    <div className="w-48 bg-white/10 rounded-full h-3 overflow-hidden">
                      <div className="bg-[#D95D39] h-3" style={{ width: `${percent}%` }} />
                    </div>
                    <span className="text-xs text-white/60 ml-2">{it.currentLevel}/{it.maxCapacity} {it.unit}</span>
                  </td>
                  <td className="px-4 py-2 text-white/80">
                    {it.minThreshold} {it.unit}
                  </td>
                  <td className="px-4 py-2 flex items-center gap-2">
                    <button onClick={() => setSelectedItem(it.id)} className="p-1 bg-white/10 hover:bg-white/20 rounded" title="Modifier seuil">
                      <Plus className="w-4 h-4" />
                    </button>
                    {alert && <span className="text-red-500 font-bold text-xs">⚠️</span>}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </section>

      {/* Manual entry */}
      <section className="bg-[#0D1117] p-4 rounded-xl">
        <h2 className="text-xl font-bold text-[#D95D39] mb-4">➕ Entrée / Sortie manuelle</h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
          <select
            value={selectedItem}
            onChange={(e) => setSelectedItem(e.target.value)}
            className="bg-[#161B22] border border-white/10 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-[#D95D39]"
          >
            <option value="">Sélectionner composant</option>
            {items.map((it) => (
              <option key={it.id} value={it.id}>{it.name}</option>
            ))}
          </select>
          <input
            type="number"
            placeholder="Quantité"
            value={qty || ""}
            onChange={(e) => setQty(parseInt(e.target.value) || 0)}
            className="bg-[#161B22] border border-white/10 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-[#D95D39]"
          />
          <select
            value={type}
            onChange={(e) => setType(e.target.value as any)}
            className="bg-[#161B22] border border-white/10 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-[#D95D39]"
          >
            <option value="in">Entrée</option>
            <option value="out">Sortie</option>
          </select>
          <button
            onClick={handleAddMovement}
            className="flex items-center gap-1 bg-[#D95D39] text-white px-4 py-2 rounded-xl hover:bg-[#D95D39]/80 transition"
          >
            {type === "in" ? <Upload className="w-4 h-4" /> : <Download className="w-4 h-4" />} Ajouter
          </button>
        </div>
      </section>

      {/* Historique des mouvements */}
      <section className="bg-[#0D1117] p-4 rounded-xl">
        <h2 className="text-xl font-bold text-[#D95D39] mb-4">📜 Historique des mouvements</h2>
        <ul className="space-y-2 max-h-48 overflow-y-auto">
          {movements.map((m) => (
            <li key={m.id} className="text-sm text-white/80 flex justify-between">
              <span>{m.type === "in" ? "➕" : "➖"} {m.quantity} {items.find(i=>i.id===m.itemId)?.unit || ""} – {m.note}</span>
              <span className="text-xs text-white/50">{new Date(m.date).toLocaleString()}</span>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
