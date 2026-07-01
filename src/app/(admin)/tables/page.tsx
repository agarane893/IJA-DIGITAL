"use client";

import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard,
  Plus,
  Minus,
  Trash2,
  Edit3,
  X,
  Users,
  Clock,
  CheckCircle2,
  XCircle,
  Banknote,
  CreditCard,
  ChefHat,
  Bell,
  AlertTriangle,
  Receipt,
  ShoppingBag,
} from "lucide-react";
import { useTableStore, RestaurantTable } from "@/lib/useTableStore";
import { useOrderStore } from "@/lib/useOrderStore";
import { useAuthStore } from "@/lib/useAuthStore";
import { PlacedOrder, CartItem } from "@/lib/useCartStore";
import { MENU_ITEMS, MenuItem } from "@/lib/menuData";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

// ─── Helpers ──────────────────────────────────────────────────────────────────

function getTableStatus(orders: PlacedOrder[]) {
  const active = orders.filter(
    (o) => o.status !== "rejected" && !o.paid
  );
  if (active.length === 0) return "free";
  if (active.some((o) => o.status === "ready")) return "ready";
  if (active.some((o) => o.status === "delivered")) return "billing";
  if (active.some((o) => o.status === "new" || o.status === "cooking"))
    return "active";
  return "free";
}

function formatTime(iso: string) {
  return new Date(iso).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });
}

function formatPrice(n: number) {
  return `${n.toFixed(3)} TND`;
}

const STATUS_LABEL: Record<string, string> = {
  new: "Nouvelle",
  cooking: "En préparation",
  ready: "Prête !",
  delivered: "Servie",
  rejected: "Annulée",
};

const STATUS_COLOR: Record<string, string> = {
  new: "bg-blue-100 text-blue-700 border-blue-200",
  cooking: "bg-amber-100 text-amber-700 border-amber-200",
  ready: "bg-emerald-100 text-emerald-700 border-emerald-200",
  delivered: "bg-purple-100 text-purple-700 border-purple-200",
  rejected: "bg-zinc-100 text-zinc-500 border-zinc-200",
};

// ─── Main Page ─────────────────────────────────────────────────────────────────

