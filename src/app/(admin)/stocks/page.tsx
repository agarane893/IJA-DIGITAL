"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Package, Plus, Minus, Search, AlertCircle, CheckCircle2 } from "lucide-react";
import { useStocksStore, StockItem } from "@/lib/useStocksStore";
import { cn } from "@/lib/utils";

export default function StocksPage() {
  const { items, addStock, deductStock, resetDailyUsage, addStockItem } = useStocksStore();
  const [searchTerm, setSearchTerm] = useState("");
  
  const [showAddForm, setShowAddForm] = useState(false);
  const [newItemName, setNewItemName] = useState("");
  const [newItemUnit, setNewItemUnit] = useState("");

  const [customAmounts, setCustomAmounts] = useState<Record<string, string>>({});

  const filteredItems = items.filter((item) =>
    item.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleAdjust = (itemId: string, type: "add" | "deduct", amount: number) => {
    if (amount <= 0) return;
    if (type === "add") addStock(itemId, amount);
    else deductStock(itemId, amount);
  };

  const handleCustomAdjust = (itemId: string, type: "add" | "deduct") => {
    const val = parseFloat(customAmounts[itemId]);
    if (!isNaN(val) && val > 0) {
      handleAdjust(itemId, type, val);
      setCustomAmounts(prev => ({ ...prev, [itemId]: "" }));
    }
  };

  const handleAddNewItem = () => {
    if (!newItemName.trim() || !newItemUnit.trim()) return;
    addStockItem(newItemName.trim(), newItemUnit.trim());
    setNewItemName("");
    setNewItemUnit("");
    setShowAddForm(false);
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-heading text-3xl font-black text-white flex items-center gap-3">
            <Package className="w-8 h-8 text-zen-500" />
            Gestion des Stocks
          </h1>
          <p className="text-white/40 mt-1 font-medium">
            Suivi quotidien et ajustements rapides
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className="flex items-center gap-2 text-sm font-bold text-white bg-zen-500 hover:bg-zen-500/80 rounded-xl px-4 py-3 transition-all min-h-[44px]"
          >
            <Plus className="w-4 h-4" /> Ajouter un composant
          </button>
          <button
            onClick={resetDailyUsage}
            className="flex items-center gap-2 text-sm font-bold text-white/50 hover:text-white bg-white/5 border border-white/8 hover:bg-white/10 rounded-xl px-4 py-3 transition-all min-h-[44px]"
          >
            Clôturer la journée
          </button>
        </div>
      </div>

      <AnimatePresence>
        {showAddForm && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <div className="bg-zen-800 border border-white/10 rounded-2xl p-6 mb-6">
              <h2 className="text-lg font-bold text-white mb-4">Nouveau composant (Ingrédient)</h2>
              <div className="flex flex-col sm:flex-row gap-3">
                <input
                  type="text"
                  placeholder="Nom (ex: Café grain, Farine...)"
                  value={newItemName}
                  onChange={(e) => setNewItemName(e.target.value)}
                  className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-white/30 focus:outline-none focus:ring-2 focus:ring-zen-500/50 min-h-[44px]"
                />
                <input
                  type="text"
                  placeholder="Unité (ex: kg, g, L, unités)"
                  value={newItemUnit}
                  onChange={(e) => setNewItemUnit(e.target.value)}
                  className="w-full sm:w-48 bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-white/30 focus:outline-none focus:ring-2 focus:ring-zen-500/50 min-h-[44px]"
                />
                <button
                  onClick={handleAddNewItem}
                  className="flex items-center justify-center gap-2 bg-zen-500 text-white px-6 py-3 rounded-xl font-bold hover:bg-zen-500/80 transition-all min-h-[44px]"
                >
                  <Plus className="w-5 h-5" /> Créer
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/30" />
        <input
          type="text"
          placeholder="Rechercher un ingrédient..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full bg-zen-800 border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-white placeholder:text-white/30 focus:outline-none focus:ring-2 focus:ring-zen-500/50 transition-all text-lg"
        />
      </div>

      {/* Grid view for mobile, Table for desktop */}
      <div className="grid grid-cols-1 gap-4">
        {filteredItems.map((item) => {
          const remaining = item.initialStock - item.usedToday;
          const percentage = item.initialStock > 0 ? (remaining / item.initialStock) * 100 : 0;
          
          let statusColor = "text-emerald-400";
          let statusBg = "bg-emerald-500/10";
          let statusBorder = "border-emerald-500/20";
          
          if (percentage < 20) {
            statusColor = "text-red-400";
            statusBg = "bg-red-500/10";
            statusBorder = "border-red-500/20";
          } else if (percentage < 50) {
            statusColor = "text-amber-400";
            statusBg = "bg-amber-500/10";
            statusBorder = "border-amber-500/20";
          }

          return (
            <motion.div
              key={item.id}
              layout
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-zen-800 border border-white/6 rounded-2xl p-5 flex flex-col lg:flex-row lg:items-center justify-between gap-6"
            >
              {/* Info section */}
              <div className="flex-1">
                <div className="flex items-start justify-between mb-2">
                  <h3 className="text-xl font-bold text-white">{item.name}</h3>
                  <div className={cn("px-2.5 py-1 rounded-lg border text-xs font-bold flex items-center gap-1.5", statusBg, statusColor, statusBorder)}>
                    {percentage < 20 ? <AlertCircle className="w-3.5 h-3.5" /> : <CheckCircle2 className="w-3.5 h-3.5" />}
                    {Math.round(percentage)}%
                  </div>
                </div>
                
                <div className="grid grid-cols-3 gap-4 mt-4 bg-black/20 rounded-xl p-3 border border-white/5">
                  <div>
                    <p className="text-[11px] font-bold text-white/30 uppercase tracking-wider mb-1">Initial</p>
                    <p className="text-lg font-bold text-white/60">{item.initialStock} <span className="text-sm font-normal">{item.unit}</span></p>
                  </div>
                  <div>
                    <p className="text-[11px] font-bold text-white/30 uppercase tracking-wider mb-1">Utilisé</p>
                    <p className="text-lg font-bold text-zen-500">{item.usedToday} <span className="text-sm font-normal">{item.unit}</span></p>
                  </div>
                  <div>
                    <p className="text-[11px] font-bold text-white/30 uppercase tracking-wider mb-1">Restant</p>
                    <p className={cn("text-xl font-black", statusColor)}>{remaining} <span className="text-sm font-bold">{item.unit}</span></p>
                  </div>
                </div>
              </div>

              {/* Actions section */}
              <div className="flex flex-col sm:flex-row items-center gap-3 shrink-0">
                {/* Custom Input */}
                <div className="flex items-center bg-white/5 border border-white/5 rounded-xl p-1">
                  <input
                    type="number"
                    min="0"
                    step="0.1"
                    placeholder="Qté"
                    value={customAmounts[item.id] || ""}
                    onChange={(e) => setCustomAmounts(prev => ({ ...prev, [item.id]: e.target.value }))}
                    className="w-20 bg-transparent text-white text-center font-bold px-2 py-3 focus:outline-none"
                  />
                  <div className="w-px h-8 bg-white/10 mx-1" />
                  <button
                    onClick={() => handleCustomAdjust(item.id, "add")}
                    className="w-12 h-12 rounded-lg bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 transition-all flex items-center justify-center active:scale-95"
                  >
                    <Plus className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => handleCustomAdjust(item.id, "deduct")}
                    className="w-12 h-12 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-all flex items-center justify-center active:scale-95 ml-1"
                  >
                    <Minus className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </motion.div>
          );
        })}

        {filteredItems.length === 0 && (
          <div className="col-span-full py-12 text-center border-2 border-dashed border-white/10 rounded-3xl">
            <Package className="w-12 h-12 text-white/20 mx-auto mb-4" />
            <p className="text-lg font-bold text-white/60">Aucun ingrédient trouvé</p>
            <p className="text-white/30">Essayez de modifier votre recherche ou ajoutez un nouveau composant</p>
          </div>
        )}
      </div>
    </div>
  );
}
