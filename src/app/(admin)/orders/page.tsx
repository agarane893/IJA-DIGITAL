"use client";

import React, { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  UtensilsCrossed, Clock, Filter, LayoutGrid, Calendar as CalendarIcon, 
  List, Search, ChevronLeft, ChevronRight, Eye, Printer, User, 
  CreditCard, Banknote, X, MessageSquare, Receipt
} from "lucide-react";
import { useOrderStore } from "@/lib/useOrderStore";
import { formatPrice } from "@/lib/menuData";
import { PlacedOrder } from "@/lib/useCartStore";
import { useStocksStore } from "@/lib/useStocksStore";
import { useAdminMenuStore } from "@/lib/useAdminMenuStore";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

// --- Types & Constants ---
type ViewMode = "table" | "kanban" | "calendar";

const STATUS_CONFIG: Record<string, { label: string; bg: string; text: string; border: string; kanban: string }> = {
  new: { label: "En attente", bg: "bg-orange-500/10", text: "text-orange-500", border: "border-orange-500/20", kanban: "border-t-orange-500" },
  confirmed: { label: "Confirmée", bg: "bg-yellow-500/10", text: "text-yellow-500", border: "border-yellow-500/20", kanban: "border-t-yellow-500" },
  cooking: { label: "En préparation", bg: "bg-blue-500/10", text: "text-blue-500", border: "border-blue-500/20", kanban: "border-t-blue-500" },
  ready: { label: "Prête", bg: "bg-emerald-500/10", text: "text-emerald-500", border: "border-emerald-500/20", kanban: "border-t-emerald-500" },
  delivered: { label: "Livrée", bg: "bg-white/5", text: "text-white/40", border: "border-white/10", kanban: "border-t-white/20" },
  rejected: { label: "Annulée", bg: "bg-red-500/10", text: "text-red-500", border: "border-red-500/20", kanban: "border-t-red-500" },
};

const KANBAN_COLUMNS = ["new", "confirmed", "cooking", "ready", "delivered", "rejected"];

