"use client";

import React, { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  UtensilsCrossed, Clock, Filter, LayoutGrid, Calendar as CalendarIcon, 
  List, Search, ChevronLeft, ChevronRight, Eye, Printer, User, 
  CreditCard, Banknote, X, MessageSquare, Receipt, CheckCircle, ChefHat, Zap
} from "lucide-react";
import { useOrderStore } from "@/lib/useOrderStore";
import { formatPrice } from "@/lib/menuData";
import { PlacedOrder } from "@/lib/useCartStore";
import { cn } from "@/lib/utils";

// --- Types & Constants ---
type ViewMode = "table" | "kanban" | "calendar";

const STATUS_CONFIG: Record<string, { label: string; bg: string; text: string; border: string; kanban: string }> = {
  new:       { label: "En attente",     bg: "bg-amber-500/10 dark:bg-amber-500/20",  text: "text-amber-700 dark:text-amber-300",  border: "border-amber-500/30 dark:border-amber-500/40",  kanban: "border-t-amber-500" },
  confirmed: { label: "Confirmée",      bg: "bg-yellow-500/10 dark:bg-yellow-500/20", text: "text-yellow-700 dark:text-yellow-300", border: "border-yellow-500/30 dark:border-yellow-500/40", kanban: "border-t-yellow-500" },
  cooking:   { label: "En préparation", bg: "bg-blue-500/10 dark:bg-blue-500/20",   text: "text-blue-700 dark:text-blue-300",    border: "border-blue-500/30 dark:border-blue-500/40",   kanban: "border-t-blue-500"   },
  ready:     { label: "Prête",          bg: "bg-emerald-500/10 dark:bg-emerald-500/20",text: "text-emerald-700 dark:text-emerald-300",border: "border-emerald-500/30 dark:border-emerald-500/40",kanban: "border-t-emerald-500"},
  delivered: { label: "Encaissée",      bg: "bg-zinc-200 dark:bg-zinc-700/40",   text: "text-zinc-800 dark:text-zinc-300",   border: "border-zinc-300 dark:border-zinc-600",      kanban: "border-t-zinc-500"   },
  rejected:  { label: "Annulée",        bg: "bg-red-500/10 dark:bg-red-500/20",    text: "text-red-700 dark:text-red-300",    border: "border-red-500/30 dark:border-red-500/40",    kanban: "border-t-red-500"    },
};

const KANBAN_COLUMNS = ["new", "confirmed", "cooking", "ready", "delivered", "rejected"];

// --- Mock historical data for Calendar ---
const generateMockHistory = (): PlacedOrder[] => {
  const pastOrders: PlacedOrder[] = [];
  const now = new Date();
  for (let i = 1; i <= 30; i++) {
    const d = new Date(now);
    d.setDate(d.getDate() - i);
    const numOrders = Math.floor(Math.random() * 5);
    for (let j = 0; j < numOrders; j++) {
      pastOrders.push({
        id: `CMD-P${i}-${j}`,
        tableId: `${Math.floor(Math.random() * 20) + 1}`,
        items: [],
        total: Math.floor(Math.random() * 50) + 10,
        paymentMethod: Math.random() > 0.5 ? "cash" : "card",
        globalComment: "",
        status: "delivered",
        createdAt: d.toISOString(),
      });
    }
  }
  return pastOrders;
};

const PAST_ORDERS = generateMockHistory();

