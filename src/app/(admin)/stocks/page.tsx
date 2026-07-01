"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Package, 
  Plus, 
  Minus, 
  Search, 
  AlertCircle, 
  CheckCircle2, 
  History, 
  X, 
  Calendar, 
  User as UserIcon, 
  ChevronRight,
  TrendingDown,
  TrendingUp,
  Tag,
  Settings2,
  Trash2,
  Edit2
} from "lucide-react";
import { useStocksStore, StockItem, JourneySnapshot } from "@/lib/useStocksStore";
import { useAuthStore } from "@/lib/useAuthStore";
import { cn } from "@/lib/utils";

export default function StocksPage() {
  const { 
    items, 
    categories,
    transactions, 
    journeys, 
    addStock, 
    deductStock, 
    closeJourney, 
    addStockItem,
    updateStockItem,
    deleteStockItem,
    addStockCategory,
    updateStockCategory,
    deleteStockCategory
  } = useStocksStore();
  
  const currentUser = useAuthStore(state => state.user);
  const activeUserName = currentUser 
    ? `${currentUser.name} (${currentUser.role === 'manager' ? 'Manager' : 'Serveur'})` 
    : "Système";

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategoryId, setSelectedCategoryId] = useState("");
  
  // Modals / forms state
  const [showAddForm, setShowAddForm] = useState(false);
  const [showCategoriesModal, setShowCategoriesModal] = useState(false);
  
  // New Stock item state
  const [newItemName, setNewItemName] = useState("");
  const [newItemUnit, setNewItemUnit] = useState("");
  const [newItemInitialQty, setNewItemInitialQty] = useState("");
  const [newItemCategoryId, setNewItemCategoryId] = useState("");

  // Category manager state
  const [newCategoryName, setNewCategoryName] = useState("");
  const [editingCategoryId, setEditingCategoryId] = useState<string | null>(null);
  const [editingCategoryName, setEditingCategoryName] = useState("");

  const [customAmounts, setCustomAmounts] = useState<Record<string, string>>({});
  
  const [selectedItem, setSelectedItem] = useState<StockItem | null>(null);
  const [showJourneysModal, setShowJourneysModal] = useState(false);
  const [selectedJourney, setSelectedJourney] = useState<JourneySnapshot | null>(null);
  const [showCloseConfirmation, setShowCloseConfirmation] = useState(false);

  // Filters stock items by search term and selected category
  const filteredItems = items.filter((item) => {
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = !selectedCategoryId || item.categoryId === selectedCategoryId;
    return matchesSearch && matchesCategory;
  });

  const handleCustomAdjust = (itemId: string, type: "add" | "deduct") => {
    const val = parseFloat(customAmounts[itemId]);
    if (!isNaN(val) && val > 0) {
      if (type === "add") {
        addStock(itemId, val, activeUserName, "Ajustement manuel");
      } else {
        deductStock(itemId, val, activeUserName, "Ajustement manuel");
      }
      setCustomAmounts(prev => ({ ...prev, [itemId]: "" }));
    }
  };

  const handleAddNewItem = () => {
    if (!newItemName.trim() || !newItemUnit.trim()) return;
    const initialQty = parseFloat(newItemInitialQty) || 0;
    addStockItem(
      newItemName.trim(), 
      newItemUnit.trim(), 
      activeUserName, 
      initialQty, 
      newItemCategoryId || undefined
    );
    setNewItemName("");
    setNewItemUnit("");
    setNewItemInitialQty("");
    setNewItemCategoryId("");
    setShowAddForm(false);
  };

  const handleCloseJourney = () => {
    closeJourney(activeUserName);
    setShowCloseConfirmation(false);
  };

  // Category handlers
  const handleAddCategory = () => {
    if (!newCategoryName.trim()) return;
    addStockCategory(newCategoryName.trim());
    setNewCategoryName("");
  };

  const handleStartEditCategory = (id: string, currentName: string) => {
    setEditingCategoryId(id);
    setEditingCategoryName(currentName);
  };

  const handleSaveEditCategory = (id: string) => {
    if (!editingCategoryName.trim()) return;
    updateStockCategory(id, editingCategoryName.trim());
    setEditingCategoryId(null);
  };

  const handleDeleteItem = (id: string) => {
    if (confirm("Voulez-vous vraiment supprimer cet ingrédient du stock ?")) {
      deleteStockItem(id);
      setSelectedItem(null);
    }
  };

  const selectedItemTransactions = selectedItem
    ? (transactions || []).filter(tx => tx.itemId === selectedItem.id)
    : [];

  return (
    <div className="space-y-6 max-w-4xl mx-auto p-4 md:p-6 text-zen-900">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-heading text-3xl font-black text-zen-900 flex items-center gap-3">
            <Package className="w-8 h-8 text-zen-600" />
            Gestion des Stocks
          </h1>
          <p className="text-zen-600/60 mt-1 font-medium text-sm">
            Suivi des mouvements, historique détaillé et clôture de service
          </p>
        </div>
        
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setShowJourneysModal(true)}
            className="flex items-center gap-2 text-sm font-bold text-zen-700 bg-white border border-zen-200 hover:bg-zen-100 rounded-xl px-4 py-2.5 transition-all min-h-[44px] shadow-sm"
          >
            <History className="w-4 h-4 text-zen-600" /> Clôtures
          </button>
          
          <button
            onClick={() => setShowCategoriesModal(true)}
            className="flex items-center gap-2 text-sm font-bold text-zen-700 bg-white border border-zen-200 hover:bg-zen-100 rounded-xl px-4 py-2.5 transition-all min-h-[44px] shadow-sm"
          >
            <Tag className="w-4 h-4 text-zen-500" /> Catégories
          </button>
          
          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className="flex items-center gap-2 text-sm font-bold text-white bg-zen-600 hover:bg-zen-700 rounded-xl px-4 py-2.5 transition-all min-h-[44px] shadow-sm"
          >
            <Plus className="w-4 h-4" /> Ajouter
          </button>
          
          <button
            onClick={() => setShowCloseConfirmation(true)}
            className="flex items-center gap-2 text-sm font-bold text-white bg-red-600 hover:bg-red-700 rounded-xl px-4 py-2.5 transition-all min-h-[44px] shadow-sm"
          >
            Clôturer la journée
          </button>
        </div>
      </div>

      {/* Add Item form */}
      <AnimatePresence>
        {showAddForm && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <div className="bg-white border border-zen-200/80 rounded-2xl p-6 shadow-sm space-y-4">
              <h2 className="text-lg font-bold text-zen-900">Nouveau composant (Ingrédient)</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-3">
                <input
                  type="text"
                  placeholder="Nom (ex: Café grain...)"
                  value={newItemName}
                  onChange={(e) => setNewItemName(e.target.value)}
                  className="bg-zen-50 border border-zen-200 rounded-xl px-4 py-3 text-zen-900 placeholder:text-zen-500/40 focus:outline-none focus:ring-2 focus:ring-zen-500/30 min-h-[44px]"
                />
                <input
                  type="text"
                  placeholder="Unité (ex: kg, g, L...)"
                  value={newItemUnit}
                  onChange={(e) => setNewItemUnit(e.target.value)}
                  className="bg-zen-50 border border-zen-200 rounded-xl px-4 py-3 text-zen-900 placeholder:text-zen-500/40 focus:outline-none focus:ring-2 focus:ring-zen-500/30 min-h-[44px]"
                />
                <input
                  type="number"
                  placeholder="Stock Initial"
                  value={newItemInitialQty}
                  onChange={(e) => setNewItemInitialQty(e.target.value)}
                  className="bg-zen-50 border border-zen-200 rounded-xl px-4 py-3 text-zen-900 placeholder:text-zen-500/40 focus:outline-none focus:ring-2 focus:ring-zen-500/30 min-h-[44px]"
                />
                <select
                  value={newItemCategoryId}
                  onChange={(e) => setNewItemCategoryId(e.target.value)}
                  className="bg-zen-50 border border-zen-200 rounded-xl px-4 py-3 text-zen-900 focus:outline-none focus:ring-2 focus:ring-zen-500/30 min-h-[44px] text-sm font-semibold"
                >
                  <option value="">-- Catégorie --</option>
                  {(categories || []).map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name}
                    </option>
                  ))}
                </select>
                <button
                  onClick={handleAddNewItem}
                  className="flex items-center justify-center gap-2 bg-zen-600 text-white rounded-xl font-bold hover:bg-zen-700 transition-all min-h-[44px] shadow-sm sm:col-span-2 md:col-span-1"
                >
                  <Plus className="w-5 h-5" /> Créer
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Search & Category Filter bar */}
      <div className="space-y-3">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zen-400" />
          <input
            type="text"
            placeholder="Rechercher un ingrédient..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-white border border-zen-200 rounded-2xl py-3.5 pl-12 pr-4 text-zen-900 placeholder:text-zen-500/40 focus:outline-none focus:ring-2 focus:ring-zen-500/30 transition-all text-base shadow-sm"
          />
        </div>

        {/* Category Filters Pills */}
        <div className="flex flex-wrap gap-2 pt-1">
          <button
            onClick={() => setSelectedCategoryId("")}
            className={cn(
              "px-4 py-2 text-xs font-bold rounded-xl transition-all border",
              !selectedCategoryId
                ? "bg-zen-600 text-white border-transparent"
                : "bg-white text-zen-600 border-zen-200 hover:bg-zen-50"
            )}
          >
            Toutes
          </button>
          {(categories || []).map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategoryId(cat.id)}
              className={cn(
                "px-4 py-2 text-xs font-bold rounded-xl transition-all border",
                selectedCategoryId === cat.id
                  ? "bg-zen-600 text-white border-transparent"
                  : "bg-white text-zen-600 border-zen-200 hover:bg-zen-50"
              )}
            >
              {cat.name}
            </button>
          ))}
        </div>
      </div>

      {/* Stocks List - single column, stacked */}
      <div className="flex flex-col gap-4">
        {filteredItems.map((item) => {
          const remaining = Math.max(0, item.initialStock - item.usedToday);
          const percentage = item.initialStock > 0 ? (remaining / item.initialStock) * 100 : 0;
          
          let statusColor = "text-emerald-600";
          let statusBg = "bg-emerald-50";
          let statusBorder = "border-emerald-200/50";
          
          if (percentage < 20) {
            statusColor = "text-red-600";
            statusBg = "bg-red-50";
            statusBorder = "border-red-200/50";
          } else if (percentage < 50) {
            statusColor = "text-amber-600";
            statusBg = "bg-amber-50";
            statusBorder = "border-amber-200/50";
          }

          const categoryObj = categories.find(c => c.id === item.categoryId);

          return (
            <motion.div
              key={item.id}
              layout
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white/80 backdrop-blur-xl border border-zen-200/80 rounded-2xl p-5 shadow-sm hover:shadow-md transition-all group"
            >
              {/* Top row: name + badge */}
              <div className="flex items-start justify-between mb-2">
                <div>
                  <button 
                    onClick={() => setSelectedItem(item)}
                    className="text-lg font-bold text-zen-900 hover:text-zen-600 flex items-center gap-2 text-left group-hover:underline"
                  >
                    {item.name}
                    <ChevronRight className="w-4 h-4 text-zen-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </button>
                  {categoryObj && (
                    <span className="inline-flex items-center gap-1 text-[10px] font-bold text-zen-500 bg-zen-50 border border-zen-100 px-2 py-0.5 rounded-md mt-1">
                      <Tag className="w-2.5 h-2.5" /> {categoryObj.name}
                    </span>
                  )}
                </div>
                <div className={cn("px-2.5 py-1 rounded-lg border text-xs font-bold flex items-center gap-1.5 shrink-0 ml-3", statusBg, statusColor, statusBorder)}>
                  {percentage < 20 ? <AlertCircle className="w-3.5 h-3.5" /> : <CheckCircle2 className="w-3.5 h-3.5" />}
                  {Math.round(percentage)}%
                </div>
              </div>

              {/* Progress bar */}
              <div className="w-full bg-zen-100 h-2 rounded-full overflow-hidden mb-4">
                <div 
                  className={cn("h-full rounded-full transition-all duration-500", 
                    percentage < 20 ? "bg-red-500" : percentage < 50 ? "bg-amber-500" : "bg-emerald-500"
                  )}
                  style={{ width: `${Math.min(100, percentage)}%` }}
                />
              </div>

              {/* Stats row */}
              <div className="grid grid-cols-3 gap-2 bg-zen-50/50 rounded-xl p-3 border border-zen-100 mb-4">
                <div>
                  <p className="text-[10px] font-bold text-zen-500/50 uppercase tracking-wider mb-0.5">Initial</p>
                  <p className="text-sm font-bold text-zen-700">{item.initialStock} <span className="text-xs font-normal text-zen-500">{item.unit}</span></p>
                </div>
                <div>
                  <p className="text-[10px] font-bold text-zen-500/50 uppercase tracking-wider mb-0.5">Consommé</p>
                  <p className="text-sm font-bold text-zen-600">{item.usedToday} <span className="text-xs font-normal text-zen-500">{item.unit}</span></p>
                </div>
                <div>
                  <p className="text-[10px] font-bold text-zen-500/50 uppercase tracking-wider mb-0.5">Restant</p>
                  <p className={cn("text-base font-black", statusColor)}>{remaining} <span className="text-xs font-bold">{item.unit}</span></p>
                </div>
              </div>

              {/* Actions row */}
              <div className="flex items-center justify-between gap-3 pt-3 border-t border-zen-100">
                <button 
                  onClick={() => setSelectedItem(item)}
                  className="text-xs font-bold text-zen-600 hover:text-zen-900 flex items-center gap-1.5"
                >
                  <History className="w-3.5 h-3.5" /> Historique / Config
                </button>

                <div className="flex items-center bg-zen-50 border border-zen-200 rounded-xl p-1">
                  <input
                    type="number"
                    min="0"
                    step="0.1"
                    placeholder="Qté"
                    value={customAmounts[item.id] || ""}
                    onChange={(e) => setCustomAmounts(prev => ({ ...prev, [item.id]: e.target.value }))}
                    className="w-16 bg-transparent text-zen-900 text-center font-bold text-sm focus:outline-none placeholder:text-zen-400"
                  />
                  <div className="w-px h-6 bg-zen-200 mx-1" />
                  <button
                    onClick={() => handleCustomAdjust(item.id, "add")}
                    className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 hover:bg-emerald-100 transition-all flex items-center justify-center active:scale-95"
                    title="Ajouter au stock"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleCustomAdjust(item.id, "deduct")}
                    className="w-8 h-8 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 transition-all flex items-center justify-center active:scale-95 ml-1"
                    title="Retirer du stock"
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </motion.div>
          );
        })}

        {filteredItems.length === 0 && (
          <div className="py-16 text-center border border-dashed border-zen-200 rounded-3xl bg-white/50">
            <Package className="w-12 h-12 text-zen-400 mx-auto mb-4" />
            <p className="text-lg font-bold text-zen-800">Aucun ingrédient trouvé</p>
            <p className="text-zen-500 text-sm mt-1">Modifiez votre recherche ou vos filtres</p>
          </div>
        )}
      </div>

      {/* CATEGORIES MANAGEMENT MODAL */}
      <AnimatePresence>
        {showCategoriesModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white border border-zen-200 rounded-2xl w-full max-w-md shadow-2xl p-6 relative flex flex-col max-h-[80vh]"
            >
              <button 
                onClick={() => setShowCategoriesModal(false)}
                className="absolute top-4 right-4 p-1.5 hover:bg-zen-100 rounded-full text-zen-400"
              >
                <X className="w-5 h-5" />
              </button>

              <h2 className="text-xl font-bold text-zen-900 mb-4 flex items-center gap-2">
                <Tag className="w-5 h-5 text-zen-600" />
                Catégories de Stock
              </h2>

              {/* Add category input */}
              <div className="flex gap-2 mb-4 shrink-0">
                <input
                  type="text"
                  placeholder="Nouvelle catégorie (ex: Épices...)"
                  value={newCategoryName}
                  onChange={(e) => setNewCategoryName(e.target.value)}
                  className="flex-1 bg-zen-50 border border-zen-200 rounded-xl px-4 py-2.5 text-zen-900 text-sm focus:outline-none focus:ring-2 focus:ring-zen-500/20"
                />
                <button
                  onClick={handleAddCategory}
                  className="bg-zen-600 hover:bg-zen-700 text-white rounded-xl px-4 font-bold text-sm transition-all"
                >
                  Ajouter
                </button>
              </div>

              {/* Categories list */}
              <div className="flex-1 overflow-y-auto space-y-2 pr-1">
                {(categories || []).map((cat) => (
                  <div 
                    key={cat.id} 
                    className="flex items-center justify-between p-3 rounded-xl border border-zen-100 bg-zen-50/30 text-sm"
                  >
                    {editingCategoryId === cat.id ? (
                      <div className="flex items-center gap-2 w-full">
                        <input
                          type="text"
                          value={editingCategoryName}
                          onChange={(e) => setEditingCategoryName(e.target.value)}
                          className="flex-1 bg-white border border-zen-200 rounded-lg px-2.5 py-1 text-zen-900 focus:outline-none"
                        />
                        <button
                          onClick={() => handleSaveEditCategory(cat.id)}
                          className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold px-3 py-1.5 rounded-lg"
                        >
                          Sauver
                        </button>
                        <button
                          onClick={() => setEditingCategoryId(null)}
                          className="text-zen-500 hover:bg-zen-100 text-xs px-2 py-1.5 rounded-lg"
                        >
                          Annuler
                        </button>
                      </div>
                    ) : (
                      <>
                        <span className="font-bold text-zen-800">{cat.name}</span>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleStartEditCategory(cat.id, cat.name)}
                            className="p-1.5 text-zen-500 hover:bg-zen-100 rounded-lg transition-all"
                            title="Modifier"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => deleteStockCategory(cat.id)}
                            className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition-all"
                            title="Supprimer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ITEM TRANSACTION HISTORY & CONFIG MODAL */}
      <AnimatePresence>
        {selectedItem && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white border border-zen-200 rounded-2xl w-full max-w-xl shadow-2xl overflow-hidden flex flex-col max-h-[80vh]"
            >
              <div className="px-6 py-4 border-b border-zen-100 flex justify-between items-center bg-zen-50">
                <div>
                  <h3 className="font-heading text-lg font-bold text-zen-900">{selectedItem.name}</h3>
                  <p className="text-xs text-zen-500 mt-0.5">Configuration & Mouvements</p>
                </div>
                <button 
                  onClick={() => setSelectedItem(null)}
                  className="p-2 hover:bg-zen-100 rounded-full transition-colors text-zen-500"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-6 overflow-y-auto space-y-4 flex-1">
                
                {/* Configuration section */}
                <div className="bg-zen-50/50 border border-zen-100 rounded-xl p-4 space-y-3">
                  <h4 className="text-xs font-black text-zen-500 uppercase tracking-wider">Configuration de l&apos;Ingrédient</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[10px] font-bold text-zen-500 mb-1">Catégorie</label>
                      <select
                        value={selectedItem.categoryId || ""}
                        onChange={(e) => updateStockItem(selectedItem.id, { categoryId: e.target.value || undefined })}
                        className="w-full bg-white border border-zen-200 rounded-lg p-2 text-xs font-semibold text-zen-900 focus:outline-none"
                      >
                        <option value="">Aucune</option>
                        {(categories || []).map((cat) => (
                          <option key={cat.id} value={cat.id}>
                            {cat.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold text-zen-500 mb-1">Unité de mesure</label>
                      <input
                        type="text"
                        value={selectedItem.unit}
                        onChange={(e) => updateStockItem(selectedItem.id, { unit: e.target.value })}
                        className="w-full bg-white border border-zen-200 rounded-lg p-2 text-xs font-semibold text-zen-900 focus:outline-none"
                      />
                    </div>
                  </div>

                  <div className="pt-2 flex justify-end">
                    <button
                      onClick={() => handleDeleteItem(selectedItem.id)}
                      className="flex items-center gap-1 text-[10px] font-bold text-red-600 hover:bg-red-50 px-3 py-1.5 rounded-lg border border-red-100 transition-all"
                    >
                      <Trash2 className="w-3 h-3" /> Supprimer le composant
                    </button>
                  </div>
                </div>

                {/* Movements list */}
                <div className="space-y-2">
                  <h4 className="text-xs font-black text-zen-500 uppercase tracking-wider">Mouvements de stock</h4>
                  {selectedItemTransactions.length === 0 ? (
                    <div className="text-center py-8 text-zen-500">
                      <History className="w-10 h-10 mx-auto mb-2 text-zen-300" />
                      <p className="font-bold text-xs">Aucun mouvement enregistré</p>
                    </div>
                  ) : (
                    selectedItemTransactions.map((tx) => {
                      const isAddition = tx.type === "add" || tx.type === "initial";
                      return (
                        <div 
                          key={tx.id} 
                          className={cn(
                            "flex items-start gap-4 p-4 rounded-xl border text-xs",
                            isAddition ? "bg-emerald-50/30 border-emerald-100" : "bg-red-50/20 border-red-100/60"
                          )}
                        >
                          <div className={cn(
                            "w-8 h-8 rounded-lg flex items-center justify-center shrink-0 border",
                            isAddition 
                              ? "bg-emerald-100 border-emerald-200 text-emerald-700" 
                              : "bg-red-100 border-red-200 text-red-700"
                          )}>
                            {isAddition ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                          </div>
                          
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between gap-2">
                              <span className="font-bold text-zen-900">
                                {isAddition ? "Stock Ajouté" : "Stock Déduit"}
                              </span>
                              <span className="text-zen-400 font-mono">
                                {new Date(tx.date).toLocaleDateString([], { day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" })}
                              </span>
                            </div>
                            <p className="text-zen-600 mt-1 font-semibold">{tx.details || "Ajustement"}</p>
                            <div className="flex items-center gap-1.5 mt-2 text-[10px] text-zen-500 font-bold">
                              <UserIcon className="w-3 h-3 text-zen-400" />
                              Par : {tx.userName}
                            </div>
                          </div>

                          <div className={cn("text-base font-black shrink-0 text-right", isAddition ? "text-emerald-700" : "text-red-700")}>
                            {isAddition ? "+" : "-"}{tx.quantity} <span className="text-xs font-normal text-zen-500">{selectedItem.unit}</span>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>

              <div className="p-4 bg-zen-50 border-t border-zen-100 flex items-center justify-between text-sm shrink-0">
                <span className="font-bold text-zen-500">Stock Actuel Restant :</span>
                <span className="text-lg font-black text-zen-800">
                  {Math.max(0, selectedItem.initialStock - selectedItem.usedToday)} {selectedItem.unit}
                </span>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* CLÔTURES PASSÉES MODAL */}
      <AnimatePresence>
        {showJourneysModal && (
          <div className="fixed inset-0 z-40 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white border border-zen-200 rounded-2xl w-full max-w-3xl shadow-2xl overflow-hidden flex flex-col h-[80vh]"
            >
              <div className="px-6 py-4 border-b border-zen-100 flex justify-between items-center bg-zen-50">
                <div>
                  <h3 className="font-heading text-lg font-bold text-zen-900">Rapports de Clôtures</h3>
                  <p className="text-xs text-zen-500 mt-0.5">Historique des sessions fermées</p>
                </div>
                <button 
                  onClick={() => { setShowJourneysModal(false); setSelectedJourney(null); }}
                  className="p-2 hover:bg-zen-100 rounded-full transition-colors text-zen-500"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="flex flex-1 overflow-hidden">
                <div className="w-1/3 border-r border-zen-100 overflow-y-auto p-4 space-y-2">
                  <h4 className="text-[10px] font-bold text-zen-400 uppercase tracking-wider mb-2">Sessions</h4>
                  {(journeys || []).length === 0 ? (
                    <p className="text-xs text-zen-500 text-center py-8">Aucune clôture</p>
                  ) : (
                    journeys.map((j) => (
                      <button
                        key={j.id}
                        onClick={() => setSelectedJourney(j)}
                        className={cn(
                          "w-full text-left p-3 rounded-xl border text-xs transition-all",
                          selectedJourney?.id === j.id
                            ? "bg-zen-500/10 border-zen-500/30 font-bold text-zen-900"
                            : "bg-zen-50/50 border-zen-100 text-zen-600 hover:bg-zen-100/60"
                        )}
                      >
                        <div className="font-mono font-bold mb-1">
                          {new Date(j.closedAt).toLocaleDateString([], { day: "2-digit", month: "2-digit" })} à {new Date(j.closedAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                        </div>
                        <div className="text-[10px] text-zen-400 flex items-center gap-1">
                          <UserIcon className="w-3 h-3" /> {j.closedBy}
                        </div>
                      </button>
                    ))
                  )}
                </div>

                <div className="flex-1 overflow-y-auto p-6 bg-zen-50/30">
                  {selectedJourney ? (
                    <div className="space-y-6">
                      <div className="border-b border-zen-200 pb-4">
                        <h4 className="font-heading font-black text-xl text-zen-900">Clôture du {new Date(selectedJourney.closedAt).toLocaleDateString()}</h4>
                        <div className="flex flex-wrap items-center gap-4 text-xs text-zen-500 mt-2 font-semibold">
                          <span className="flex items-center gap-1"><Calendar className="w-3.5 h-3.5" /> {new Date(selectedJourney.closedAt).toLocaleTimeString()}</span>
                          <span className="flex items-center gap-1"><UserIcon className="w-3.5 h-3.5" /> {selectedJourney.closedBy}</span>
                        </div>
                      </div>

                      <div className="bg-white border border-zen-200 rounded-xl overflow-hidden shadow-sm">
                        <table className="w-full text-left text-xs border-collapse">
                          <thead>
                            <tr className="bg-zen-50 text-zen-600/70 border-b border-zen-100">
                              <th className="p-3 font-bold">Composant</th>
                              <th className="p-3 font-bold text-center">Initial</th>
                              <th className="p-3 font-bold text-center">Utilisé</th>
                              <th className="p-3 font-bold text-center">Final</th>
                            </tr>
                          </thead>
                          <tbody>
                            {selectedJourney.items.map((it) => (
                              <tr key={it.itemId} className="border-b border-zen-100 hover:bg-zen-50/50">
                                <td className="p-3 font-bold text-zen-900">{it.itemName}</td>
                                <td className="p-3 text-center text-zen-500">{it.initialStock} {it.unit}</td>
                                <td className="p-3 text-center text-zen-600">{it.usedToday} {it.unit}</td>
                                <td className="p-3 text-center font-bold text-zen-800">{it.finalStock} {it.unit}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center h-full text-zen-400/50 py-20">
                      <History className="w-16 h-16 mb-4 stroke-1 opacity-60" />
                      <p className="font-bold">Sélectionnez une clôture</p>
                      <p className="text-xs text-center px-6 mt-1">Choisissez un rapport dans la liste de gauche.</p>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* CONFIRMATION CLÔTURE */}
      <AnimatePresence>
        {showCloseConfirmation && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white border border-zen-200 rounded-2xl w-full max-w-md shadow-2xl p-6 text-center"
            >
              <div className="w-14 h-14 bg-red-100 rounded-full flex items-center justify-center text-red-600 mx-auto mb-4 border border-red-200">
                <AlertCircle className="w-8 h-8" />
              </div>

              <h3 className="font-heading text-lg font-black text-zen-900 mb-2">Clôturer la journée ?</h3>
              <p className="text-sm text-zen-600/70 mb-6">
                Cette action va enregistrer l'inventaire actuel et réinitialiser les compteurs d'usage à zéro pour demain.
              </p>

              <div className="bg-zen-50 rounded-xl p-3 mb-6 text-xs border border-zen-100 text-left">
                <div className="font-bold text-zen-500">Responsable</div>
                <div className="text-zen-800 flex items-center gap-1 mt-1 font-bold">
                  <UserIcon className="w-3 h-3 text-zen-400" />
                  {activeUserName}
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setShowCloseConfirmation(false)}
                  className="flex-1 py-2.5 rounded-xl font-bold text-zen-700 bg-zen-100 hover:bg-zen-200 transition-colors"
                >
                  Annuler
                </button>
                <button
                  onClick={handleCloseJourney}
                  className="flex-1 bg-red-600 text-white py-2.5 rounded-xl font-bold hover:bg-red-700 transition-colors shadow-lg shadow-red-600/20"
                >
                  Confirmer la clôture
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
