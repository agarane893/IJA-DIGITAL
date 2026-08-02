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
import { MENU_ITEMS, MenuItem, CATEGORIES } from "@/lib/menuData";
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

  // --- Order builder: POS tile grid & draft state ---
  const [showOrderForm, setShowOrderForm] = useState(false);
  const [draftCartItems, setDraftCartItems] = useState<CartItem[]>([]);
  const [globalComment, setGlobalComment] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("boissons");

  // --- Beverage / Item Option Modal state for Server ---
  const [optionItem, setOptionItem] = useState<MenuItem | null>(null);
  const [optionChoices, setOptionChoices] = useState<Record<string, string>>({});
  const [optionComment, setOptionComment] = useState("");
  const [optionQty, setOptionQty] = useState(1);

  // --- Checkout / payment state ---
  const [checkoutOrder, setCheckoutOrder] = useState<PlacedOrder | null>(null);
  const [checkoutPaymentMethod, setCheckoutPaymentMethod] = useState<"cash" | "card">("cash");

  // --- History collapsible state ---
  const [showHistory, setShowHistory] = useState(false);

  // Add item from POS Carreaux Tile
  const handleItemTileClick = (item: MenuItem) => {
    if (item.options && item.options.length > 0) {
      const defaultOpts: Record<string, string> = {};
      item.options.forEach((opt) => {
        defaultOpts[opt.label] = opt.choices[0].label;
      });
      setOptionChoices(defaultOpts);
      setOptionComment("");
      setOptionQty(1);
      setOptionItem(item);
    } else {
      setDraftCartItems((prev) => {
        const existingIndex = prev.findIndex(
          (it) => it.menuItem.id === item.id && Object.keys(it.options || {}).length === 0 && !it.comment
        );
        if (existingIndex >= 0) {
          const updated = [...prev];
          const cur = updated[existingIndex];
          const newQty = cur.quantity + 1;
          updated[existingIndex] = {
            ...cur,
            quantity: newQty,
            totalPrice: cur.unitPrice * newQty,
          };
          return updated;
        } else {
          return [
            ...prev,
            {
              id: `${item.id}-${Date.now()}`,
              menuItem: item,
              quantity: 1,
              options: {},
              comment: "",
              unitPrice: item.price,
              totalPrice: item.price,
            },
          ];
        }
      });
    }
  };

  const handleConfirmOptionItem = () => {
    if (!optionItem) return;
    let unit = optionItem.price;
    if (optionItem.options) {
      optionItem.options.forEach((opt) => {
        const selectedLabel = optionChoices[opt.label];
        const choice = opt.choices.find((c) => c.label === selectedLabel);
        if (choice) unit += choice.priceDelta;
      });
    }

    const newItem: CartItem = {
      id: `${optionItem.id}-${Date.now()}`,
      menuItem: optionItem,
      quantity: optionQty,
      options: { ...optionChoices },
      comment: optionComment.trim(),
      unitPrice: unit,
      totalPrice: unit * optionQty,
    };

    setDraftCartItems((prev) => [...prev, newItem]);
    toast.success(`${optionItem.name} ajouté !`);
    setOptionItem(null);
  };

  const handleUpdateDraftQty = (cartItemId: string, delta: number) => {
    setDraftCartItems((prev) =>
      prev
        .map((it) => {
          if (it.id === cartItemId) {
            const nQty = it.quantity + delta;
            if (nQty <= 0) return null;
            return { ...it, quantity: nQty, totalPrice: it.unitPrice * nQty };
          }
          return it;
        })
        .filter(Boolean) as CartItem[]
    );
  };

  const handleRemoveDraftItem = (cartItemId: string) => {
    setDraftCartItems((prev) => prev.filter((it) => it.id !== cartItemId));
  };

  const draftTotal = draftCartItems.reduce((acc, it) => acc + it.totalPrice, 0);
  const draftCount = draftCartItems.reduce((acc, it) => acc + it.quantity, 0);

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

  const handleMarkPaid = (orderId: string, method: "cash" | "card") => {
    markAsPaid(orderId, activeUserName, method);
    toast.success("Commande marquée comme payée ✓");
    setCheckoutOrder(null);
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

  // Submit the manual order
  const handleSubmitManualOrder = () => {
    if (!selectedTable) return;
    if (draftCartItems.length === 0) {
      toast.error("Veuillez sélectionner au moins un article");
      return;
    }

    const orderId = `CMD-${Math.floor(100 + Math.random() * 900)}`;
    const newOrder: PlacedOrder = {
      id: orderId,
      tableId: selectedTable.id,
      items: draftCartItems,
      total: draftTotal,
      paymentMethod: "cash",
      globalComment,
      status: "new",
      createdAt: new Date().toISOString(),
    };

    addOrder(newOrder);
    toast.success(`Commande ${orderId} créée — ${draftCartItems.length} article(s)`);

    // Reset
    setDraftCartItems([]);
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
      <div className="flex items-center justify-between gap-4">
        <h1 className="font-heading text-3xl font-black text-zen-900 flex items-center gap-3">
          <LayoutDashboard className="w-8 h-8 text-zen-600" />
          Commandes
        </h1>

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
            <Plus className="w-4 h-4" /> Table
          </button>
        </div>
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
                    setDraftCartItems([]);
                    setOrderSearch("");
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
                      setDraftCartItems([]);
                      setOrderSearch("");
                    }}
                    className="text-xs font-bold text-white bg-zen-600 hover:bg-zen-700 px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5"
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
                  <div className="flex flex-col" style={{height: '80vh'}}>

                    {/* ── CATEGORY TABS ── big, easy to tap */}
                    <div className="flex overflow-x-auto border-b border-zinc-200 bg-white shrink-0">
                      {CATEGORIES.map((cat) => (
                        <button
                          key={cat.id}
                          type="button"
                          onClick={() => setSelectedCategory(cat.id)}
                          className={cn(
                            "flex flex-col items-center justify-center gap-1 px-5 py-3 shrink-0 border-b-[3px] transition-all font-black text-sm",
                            selectedCategory === cat.id
                              ? "border-zinc-900 text-zinc-900 bg-zinc-50"
                              : "border-transparent text-zinc-400 hover:text-zinc-700"
                          )}
                        >
                          <span className="text-2xl">{cat.emoji}</span>
                          <span className="text-[11px]">{cat.label}</span>
                        </button>
                      ))}
                    </div>

                    {/* ── ITEM TILES ── big 2-col grid */}
                    <div className="flex-1 overflow-y-auto p-3 bg-zinc-100">
                      <div className="grid grid-cols-2 gap-3">
                        {MENU_ITEMS.filter((item) =>
                          item.available && item.categoryId === selectedCategory
                        ).map((item) => {
                          const qty = draftCartItems
                            .filter((it) => it.menuItem.id === item.id)
                            .reduce((s, it) => s + it.quantity, 0);
                          return (
                            <button
                              key={item.id}
                              type="button"
                              onClick={() => handleItemTileClick(item)}
                              className={cn(
                                "relative flex flex-col items-center justify-center gap-2 rounded-2xl p-4 border-2 active:scale-95 transition-all text-center",
                                qty > 0
                                  ? "bg-zinc-900 border-zinc-900 text-white shadow-lg"
                                  : "bg-white border-zinc-200 text-zinc-900 hover:border-zinc-400"
                              )}
                            >
                              {qty > 0 && (
                                <span className="absolute -top-2.5 -right-2.5 bg-amber-400 text-zinc-900 font-black text-sm w-8 h-8 rounded-full flex items-center justify-center shadow-md">
                                  {qty}
                                </span>
                              )}
                              <span className="text-5xl">{item.emoji}</span>
                              <span className="font-black text-base leading-tight">{item.name}</span>
                              <span className={cn(
                                "font-black text-lg",
                                qty > 0 ? "text-amber-300" : "text-zinc-500"
                              )}>
                                {formatPrice(item.price)}
                              </span>
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* ── CART SUMMARY + VALIDATE ── */}
                    <div className="bg-white border-t-2 border-zinc-200 shrink-0">
                      {/* Items in cart - compact list */}
                      {draftCartItems.length > 0 && (
                        <div className="px-4 pt-3 pb-1 max-h-36 overflow-y-auto space-y-1.5">
                          {draftCartItems.map((cartIt) => (
                            <div key={cartIt.id} className="flex items-center justify-between bg-zinc-50 rounded-xl px-3 py-2">
                              <div className="flex-1 min-w-0">
                                <span className="font-black text-zinc-900 text-sm">{cartIt.quantity}× {cartIt.menuItem.name}</span>
                                {cartIt.options && Object.keys(cartIt.options).length > 0 && (
                                  <p className="text-xs text-zinc-500">{Object.values(cartIt.options).join(" · ")}</p>
                                )}
                              </div>
                              <div className="flex items-center gap-2 shrink-0">
                                <span className="font-black text-zinc-900 text-sm">{formatPrice(cartIt.totalPrice)}</span>
                                <button type="button" onClick={() => handleUpdateDraftQty(cartIt.id, -1)}
                                  className="w-7 h-7 rounded-lg bg-zinc-200 flex items-center justify-center font-black text-zinc-700 text-base hover:bg-zinc-300">−</button>
                                <button type="button" onClick={() => handleUpdateDraftQty(cartIt.id, 1)}
                                  className="w-7 h-7 rounded-lg bg-zinc-200 flex items-center justify-center font-black text-zinc-700 text-base hover:bg-zinc-300">+</button>
                                <button type="button" onClick={() => handleRemoveDraftItem(cartIt.id)}
                                  className="w-7 h-7 rounded-lg bg-red-100 text-red-500 flex items-center justify-center font-black text-base hover:bg-red-200">✕</button>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Commentaire global + boutons */}
                      <div className="p-3 space-y-2">
                        <input
                          type="text"
                          value={globalComment}
                          onChange={(e) => setGlobalComment(e.target.value)}
                          placeholder="💬 Commentaire (ex: allergie, sans sauce...)"
                          className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-4 py-2.5 text-sm font-medium text-zinc-900 focus:outline-none focus:ring-2 focus:ring-zinc-400/30"
                        />
                        <div className="flex gap-2">
                          <button type="button"
                            onClick={() => { setShowOrderForm(false); setDraftCartItems([]); }}
                            className="w-16 py-4 rounded-xl font-bold text-zinc-500 bg-zinc-100 hover:bg-zinc-200 transition-colors text-sm">
                            ✕
                          </button>
                          <button type="button"
                            onClick={handleSubmitManualOrder}
                            disabled={draftCartItems.length === 0}
                            className="flex-1 bg-zinc-900 disabled:opacity-30 text-white py-4 rounded-xl font-black text-lg hover:bg-black transition-colors shadow-md flex items-center justify-center gap-3">
                            <span>VALIDER</span>
                            {draftCartItems.length > 0 && (
                              <span className="bg-white/20 px-3 py-1 rounded-lg text-base">{formatPrice(draftTotal)}</span>
                            )}
                          </button>
                        </div>
                      </div>
                    </div>

                  </div>
                ) : (
                  <>
                    <div className="p-6 space-y-4">
                      {activeSelectedOrders.length === 0 ? (
                        <div className="text-center py-10 text-zen-400">
                          <ShoppingBag className="w-12 h-12 mx-auto mb-3 opacity-40" />
                          <p className="font-bold">Aucune commande active</p>
                          <p className="text-xs mt-1">Cette table est libre</p>
                        </div>
                      ) : (                        activeSelectedOrders.map((order) => (
                          <OrderCard
                            key={order.id}
                            order={order}
                            onAdvance={() => handleAdvanceStatus(order)}
                            onCancel={() => { setCancellingOrder(order); setCancelReason(""); }}
                            onPay={() => { setCheckoutOrder(order); setCheckoutPaymentMethod("cash"); }}
                          />
                        ))
                      )}
                    </div>

                    {/* History Collapsible */}
                    {historyOrders.length > 0 && (
                      <div className="px-6 pb-6 border-t border-zen-100/50 pt-4">
                        <button
                          type="button"
                          onClick={() => setShowHistory(!showHistory)}
                          className="w-full py-2 bg-zen-50 hover:bg-zen-100 border border-zen-200 rounded-xl text-xs font-bold text-zen-600 transition-colors flex items-center justify-between px-4"
                        >
                          <span>Historique de la table ({historyOrders.length})</span>
                          <span>{showHistory ? "▲ Masquer" : "▼ Afficher"}</span>
                        </button>
                        {showHistory && (
                          <div className="space-y-2 mt-3 max-h-48 overflow-y-auto pr-1">
                            {historyOrders.map((order) => (
                              <div
                                key={order.id}
                                className={cn(
                                  "flex items-center justify-between p-3 rounded-xl border text-xs bg-white",
                                  order.status === "rejected"
                                    ? "border-zinc-100 text-zinc-500"
                                    : "border-blue-100 text-blue-700"
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
                        )}
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

      {/* ─── CHECKOUT / PAYMENT MODAL ────────────────────────────── */}
      <AnimatePresence>
        {checkoutOrder && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white border border-zen-200 rounded-2xl w-full max-w-sm shadow-2xl p-6 space-y-5"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center border border-purple-200 animate-pulse">
                  <Receipt className="w-5 h-5 text-purple-600" />
                </div>
                <div>
                  <h3 className="font-bold text-zen-900">Encaisser la commande</h3>
                  <p className="text-xs text-zen-500">{checkoutOrder.id} · {formatPrice(checkoutOrder.total)}</p>
                </div>
              </div>

              <div className="space-y-2">
                <label className="block text-xs font-bold text-zen-600">
                  Sélectionner le mode de paiement
                </label>
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => setCheckoutPaymentMethod("cash")}
                    className={cn(
                      "flex-1 flex flex-col items-center justify-center gap-2 py-3 rounded-xl font-bold border transition-all",
                      checkoutPaymentMethod === "cash"
                        ? "bg-emerald-50 border-emerald-300 text-emerald-700 shadow-sm"
                        : "bg-white border-zen-200 text-zen-600 hover:bg-zen-50"
                    )}
                  >
                    <Banknote className="w-5 h-5 text-emerald-500" />
                    <span className="text-xs">Espèces</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setCheckoutPaymentMethod("card")}
                    className={cn(
                      "flex-1 flex flex-col items-center justify-center gap-2 py-3 rounded-xl font-bold border transition-all",
                      checkoutPaymentMethod === "card"
                        ? "bg-blue-50 border-blue-300 text-blue-700 shadow-sm"
                        : "bg-white border-zen-200 text-zen-600 hover:bg-zen-50"
                    )}
                  >
                    <CreditCard className="w-5 h-5 text-blue-500" />
                    <span className="text-xs">Carte</span>
                  </button>
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  onClick={() => setCheckoutOrder(null)}
                  className="flex-1 py-3 rounded-xl font-bold text-zen-700 bg-zen-100 hover:bg-zen-200 transition-colors text-sm"
                >
                  Retour
                </button>
                <button
                  onClick={() => handleMarkPaid(checkoutOrder.id, checkoutPaymentMethod)}
                  className="flex-1 bg-black text-white dark:bg-white dark:text-black py-3 rounded-xl font-black text-sm hover:opacity-90 transition-colors shadow-xl"
                >
                  Confirmer l&apos;encaissement
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

      {/* ─── OPTION MODAL (SIMPLE, GRAND, LISIBLE) ───────────── */}
      <AnimatePresence>
        {optionItem && (
          <div className="fixed inset-0 z-[70] flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/70">
            <motion.div
              initial={{ opacity: 0, y: 60 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 60 }}
              className="bg-white rounded-t-3xl sm:rounded-3xl w-full sm:max-w-sm shadow-2xl overflow-hidden"
            >
              {/* Header */}
              <div className="flex items-center justify-between p-5 bg-zinc-900 text-white">
                <div className="flex items-center gap-3">
                  <span className="text-4xl">{optionItem.emoji}</span>
                  <div>
                    <p className="font-black text-xl leading-tight">{optionItem.name}</p>
                    <p className="text-amber-300 font-black text-base">{formatPrice(optionItem.price)}</p>
                  </div>
                </div>
                <button type="button" onClick={() => setOptionItem(null)}
                  className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-5 space-y-5">
                {/* Option Groups — big buttons */}
                {optionItem.options?.map((opt) => (
                  <div key={opt.label}>
                    <p className="font-black text-base text-zinc-700 mb-2">{opt.label}</p>
                    <div className="grid grid-cols-2 gap-2">
                      {opt.choices.map((choice) => {
                        const isSelected = optionChoices[opt.label] === choice.label;
                        return (
                          <button key={choice.id} type="button"
                            onClick={() => setOptionChoices((prev) => ({ ...prev, [opt.label]: choice.label }))}
                            className={cn(
                              "py-3 px-4 rounded-2xl font-black text-sm border-2 transition-all text-left",
                              isSelected
                                ? "bg-zinc-900 border-zinc-900 text-white"
                                : "bg-zinc-50 border-zinc-200 text-zinc-800 hover:border-zinc-400"
                            )}
                          >
                            <span className="block">{choice.label}</span>
                            {choice.priceDelta > 0 && (
                              <span className={cn("text-xs font-black", isSelected ? "text-amber-300" : "text-zinc-500")}>
                                +{formatPrice(choice.priceDelta)}
                              </span>
                            )}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ))}

                {/* Commentaire */}
                <div>
                  <p className="font-black text-base text-zinc-700 mb-2">Commentaire</p>
                  <input type="text" value={optionComment}
                    onChange={(e) => setOptionComment(e.target.value)}
                    placeholder="Ex: sans sucre, avec glace..."
                    className="w-full bg-zinc-50 border-2 border-zinc-200 rounded-2xl px-4 py-3 text-base font-medium text-zinc-900 focus:outline-none focus:border-zinc-400"
                  />
                </div>

                {/* Quantité */}
                <div className="flex items-center justify-between">
                  <p className="font-black text-base text-zinc-700">Quantité</p>
                  <div className="flex items-center gap-3">
                    <button type="button" onClick={() => setOptionQty(Math.max(1, optionQty - 1))}
                      className="w-12 h-12 rounded-2xl bg-zinc-100 border-2 border-zinc-200 font-black text-zinc-900 text-2xl flex items-center justify-center hover:bg-zinc-200">−</button>
                    <span className="w-10 text-center font-black text-2xl text-zinc-900">{optionQty}</span>
                    <button type="button" onClick={() => setOptionQty(optionQty + 1)}
                      className="w-12 h-12 rounded-2xl bg-zinc-100 border-2 border-zinc-200 font-black text-zinc-900 text-2xl flex items-center justify-center hover:bg-zinc-200">+</button>
                  </div>
                </div>

                {/* Bouton confirmer */}
                <button type="button" onClick={handleConfirmOptionItem}
                  className="w-full bg-zinc-900 text-white font-black py-4 rounded-2xl text-lg hover:bg-black transition-colors shadow-lg flex items-center justify-center gap-3">
                  <span>Ajouter</span>
                  <span className="bg-white/20 px-3 py-1 rounded-xl text-base">
                    {formatPrice(
                      (optionItem.price + (optionItem.options?.reduce((sum, opt) => {
                        const sel = optionChoices[opt.label];
                        const choice = opt.choices.find((c) => c.label === sel);
                        return sum + (choice?.priceDelta || 0);
                      }, 0) || 0)) * optionQty
                    )}
                  </span>
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
      {/* Top row — no CMD ID shown to staff */}
      <div className="flex items-center justify-between">
        <span className={cn("text-xs font-black px-3 py-1 rounded-lg border", STATUS_COLOR[order.status])}>
          {STATUS_LABEL[order.status]}
        </span>
        <div className="flex items-center gap-1 text-[10px] text-zinc-400">
          <Clock className="w-3 h-3" />
          {formatTime(order.createdAt)}
        </div>
      </div>

      {/* Items */}
      <div className="space-y-2 py-1">
        {order.items?.map((item, i) => (
          <div key={i} className="text-xs text-zen-800 space-y-0.5 border-b border-zen-100/60 pb-1 last:border-0">
            <div className="flex items-center justify-between font-bold">
              <span className="text-zen-900 font-extrabold">
                {item.quantity}× {item.menuItem?.name || "Article"}
              </span>
              <span className="text-zen-700 font-black">{formatPrice(item.totalPrice)}</span>
            </div>
            {item.options && Object.keys(item.options).length > 0 && (
              <p className="text-[11px] text-zen-500 font-semibold pl-2">
                • {Object.entries(item.options).map(([k, v]) => `${v}`).join(", ")}
              </p>
            )}
            {item.comment && (
              <p className="text-[10px] text-amber-800 bg-amber-50 border border-amber-200/60 rounded px-1.5 py-0.5 font-bold pl-2 inline-block">
                💬 Commentaire : {item.comment}
              </p>
            )}
          </div>
        ))}
        {order.globalComment && (
          <p className="text-[11px] text-amber-800 bg-amber-50 border border-amber-200 rounded-lg px-2.5 py-1 mt-1 font-black">
            📝 Commentaire commande : {order.globalComment}
          </p>
        )}
      </div>

      {/* Total */}
      <div className="flex items-center justify-between border-t border-current/10 pt-2">
        <span className="text-xs text-zen-500 font-bold">Total</span>
        <span className="text-base font-black text-zen-900">{formatPrice(order.total)}</span>
      </div>
      {/* Payment method if paid */}
      {order.paid && (
        <div className="flex items-center gap-1.5 text-[10px] text-zen-500 font-bold">
          {order.paymentMethod === "cash" ? (
            <Banknote className="w-3.5 h-3.5 text-emerald-500" />
          ) : (
            <CreditCard className="w-3.5 h-3.5 text-blue-500" />
          )}
          Payé en {order.paymentMethod === "cash" ? "Espèces" : "Carte"}
        </div>
      )}

      {/* Actions */}
      <div className="flex gap-2 pt-1">
        {["new", "confirmed"].includes(order.status) && (
          <button
            onClick={onAdvance}
            className="flex-1 py-2.5 rounded-xl text-xs font-black bg-blue-600 text-white hover:bg-blue-500 flex items-center justify-center gap-1.5 transition-all shadow-md"
          >
            <ChefHat className="w-4 h-4" />
            En préparation
          </button>
        )}

        {order.status === "cooking" && (
          <button
            onClick={onAdvance}
            className="flex-1 py-2.5 rounded-xl text-xs font-black bg-emerald-600 text-white hover:bg-emerald-500 flex items-center justify-center gap-1.5 transition-all shadow-md"
          >
            <CheckCircle2 className="w-4 h-4" />
            Prête
          </button>
        )}

        {(order.status === "ready" || (order.status === "delivered" && !order.paid)) && (
          <button
            onClick={onPay}
            className="flex-1 py-3 px-4 rounded-xl text-sm font-black bg-black text-white dark:bg-white dark:text-black hover:opacity-90 flex items-center justify-center gap-2 shadow-xl transition-all"
          >
            <Receipt className="w-4 h-4" />
            Encaisser
          </button>
        )}

        {order.status !== "rejected" && !order.paid && (
          <button
            onClick={onCancel}
            className="py-2.5 px-3 rounded-xl text-xs font-bold bg-red-50 text-red-500 hover:bg-red-100 border border-red-100 transition-all shrink-0"
            title="Annuler la commande"
          >
            <XCircle className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  );
}