export default function OrdersPage() {
  const { orders, updateOrder } = useOrderStore();
  const allOrders = useMemo(() => {
    return [...orders, ...PAST_ORDERS].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }, [orders]);

  const [viewMode, setViewMode] = useState<ViewMode>("table");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [selectedOrder, setSelectedOrder] = useState<PlacedOrder | null>(null);
  const [receiptOrder, setReceiptOrder] = useState<PlacedOrder | null>(null);

  const filteredOrders = useMemo(() => {
    return allOrders.filter(o => {
      const matchSearch = o.id.toLowerCase().includes(search.toLowerCase()) || o.tableId.includes(search);
      const matchStatus = statusFilter === "all" || o.status === statusFilter;
      return matchSearch && matchStatus;
    });
  }, [allOrders, search, statusFilter]);

  return (
    <div className="space-y-6 h-full flex flex-col">
      {/* Header & Controls */}
      <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4 shrink-0">
        <h1 className="font-heading text-3xl font-black text-zinc-900 dark:text-white flex items-center gap-3">
          <UtensilsCrossed className="w-8 h-8 text-zinc-900 dark:text-white" />
          Historique des Commandes
        </h1>

        <div className="flex flex-wrap items-center gap-3">
          {/* Search */}
          <div className="relative">
            <Search className="w-4 h-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input 
              type="text"
              placeholder="Rechercher N° ou Table..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="bg-white dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 rounded-xl pl-10 pr-4 py-2.5 text-sm font-bold text-zinc-900 dark:text-white placeholder:text-zinc-400 dark:placeholder:text-zinc-500 focus:outline-none focus:border-zinc-900 dark:focus:border-white transition-all w-48 lg:w-64 shadow-sm"
            />
          </div>

          {/* Status Filter */}
          <select 
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-white dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 rounded-xl px-4 py-2.5 text-sm font-bold text-zinc-900 dark:text-white focus:outline-none focus:border-zinc-900 dark:focus:border-white transition-all cursor-pointer shadow-sm"
          >
            <option value="all">Tous les statuts</option>
            {Object.entries(STATUS_CONFIG).map(([k, v]) => (
              <option key={k} value={k}>{v.label}</option>
            ))}
          </select>

          {/* View Toggles */}
          <div className="flex items-center bg-zinc-100 dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 rounded-xl p-1 gap-1 shadow-sm">
            <ViewToggle icon={List} label="Tableau" active={viewMode === "table"} onClick={() => setViewMode("table")} />
            <ViewToggle icon={LayoutGrid} label="Kanban" active={viewMode === "kanban"} onClick={() => setViewMode("kanban")} />
            <ViewToggle icon={CalendarIcon} label="Calendrier" active={viewMode === "calendar"} onClick={() => setViewMode("calendar")} />
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 min-h-0 bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-2xl overflow-hidden relative shadow-xl">
        <AnimatePresence mode="wait">
          {viewMode === "table" && (
            <TableView key="table" orders={filteredOrders} onViewDetail={setSelectedOrder} onPrint={setReceiptOrder} updateOrder={updateOrder} />
          )}
          {viewMode === "kanban" && (
            <KanbanView key="kanban" orders={filteredOrders} onViewDetail={setSelectedOrder} updateOrder={updateOrder} />
          )}
          {viewMode === "calendar" && (
            <CalendarView key="calendar" orders={allOrders} />
          )}
        </AnimatePresence>
      </div>

      {/* Modals */}
      <AnimatePresence>
        {selectedOrder && <OrderDetailModal order={selectedOrder} onClose={() => setSelectedOrder(null)} updateOrder={updateOrder} />}
        {receiptOrder && <ReceiptModal order={receiptOrder} onClose={() => setReceiptOrder(null)} />}
      </AnimatePresence>
    </div>
  );
}

// --- View Components ---

function ViewToggle({ icon: Icon, label, active, onClick }: { icon: any, label: string, active: boolean, onClick: () => void }) {
  return (
    <button 
      onClick={onClick}
      title={label}
      className={cn(
        "p-2.5 rounded-lg transition-all flex items-center gap-2 text-xs font-black",
        active 
          ? "bg-black text-white dark:bg-white dark:text-black shadow-md" 
          : "text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-200 dark:hover:bg-zinc-800"
      )}
    >
      <Icon className="w-4 h-4" />
      <span className="hidden sm:inline">{label}</span>
    </button>
  );
}