export default function TablesPage() {
  const { tables, addTable, updateTable, deleteTable } = useTableStore();
  const { orders, addOrder, updateOrder, cancelOrder, markAsPaid } = useOrderStore();
  const { user } = useAuthStore();
  const activeUserName = user
    ? `${user.name} (${user.role === "manager" ? "Manager" : "Serveur"})`
    : "Système";

  // --- Add/Edit table modal ---
  const [showTableModal, setShowTableModal] = useState(false);
  const [editingTable, setEditingTable] = useState<RestaurantTable | null>(null);
  const [tableName, setTableName] = useState("");
  const [tableCapacity, setTableCapacity] = useState("2");

  // --- Table detail modal ---
  const [selectedTable, setSelectedTable] = useState<RestaurantTable | null>(null);

  // --- Cancel order modal ---
  const [cancellingOrder, setCancellingOrder] = useState<PlacedOrder | null>(null);
  const [cancelReason, setCancelReason] = useState("");

  // --- Order builder inline form state ---
  const [showOrderForm, setShowOrderForm] = useState(false);
  const [draftItems, setDraftItems] = useState<CartItem[]>([]);
  const [selectedProductId, setSelectedProductId] = useState("");
  const [itemQty, setItemQty] = useState(1);
  const [itemComment, setItemComment] = useState("");
  const [globalComment, setGlobalComment] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<"cash" | "card">("cash");

  const openAddTable = () => {
    setEditingTable(null);
    setTableName("");
    setTableCapacity("2");
    setShowTableModal(true);
  };

  const openEditTable = (t: RestaurantTable) => {
    setEditingTable(t);
    setTableName(t.name);
    setTableCapacity(t.capacity?.toString() || "2");
    setShowTableModal(true);
  };

  const handleSaveTable = () => {
    if (!tableName.trim()) {
      toast.error("Veuillez entrer un nom de table");
      return;
    }
    if (editingTable) {
      updateTable(editingTable.id, {
        name: tableName.trim(),
        capacity: parseInt(tableCapacity) || 2,
      });
      toast.success("Table modifiée");
    } else {
      const newId = `T${Date.now()}`;
      addTable({ id: newId, name: tableName.trim(), capacity: parseInt(tableCapacity) || 2 });
      toast.success("Table ajoutée");
    }
    setShowTableModal(false);
  };

  const handleDeleteTable = (id: string) => {
    if (confirm("Supprimer cette table ?")) {
      deleteTable(id);
      if (selectedTable?.id === id) setSelectedTable(null);
      toast.success("Table supprimée");
    }
  };

  const handleConfirmCancel = () => {
    if (!cancellingOrder) return;
    if (!cancelReason.trim()) {
      toast.error("Veuillez entrer une raison d'annulation");
      return;
    }
    cancelOrder(cancellingOrder.id, cancelReason, activeUserName);
    toast.success(`Commande ${cancellingOrder.id} annulée`);
    setCancellingOrder(null);
    setCancelReason("");
  };

  const handleMarkPaid = (orderId: string) => {
    markAsPaid(orderId, activeUserName);
    toast.success("Commande marquée comme payée ✓");
  };

  const handleAdvanceStatus = (order: PlacedOrder) => {
    const next: Record<string, PlacedOrder["status"]> = {
      new: "cooking",
      cooking: "ready",
      ready: "delivered",
    };
    if (next[order.status]) {
      updateOrder(order.id, { status: next[order.status] });
      toast.success(`Commande ${order.id} → ${STATUS_LABEL[next[order.status]]}`);
    }
  };

  // Add item to draft order
  const handleAddDraftItem = () => {
    if (!selectedProductId) {
      toast.error("Veuillez sélectionner un article");
      return;
    }
    const menuItem = MENU_ITEMS.find((item) => item.id === selectedProductId);
    if (!menuItem) return;

    const draftId = `${menuItem.id}::${Date.now()}`;
    const newDraftItem: CartItem = {
      id: draftId,
      menuItem,
      quantity: itemQty,
      options: {},
      comment: itemComment,
      unitPrice: menuItem.price,
      totalPrice: menuItem.price * itemQty,
    };

    setDraftItems((prev) => [...prev, newDraftItem]);
    setSelectedProductId("");
    setItemQty(1);
    setItemComment("");
    toast.success(`${menuItem.name} ajouté au panier`);
  };

  // Remove item from draft order
  const handleRemoveDraftItem = (id: string) => {
    setDraftItems((prev) => prev.filter((it) => it.id !== id));
  };

  // Submit the manual order
  const handleSubmitManualOrder = () => {
    if (!selectedTable) return;
    if (draftItems.length === 0) {
      toast.error("Veuillez ajouter au moins un article");
      return;
    }

    const orderId = `CMD-${Math.floor(100 + Math.random() * 900)}`;
    const newOrder: PlacedOrder = {
      id: orderId,
      tableId: selectedTable.id,
      items: draftItems,
      total: draftItems.reduce((acc, it) => acc + it.totalPrice, 0),
      paymentMethod,
      globalComment,
      status: "new",
      createdAt: new Date().toISOString(),
    };

    addOrder(newOrder);
    toast.success(`Commande ${orderId} créée avec succès !`);

    // Reset Form
    setDraftItems([]);
    setGlobalComment("");
    setShowOrderForm(false);
  };

  // Orders grouped by table
  const ordersByTable = useMemo(() => {
    const map: Record<string, PlacedOrder[]> = {};
    for (const o of orders) {
      if (!map[o.tableId]) map[o.tableId] = [];
      map[o.tableId].push(o);
    }
    return map;
  }, [orders]);

  const selectedTableOrders = selectedTable
    ? (ordersByTable[selectedTable.id] || [])
    : [];

  const activeSelectedOrders = selectedTableOrders.filter(
    (o) => o.status !== "rejected" && !o.paid
  );
  const historyOrders = selectedTableOrders.filter(
    (o) => o.status === "rejected" || o.paid
  );

  // Count tables needing attention
  const readyCount = tables.filter(
    (t) => getTableStatus(ordersByTable[t.id] || []) === "ready"
  ).length;

  return (
    <div className="h-full flex flex-col p-4 md:p-6 max-w-7xl mx-auto space-y-6 text-zen-900">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-heading text-3xl font-black text-zen-900 flex items-center gap-3">
            <LayoutDashboard className="w-8 h-8 text-zen-600" />
            Gestion Commandes
          </h1>
          <p className="text-zen-600/60 mt-1 text-sm font-medium">
            Réception, tables et caisse en temps réel
          </p>
        </div>

        <div className="flex items-center gap-3">
          {readyCount > 0 && (
            <div className="flex items-center gap-2 bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-xl px-3 py-2 text-sm font-bold animate-pulse">
              <Bell className="w-4 h-4" />
              {readyCount} table{readyCount > 1 ? "s" : ""} prête{readyCount > 1 ? "s" : ""} !
            </div>
          )}
          <button
            onClick={openAddTable}
            className="flex items-center gap-2 text-sm font-bold text-white bg-zen-600 hover:bg-zen-700 rounded-xl px-4 py-2.5 transition-all shadow-sm"
          >
            <Plus className="w-4 h-4" /> Ajouter une table
          </button>
        </div>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-2 text-xs font-bold">
        {[
          { dot: "bg-zen-400", color: "bg-zen-50 border-zen-200 text-zen-600", label: "Libre" },
          { dot: "bg-amber-400", color: "bg-amber-50 border-amber-200 text-amber-700", label: "En cours" },
          { dot: "bg-emerald-500 animate-pulse", color: "bg-emerald-50 border-emerald-200 text-emerald-700", label: "Prête" },
          { dot: "bg-purple-500", color: "bg-purple-50 border-purple-200 text-purple-700", label: "À encaisser" },
          { dot: "bg-blue-400", color: "bg-blue-50 border-blue-200 text-blue-700", label: "Payée" },
        ].map((l) => (
          <span key={l.label} className={cn("flex items-center gap-1.5 px-3 py-1.5 rounded-lg border", l.color)}>
            <span className={cn("w-2 h-2 rounded-full shrink-0", l.dot)} />
            {l.label}
          </span>
        ))}
      </div>

      {/* Table Grid */}
      {tables.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 border border-dashed border-zen-200 rounded-3xl bg-white/50">
          <LayoutDashboard className="w-16 h-16 text-zen-300 mb-4" />
          <p className="text-xl font-bold text-zen-700 mb-1">Aucune table configurée</p>
          <p className="text-zen-400 text-sm mb-6">Ajoutez votre première table pour commencer</p>
          <button onClick={openAddTable} className="bg-zen-600 text-white px-5 py-2.5 rounded-xl font-bold flex items-center gap-2">
            <Plus className="w-4 h-4" /> Créer une table
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          <AnimatePresence mode="popLayout">
            {tables.map((table) => {
              const tableOrders = ordersByTable[table.id] || [];
              const status = getTableStatus(tableOrders);
              const activeOrders = tableOrders.filter(
                (o) => o.status !== "rejected" && !o.paid
              );
              const total = activeOrders.reduce((s, o) => s + o.total, 0);

              return (
                <TableCard
                  key={table.id}
                  table={table}
                  status={status}
                  activeOrderCount={activeOrders.length}
                  total={total}
                  onSelect={() => {
                    setSelectedTable(table);
                    setShowOrderForm(false);
                    setDraftItems([]);
                  }}
                  onEdit={() => openEditTable(table)}
                  onDelete={() => handleDeleteTable(table.id)}
                />
              );
            })}
          </AnimatePresence>
        </div>
      )}

      {/* ─── TABLE DETAIL MODAL ────────────────────────────────────── */}
      <AnimatePresence>
        {selectedTable && (
          <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/50 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 40 }}
              className="bg-white border border-zen-200 rounded-t-3xl sm:rounded-2xl w-full sm:max-w-2xl shadow-2xl flex flex-col max-h-[92vh]"
            >
              {/* Header */}
              <div className="px-6 py-4 border-b border-zen-100 flex items-center justify-between bg-zen-50 rounded-t-3xl sm:rounded-t-2xl">
                <div>
                  <h2 className="font-heading text-xl font-black text-zen-900">
                    {selectedTable.name}
                  </h2>
                  <p className="text-xs text-zen-500 flex items-center gap-1 mt-0.5">
                    <Users className="w-3 h-3" /> {selectedTable.capacity} places
                    {activeSelectedOrders.length > 0 && (
                      <span className="ml-2 font-bold text-zen-700">
                        · {activeSelectedOrders.length} commande{activeSelectedOrders.length > 1 ? "s" : ""} active{activeSelectedOrders.length > 1 ? "s" : ""}
                      </span>
                    )}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      setShowOrderForm(!showOrderForm);
                      setDraftItems([]);
                    }}
                    className="text-xs font-bold text-white bg-zen-600 hover:bg-zen-700 px-3 py-1.5 rounded-lg transition-colors"
                  >
                    {showOrderForm ? "Voir Commandes" : "+ Commande"}
                  </button>
                  <button
                    onClick={() => setSelectedTable(null)}
                    className="p-2 hover:bg-zen-100 rounded-full transition-colors text-zen-500"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto">
                {showOrderForm ? (
                  /* ─── ADD NEW ORDER FORM INLINE ─── */
                  <div className="p-6 space-y-6">
                    <h3 className="text-sm font-black text-zen-900 uppercase tracking-wider">
                      Nouvelle Commande pour {selectedTable.name}
                    </h3>
                    
                    {/* Add Item Area */}
                    <div className="bg-zen-50 border border-zen-200 rounded-2xl p-4 space-y-3">
                      <div>
                        <label className="block text-xs font-bold text-zen-600 mb-1.5">
                          Choisir un Article
                        </label>
                        <select
                          value={selectedProductId}
                          onChange={(e) => setSelectedProductId(e.target.value)}
                          className="w-full bg-white border border-zen-200 rounded-xl px-3 py-2.5 text-sm text-zen-900 focus:outline-none focus:ring-2 focus:ring-zen-500/20"
                        >
                          <option value="">-- Sélectionner --</option>
                          {MENU_ITEMS.map((item) => (
                            <option key={item.id} value={item.id}>
                              {item.emoji} {item.name} ({formatPrice(item.price)})
                            </option>
                          ))}
                        </select>
                      </div>

                      <div className="flex gap-3">
                        <div className="w-1/3">
                          <label className="block text-xs font-bold text-zen-600 mb-1.5">
                            Quantité
                          </label>
                          <div className="flex items-center bg-white border border-zen-200 rounded-xl px-2 py-1">
                            <button
                              type="button"
                              onClick={() => setItemQty((q) => Math.max(1, q - 1))}
                              className="w-7 h-7 flex items-center justify-center bg-zen-50 hover:bg-zen-100 text-zen-700 rounded-lg"
                            >
                              <Minus className="w-3.5 h-3.5" />
                            </button>
                            <span className="flex-1 text-center font-bold text-sm text-zen-900">
                              {itemQty}
                            </span>
                            <button
                              type="button"
                              onClick={() => setItemQty((q) => q + 1)}
                              className="w-7 h-7 flex items-center justify-center bg-zen-50 hover:bg-zen-100 text-zen-700 rounded-lg"
                            >
                              <Plus className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>

                        <div className="flex-1">
                          <label className="block text-xs font-bold text-zen-600 mb-1.5">
                            Note / Instruction
                          </label>
                          <input
                            type="text"
                            value={itemComment}
                            onChange={(e) => setItemComment(e.target.value)}
                            placeholder="Ex: sans sucre, piquant..."
                            className="w-full bg-white border border-zen-200 rounded-xl px-3 py-2 text-sm text-zen-900 focus:outline-none focus:ring-2 focus:ring-zen-500/20"
                          />
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={handleAddDraftItem}
                        className="w-full bg-zen-600 hover:bg-zen-700 text-white font-bold text-xs py-2 rounded-xl transition-all"
                      >
                        Ajouter cet article
                      </button>
                    </div>

                    {/* Draft Basket */}
                    {draftItems.length > 0 && (
                      <div className="space-y-2">
                        <h4 className="text-xs font-bold text-zen-500">Panier temporaire</h4>
                        <div className="border border-zen-100 rounded-2xl overflow-hidden divide-y divide-zen-100">
                          {draftItems.map((item) => (
                            <div key={item.id} className="bg-white p-3 flex items-center justify-between text-xs">
                              <div>
                                <span className="font-bold text-zen-900">{item.quantity}x {item.menuItem.name}</span>
                                {item.comment && (
                                  <p className="text-[10px] text-zen-500 italic mt-0.5">Note: {item.comment}</p>
                                )}
                              </div>
                              <div className="flex items-center gap-3">
                                <span className="font-bold text-zen-700">{formatPrice(item.totalPrice)}</span>
                                <button
                                  type="button"
                                  onClick={() => handleRemoveDraftItem(item.id)}
                                  className="text-red-500 hover:bg-red-50 p-1.5 rounded-lg transition-colors"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Global order params */}
                    <div className="space-y-3">
                      <div>
                        <label className="block text-xs font-bold text-zen-600 mb-1.5">
                          Note globale pour la commande
                        </label>
                        <input
                          type="text"
                          value={globalComment}
                          onChange={(e) => setGlobalComment(e.target.value)}
                          placeholder="Note de service générale..."
                          className="w-full bg-zen-50 border border-zen-200 rounded-xl px-3 py-2 text-sm text-zen-900 focus:outline-none"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-zen-600 mb-1.5">
                          Méthode de paiement prévue
                        </label>
                        <div className="flex gap-3">
                          <button
                            type="button"
                            onClick={() => setPaymentMethod("cash")}
                            className={cn(
                              "flex-1 flex items-center justify-center gap-2 py-2 rounded-xl text-xs font-bold border transition-all",
                              paymentMethod === "cash"
                                ? "bg-emerald-50 border-emerald-300 text-emerald-700"
                                : "bg-white border-zen-200 text-zen-600"
                            )}
                          >
                            <Banknote className="w-4 h-4" /> Espèces
                          </button>
                          <button
                            type="button"
                            onClick={() => setPaymentMethod("card")}
                            className={cn(
                              "flex-1 flex items-center justify-center gap-2 py-2 rounded-xl text-xs font-bold border transition-all",
                              paymentMethod === "card"
                                ? "bg-blue-50 border-blue-300 text-blue-700"
                                : "bg-white border-zen-200 text-zen-600"
                            )}
                          >
                            <CreditCard className="w-4 h-4" /> Carte
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-3 pt-3">
                      <button
                        type="button"
                        onClick={() => {
                          setShowOrderForm(false);
                          setDraftItems([]);
                        }}
                        className="flex-1 py-2.5 rounded-xl font-bold text-zen-700 bg-zen-100 hover:bg-zen-200 transition-colors text-sm"
                      >
                        Annuler
                      </button>
                      <button
                        type="button"
                        onClick={handleSubmitManualOrder}
                        disabled={draftItems.length === 0}
                        className="flex-1 bg-zen-600 disabled:opacity-50 text-white py-2.5 rounded-xl font-bold hover:bg-zen-700 transition-colors text-sm shadow-sm"
                      >
                        Valider la commande ({formatPrice(draftItems.reduce((acc, it) => acc + it.totalPrice, 0))})
                      </button>
                    </div>
                  </div>
                ) : (
                  /* ─── ACTIVE ORDERS LIST ─── */
                  <>
                    <div className="p-6 space-y-4">
                      {activeSelectedOrders.length === 0 ? (
                        <div className="text-center py-10 text-zen-400">
                          <ShoppingBag className="w-12 h-12 mx-auto mb-3 opacity-40" />
                          <p className="font-bold">Aucune commande active</p>
                          <p className="text-xs mt-1">Cette table est libre</p>
                        </div>
                      ) : (
                        activeSelectedOrders.map((order) => (
                          <OrderCard
                            key={order.id}
                            order={order}
                            onAdvance={() => handleAdvanceStatus(order)}
                            onCancel={() => { setCancellingOrder(order); setCancelReason(""); }}
                            onPay={() => handleMarkPaid(order.id)}
                          />
                        ))
                      )}
                    </div>

                    {/* History */}
                    {historyOrders.length > 0 && (
                      <div className="px-6 pb-6">
                        <h3 className="text-[10px] font-black text-zen-400 uppercase tracking-wider mb-3">
                          Historique
                        </h3>
                        <div className="space-y-2">
                          {historyOrders.map((order) => (
                            <div
                              key={order.id}
                              className={cn(
                                "flex items-center justify-between p-3 rounded-xl border text-xs",
                                order.status === "rejected"
                                  ? "bg-zinc-50 border-zinc-100 text-zinc-500"
                                  : "bg-blue-50/40 border-blue-100 text-blue-700"
                              )}
                            >
                              <div className="flex items-center gap-2">
                                {order.status === "rejected" ? (
                                  <XCircle className="w-4 h-4 text-zinc-400" />
                                ) : (
                                  <CheckCircle2 className="w-4 h-4 text-blue-500" />
                                )}
                                <div>
                                  <span className="font-bold">{order.id}</span>
                                  {order.cancelReason && (
                                    <p className="text-[10px] text-zinc-400 mt-0.5">
                                      Motif : {order.cancelReason} · Par {order.cancelledBy}
                                    </p>
                                  )}
                                  {order.paid && order.paidBy && (
                                    <p className="text-[10px] text-blue-400 mt-0.5">
                                      Payée à {order.paidAt ? formatTime(order.paidAt) : ""} · Par {order.paidBy}
                                    </p>
                                  )}
                                </div>
                              </div>
                              <span className="font-black">{formatPrice(order.total)}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </>
                )}
              </div>

              {/* Footer total */}
              {!showOrderForm && activeSelectedOrders.length > 0 && (
                <div className="px-6 py-4 border-t border-zen-100 bg-zen-50/50 flex items-center justify-between rounded-b-3xl sm:rounded-b-2xl">
                  <span className="text-sm font-bold text-zen-500">Total table</span>
                  <span className="text-2xl font-black text-zen-900">
                    {formatPrice(activeSelectedOrders.reduce((s, o) => s + o.total, 0))}
                  </span>
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ─── CANCEL ORDER MODAL ───────────────────────────────────── */}
      <AnimatePresence>
        {cancellingOrder && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white border border-zen-200 rounded-2xl w-full max-w-sm shadow-2xl p-6"
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-red-100 rounded-xl flex items-center justify-center border border-red-200">
                  <AlertTriangle className="w-5 h-5 text-red-600" />
                </div>
                <div>
                  <h3 className="font-bold text-zen-900">Annuler la commande</h3>
                  <p className="text-xs text-zen-500">{cancellingOrder.id} · {formatPrice(cancellingOrder.total)}</p>
                </div>
              </div>

              <label className="block text-xs font-bold text-zen-600 mb-1.5">
                Raison de l&apos;annulation
              </label>
              <textarea
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
                placeholder="Ex: Client absent, Erreur de commande..."
                rows={3}
                className="w-full bg-zen-50 border border-zen-200 rounded-xl px-4 py-3 text-zen-900 text-sm placeholder:text-zen-400/60 focus:outline-none focus:ring-2 focus:ring-red-400/30 resize-none"
              />

              <div className="flex gap-3 mt-4">
                <button
                  onClick={() => setCancellingOrder(null)}
                  className="flex-1 py-2.5 rounded-xl font-bold text-zen-700 bg-zen-100 hover:bg-zen-200 transition-colors text-sm"
                >
                  Retour
                </button>
                <button
                  onClick={handleConfirmCancel}
                  className="flex-1 bg-red-600 text-white py-2.5 rounded-xl font-bold hover:bg-red-700 transition-colors text-sm shadow-lg shadow-red-600/20"
                >
                  Confirmer l&apos;annulation
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ─── ADD/EDIT TABLE MODAL ─────────────────────────────────── */}
      <AnimatePresence>
        {showTableModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white border border-zen-200 rounded-2xl w-full max-w-sm shadow-2xl p-6"
            >
              <div className="flex items-center justify-between mb-5">
                <h3 className="font-heading text-lg font-bold text-zen-900">
                  {editingTable ? "Modifier la table" : "Nouvelle table"}
                </h3>
                <button
                  onClick={() => setShowTableModal(false)}
                  className="p-1.5 hover:bg-zen-100 rounded-full text-zen-400"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-zen-600 mb-1.5">
                    Nom / Numéro de table
                  </label>
                  <input
                    type="text"
                    value={tableName}
                    onChange={(e) => setTableName(e.target.value)}
                    placeholder="Ex: Table 3, Terrasse Jardin..."
                    className="w-full bg-zen-50 border border-zen-200 rounded-xl px-4 py-3 text-zen-900 placeholder:text-zen-400/60 focus:outline-none focus:ring-2 focus:ring-zen-500/30 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-zen-600 mb-1.5">
                    Capacité (personnes)
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={tableCapacity}
                    onChange={(e) => setTableCapacity(e.target.value)}
                    className="w-full bg-zen-50 border border-zen-200 rounded-xl px-4 py-3 text-zen-900 focus:outline-none focus:ring-2 focus:ring-zen-500/30 text-sm"
                  />
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => setShowTableModal(false)}
                  className="flex-1 py-2.5 rounded-xl font-bold text-zen-700 bg-zen-100 hover:bg-zen-200 transition-colors text-sm"
                >
                  Annuler
                </button>
                <button
                  onClick={handleSaveTable}
                  className="flex-1 bg-zen-600 text-white py-2.5 rounded-xl font-bold hover:bg-zen-700 transition-colors text-sm shadow-sm"
                >
                  {editingTable ? "Enregistrer" : "Créer"}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ─── TableCard ────────────────────────────────────────────────────────────────

function TableCard({
  table,
  status,
  activeOrderCount,
  total,
  onSelect,
  onEdit,
  onDelete,
}: {
  table: RestaurantTable;
  status: string;
  activeOrderCount: number;
  total: number;
  onSelect: () => void;
  onEdit: () => void;
  onDelete: () => void;
}) {
  const config = {
    free: {
      card: "bg-white border-zen-200 hover:border-zen-300",
      badge: "bg-zen-100 text-zen-500 border-zen-200",
      label: "Libre",
      glow: "",
    },
    active: {
      card: "bg-amber-50/60 border-amber-200 hover:border-amber-300",
      badge: "bg-amber-100 text-amber-700 border-amber-200",
      label: "En cours",
      glow: "",
    },
    ready: {
      card: "bg-emerald-50/80 border-emerald-300 shadow-emerald-200/60",
      badge: "bg-emerald-100 text-emerald-700 border-emerald-300 animate-pulse",
      label: "PRÊTE !",
      glow: "shadow-lg shadow-emerald-200",
    },
    billing: {
      card: "bg-purple-50/60 border-purple-200 hover:border-purple-300",
      badge: "bg-purple-100 text-purple-700 border-purple-200",
      label: "À encaisser",
      glow: "",
    },
  }[status] ?? {
    card: "bg-white border-zen-200",
    badge: "bg-zen-100 text-zen-500 border-zen-200",
    label: "Libre",
    glow: "",
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.92 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      className={cn(
        "relative rounded-2xl border-2 p-4 cursor-pointer transition-all group flex flex-col gap-3",
        config.card,
        config.glow
      )}
      onClick={onSelect}
    >
      {/* Edit / Delete buttons */}
      <div
        className="absolute top-2.5 right-2.5 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onEdit}
          className="p-1 bg-white/80 hover:bg-zen-100 rounded-lg text-zen-500 border border-zen-200 transition-colors"
        >
          <Edit3 className="w-3 h-3" />
        </button>
        <button
          onClick={onDelete}
          className="p-1 bg-white/80 hover:bg-red-50 rounded-lg text-red-400 border border-red-100 transition-colors"
        >
          <Trash2 className="w-3 h-3" />
        </button>
      </div>

      {/* Table name */}
      <div className="pr-14">
        <h3 className="font-black text-zen-900 text-base leading-tight">{table.name}</h3>
        <p className="text-[10px] text-zen-400 flex items-center gap-1 mt-0.5">
          <Users className="w-2.5 h-2.5" /> {table.capacity} places
        </p>
      </div>

      {/* Status badge */}
      <div className={cn("px-2 py-1 rounded-lg border text-[10px] font-black inline-flex w-fit", config.badge)}>
        {config.label}
      </div>

      {/* Order count + total if active */}
      {activeOrderCount > 0 && (
        <div className="pt-2 border-t border-current/10 space-y-1">
          <p className="text-[10px] text-zen-500 font-bold">
            {activeOrderCount} commande{activeOrderCount > 1 ? "s" : ""}
          </p>
          <p className="text-sm font-black text-zen-900">{`${total.toFixed(3)} TND`}</p>
        </div>
      )}
    </motion.div>
  );
}

// ─── OrderCard ────────────────────────────────────────────────────────────────

function OrderCard({
  order,
  onAdvance,
  onCancel,
  onPay,
}: {
  order: PlacedOrder;
  onAdvance: () => void;
  onCancel: () => void;
  onPay: () => void;
}) {
  const nextLabel: Record<string, string> = {
    new: "Mettre en préparation",
    cooking: "Marquer comme prête",
    ready: "Marquer comme servie",
  };

  return (
    <div
      className={cn(
        "rounded-2xl border p-4 space-y-3",
        order.status === "ready"
          ? "bg-emerald-50 border-emerald-200"
          : order.status === "delivered"
          ? "bg-purple-50 border-purple-200"
          : "bg-white border-zen-200"
      )}
    >
      {/* Top row */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-sm font-black text-zen-900">{order.id}</span>
          <span className={cn("text-[10px] font-bold px-2 py-0.5 rounded-lg border", STATUS_COLOR[order.status])}>
            {STATUS_LABEL[order.status]}
          </span>
        </div>
        <div className="flex items-center gap-1 text-[10px] text-zen-400">
          <Clock className="w-3 h-3" />
          {formatTime(order.createdAt)}
        </div>
      </div>

      {/* Items */}
      <div className="space-y-1">
        {order.items?.map((item, i) => (
          <div key={i} className="flex items-center justify-between text-xs text-zen-700">
            <span className="font-medium">
              {item.quantity}× {item.menuItem?.name || "Article"}
            </span>
            <span className="font-bold text-zen-600">{formatPrice(item.totalPrice)}</span>
          </div>
        ))}
        {order.globalComment && (
          <p className="text-[10px] text-amber-700 bg-amber-50 border border-amber-100 rounded-lg px-2 py-1 mt-1 font-medium">
            Note : {order.globalComment}
          </p>
        )}
      </div>

      {/* Total */}
      <div className="flex items-center justify-between border-t border-current/10 pt-2">
        <span className="text-xs text-zen-500 font-bold">Total</span>
        <span className="text-base font-black text-zen-900">{formatPrice(order.total)}</span>
      </div>

      {/* Payment method */}
      <div className="flex items-center gap-1.5 text-[10px] text-zen-500 font-bold">
        {order.paymentMethod === "cash" ? (
          <Banknote className="w-3.5 h-3.5 text-emerald-500" />
        ) : (
          <CreditCard className="w-3.5 h-3.5 text-blue-500" />
        )}
        {order.paymentMethod === "cash" ? "Espèces" : "Carte"}
      </div>

      {/* Actions */}
      <div className="flex gap-2 pt-1">
        {order.status !== "delivered" && order.status !== "rejected" && (
          <button
            onClick={onAdvance}
            className={cn(
              "flex-1 py-2 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all",
              order.status === "ready"
                ? "bg-emerald-600 text-white hover:bg-emerald-700 shadow-md shadow-emerald-600/20"
                : "bg-zen-100 text-zen-700 hover:bg-zen-200"
            )}
          >
            <ChefHat className="w-3.5 h-3.5" />
            {nextLabel[order.status] || "Avancer"}
          </button>
        )}

        {order.status === "delivered" && !order.paid && (
          <button
            onClick={onPay}
            className="flex-1 py-2 rounded-xl text-xs font-bold bg-purple-600 text-white hover:bg-purple-700 flex items-center justify-center gap-1.5 shadow-md shadow-purple-600/20"
          >
            <Receipt className="w-3.5 h-3.5" />
            Encaisser
          </button>
        )}

        {order.status !== "rejected" && !order.paid && (
          <button
            onClick={onCancel}
            className="py-2 px-3 rounded-xl text-xs font-bold bg-red-50 text-red-500 hover:bg-red-100 border border-red-100 transition-all"
          >
            <XCircle className="w-3.5 h-3.5" />
          </button>
        )}
      </div>
    </div>
  );
}
