"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Clock, 
  CheckCircle2, 
  XCircle, 
  ChefHat, 
  Utensils, 
  Banknote,
  CreditCard,
  MessageSquare,
  Timer
} from "lucide-react";
import { useOrderStore } from "@/lib/useOrderStore";
import { formatPrice } from "@/lib/menuData";
import { cn } from "@/lib/utils";

// Helper to format elapsed time
const useElapsedTime = (createdAt: string) => {
  const [elapsed, setElapsed] = useState("");

  useEffect(() => {
    const updateTime = () => {
      const diffMs = Date.now() - new Date(createdAt).getTime();
      const diffMins = Math.floor(diffMs / 60000);
      if (diffMins < 1) setElapsed("À l'instant");
      else if (diffMins === 1) setElapsed("1 min");
      else setElapsed(`${diffMins} min`);
    };
    updateTime();
    const interval = setInterval(updateTime, 10000); // Update every 10s
    return () => clearInterval(interval);
  }, [createdAt]);

  return elapsed;
};

export default function ReceptionPOSPage() {
  const { orders, updateOrder } = useOrderStore();
  const [filter, setFilter] = useState<"all" | "new" | "cooking" | "ready">("new");

  // Filter orders
  // We only show new, cooking, ready in the POS (hide delivered/rejected)
  const visibleOrders = orders.filter((o) => {
    if (o.status === "delivered" || o.status === "rejected") return false;
    if (filter === "all") return true;
    return o.status === filter;
  }).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()); // newest first

  const counts = {
    all: orders.filter(o => !["delivered", "rejected"].includes(o.status)).length,
    new: orders.filter(o => o.status === "new").length,
    cooking: orders.filter(o => o.status === "cooking").length,
    ready: orders.filter(o => o.status === "ready").length,
  };

  return (
    <main className="min-h-screen bg-zen-50 text-zen-900 font-sans flex flex-col">
      {/* Header */}
      <header className="bg-white border-b border-zen-200 px-6 py-4 flex items-center justify-between shrink-0 sticky top-0 z-20">
        <div>
          <h1 className="font-heading font-black text-2xl text-zen-900">Réception & Caisse</h1>
          <p className="text-sm font-bold text-zen-500">Gestion des commandes en direct</p>
        </div>

        {/* Filters */}
        <div className="flex bg-zen-50 border border-zen-200 p-1 rounded-xl">
          <FilterTab 
            label="Toutes" count={counts.all} 
            active={filter === "all"} onClick={() => setFilter("all")} 
            color="text-zen-900" bg="bg-white" 
          />
          <FilterTab 
            label="En attente" count={counts.new} 
            active={filter === "new"} onClick={() => setFilter("new")} 
            color="text-orange-600" bg="bg-orange-500/10" 
            pulse={counts.new > 0}
          />
          <FilterTab 
            label="En préparation" count={counts.cooking} 
            active={filter === "cooking"} onClick={() => setFilter("cooking")} 
            color="text-blue-600" bg="bg-blue-500/10" 
          />
          <FilterTab 
            label="Prêtes" count={counts.ready} 
            active={filter === "ready"} onClick={() => setFilter("ready")} 
            color="text-emerald-600" bg="bg-emerald-500/10" 
          />
        </div>
      </header>

      {/* Grid view */}
      <div className="flex-1 p-6 overflow-y-auto">
        {visibleOrders.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-zen-900/40 space-y-4">
            <Utensils className="w-16 h-16 stroke-[1.5]" />
            <h2 className="text-xl font-bold font-heading">Aucune commande {filter !== 'all' && 'dans cette catégorie'}</h2>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            <AnimatePresence mode="popLayout">
              {visibleOrders.map((order) => (
                <OrderCard key={order.id} order={order} updateOrder={updateOrder} />
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>
    </main>
  );
}

function FilterTab({ label, count, active, onClick, color, bg, pulse }: any) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition-all relative",
        active ? `shadow-sm border border-zen-200/50 ${bg} ${color}` : "text-zen-900/60 hover:text-zen-900 hover:bg-white/50"
      )}
    >
      {pulse && !active && (
        <span className="absolute top-2 right-2 w-2 h-2 bg-orange-500 rounded-full animate-ping" />
      )}
      {label}
      <span className={cn(
        "px-2 py-0.5 rounded-md text-xs",
        active ? "bg-white/50" : "bg-zen-900/5"
      )}>
        {count}
      </span>
    </button>
  );
}