function QuickActionButtons({ order, updateOrder, onClose }: { order: PlacedOrder, updateOrder: any, onClose?: () => void }) {
  const isDone = order.status === "delivered" || order.status === "rejected";
  
  if (isDone) return null;

  const handleAction = (newStatus: string) => {
    updateOrder(order.id, { status: newStatus as any });
    if (onClose) onClose();
  };

  if (["new", "confirmed"].includes(order.status)) {
    return (
      <button
        onClick={(e) => { e.stopPropagation(); handleAction("cooking"); }}
        className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2.5 rounded-xl font-black hover:bg-blue-500 transition-all text-xs whitespace-nowrap shadow-md"
      >
        <ChefHat className="w-4 h-4" /> En préparation
      </button>
    );
  }
  if (order.status === "cooking") {
    return (
      <button
        onClick={(e) => { e.stopPropagation(); handleAction("ready"); }}
        className="flex items-center gap-2 bg-emerald-600 text-white px-4 py-2.5 rounded-xl font-black hover:bg-emerald-500 transition-all text-xs whitespace-nowrap shadow-md"
      >
        <CheckCircle className="w-4 h-4" /> Prête
      </button>
    );
  }
  if (order.status === "ready") {
    return (
      <button
        onClick={(e) => { e.stopPropagation(); handleAction("delivered"); }}
        className="flex items-center gap-2 bg-black text-white dark:bg-white dark:text-black px-5 py-2.5 rounded-xl font-black hover:opacity-90 transition-all text-sm whitespace-nowrap shadow-xl"
      >
        <Zap className="w-4 h-4" /> Encaisser
      </button>
    );
  }
  return null;
}

function TableView({ orders, onViewDetail, onPrint, updateOrder }: { orders: PlacedOrder[], onViewDetail: (o: PlacedOrder) => void, onPrint: (o: PlacedOrder) => void, updateOrder: any }) {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
      className="w-full h-full overflow-auto"
    >
      <table className="w-full text-left border-collapse">
        <thead className="bg-zinc-100 dark:bg-zinc-900 sticky top-0 z-10 border-b border-zinc-300 dark:border-zinc-700 text-xs font-black text-zinc-700 dark:text-zinc-300 uppercase tracking-wider">
          <tr>
            <th className="px-6 py-4">N° Commande</th>
            <th className="px-6 py-4">Date & Heure</th>
            <th className="px-6 py-4">Table</th>
            <th className="px-6 py-4">Statut</th>
            <th className="px-6 py-4">Mode de Paiement</th>
            <th className="px-6 py-4 text-right">Total</th>
            <th className="px-6 py-4 text-center">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800/80">
          {orders.map((o) => (
            <tr key={o.id} className="hover:bg-zinc-50 dark:hover:bg-zinc-900/90 transition-colors group cursor-pointer" onClick={() => onViewDetail(o)}>
              <td className="px-6 py-4 font-black text-zinc-900 dark:text-white text-base">{o.id}</td>
              <td className="px-6 py-4 text-sm font-bold text-zinc-700 dark:text-zinc-200">
                {new Date(o.createdAt).toLocaleString("fr-FR", { dateStyle: "short", timeStyle: "short" })}
              </td>
              <td className="px-6 py-4">
                <span className="bg-zinc-200 dark:bg-zinc-800 text-zinc-900 dark:text-white px-3 py-1.5 rounded-lg text-xs font-extrabold border border-zinc-300 dark:border-zinc-700">T-{o.tableId}</span>
              </td>
              <td className="px-6 py-4">
                <StatusBadge status={o.status} />
              </td>
              <td className="px-6 py-4">
                {o.paymentMethod === "cash" ? (
                  <span className="inline-flex items-center gap-1.5 text-xs font-extrabold text-emerald-800 dark:text-emerald-300 bg-emerald-100 dark:bg-emerald-950/60 border border-emerald-300 dark:border-emerald-700/50 px-2.5 py-1 rounded-lg">
                    <Banknote className="w-3.5 h-3.5" /> Espèces
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1.5 text-xs font-extrabold text-blue-800 dark:text-blue-300 bg-blue-100 dark:bg-blue-950/60 border border-blue-300 dark:border-blue-700/50 px-2.5 py-1 rounded-lg">
                    <CreditCard className="w-3.5 h-3.5" /> Carte
                  </span>
                )}
              </td>
              <td className="px-6 py-4 text-right font-black text-zinc-900 dark:text-white text-lg">{formatPrice(o.total)}</td>
              <td className="px-6 py-4">
                <div className="flex items-center justify-center gap-2" onClick={(e) => e.stopPropagation()}>
                  <QuickActionButtons order={o} updateOrder={updateOrder} />
                  <button 
                    onClick={() => onViewDetail(o)} 
                    className="p-2.5 bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-900 dark:text-white rounded-xl transition-all border border-zinc-300 dark:border-zinc-700 font-bold text-xs flex items-center gap-1" 
                    title="Voir détails"
                  >
                    <Eye className="w-4 h-4" />
                  </button>
                  <button 
                    onClick={() => onPrint(o)} 
                    className="p-2.5 bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-900 dark:text-white rounded-xl transition-all border border-zinc-300 dark:border-zinc-700 font-bold text-xs" 
                    title="Imprimer Ticket"
                  >
                    <Printer className="w-4 h-4" />
                  </button>
                </div>
              </td>
            </tr>
          ))}
          {orders.length === 0 && (
            <tr>
              <td colSpan={7} className="px-6 py-16 text-center text-zinc-500 dark:text-zinc-400 text-base font-bold">Aucune commande trouvée.</td>
            </tr>
          )}
        </tbody>
      </table>
    </motion.div>
  );
}