// --- Mock historical data for Calendar ---
const generateMockHistory = (): PlacedOrder[] => {
  const pastOrders: PlacedOrder[] = [];
  const now = new Date();
  for (let i = 1; i <= 30; i++) {
    const d = new Date(now);
    d.setDate(d.getDate() - i);
    const numOrders = Math.floor(Math.random() * 5); // 0 to 4 orders per day
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
  const allOrders = [...orders, ...PAST_ORDERS].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  // State
  const [viewMode, setViewMode] = useState<ViewMode>("table");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [selectedOrder, setSelectedOrder] = useState<PlacedOrder | null>(null);
  const [receiptOrder, setReceiptOrder] = useState<PlacedOrder | null>(null);

  // Filtering
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
        <div>
          <h1 className="font-heading text-2xl font-black text-white flex items-center gap-2">
            <UtensilsCrossed className="w-7 h-7 text-zen-500" />
            Historique & Commandes
          </h1>
          <p className="text-sm text-white/40 mt-1">Supervision de toutes les commandes du restaurant</p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Search */}
          <div className="relative">
            <Search className="w-4 h-4 text-white/30 absolute left-3 top-1/2 -translate-y-1/2" />
            <input 
              type="text"
              placeholder="N° Commande ou Table..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="bg-zen-800 border border-white/10 rounded-xl pl-9 pr-4 py-2 text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-zen-500 transition-all w-48 lg:w-64"
            />
          </div>

          {/* Status Filter */}
          <select 
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-zen-800 border border-white/10 rounded-xl px-4 py-2 text-sm text-white/70 focus:outline-none focus:border-zen-500 transition-all appearance-none cursor-pointer"
          >
            <option value="all">Tous statuts</option>
            {Object.entries(STATUS_CONFIG).map(([k, v]) => (
              <option key={k} value={k}>{v.label}</option>
            ))}
          </select>

          {/* View Toggles */}
          <div className="flex items-center bg-zen-800 border border-white/10 rounded-xl p-1">
            <ViewToggle icon={List} active={viewMode === "table"} onClick={() => setViewMode("table")} />
            <ViewToggle icon={LayoutGrid} active={viewMode === "kanban"} onClick={() => setViewMode("kanban")} />
            <ViewToggle icon={CalendarIcon} active={viewMode === "calendar"} onClick={() => setViewMode("calendar")} />
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 min-h-0 bg-zen-800/50 border border-white/5 rounded-2xl overflow-hidden relative">
        <AnimatePresence mode="wait">
          {viewMode === "table" && (
            <TableView key="table" orders={filteredOrders} onViewDetail={setSelectedOrder} onPrint={setReceiptOrder} />
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

function ViewToggle({ icon: Icon, active, onClick }: { icon: any, active: boolean, onClick: () => void }) {
  return (
    <button 
      onClick={onClick}
      className={cn(
        "p-2 rounded-lg transition-all",
        active ? "bg-zen-500 text-white shadow-md shadow-zen-500/20" : "text-white/40 hover:text-white hover:bg-white/5"
      )}
    >
      <Icon className="w-4 h-4" />
    </button>
  );
}

function TableView({ orders, onViewDetail, onPrint }: { orders: PlacedOrder[], onViewDetail: (o: PlacedOrder) => void, onPrint: (o: PlacedOrder) => void }) {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
      className="w-full h-full overflow-auto"
    >
      <table className="w-full text-left border-collapse">
        <thead className="bg-zen-800 sticky top-0 z-10 border-b border-white/10 text-xs font-bold text-white/40 uppercase tracking-wider">
          <tr>
            <th className="px-6 py-4">ID</th>
            <th className="px-6 py-4">Date & Heure</th>
            <th className="px-6 py-4">Table</th>
            <th className="px-6 py-4">Statut</th>
            <th className="px-6 py-4">Paiement</th>
            <th className="px-6 py-4 text-right">Total</th>
            <th className="px-6 py-4 text-center">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-white/5">
          {orders.map((o) => (
            <tr key={o.id} className="hover:bg-white/5 transition-colors group">
              <td className="px-6 py-4 font-black text-zen-500">{o.id}</td>
              <td className="px-6 py-4 text-sm text-white/70">
                {new Date(o.createdAt).toLocaleString("fr-FR", { dateStyle: "short", timeStyle: "short" })}
              </td>
              <td className="px-6 py-4">
                <span className="bg-white/10 px-2 py-1 rounded text-xs font-bold text-white">T-{o.tableId}</span>
              </td>
              <td className="px-6 py-4">
                <StatusBadge status={o.status} />
              </td>
              <td className="px-6 py-4">
                {o.paymentMethod === "cash" ? (
                  <span className="flex items-center gap-1.5 text-xs font-bold text-emerald-400"><Banknote className="w-3.5 h-3.5" /> Espèces</span>
                ) : (
                  <span className="flex items-center gap-1.5 text-xs font-bold text-blue-400"><CreditCard className="w-3.5 h-3.5" /> Carte</span>
                )}
              </td>
              <td className="px-6 py-4 text-right font-black text-white">{formatPrice(o.total)}</td>
              <td className="px-6 py-4">
                <div className="flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button onClick={() => onViewDetail(o)} className="p-2 bg-white/10 hover:bg-white/20 rounded-lg text-white transition-colors" title="Détails">
                    <Eye className="w-4 h-4" />
                  </button>
                  <button onClick={() => onPrint(o)} className="p-2 bg-zen-500/20 hover:bg-zen-500/40 text-zen-500 rounded-lg transition-colors" title="Imprimer">
                    <Printer className="w-4 h-4" />
                  </button>
                </div>
              </td>
            </tr>
          ))}
          {orders.length === 0 && (
            <tr>
              <td colSpan={7} className="px-6 py-12 text-center text-white/40">Aucune commande trouvée.</td>
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
          <div key={colStatus} className="flex-shrink-0 w-72 bg-zen-800 rounded-2xl flex flex-col border border-white/5 overflow-hidden">
            <div className={cn("px-4 py-3 border-b border-white/5 border-t-4 flex justify-between items-center bg-white/2", config.kanban)}>
              <span className="font-bold text-white text-sm uppercase tracking-wider">{config.label}</span>
              <span className="bg-white/10 text-white/60 px-2 py-0.5 rounded text-xs font-black">{colOrders.length}</span>
            </div>
            <div className="flex-1 p-3 space-y-3 overflow-y-auto scrollbar-thin">
              {colOrders.map((o: any) => (
                <div key={o.id} onClick={() => onViewDetail(o)} className="bg-zen-900 border border-white/10 rounded-xl p-3 cursor-pointer hover:border-white/30 transition-all hover:shadow-lg shadow-black/50 group">
                  <div className="flex justify-between items-start mb-2">
                    <span className="text-xs font-black text-zen-500">{o.id}</span>
                    <span className="text-[10px] text-white/40">{new Date(o.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                  </div>
                  <div className="font-bold text-white text-sm mb-1">Table {o.tableId}</div>
                  <div className="text-xs text-white/50 line-clamp-2 mb-3">
                    {o.items?.map((i: any) => `${i.quantity}x ${i.menuItem.name}`).join(", ") || "Pas d'articles"}
                  </div>
                  <div className="flex justify-between items-center pt-2 border-t border-white/10">
                    <span className="text-xs font-bold text-white/80">{formatPrice(o.total)}</span>
                    <button className="text-[10px] bg-white/10 hover:bg-white/20 px-2 py-1 rounded text-white transition-colors opacity-0 group-hover:opacity-100">
                      Ouvrir
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
      })}
    </motion.div>
  );
}

function CalendarView({ orders }: { orders: PlacedOrder[] }) {
  // Simple visual simulation of a calendar month
  const days = Array.from({ length: 35 }, (_, i) => i + 1);
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="p-6 h-full flex flex-col">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-lg font-bold text-white">Juin 2026</h2>
        <div className="flex gap-2">
          <button className="p-1.5 bg-white/5 rounded hover:bg-white/10"><ChevronLeft className="w-5 h-5 text-white" /></button>
          <button className="p-1.5 bg-white/5 rounded hover:bg-white/10"><ChevronRight className="w-5 h-5 text-white" /></button>
        </div>
      </div>
      <div className="grid grid-cols-7 gap-2 flex-1">
        {["Lun", "Mar", "Mer", "Jeu", "Ven", "Sam", "Dim"].map(d => (
          <div key={d} className="text-center text-xs font-bold text-white/40 mb-2">{d}</div>
        ))}
        {days.map(d => {
          const dayOrders = Math.floor(Math.random() * 8);
          const revenue = dayOrders * 25;
          const isToday = d === 23; // Fake today
          return (
            <div key={d} className={cn(
              "border rounded-xl p-2 flex flex-col transition-colors hover:bg-white/5 cursor-pointer",
              isToday ? "border-zen-500 bg-zen-500/5" : "border-white/5 bg-zen-800"
            )}>
              <span className={cn("text-xs font-bold mb-auto", isToday ? "text-zen-500" : "text-white/60")}>{d}</span>
              {dayOrders > 0 && (
                <div className="mt-2 space-y-1">
                  <div className="text-[10px] bg-white/10 text-white/80 px-1.5 py-0.5 rounded">{dayOrders} cmds</div>
                  <div className="text-[10px] text-emerald-400 font-bold">{revenue} TND</div>
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
    <span className={cn("text-[10px] font-bold px-2 py-1 rounded-lg border uppercase tracking-wider", conf.bg, conf.text, conf.border)}>
      {conf.label}
    </span>
  );
}

function OrderDetailModal({ order, onClose, updateOrder }: { order: PlacedOrder, onClose: () => void, updateOrder: (id: string, updates: Partial<PlacedOrder>) => void }) {


  const handleStatusChange = (newStatus: string) => {
    updateOrder(order.id, { status: newStatus as any });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4 bg-black/60 backdrop-blur-sm">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="w-full max-w-2xl bg-zen-900 border border-white/10 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
      >
        <div className="px-6 py-4 border-b border-white/10 flex justify-between items-center bg-zen-800">
          <div className="flex items-center gap-3">
            <h2 className="text-xl font-black text-white">{order.id}</h2>
            <StatusBadge status={order.status} />
          </div>
          <button onClick={onClose} className="p-2 bg-white/5 hover:bg-white/10 rounded-full transition-colors text-white/60">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto space-y-8 flex-1">
          {/* Info Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <InfoBlock icon={UtensilsCrossed} label="Table" value={`Table ${order.tableId}`} />
            <InfoBlock icon={Clock} label="Heure" value={new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} />
            <InfoBlock icon={CreditCard} label="Paiement" value={order.paymentMethod === 'cash' ? "Espèces" : "Carte"} />
            <InfoBlock icon={User} label="Assigné à" value="Serveur" />
          </div>

          {/* Items */}
          <div>
            <h3 className="text-sm font-bold text-white/40 uppercase tracking-wider mb-3">Articles commandés</h3>
            <div className="space-y-3">
              {order.items?.map((item: any, i: number) => (
                <div key={i} className="flex gap-4 p-3 bg-white/5 rounded-xl border border-white/5">
                  <div className="w-10 h-10 bg-zen-800 rounded-lg flex items-center justify-center font-black text-zen-500 shrink-0 border border-white/10">
                    {item.quantity}x
                  </div>
                  <div className="flex-1">
                    <p className="font-bold text-white">{item.menuItem?.name || "Article"}</p>
                    {item.options && Object.keys(item.options).length > 0 && (
                      <p className="text-xs text-white/50 mt-0.5">{Object.entries(item.options).map(([k, v]) => `${v}`).join(", ")}</p>
                    )}
                    {item.comment && (
                      <div className="flex items-center gap-1.5 mt-2 text-xs font-medium text-orange-400 bg-orange-500/10 px-2 py-1 rounded inline-flex">
                        <MessageSquare className="w-3 h-3" /> {item.comment}
                      </div>
                    )}
                  </div>
                  <div className="font-black text-white text-right shrink-0">
                    {formatPrice(item.totalPrice || 0)}
                  </div>
                </div>
              ))}
              {!order.items?.length && <p className="text-white/40 text-sm">Détail des articles non disponible (Historique).</p>}
            </div>
          </div>

          {/* Actions rapides */}
          {order.status !== "delivered" && order.status !== "rejected" && (
            <div className="pt-4 border-t border-white/10">
              <h3 className="text-sm font-bold text-white/40 uppercase tracking-wider mb-3">Actions rapides</h3>
              <div className="flex flex-wrap gap-3">
                {["new", "confirmed"].includes(order.status) && (
                  <button 
                    onClick={() => handleStatusChange("cooking")}
                    className="flex-1 bg-blue-500/20 text-blue-400 border border-blue-500/30 px-4 py-3 rounded-xl font-bold hover:bg-blue-500/30 transition-all"
                  >
                    Mettre en préparation
                  </button>
                )}
                {order.status === "cooking" && (
                  <button 
                    onClick={() => handleStatusChange("ready")}
                    className="flex-1 bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 px-4 py-3 rounded-xl font-bold hover:bg-emerald-500/30 transition-all"
                  >
                    Marquer comme prête
                  </button>
                )}
                {order.status === "ready" && (
                  <button 
                    onClick={() => handleStatusChange("delivered")}
                    className="flex-1 bg-white/10 text-white/80 border border-white/20 px-4 py-3 rounded-xl font-bold hover:bg-white/20 transition-all"
                  >
                    Marquer comme servie
                  </button>
                )}
              </div>
            </div>
          )}
        </div>

        <div className="px-6 py-4 bg-zen-800 border-t border-white/10 flex justify-between items-center">
          <div className="text-sm text-white/50 font-bold uppercase tracking-wider">Total à payer</div>
          <div className="text-3xl font-black text-zen-500">{formatPrice(order.total)}</div>
        </div>
      </motion.div>
    </div>
  );
}

function InfoBlock({ icon: Icon, label, value }: { icon: any, label: string, value: string }) {
  return (
    <div className="bg-zen-800 p-3 rounded-xl border border-white/5">
      <Icon className="w-4 h-4 text-zen-500 mb-2" />
      <div className="text-[10px] font-bold text-white/40 uppercase tracking-wider mb-0.5">{label}</div>
      <div className="font-bold text-white text-sm">{value}</div>
    </div>
  );
}

function TimelineStep({ title, time, active }: { title: string, time: string, active: boolean }) {
  return (
    <div className="relative pl-6">
      <div className={cn("absolute left-[-5px] top-1 w-2 h-2 rounded-full ring-4 ring-[#0D1117]", active ? "bg-zen-500" : "bg-white/20")} />
      <div className={cn("text-sm font-bold", active ? "text-white" : "text-white/40")}>{title}</div>
      <div className="text-xs text-white/30">{time}</div>
    </div>
  );
}

function ReceiptModal({ order, onClose }: { order: PlacedOrder, onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4 bg-black/60 backdrop-blur-sm" onClick={onClose}>
      <motion.div 
        initial={{ opacity: 0, y: 50, scale: 0.9 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 50, scale: 0.9 }}
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-sm bg-white text-black p-6 shadow-2xl relative"
        style={{ fontFamily: "monospace" }}
      >
        {/* Receipt ZigZag Top/Bottom using CSS */}
        <div className="absolute top-[-8px] left-0 right-0 h-4 bg-[radial-gradient(circle,transparent_4px,white_4px)] bg-[length:16px_16px] bg-[position:-8px_8px]" />
        
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold uppercase tracking-widest mb-1">IJA DIGITAL</h2>
          <p className="text-xs text-gray-500">Le Comptoir de Tunis<br/>123 Avenue Habib Bourguiba</p>
          <div className="mt-4 text-xs">
            <p>Ticket: {order.id}</p>
            <p>Date: {new Date(order.createdAt).toLocaleString()}</p>
            <p>Table: {order.tableId} • {order.paymentMethod === 'cash' ? "ESPÈCES" : "CARTE"}</p>
          </div>
        </div>

        <div className="border-t-2 border-dashed border-gray-300 py-4 mb-4 space-y-2">
          {order.items?.map((item: any, i: number) => (
            <div key={i} className="flex justify-between text-sm">
              <span className="font-semibold">{item.quantity}x {item.menuItem?.name || "Article"}</span>
              <span>{formatPrice(item.totalPrice || 0)}</span>
            </div>
          ))}
          {!order.items?.length && <p className="text-sm text-center text-gray-400">Total Global</p>}
        </div>

        <div className="border-t-2 border-dashed border-gray-300 pt-4 flex justify-between items-center font-bold text-lg">
          <span>TOTAL</span>
          <span>{formatPrice(order.total)}</span>
        </div>
        
        <div className="text-center mt-8 space-y-1">
          <Receipt className="w-8 h-8 mx-auto text-gray-300 mb-2" />
          <p className="text-xs font-bold">MERCI DE VOTRE VISITE</p>
          <p className="text-[10px] text-gray-500">À BIENTÔT</p>
        </div>

        <div className="absolute bottom-[-8px] left-0 right-0 h-4 bg-[radial-gradient(circle,transparent_4px,white_4px)] bg-[length:16px_16px] bg-[position:-8px_-8px]" />
      </motion.div>
    </div>
  );
}