function OrderCard({ order, updateOrder }: any) {
  const elapsed = useElapsedTime(order.createdAt);
  const [acceptMode, setAcceptMode] = useState(false);
  const [estimatedTime, setEstimatedTime] = useState("10 min");

  const isNew = order.status === "new";
  const isCooking = order.status === "cooking";
  const isReady = order.status === "ready";

  const statusColor = isNew ? "border-orange-500 bg-orange-50" : 
                      isCooking ? "border-blue-500 bg-blue-50" : 
                      "border-emerald-500 bg-emerald-50";

  const headerColor = isNew ? "bg-orange-500 text-white" : 
                      isCooking ? "bg-blue-500 text-white" : 
                      "bg-emerald-500 text-white";

  const handleAccept = () => {
    updateOrder(order.id, { status: "cooking", estimatedTime });
    setAcceptMode(false);
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.95, y: 20 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ type: "spring", stiffness: 300, damping: 25 }}
      className={cn(
        "rounded-2xl border-2 flex flex-col overflow-hidden bg-white shadow-sm transition-all",
        statusColor,
        isNew && "shadow-[0_0_15px_rgba(249,115,22,0.2)] animate-in"
      )}
    >
      {/* Header */}
      <div className={cn("px-4 py-3 flex items-center justify-between", headerColor)}>
        <div className="flex items-center gap-3">
          <span className="font-black text-lg">{order.id}</span>
          <span className="bg-white/20 px-2 py-0.5 rounded-md text-sm font-bold">Table {order.tableId}</span>
        </div>
        <div className="flex items-center gap-1.5 text-sm font-bold bg-black/10 px-2 py-1 rounded-lg">
          <Clock className="w-4 h-4" />
          {elapsed}
        </div>
      </div>

      {/* Body */}
      <div className="p-4 flex-1 flex flex-col">
        {/* Items List */}
        <div className="space-y-3 flex-1 mb-4">
          {order.items.map((item: any) => (
            <div key={item.id} className="flex gap-3">
              <div className="w-8 h-8 rounded-lg bg-zen-50 flex items-center justify-center shrink-0 border border-zen-200">
                <span className="font-bold text-zen-500 text-sm">{item.quantity}x</span>
              </div>
              <div className="flex-1">
                <p className="font-bold text-zen-900 text-sm leading-tight">{item.menuItem.name}</p>
                
                {/* Options */}
                {Object.keys(item.options).length > 0 && (
                  <p className="text-xs text-zen-900/60 font-medium mt-0.5">
                    {Object.entries(item.options).map(([k, v]) => `${v}`).join(", ")}
                  </p>
                )}
                
                {/* Item Comment */}
                {item.comment && (
                  <div className="flex items-start gap-1 mt-1 text-orange-600 bg-orange-500/10 px-2 py-1 rounded border border-orange-500/20">
                    <MessageSquare className="w-3 h-3 mt-0.5 shrink-0" />
                    <span className="text-xs font-bold leading-tight">"{item.comment}"</span>
                  </div>
                )}
              </div>
              <div className="font-bold text-zen-900 text-sm text-right shrink-0">
                {formatPrice(item.totalPrice)}
              </div>
            </div>
          ))}
        </div>

        {/* Global Comment */}
        {order.globalComment && (
          <div className="mb-4 bg-yellow-50 border border-yellow-200 p-3 rounded-xl flex items-start gap-2 text-yellow-800">
            <MessageSquare className="w-4 h-4 mt-0.5 shrink-0" />
            <div className="text-sm">
              <span className="font-bold uppercase text-[10px] block mb-0.5 opacity-70">Note globale</span>
              <p className="font-semibold">"{order.globalComment}"</p>
            </div>
          </div>
        )}

        {/* Footer Summary */}
        <div className="flex items-center justify-between border-t border-zen-200 pt-4 mb-4">
          <div className="flex items-center gap-1.5 text-xs font-bold text-zen-900/60 uppercase">
            {order.paymentMethod === "cash" ? <Banknote className="w-4 h-4 text-emerald-500" /> : <CreditCard className="w-4 h-4 text-blue-500" />}
            {order.paymentMethod === "cash" ? "Espèces" : "Carte"}
          </div>
          <div className="text-right">
            <span className="text-xs font-bold text-zen-900/50 uppercase mr-2">Total</span>
            <span className="font-heading font-black text-xl text-zen-900">{formatPrice(order.total)}</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="mt-auto">
          {isNew && !acceptMode && (
            <div className="grid grid-cols-2 gap-3">
              <button 
                onClick={() => updateOrder(order.id, { status: "rejected" })}
                className="flex items-center justify-center gap-2 h-12 rounded-xl font-bold text-red-600 bg-red-50 hover:bg-red-100 border border-red-200 transition-colors"
              >
                <XCircle className="w-5 h-5" /> Refuser
              </button>
              <button 
                onClick={() => setAcceptMode(true)}
                className="flex items-center justify-center gap-2 h-12 rounded-xl font-bold text-white bg-orange-500 hover:bg-orange-600 shadow-md shadow-orange-500/20 transition-all active:scale-95"
              >
                <CheckCircle2 className="w-5 h-5" /> Accepter
              </button>
            </div>
          )}

          {isNew && acceptMode && (
            <motion.div 
              initial={{ opacity: 0, height: 0 }} 
              animate={{ opacity: 1, height: "auto" }} 
              className="bg-orange-50 p-3 rounded-xl border border-orange-200 space-y-3"
            >
              <div className="flex items-center gap-2 text-sm font-bold text-orange-800">
                <Timer className="w-4 h-4" /> Temps de préparation estimé :
              </div>
              <div className="flex gap-2">
                {["5 min", "10 min", "15 min", "20 min"].map(t => (
                  <button 
                    key={t}
                    onClick={() => setEstimatedTime(t)}
                    className={cn(
                      "flex-1 py-1.5 rounded-lg text-xs font-bold border transition-colors",
                      estimatedTime === t ? "bg-orange-500 text-white border-orange-500" : "bg-white text-orange-800 border-orange-200 hover:bg-orange-100"
                    )}
                  >
                    {t}
                  </button>
                ))}
              </div>
              <div className="flex gap-2 pt-1">
                <button 
                  onClick={() => setAcceptMode(false)}
                  className="flex-1 py-2 text-xs font-bold text-orange-600/70 hover:text-orange-600"
                >
                  Annuler
                </button>
                <button 
                  onClick={handleAccept}
                  className="flex-[2] py-2 bg-orange-500 text-white rounded-lg text-sm font-bold shadow-sm"
                >
                  Valider l'envoi en cuisine
                </button>
              </div>
            </motion.div>
          )}

          {isCooking && (
            <div className="flex items-center justify-between">
              <div className="text-sm font-bold text-blue-600 flex items-center gap-1.5 bg-blue-100 px-3 py-1.5 rounded-lg">
                <ChefHat className="w-4 h-4" /> Préparation: {order.estimatedTime || "N/A"}
              </div>
              <button 
                onClick={() => updateOrder(order.id, { status: "ready" })}
                className="flex items-center justify-center gap-2 px-6 h-12 rounded-xl font-bold text-white bg-blue-500 hover:bg-blue-600 shadow-md shadow-blue-500/20 transition-all active:scale-95"
              >
                <CheckCircle2 className="w-5 h-5" /> Marquer Prête
              </button>
            </div>
          )}

          {isReady && (
            <div className="grid grid-cols-1">
              <button 
                onClick={() => updateOrder(order.id, { status: "delivered" })}
                className="flex items-center justify-center gap-2 h-12 rounded-xl font-bold text-white bg-emerald-500 hover:bg-emerald-600 shadow-md shadow-emerald-500/20 transition-all active:scale-95"
              >
                <Utensils className="w-5 h-5" /> Commande Servie
              </button>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}