function KanbanView({ orders, onViewDetail, updateOrder }: any) {
  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.98 }}
      className="h-full flex overflow-x-auto p-4 gap-4 scrollbar-thin"
    >
      {KANBAN_COLUMNS.map((colStatus) => {
        const colOrders = orders.filter((o: any) => o.status === colStatus);
        const config = STATUS_CONFIG[colStatus];
        return (
          <div key={colStatus} className="flex-shrink-0 w-80 bg-zinc-100 dark:bg-zinc-900 rounded-2xl flex flex-col border border-zinc-300 dark:border-zinc-800 overflow-hidden">
            <div className={cn("px-4 py-3.5 border-b border-zinc-200 dark:border-zinc-800 border-t-4 flex justify-between items-center bg-white dark:bg-zinc-950", config.kanban)}>
              <span className="font-black text-zinc-900 dark:text-white text-sm uppercase tracking-wider">{config.label}</span>
              <span className="bg-zinc-200 dark:bg-zinc-800 text-zinc-900 dark:text-white px-2.5 py-1 rounded-lg text-xs font-black border border-zinc-300 dark:border-zinc-700">{colOrders.length}</span>
            </div>
            <div className="flex-1 p-3 space-y-3 overflow-y-auto scrollbar-thin">
              {colOrders.map((o: any) => (
                <div key={o.id} className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl p-4 cursor-pointer hover:border-zinc-400 dark:hover:border-zinc-500 transition-all hover:shadow-xl group space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-black text-zinc-900 dark:text-white">{o.id}</span>
                    <span className="text-xs font-bold text-zinc-500 dark:text-zinc-400">{new Date(o.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                  </div>
                  <div className="font-extrabold text-zinc-900 dark:text-white text-base">Table {o.tableId}</div>
                  <div className="text-xs text-zinc-600 dark:text-zinc-300 line-clamp-2 font-semibold">
                    {o.items?.map((i: any) => `${i.quantity}x ${i.menuItem?.name || "Article"}`).join(", ") || "Commande enregistrée"}
                  </div>
                  <div className="flex justify-between items-center pt-2 border-t border-zinc-100 dark:border-zinc-800 gap-2">
                    <span className="text-sm font-black text-zinc-900 dark:text-white">{formatPrice(o.total)}</span>
                    <div className="flex items-center gap-1.5">
                      <QuickActionButtons order={o} updateOrder={updateOrder} />
                      <button onClick={() => onViewDetail(o)} className="text-xs font-bold bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 px-3 py-1.5 rounded-lg text-zinc-900 dark:text-white transition-colors border border-zinc-300 dark:border-zinc-700">
                        Voir
                      </button>
                    </div>
                  </div>
                </div>
              ))}
              {colOrders.length === 0 && (
                <p className="text-center py-8 text-xs font-bold text-zinc-400">Aucune commande</p>
              )}
            </div>
          </div>
        );
      })}
    </motion.div>
  );
}

