"use client";

import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ShoppingCart,
  Users,
  Search,
  Plus,
  Minus,
  Trash2,
  CheckCircle2,
  Banknote,
  CreditCard,
  Receipt,
  X,
  Clock,
  MessageSquare,
  Coffee,
  Check,
  ChevronRight,
  Sparkles,
} from "lucide-react";
import { useTableStore, RestaurantTable } from "@/lib/useTableStore";
import { useOrderStore } from "@/lib/useOrderStore";
import { useAuthStore } from "@/lib/useAuthStore";
import { PlacedOrder, CartItem } from "@/lib/useCartStore";
import { MENU_ITEMS, MenuItem, CATEGORIES, CategoryId } from "@/lib/menuData";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

function formatPrice(n: number) {
  return `${n.toFixed(3)} TND`;
}

export default function PosTerminalPage() {
  const { tables } = useTableStore();
  const { orders, addOrder, updateOrder, markAsPaid } = useOrderStore();
  const { user } = useAuthStore();

  const activeUserName = user
    ? `${user.name} (${user.role === "manager" ? "Manager" : "Serveur"})`
    : "Serveur";

  // --- Active Table Selection ---
  const [selectedTableId, setSelectedTableId] = useState<string>(tables[0]?.id || "T1");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");

  // --- Current POS Ticket Draft Items ---
  const [draftItems, setDraftItems] = useState<CartItem[]>([]);
  const [globalComment, setGlobalComment] = useState("");

  // --- Option Modal for Server ---
  const [optionItem, setOptionItem] = useState<MenuItem | null>(null);
  const [optionChoices, setOptionChoices] = useState<Record<string, string>>({});
  const [optionComment, setOptionComment] = useState("");
  const [optionQty, setOptionQty] = useState(1);

  // --- Checkout Payment Modal ---
  const [showCheckout, setShowCheckout] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<"cash" | "card">("cash");

  // Orders grouped by table
  const ordersByTable = useMemo(() => {
    const map: Record<string, PlacedOrder[]> = {};
    for (const o of orders) {
      if (!map[o.tableId]) map[o.tableId] = [];
      map[o.tableId].push(o);
    }
    return map;
  }, [orders]);

  const activeTableOrders = useMemo(() => {
    const list = ordersByTable[selectedTableId] || [];
    return list.filter((o) => o.status !== "rejected" && !o.paid);
  }, [ordersByTable, selectedTableId]);

  const selectedTable = tables.find((t) => t.id === selectedTableId) || {
    id: selectedTableId,
    name: selectedTableId === "takeaway" ? "À emporter" : `Table ${selectedTableId}`,
    capacity: 2,
  };

  // Handle clicking an item tile ("carreau")
  const handleTileClick = (item: MenuItem) => {
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
      setDraftItems((prev) => {
        const existingIdx = prev.findIndex(
          (it) => it.menuItem.id === item.id && Object.keys(it.options || {}).length === 0 && !it.comment
        );
        if (existingIdx >= 0) {
          const copy = [...prev];
          const cur = copy[existingIdx];
          const newQty = cur.quantity + 1;
          copy[existingIdx] = {
            ...cur,
            quantity: newQty,
            totalPrice: cur.unitPrice * newQty,
          };
          return copy;
        }
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
      });
    }
  };

  const handleConfirmOptionItem = () => {
    if (!optionItem) return;
    let unit = optionItem.price;
    if (optionItem.options) {
      optionItem.options.forEach((opt) => {
        const selLabel = optionChoices[opt.label];
        const choice = opt.choices.find((c) => c.label === selLabel);
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

    setDraftItems((prev) => [...prev, newItem]);
    toast.success(`${optionItem.name} ajouté au ticket`);
    setOptionItem(null);
  };

  const updateDraftQty = (id: string, delta: number) => {
    setDraftItems((prev) =>
      prev
        .map((it) => {
          if (it.id === id) {
            const newQty = it.quantity + delta;
            if (newQty <= 0) return null;
            return { ...it, quantity: newQty, totalPrice: it.unitPrice * newQty };
          }
          return it;
        })
        .filter(Boolean) as CartItem[]
    );
  };

  const removeDraftItem = (id: string) => {
    setDraftItems((prev) => prev.filter((it) => it.id !== id));
  };

  const draftTotal = draftItems.reduce((acc, it) => acc + it.totalPrice, 0);
  const draftCount = draftItems.reduce((acc, it) => acc + it.quantity, 0);

  // Send Order to Kitchen / Create order
  const handleSendOrder = () => {
    if (draftItems.length === 0) {
      toast.error("Le ticket est vide ! Veuillez ajouter des articles.");
      return;
    }

    const newOrderId = `CMD-${Math.floor(100 + Math.random() * 900)}`;
    const newOrder: PlacedOrder = {
      id: newOrderId,
      tableId: selectedTable.id,
      items: draftItems,
      total: draftTotal,
      paymentMethod: "cash",
      globalComment,
      status: "new",
      createdAt: new Date().toISOString(),
    };

    addOrder(newOrder);
    toast.success(`Commande envoyée en cuisine pour ${selectedTable.name} !`);
    setDraftItems([]);
    setGlobalComment("");
  };

  // Quick checkout active order or draft order
  const handleConfirmCheckout = () => {
    if (draftItems.length > 0) {
      const newOrderId = `CMD-${Math.floor(100 + Math.random() * 900)}`;
      const newOrder: PlacedOrder = {
        id: newOrderId,
        tableId: selectedTable.id,
        items: draftItems,
        total: draftTotal,
        paymentMethod,
        globalComment,
        status: "delivered",
        paid: true,
        paidAt: new Date().toISOString(),
        paidBy: activeUserName,
        createdAt: new Date().toISOString(),
      };
      addOrder(newOrder);
      toast.success(`Commande ${selectedTable.name} encaissée (${formatPrice(draftTotal)}) ✓`);
      setDraftItems([]);
      setGlobalComment("");
      setShowCheckout(false);
      return;
    }

    if (activeTableOrders.length > 0) {
      activeTableOrders.forEach((o) => {
        markAsPaid(o.id, activeUserName, paymentMethod);
        updateOrder(o.id, { status: "delivered" });
      });
      toast.success(`Encaissement réussi pour ${selectedTable.name} ✓`);
      setShowCheckout(false);
    }
  };

  // Filtered menu items
  const filteredMenuItems = useMemo(() => {
    return MENU_ITEMS.filter((item) => {
      const matchCat = selectedCategory === "all" || item.categoryId === selectedCategory;
      const matchSearch =
        !searchQuery ||
        item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (item.nameAr && item.nameAr.includes(searchQuery));
      return item.available && matchCat && matchSearch;
    });
  }, [selectedCategory, searchQuery]);

  return (
    <div className="h-[calc(100vh-4rem)] flex flex-col lg:flex-row bg-zen-50 overflow-hidden text-zen-900 font-sans">
      
      {/* ─── LEFT/MAIN AREA: TABLE SELECTOR & ITEM CARREAUX ─────────── */}
      <div className="flex-1 flex flex-col min-w-0 border-r border-zen-200 bg-zen-50/60 overflow-hidden">
        
        {/* Top Header: Table Carreaux bar */}
        <div className="p-3 bg-white border-b border-zen-200 shadow-sm space-y-3 shrink-0">
          <div className="flex items-center justify-between gap-2">
            <h1 className="font-heading font-black text-xl text-zen-900 flex items-center gap-2">
              <ShoppingCart className="w-6 h-6 text-zen-900" />
              Caisse POS
            </h1>
            <span className="text-xs font-bold text-zen-600 bg-zen-100 border border-zen-200 px-3 py-1 rounded-full">
              👤 {activeUserName}
            </span>
          </div>

          {/* Table Selector Pills / Carreaux */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
            <button
              onClick={() => setSelectedTableId("takeaway")}
              className={cn(
                "px-3.5 py-2 rounded-xl text-xs font-black shrink-0 transition-all border flex items-center gap-1.5 shadow-sm",
                selectedTableId === "takeaway"
                  ? "bg-zen-900 text-white border-zen-900"
                  : "bg-white text-zen-700 border-zen-200 hover:border-zen-400"
              )}
            >
              <span>🛍️</span>
              <span>À emporter</span>
            </button>

            {tables.map((t) => {
              const activeCount = (ordersByTable[t.id] || []).filter((o) => !o.paid && o.status !== "rejected").length;
              const isSelected = selectedTableId === t.id;
              return (
                <button
                  key={t.id}
                  onClick={() => setSelectedTableId(t.id)}
                  className={cn(
                    "px-3.5 py-2 rounded-xl text-xs font-black shrink-0 transition-all border flex items-center gap-2 shadow-sm relative",
                    isSelected
                      ? "bg-zen-900 text-white border-zen-900"
                      : activeCount > 0
                      ? "bg-amber-50 text-amber-900 border-amber-300 hover:bg-amber-100"
                      : "bg-white text-zen-700 border-zen-200 hover:border-zen-400"
                  )}
                >
                  <span>🍽️</span>
                  <span>{t.name}</span>
                  {activeCount > 0 && (
                    <span className="w-2 h-2 rounded-full bg-amber-500 animate-ping"></span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Category Filter & Search Bar */}
        <div className="p-3 bg-white/80 border-b border-zen-200 space-y-2 shrink-0 backdrop-blur-md">
          <div className="relative">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Rechercher une boisson, un plat, café..."
              className="w-full bg-zen-50 border border-zen-200 rounded-xl pl-9 pr-4 py-2 text-sm font-semibold text-zen-900 placeholder:text-zen-400 focus:outline-none focus:ring-2 focus:ring-zen-500/20"
            />
            <Search className="w-4 h-4 text-zen-400 absolute left-3 top-1/2 -translate-y-1/2" />
          </div>

          {/* Category Tabs */}
          <div className="flex items-center gap-2 overflow-x-auto pb-0.5 no-scrollbar">
            <button
              onClick={() => setSelectedCategory("all")}
              className={cn(
                "px-3 py-1.5 rounded-lg text-xs font-black shrink-0 transition-all border",
                selectedCategory === "all"
                  ? "bg-zen-900 text-white border-zen-900"
                  : "bg-white text-zen-600 border-zen-200 hover:bg-zen-100"
              )}
            >
              Tous les articles
            </button>
            {CATEGORIES.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={cn(
                  "px-3 py-1.5 rounded-lg text-xs font-black shrink-0 flex items-center gap-1.5 transition-all border",
                  selectedCategory === cat.id
                    ? "bg-zen-900 text-white border-zen-900"
                    : "bg-white text-zen-600 border-zen-200 hover:bg-zen-100"
                )}
              >
                <span>{cat.emoji}</span>
                <span>{cat.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* CARREAUX GRID (Grille d'articles POS) */}
        <div className="flex-1 overflow-y-auto p-4">
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3.5">
            {filteredMenuItems.map((item) => {
              const inDraftCount = draftItems
                .filter((it) => it.menuItem.id === item.id)
                .reduce((sum, it) => sum + it.quantity, 0);

              return (
                <div
                  key={item.id}
                  onClick={() => handleTileClick(item)}
                  className={cn(
                    "relative bg-white border-2 rounded-2xl p-4 flex flex-col justify-between cursor-pointer transition-all active:scale-[0.96] hover:shadow-lg group min-h-[128px]",
                    inDraftCount > 0
                      ? "border-zen-900 bg-zen-900/5 shadow-md"
                      : "border-zen-200 hover:border-zen-400"
                  )}
                >
                  {/* Draft Count Badge */}
                  {inDraftCount > 0 && (
                    <span className="absolute -top-2.5 -right-2.5 bg-zen-900 text-white font-black text-xs w-7 h-7 rounded-full flex items-center justify-center shadow-lg border-2 border-white">
                      {inDraftCount}x
                    </span>
                  )}

                  {/* Top: Emoji & Drink Options badge */}
                  <div className="flex items-start justify-between gap-1 mb-2">
                    <span className="text-4xl select-none group-hover:scale-110 transition-transform">
                      {item.emoji}
                    </span>
                    {item.options && item.options.length > 0 && (
                      <span className="text-[10px] font-black text-amber-800 bg-amber-100 border border-amber-300 px-2 py-0.5 rounded-lg shadow-sm">
                        Options 🥤
                      </span>
                    )}
                  </div>

                  {/* Bottom: Item info & price */}
                  <div>
                    <h3 className="font-black text-sm text-zen-900 leading-snug line-clamp-2">
                      {item.name}
                    </h3>
                    <div className="flex items-center justify-between pt-2">
                      <span className="font-black text-xs text-zen-900 bg-zen-100 px-2.5 py-1 rounded-lg">
                        {formatPrice(item.price)}
                      </span>
                      <span className="w-7 h-7 rounded-xl bg-zen-900 text-white flex items-center justify-center font-bold text-sm shadow-sm group-hover:bg-black">
                        +
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* ─── RIGHT PANEL: ACTIVE TICKET & CHECKOUT ─────────────────── */}
      <div className="w-full lg:w-[380px] xl:w-[420px] bg-white border-l border-zen-200 flex flex-col h-full shadow-2xl shrink-0">
        
        {/* Ticket Header */}
        <div className="p-4 border-b border-zen-200 bg-zen-50 flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="font-heading font-black text-lg text-zen-900">
                {selectedTable.name}
              </h2>
              <span className="text-xs font-extrabold px-2 py-0.5 rounded bg-zen-200 text-zen-700">
                Ticket POS
              </span>
            </div>
            <p className="text-xs text-zen-500 font-medium">
              {draftCount} article{draftCount > 1 ? "s" : ""} dans le ticket
            </p>
          </div>
          {draftItems.length > 0 && (
            <button
              onClick={() => setDraftItems([])}
              className="text-xs font-bold text-red-500 hover:text-red-700 bg-red-50 hover:bg-red-100 px-2.5 py-1 rounded-lg border border-red-200 transition-colors"
            >
              Effacer
            </button>
          )}
        </div>

        {/* Ticket Items List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {/* Active un-paid orders for this table */}
          {activeTableOrders.length > 0 && (
            <div className="mb-4 space-y-2">
              <p className="text-xs font-black text-amber-800 uppercase tracking-widest bg-amber-50 border border-amber-200 px-3 py-1.5 rounded-xl">
                Commandes actives en table ({activeTableOrders.length})
              </p>
              {activeTableOrders.map((o) => (
                <div key={o.id} className="bg-amber-50/50 border border-amber-200/80 rounded-2xl p-3 space-y-2">
                  <div className="flex items-center justify-between text-xs font-black text-amber-900">
                    <span>{o.id}</span>
                    <span>{formatPrice(o.total)}</span>
                  </div>
                  <div className="space-y-1">
                    {o.items?.map((it, idx) => (
                      <div key={idx} className="text-xs text-zen-800 flex justify-between">
                        <span>{it.quantity}x {it.menuItem?.name}</span>
                        <span className="font-bold">{formatPrice(it.totalPrice)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Current draft items being added */}
          {draftItems.length === 0 ? (
            <div className="h-64 flex flex-col items-center justify-center text-center p-6 border-2 border-dashed border-zen-200 rounded-3xl bg-zen-50/50">
              <Coffee className="w-12 h-12 text-zen-300 mb-3" />
              <p className="font-extrabold text-zen-800 text-sm">Ticket vide</p>
              <p className="text-xs text-zen-400 mt-1 max-w-[200px]">
                Touchez les carreaux d&apos;articles à gauche pour ajouter des boissons ou des plats.
              </p>
            </div>
          ) : (
            draftItems.map((cartIt) => (
              <div
                key={cartIt.id}
                className="bg-zen-50 border border-zen-200 rounded-2xl p-3 space-y-2 shadow-sm"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1">
                    <h4 className="font-black text-sm text-zen-900 leading-tight">
                      {cartIt.menuItem.name}
                    </h4>
                    {/* Selected Drink / Item options */}
                    {cartIt.options && Object.keys(cartIt.options).length > 0 && (
                      <p className="text-xs text-zen-600 font-bold mt-0.5">
                        • {Object.entries(cartIt.options).map(([k, v]) => `${v}`).join(", ")}
                      </p>
                    )}
                    {/* Item comment */}
                    {cartIt.comment && (
                      <p className="text-[11px] text-amber-800 bg-amber-100/70 border border-amber-300 px-2 py-0.5 rounded-md font-bold mt-1 inline-block">
                        💬 Commentaire : {cartIt.comment}
                      </p>
                    )}
                  </div>

                  <span className="font-black text-sm text-zen-900 shrink-0">
                    {formatPrice(cartIt.totalPrice)}
                  </span>
                </div>

                {/* Stepper + Delete */}
                <div className="flex items-center justify-between pt-1 border-t border-zen-200/60">
                  <span className="text-[11px] font-bold text-zen-400">
                    {formatPrice(cartIt.unitPrice)} / unité
                  </span>

                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => updateDraftQty(cartIt.id, -1)}
                      className="w-7 h-7 rounded-lg bg-white border border-zen-300 flex items-center justify-center font-black text-zen-800 hover:bg-zen-100"
                    >
                      <Minus className="w-3.5 h-3.5" />
                    </button>
                    <span className="w-6 text-center font-black text-sm">{cartIt.quantity}</span>
                    <button
                      onClick={() => updateDraftQty(cartIt.id, 1)}
                      className="w-7 h-7 rounded-lg bg-white border border-zen-300 flex items-center justify-center font-black text-zen-800 hover:bg-zen-100"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => removeDraftItem(cartIt.id)}
                      className="w-7 h-7 rounded-lg bg-red-50 border border-red-200 text-red-500 flex items-center justify-center font-bold hover:bg-red-100 ml-1"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Global Comment & Actions Footer */}
        <div className="p-4 border-t border-zen-200 bg-white space-y-3">
          <input
            type="text"
            value={globalComment}
            onChange={(e) => setGlobalComment(e.target.value)}
            placeholder="Commentaire ticket / cuisine..."
            className="w-full bg-zen-50 border border-zen-200 rounded-xl px-3 py-2 text-xs font-semibold text-zen-900 focus:outline-none focus:ring-2 focus:ring-zen-500/20"
          />

          {/* Total Row */}
          <div className="flex items-center justify-between py-1">
            <span className="text-xs font-black text-zen-500 uppercase tracking-wider">Total Ticket</span>
            <span className="text-2xl font-black text-zen-900">
              {formatPrice(draftTotal + activeTableOrders.reduce((sum, o) => sum + o.total, 0))}
            </span>
          </div>

          {/* Action CTAs */}
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={handleSendOrder}
              disabled={draftItems.length === 0}
              className="py-3 px-3 rounded-2xl font-black text-xs bg-zen-900 text-white hover:bg-black disabled:opacity-40 transition-all shadow-md flex items-center justify-center gap-1.5"
            >
              <CheckCircle2 className="w-4 h-4" /> Envoyer Cuisine
            </button>
            <button
              onClick={() => setShowCheckout(true)}
              disabled={draftItems.length === 0 && activeTableOrders.length === 0}
              className="py-3 px-3 rounded-2xl font-black text-xs bg-emerald-600 text-white hover:bg-emerald-500 disabled:opacity-40 transition-all shadow-md flex items-center justify-center gap-1.5"
            >
              <Banknote className="w-4 h-4" /> Encaisser
            </button>
          </div>
        </div>
      </div>

      {/* ─── SERVER ITEM OPTION MODAL (BOISSONS & PLATS) ───────────── */}
      <AnimatePresence>
        {optionItem && (
          <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white border border-zen-200 rounded-3xl w-full max-w-md shadow-2xl p-6 space-y-5"
            >
              <div className="flex items-start justify-between border-b border-zen-100 pb-4">
                <div className="flex items-center gap-3">
                  <span className="text-4xl">{optionItem.emoji}</span>
                  <div>
                    <h3 className="font-heading text-lg font-black text-zen-900">
                      {optionItem.name}
                    </h3>
                    <p className="text-xs font-bold text-zen-500">
                      {formatPrice(optionItem.price)}
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setOptionItem(null)}
                  className="p-1.5 hover:bg-zen-100 rounded-full text-zen-400"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-4 max-h-[45vh] overflow-y-auto pr-1">
                {optionItem.options?.map((opt) => (
                  <div key={opt.label} className="space-y-2">
                    <label className="block text-xs font-black uppercase tracking-wider text-zen-700">
                      {opt.label}
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {opt.choices.map((choice) => {
                        const isSelected = optionChoices[opt.label] === choice.label;
                        return (
                          <button
                            key={choice.id}
                            type="button"
                            onClick={() =>
                              setOptionChoices((prev) => ({ ...prev, [opt.label]: choice.label }))
                            }
                            className={cn(
                              "px-3.5 py-2.5 rounded-xl text-xs font-bold border transition-all flex items-center gap-1.5",
                              isSelected
                                ? "bg-zen-900 text-white border-zen-900 shadow-sm"
                                : "bg-zen-50 text-zen-800 border-zen-200 hover:border-zen-400"
                            )}
                          >
                            <span>{choice.label}</span>
                            {choice.priceDelta > 0 && (
                              <span
                                className={cn(
                                  "text-[10px] font-black px-1.5 py-0.5 rounded",
                                  isSelected ? "bg-white/20 text-white" : "bg-zen-200 text-zen-900"
                                )}
                              >
                                +{formatPrice(choice.priceDelta)}
                              </span>
                            )}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ))}

                <div className="space-y-1.5 pt-2">
                  <label className="block text-xs font-black uppercase tracking-wider text-zen-700">
                    Commentaire
                  </label>
                  <input
                    type="text"
                    value={optionComment}
                    onChange={(e) => setOptionComment(e.target.value)}
                    placeholder="Ex: Sans sucre, avec palets de glace..."
                    className="w-full bg-zen-50 border border-zen-200 rounded-xl px-3.5 py-2.5 text-xs text-zen-900 focus:outline-none focus:ring-2 focus:ring-zen-500/20 font-semibold"
                  />
                </div>

                <div className="flex items-center justify-between pt-2">
                  <span className="text-xs font-black text-zen-700">Quantité</span>
                  <div className="flex items-center bg-zen-100 rounded-xl p-1 border border-zen-200">
                    <button
                      type="button"
                      onClick={() => setOptionQty(Math.max(1, optionQty - 1))}
                      className="w-8 h-8 rounded-lg bg-white font-black text-zen-900 shadow-sm hover:bg-zen-50 flex items-center justify-center"
                    >
                      -
                    </button>
                    <span className="w-8 text-center font-black text-sm text-zen-900">
                      {optionQty}
                    </span>
                    <button
                      type="button"
                      onClick={() => setOptionQty(optionQty + 1)}
                      className="w-8 h-8 rounded-lg bg-white font-black text-zen-900 shadow-sm hover:bg-zen-50 flex items-center justify-center"
                    >
                      +
                    </button>
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={handleConfirmOptionItem}
                className="w-full bg-zen-900 hover:bg-black text-white font-black py-3.5 rounded-2xl transition-all shadow-lg text-sm flex items-center justify-center gap-2"
              >
                <span>Ajouter à la commande</span>
                <span className="bg-white/20 px-2 py-0.5 rounded text-xs">
                  {formatPrice(
                    ((optionItem.price +
                      (optionItem.options?.reduce((sum, opt) => {
                        const sel = optionChoices[opt.label];
                        const choice = opt.choices.find((c) => c.label === sel);
                        return sum + (choice?.priceDelta || 0);
                      }, 0) || 0)) *
                      optionQty)
                  )}
                </span>
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ─── CHECKOUT MODAL ─────────────────────────────────────────── */}
      <AnimatePresence>
        {showCheckout && (
          <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white border border-zen-200 rounded-3xl w-full max-w-sm shadow-2xl p-6 space-y-5"
            >
              <div className="flex items-center gap-3 border-b border-zen-100 pb-4">
                <div className="w-10 h-10 bg-emerald-100 rounded-xl flex items-center justify-center border border-emerald-200">
                  <Receipt className="w-5 h-5 text-emerald-700" />
                </div>
                <div>
                  <h3 className="font-bold text-zen-900">Encaissement Caisse</h3>
                  <p className="text-xs text-zen-500 font-medium">
                    {selectedTable.name} · {formatPrice(draftTotal + activeTableOrders.reduce((sum, o) => sum + o.total, 0))}
                  </p>
                </div>
              </div>

              <div className="space-y-2">
                <label className="block text-xs font-black text-zen-700">
                  Mode de Paiement
                </label>
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => setPaymentMethod("cash")}
                    className={cn(
                      "flex-1 flex flex-col items-center justify-center gap-2 py-3 rounded-2xl font-black border transition-all",
                      paymentMethod === "cash"
                        ? "bg-emerald-50 border-emerald-300 text-emerald-700 shadow-sm"
                        : "bg-white border-zen-200 text-zen-600 hover:bg-zen-50"
                    )}
                  >
                    <Banknote className="w-6 h-6 text-emerald-600" />
                    <span className="text-xs">Espèces</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setPaymentMethod("card")}
                    className={cn(
                      "flex-1 flex flex-col items-center justify-center gap-2 py-3 rounded-2xl font-black border transition-all",
                      paymentMethod === "card"
                        ? "bg-blue-50 border-blue-300 text-blue-700 shadow-sm"
                        : "bg-white border-zen-200 text-zen-600 hover:bg-zen-50"
                    )}
                  >
                    <CreditCard className="w-6 h-6 text-blue-600" />
                    <span className="text-xs">Carte</span>
                  </button>
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  onClick={() => setShowCheckout(false)}
                  className="flex-1 py-3 rounded-xl font-bold text-zen-700 bg-zen-100 hover:bg-zen-200 transition-colors text-xs"
                >
                  Annuler
                </button>
                <button
                  onClick={handleConfirmCheckout}
                  className="flex-1 bg-zen-900 text-white py-3 rounded-xl font-black text-xs hover:bg-black transition-colors shadow-lg"
                >
                  Confirmer PAIEMENT
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