function CalendarView({ orders }: { orders: PlacedOrder[] }) {
  const days = Array.from({ length: 35 }, (_, i) => i + 1);
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="p-6 h-full flex flex-col">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-black text-zinc-900 dark:text-white">Juillet 2026</h2>
        <div className="flex gap-2">
          <button className="p-2 bg-white dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 rounded-xl hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-900 dark:text-white"><ChevronLeft className="w-5 h-5" /></button>
          <button className="p-2 bg-white dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 rounded-xl hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-900 dark:text-white"><ChevronRight className="w-5 h-5" /></button>
        </div>
      </div>
      <div className="grid grid-cols-7 gap-2 flex-1">
        {["Lun", "Mar", "Mer", "Jeu", "Ven", "Sam", "Dim"].map(d => (
          <div key={d} className="text-center text-xs font-black text-zinc-500 dark:text-zinc-400 uppercase mb-2">{d}</div>
        ))}
        {days.map(d => {
          const dayOrders = Math.floor(Math.random() * 8);
          const revenue = dayOrders * 25;
          const isToday = d === 29;
          return (
            <div key={d} className={cn(
              "border rounded-xl p-3 flex flex-col transition-colors hover:bg-zinc-100 dark:hover:bg-zinc-900 cursor-pointer",
              isToday ? "border-black dark:border-white bg-zinc-100 dark:bg-zinc-900" : "border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950"
            )}>
              <span className={cn("text-xs font-black mb-auto", isToday ? "text-black dark:text-white underline" : "text-zinc-700 dark:text-zinc-300")}>{d}</span>
              {dayOrders > 0 && (
                <div className="mt-2 space-y-1">
                  <div className="text-xs bg-zinc-200 dark:bg-zinc-800 text-zinc-900 dark:text-white font-bold px-2 py-0.5 rounded border border-zinc-300 dark:border-zinc-700">{dayOrders} cmds</div>
                  <div className="text-xs text-zinc-900 dark:text-white font-black">{revenue} TND</div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </motion.div>
  );
}

// --- Shared Components & Modals ---

function StatusBadge({ status }: { status: string }) {
  const conf = STATUS_CONFIG[status] || STATUS_CONFIG.new;
  return (
    <span className={cn("text-xs font-black px-2.5 py-1 rounded-lg border uppercase tracking-wider", conf.bg, conf.text, conf.border)}>
      {conf.label}
    </span>
  );
}

function OrderDetailModal({ order, onClose, updateOrder }: { order: PlacedOrder, onClose: () => void, updateOrder: (id: string, updates: Partial<PlacedOrder>) => void }) {
  const handleStatusChange = (newStatus: string) => {
    updateOrder(order.id, { status: newStatus as any });
    onClose();
  };

  const isDone = order.status === "delivered" || order.status === "rejected";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4 bg-black/60 dark:bg-black/80 backdrop-blur-md">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="w-full max-w-lg bg-white dark:bg-zinc-950 border border-zinc-300 dark:border-zinc-700 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
      >
        {/* Header */}
        <div className="px-6 py-5 border-b border-zinc-200 dark:border-zinc-800 flex justify-between items-center bg-zinc-100 dark:bg-zinc-900">
          <div className="flex items-center gap-3">
            <h2 className="text-2xl font-black text-zinc-900 dark:text-white">{order.id}</h2>
            <span className="bg-zinc-200 dark:bg-zinc-800 text-zinc-900 dark:text-white border border-zinc-300 dark:border-zinc-700 px-2.5 py-1 rounded text-xs font-black">Table {order.tableId}</span>
            <StatusBadge status={order.status} />
          </div>
          <button onClick={onClose} className="p-2 bg-zinc-200 dark:bg-zinc-800 hover:bg-zinc-300 dark:hover:bg-zinc-700 rounded-full transition-colors text-zinc-900 dark:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Items */}
        <div className="p-6 overflow-y-auto space-y-3 flex-1">
          {order.items?.map((item: any, i: number) => (
            <div key={i} className="flex gap-4 p-4 bg-zinc-50 dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 items-center">
              <div className="w-10 h-10 bg-zinc-200 dark:bg-zinc-800 rounded-xl flex items-center justify-center font-black text-zinc-900 dark:text-white shrink-0 border border-zinc-300 dark:border-zinc-700 text-base">
                {item.quantity}x
              </div>
              <div className="flex-1">
                <p className="font-extrabold text-zinc-900 dark:text-white text-base">{item.menuItem?.name || "Article"}</p>
                {item.options && Object.keys(item.options).length > 0 && (
                  <p className="text-xs text-zinc-600 dark:text-zinc-300 font-bold mt-0.5">{Object.entries(item.options).map(([k, v]) => `${v}`).join(", ")}</p>
                )}
                {item.comment && (
                  <div className="flex items-center gap-1.5 mt-1.5 text-xs font-bold text-amber-800 dark:text-amber-300 bg-amber-100 dark:bg-amber-950/60 border border-amber-300 dark:border-amber-700/50 px-2.5 py-1 rounded-lg inline-flex">
                    <MessageSquare className="w-3.5 h-3.5" /> {item.comment}
                  </div>
                )}
              </div>
              <div className="font-black text-zinc-900 dark:text-white text-right shrink-0 text-base">
                {formatPrice(item.totalPrice || 0)}
              </div>
            </div>
          ))}
          {!order.items?.length && <p className="text-zinc-500 dark:text-zinc-400 text-sm font-semibold text-center py-6">Détail des articles non disponible.</p>}

          {/* Payment info */}
          <div className="flex items-center justify-between pt-3 border-t border-zinc-200 dark:border-zinc-800">
            {order.paymentMethod === "cash" ? (
              <span className="flex items-center gap-2 text-xs font-black text-emerald-800 dark:text-emerald-300 bg-emerald-100 dark:bg-emerald-950/60 px-3 py-1.5 rounded-lg border border-emerald-300 dark:border-emerald-700/50">
                <Banknote className="w-4 h-4" /> Espèces
              </span>
            ) : (
              <span className="flex items-center gap-2 text-xs font-black text-blue-800 dark:text-blue-300 bg-blue-100 dark:bg-blue-950/60 px-3 py-1.5 rounded-lg border border-blue-300 dark:border-blue-700/50">
                <CreditCard className="w-4 h-4" /> Carte
              </span>
            )}
            <span className="text-xs font-bold text-zinc-600 dark:text-zinc-300">
              {new Date(order.createdAt).toLocaleString("fr-FR", { dateStyle: "short", timeStyle: "short" })}
            </span>
          </div>
        </div>

        {/* Footer: Total + CTA */}
        <div className="px-6 pb-6 bg-white dark:bg-zinc-950 border-t border-zinc-200 dark:border-zinc-800 pt-5 space-y-4">
          <div className="flex justify-between items-center">
            <span className="text-sm text-zinc-600 dark:text-zinc-300 font-extrabold uppercase tracking-wider">Total</span>
            <span className="text-3xl font-black text-zinc-900 dark:text-white">{formatPrice(order.total)}</span>
          </div>

          {!isDone && (
            <div className="flex gap-3">
              {["new", "confirmed"].includes(order.status) && (
                <button
                  onClick={() => handleStatusChange("cooking")}
                  className="flex-1 flex items-center justify-center gap-2 bg-blue-600 text-white py-4 rounded-2xl font-black hover:bg-blue-500 transition-all text-base shadow-xl"
                >
                  <ChefHat className="w-5 h-5" /> En préparation
                </button>
              )}
              {order.status === "cooking" && (
                <button
                  onClick={() => handleStatusChange("ready")}
                  className="flex-1 flex items-center justify-center gap-2 bg-emerald-600 text-white py-4 rounded-2xl font-black hover:bg-emerald-500 transition-all text-base shadow-xl"
                >
                  <CheckCircle className="w-5 h-5" /> Prête
                </button>
              )}
              {order.status === "ready" && (
                <button
                  onClick={() => handleStatusChange("delivered")}
                  className="flex-1 flex items-center justify-center gap-2 bg-black text-white dark:bg-white dark:text-black py-4 rounded-2xl font-black hover:opacity-90 transition-all shadow-2xl text-lg"
                >
                  <Zap className="w-6 h-6" /> Encaisser
                </button>
              )}
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
}

function ReceiptModal({ order, onClose }: { order: PlacedOrder, onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4 bg-black/60 dark:bg-black/80 backdrop-blur-md" onClick={onClose}>
      <motion.div 
        initial={{ opacity: 0, y: 50, scale: 0.9 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 50, scale: 0.9 }}
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-sm bg-white text-black p-6 shadow-2xl relative"
        style={{ fontFamily: "monospace" }}
      >
        <div className="absolute top-[-8px] left-0 right-0 h-4 bg-[radial-gradient(circle,transparent_4px,white_4px)] bg-[length:16px_16px] bg-[position:-8px_8px]" />
        
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold uppercase tracking-widest mb-1">IJA DIGITAL</h2>
          <p className="text-xs text-gray-700">Le Comptoir de Tunis<br/>123 Avenue Habib Bourguiba</p>
          <div className="mt-4 text-xs font-bold">
            <p>Ticket: {order.id}</p>
            <p>Date: {new Date(order.createdAt).toLocaleString()}</p>
            <p>Table: {order.tableId} • {order.paymentMethod === 'cash' ? "ESPÈCES" : "CARTE"}</p>
          </div>
        </div>

        <div className="border-t-2 border-dashed border-gray-400 py-4 mb-4 space-y-2">
          {order.items?.map((item: any, i: number) => (
            <div key={i} className="flex justify-between text-sm">
              <span className="font-bold">{item.quantity}x {item.menuItem?.name || "Article"}</span>
              <span className="font-bold">{formatPrice(item.totalPrice || 0)}</span>
            </div>
          ))}
          {!order.items?.length && <p className="text-sm text-center text-gray-500 font-bold">Total Global</p>}
        </div>

        <div className="border-t-2 border-dashed border-gray-400 pt-4 flex justify-between items-center font-black text-xl">
          <span>TOTAL</span>
          <span>{formatPrice(order.total)}</span>
        </div>
        
        <div className="text-center mt-8 space-y-1">
          <Receipt className="w-8 h-8 mx-auto text-gray-400 mb-2" />
          <p className="text-xs font-bold">MERCI DE VOTRE VISITE</p>
          <p className="text-[10px] text-gray-600 font-bold">À BIENTÔT</p>
        </div>

        <div className="absolute bottom-[-8px] left-0 right-0 h-4 bg-[radial-gradient(circle,transparent_4px,white_4px)] bg-[length:16px_16px] bg-[position:-8px_-8px]" />
      </motion.div>
    </div>
  );
}
