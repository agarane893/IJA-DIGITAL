"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAdminMenuStore, ProductOptionGroup } from "@/lib/useAdminMenuStore";
import { useStocksStore } from "@/lib/useStocksStore";
import { useAuthStore } from "@/lib/useAuthStore";
import { Plus, Trash2, MenuSquare, CheckCircle2, XCircle, Search, Package, Settings2, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

export default function AdminMenuPage() {
  const { categories, products, addCategory, deleteCategory, addProduct, deleteProduct, toggleProductAvailability, addOptionGroup, deleteOptionGroup } = useAdminMenuStore();
  const { items: stockItems, addStockItem } = useStocksStore();
  const { user } = useAuthStore();
  const activeUserName = user ? `${user.name} (${user.role === 'manager' ? 'Manager' : 'Serveur'})` : "Système";

  const [newCatName, setNewCatName] = useState("");
  const [activeTab, setActiveTab] = useState<"products" | "categories">("products");

  // Product creation state
  const [newProdName, setNewProdName] = useState("");
  const [newProdPrice, setNewProdPrice] = useState("");
  const [newProdCategory, setNewProdCategory] = useState("");
  const [newProdAvailable, setNewProdAvailable] = useState(true);
  
  // Recipe builder state
  const [recipe, setRecipe] = useState<{ ingredientId: string; quantity: number; name: string; unit: string }[]>([]);
  const [compSearch, setCompSearch] = useState("");
  const [compQuantity, setCompQuantity] = useState("");
  const [compUnit, setCompUnit] = useState("g"); // for new component creation

  // Options state (for new product creation)
  const [newOptions, setNewOptions] = useState<ProductOptionGroup[]>([]);
  const [optGroupName, setOptGroupName] = useState("");
  const [optGroupRequired, setOptGroupRequired] = useState(false);
  const [optGroupChoices, setOptGroupChoices] = useState(""); // comma-separated

  // Options state (for existing product editing)
  const [editingOptionsProductId, setEditingOptionsProductId] = useState<string | null>(null);
  const [editOptGroupName, setEditOptGroupName] = useState("");
  const [editOptGroupRequired, setEditOptGroupRequired] = useState(false);
  const [editOptGroupChoices, setEditOptGroupChoices] = useState("");

  const filteredStockItems = stockItems.filter(item => 
    item.name.toLowerCase().includes(compSearch.toLowerCase()) &&
    !recipe.some(r => r.ingredientId === item.id)
  );
  
  const showCreateComponent = compSearch.trim().length > 0 && filteredStockItems.length === 0;

  const handleAddCategory = () => {
    if (!newCatName.trim()) return;
    const id = `c${Date.now()}`;
    addCategory({ id, name: newCatName.trim() });
    setNewCatName("");
  };

  const handleAddRecipeComponent = (stockItemId: string, name: string, unit: string) => {
    const qty = parseFloat(compQuantity) || 0;
    if (qty <= 0) return;
    
    setRecipe(prev => [...prev, { ingredientId: stockItemId, quantity: qty, name, unit }]);
    setCompSearch("");
    setCompQuantity("");
  };

  const handleCreateAndAddComponent = () => {
    if (!compSearch.trim() || !compUnit.trim()) return;
    const qty = parseFloat(compQuantity) || 0;
    if (qty <= 0) return;

    // 1. Add to global stock
    const newId = addStockItem(compSearch.trim(), compUnit.trim(), activeUserName);
    
    // 2. Add to local recipe
    setRecipe(prev => [...prev, { ingredientId: newId, quantity: qty, name: compSearch.trim(), unit: compUnit.trim() }]);
    
    // 3. Reset fields
    setCompSearch("");
    setCompQuantity("");
    setCompUnit("g");
  };

  const handleRemoveRecipeComponent = (idx: number) => {
    setRecipe(prev => prev.filter((_, i) => i !== idx));
  };

  const handleAddOptionToNew = () => {
    if (!optGroupName.trim() || !optGroupChoices.trim()) return;
    const choices = optGroupChoices.split(",").map(c => c.trim()).filter(Boolean);
    if (choices.length < 2) return;
    setNewOptions(prev => [...prev, { id: `opt-${Date.now()}`, name: optGroupName.trim(), required: optGroupRequired, choices }]);
    setOptGroupName("");
    setOptGroupRequired(false);
    setOptGroupChoices("");
  };

  const handleAddOptionToExisting = (productId: string) => {
    if (!editOptGroupName.trim() || !editOptGroupChoices.trim()) return;
    const choices = editOptGroupChoices.split(",").map(c => c.trim()).filter(Boolean);
    if (choices.length < 2) return;
    addOptionGroup(productId, { id: `opt-${Date.now()}`, name: editOptGroupName.trim(), required: editOptGroupRequired, choices });
    setEditOptGroupName("");
    setEditOptGroupRequired(false);
    setEditOptGroupChoices("");
  };

  const handleAddProduct = () => {
    if (!newProdName.trim() || !newProdPrice || !newProdCategory) return;
    
    const id = `p${Date.now()}`;
    addProduct({
      id,
      name: newProdName.trim(),
      price: parseFloat(newProdPrice),
      available: newProdAvailable,
      image: "https://via.placeholder.com/150",
      categoryId: newProdCategory,
      recipe: recipe.map(r => ({ ingredientId: r.ingredientId, quantity: r.quantity })),
      options: newOptions,
    });
    
    // Reset product form
    setNewProdName("");
    setNewProdPrice("");
    setNewProdCategory("");
    setNewProdAvailable(true);
    setRecipe([]);
    setNewOptions([]);
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto text-zinc-900 dark:text-white">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-heading text-3xl font-black text-zinc-900 dark:text-white flex items-center gap-3">
            <MenuSquare className="w-8 h-8 text-zinc-900 dark:text-white" />
            Gestion du Menu
          </h1>
          <p className="text-zinc-600 dark:text-zinc-400 mt-1 font-semibold text-sm">
            Gérez vos catégories, produits et recettes
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-zinc-200 dark:border-zinc-800 pb-4">
        <button
          onClick={() => setActiveTab("products")}
          className={`px-5 py-2.5 rounded-xl text-sm font-black transition-all min-w-[120px] ${
            activeTab === "products"
              ? "bg-black text-white dark:bg-white dark:text-black shadow-md"
              : "text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-800"
          }`}
        >
          Produits
        </button>
        <button
          onClick={() => setActiveTab("categories")}
          className={`px-5 py-2.5 rounded-xl text-sm font-black transition-all min-w-[120px] ${
            activeTab === "categories"
              ? "bg-black text-white dark:bg-white dark:text-black shadow-md"
              : "text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-800"
          }`}
        >
          Catégories
        </button>
      </div>

      <AnimatePresence mode="wait">
        {activeTab === "categories" && (
          <motion.div
            key="categories"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-6"
          >
            {/* Add Category */}
            <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 shadow-sm">
              <h2 className="text-lg font-bold text-zinc-900 dark:text-white mb-4">Ajouter une catégorie</h2>
              <div className="flex flex-col sm:flex-row gap-3">
                <input
                  type="text"
                  placeholder="Nom de la nouvelle catégorie"
                  value={newCatName}
                  onChange={(e) => setNewCatName(e.target.value)}
                  className="flex-1 bg-zinc-50 dark:bg-zinc-950 border border-zinc-300 dark:border-zinc-700 rounded-xl px-4 py-3 text-zinc-900 dark:text-white placeholder:text-zinc-400 dark:placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white min-h-[44px]"
                />
                <button
                  onClick={handleAddCategory}
                  className="flex items-center justify-center gap-2 bg-black text-white dark:bg-white dark:text-black px-6 py-3 rounded-xl font-bold hover:opacity-90 transition-all min-h-[44px]"
                >
                  <Plus className="w-5 h-5" /> Ajouter
                </button>
              </div>
            </div>

            {/* List Categories */}
            <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl overflow-hidden shadow-sm">
              <ul className="divide-y divide-zinc-200 dark:divide-zinc-800">
                {categories.map((c) => (
                  <li key={c.id} className="flex justify-between items-center px-6 py-4 hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition">
                    <span className="text-lg font-bold text-zinc-900 dark:text-white">{c.name}</span>
                    <button
                      onClick={() => deleteCategory(c.id)}
                      className="w-10 h-10 rounded-xl bg-red-50 dark:bg-red-950/40 text-red-600 dark:text-red-400 flex items-center justify-center hover:bg-red-100 dark:hover:bg-red-900/60 transition-all border border-red-200 dark:border-red-800/40"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </li>
                ))}
                {categories.length === 0 && (
                  <li className="px-6 py-8 text-center text-zinc-500 dark:text-zinc-400 font-semibold">Aucune catégorie existante.</li>
                )}
              </ul>
            </div>
          </motion.div>
        )}

        {activeTab === "products" && (
          <motion.div
            key="products"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-6"
          >
            {/* Add Product */}
            <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 shadow-sm">
              <h2 className="text-xl font-black text-zinc-900 dark:text-white mb-6">Nouveau Produit</h2>
              
              <div className="space-y-8">
                {/* Product Basics */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  <input
                    type="text"
                    placeholder="Nom du produit"
                    value={newProdName}
                    onChange={(e) => setNewProdName(e.target.value)}
                    className="bg-zinc-50 dark:bg-zinc-950 border border-zinc-300 dark:border-zinc-700 rounded-xl px-4 py-3 text-zinc-900 dark:text-white placeholder:text-zinc-400 dark:placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white min-h-[44px]"
                  />
                  <input
                    type="number"
                    placeholder="Prix (TND)"
                    value={newProdPrice}
                    onChange={(e) => setNewProdPrice(e.target.value)}
                    className="bg-zinc-50 dark:bg-zinc-950 border border-zinc-300 dark:border-zinc-700 rounded-xl px-4 py-3 text-zinc-900 dark:text-white placeholder:text-zinc-400 dark:placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white min-h-[44px]"
                  />
                  <select
                    value={newProdCategory}
                    onChange={(e) => setNewProdCategory(e.target.value)}
                    className="bg-zinc-50 dark:bg-zinc-950 border border-zinc-300 dark:border-zinc-700 rounded-xl px-4 py-3 text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white min-h-[44px] cursor-pointer font-semibold"
                  >
                    <option value="">Sélectionner une catégorie...</option>
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>

                {/* Recipe Builder */}
                <div className="border border-zinc-200 dark:border-zinc-800 rounded-xl p-5 bg-zinc-50 dark:bg-zinc-950">
                  <h3 className="text-xs font-black text-zinc-600 dark:text-zinc-400 uppercase tracking-wider mb-4 flex items-center gap-2">
                    <Package className="w-4 h-4" />
                    Recette & Composants (Optionnel)
                  </h3>

                  {/* Current Recipe Items */}
                  {recipe.length > 0 && (
                    <ul className="mb-4 space-y-2">
                      {recipe.map((r, idx) => (
                        <li key={idx} className="flex items-center justify-between bg-white dark:bg-zinc-900 px-4 py-2.5 rounded-lg border border-zinc-200 dark:border-zinc-800 shadow-sm">
                          <span className="text-zinc-900 dark:text-white font-bold">{r.name}</span>
                          <div className="flex items-center gap-4">
                            <span className="text-black dark:text-white font-black">{r.quantity} {r.unit}</span>
                            <button onClick={() => handleRemoveRecipeComponent(idx)} className="text-red-500 hover:text-red-700">
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </li>
                      ))}
                    </ul>
                  )}

                  {/* Add Component to Recipe */}
                  <div className="flex flex-col sm:flex-row gap-3">
                    <div className="relative flex-1">
                      <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
                      <input
                        type="text"
                        placeholder="Chercher ou créer un composant..."
                        value={compSearch}
                        onChange={(e) => setCompSearch(e.target.value)}
                        className="w-full bg-white dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 rounded-xl py-2.5 pl-10 pr-4 text-zinc-900 dark:text-white placeholder:text-zinc-400 dark:placeholder:text-zinc-500 focus:outline-none"
                      />
                      
                      {/* Dropdown for search results */}
                      {compSearch.trim().length > 0 && (
                        <div className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-xl shadow-2xl overflow-hidden z-10">
                          {filteredStockItems.map(item => (
                            <div key={item.id} className="px-4 py-3 hover:bg-zinc-100 dark:hover:bg-zinc-800 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between">
                              <span className="text-zinc-900 dark:text-white font-bold">{item.name} <span className="text-zinc-500 text-sm">({item.unit})</span></span>
                              <div className="flex items-center gap-2">
                                <input
                                  type="number"
                                  placeholder={`Qté`}
                                  value={compQuantity}
                                  onChange={e => setCompQuantity(e.target.value)}
                                  className="w-20 bg-zinc-50 dark:bg-zinc-950 border border-zinc-300 dark:border-zinc-700 rounded px-2 py-1 text-zinc-900 dark:text-white text-sm font-bold"
                                  onClick={e => e.stopPropagation()}
                                />
                                <button
                                  onClick={() => handleAddRecipeComponent(item.id, item.name, item.unit)}
                                  disabled={!compQuantity || parseFloat(compQuantity) <= 0}
                                  className="bg-black text-white dark:bg-white dark:text-black px-3 py-1 rounded-lg font-bold text-xs disabled:opacity-50"
                                >
                                  Ajouter
                                </button>
                              </div>
                            </div>
                          ))}

                          {showCreateComponent && (
                            <div className="p-4 bg-zinc-100 dark:bg-zinc-800/60 flex flex-col gap-3">
                              <p className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">"{compSearch}" n'existe pas dans le stock.</p>
                              <div className="flex items-center gap-2">
                                <input
                                  type="text"
                                  placeholder="Unité (ex: g, L)"
                                  value={compUnit}
                                  onChange={e => setCompUnit(e.target.value)}
                                  className="w-24 bg-white dark:bg-zinc-950 border border-zinc-300 dark:border-zinc-700 rounded-lg px-3 py-1.5 text-zinc-900 dark:text-white text-sm font-bold"
                                />
                                <input
                                  type="number"
                                  placeholder="Qté"
                                  value={compQuantity}
                                  onChange={e => setCompQuantity(e.target.value)}
                                  className="w-20 bg-white dark:bg-zinc-950 border border-zinc-300 dark:border-zinc-700 rounded-lg px-3 py-1.5 text-zinc-900 dark:text-white text-sm font-bold"
                                />
                                <button
                                  onClick={handleCreateAndAddComponent}
                                  disabled={!compQuantity || parseFloat(compQuantity) <= 0 || !compUnit.trim()}
                                  className="flex-1 bg-black text-white dark:bg-white dark:text-black px-3 py-1.5 rounded-lg font-bold text-xs disabled:opacity-50"
                                >
                                  Créer & Ajouter
                                </button>
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Options Builder */}
                <div className="border border-zinc-200 dark:border-zinc-800 rounded-xl p-5 bg-zinc-50 dark:bg-zinc-950">
                  <h3 className="text-xs font-black text-zinc-600 dark:text-zinc-400 uppercase tracking-wider mb-4 flex items-center gap-2">
                    <Settings2 className="w-4 h-4" /> Options de personnalisation (Optionnel)
                  </h3>
                  {/* Existing options */}
                  {newOptions.length > 0 && (
                    <ul className="mb-4 space-y-2">
                      {newOptions.map((opt, idx) => (
                        <li key={idx} className="flex items-center justify-between bg-white dark:bg-zinc-900 px-4 py-2.5 rounded-lg border border-zinc-200 dark:border-zinc-800 shadow-sm">
                          <div>
                            <span className="text-zinc-900 dark:text-white font-bold text-sm">{opt.name}</span>
                            {opt.required && <span className="ml-2 text-[10px] text-amber-700 dark:text-amber-300 font-bold bg-amber-100 dark:bg-amber-950/60 px-1.5 py-0.5 rounded border border-amber-300 dark:border-amber-700/50">Obligatoire</span>}
                            <p className="text-xs text-zinc-600 dark:text-zinc-400 font-semibold mt-0.5">{opt.choices.join(" / ")}</p>
                          </div>
                          <button onClick={() => setNewOptions(prev => prev.filter((_, i) => i !== idx))} className="text-red-500 hover:text-red-700">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </li>
                      ))}
                    </ul>
                  )}
                  {/* Add new option group */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <input type="text" placeholder="Nom du groupe (ex: Mousse)" value={optGroupName} onChange={(e) => setOptGroupName(e.target.value)}
                      className="bg-white dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 rounded-xl px-3 py-2 text-zinc-900 dark:text-white text-sm font-semibold placeholder:text-zinc-400 dark:placeholder:text-zinc-500 focus:outline-none" />
                    <input type="text" placeholder="Choix séparés par virgule (ex: Sans mousse, Avec mousse)" value={optGroupChoices} onChange={(e) => setOptGroupChoices(e.target.value)}
                      className="bg-white dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 rounded-xl px-3 py-2 text-zinc-900 dark:text-white text-sm font-semibold placeholder:text-zinc-400 dark:placeholder:text-zinc-500 focus:outline-none" />
                    <div className="flex gap-2 items-center">
                      <label className="flex items-center gap-2 text-xs font-bold text-zinc-700 dark:text-zinc-300 cursor-pointer">
                        <input type="checkbox" checked={optGroupRequired} onChange={(e) => setOptGroupRequired(e.target.checked)} className="rounded" /> Obligatoire
                      </label>
                      <button onClick={handleAddOptionToNew}
                        className="flex-1 bg-black text-white dark:bg-white dark:text-black rounded-xl px-3 py-2 font-bold text-xs hover:opacity-90 transition-all flex items-center justify-center gap-1">
                        <Plus className="w-4 h-4" /> Ajouter
                      </button>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between border-t border-zinc-200 dark:border-zinc-800 pt-6">
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={newProdAvailable}
                      onChange={(e) => setNewProdAvailable(e.target.checked)}
                      className="w-5 h-5 rounded border-zinc-300 dark:border-zinc-700 text-black dark:text-white focus:ring-black dark:focus:ring-white bg-transparent"
                    />
                    <span className="text-zinc-900 dark:text-white font-bold select-none">Produit Actif</span>
                  </label>
                  
                  <button
                    onClick={handleAddProduct}
                    className="flex items-center justify-center gap-2 bg-black text-white dark:bg-white dark:text-black px-8 py-3 rounded-xl font-black hover:opacity-90 transition-all min-h-[44px] shadow-lg"
                  >
                    <Plus className="w-5 h-5" /> Enregistrer Produit
                  </button>
                </div>
              </div>
            </div>

            {/* List Products */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {products.map((p) => {
                const category = categories.find(c => c.id === p.categoryId);
                
                return (
                  <motion.div
                    key={p.id}
                    layout
                    className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-5 flex flex-col gap-4 shadow-sm"
                  >
                    <div className="flex items-center justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-3 mb-1">
                          <h3 className="text-lg font-black text-zinc-900 dark:text-white truncate">{p.name}</h3>
                          {p.available ? (
                            <span className="inline-flex items-center gap-1 bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 text-[10px] font-black px-2 py-0.5 rounded-md border border-emerald-300 dark:border-emerald-700/50">
                              <CheckCircle2 className="w-3 h-3" /> Actif
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 bg-red-100 dark:bg-red-950/60 text-red-800 dark:text-red-300 text-[10px] font-black px-2 py-0.5 rounded-md border border-red-300 dark:border-red-700/50">
                              <XCircle className="w-3 h-3" /> Inactif
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-3 text-sm text-zinc-600 dark:text-zinc-400 font-bold">
                          <span className="font-black text-zinc-900 dark:text-white">{p.price.toFixed(3)} TND</span>
                          <span className="w-1.5 h-1.5 rounded-full bg-zinc-300 dark:bg-zinc-700" />
                          <span>{category?.name || "Sans catégorie"}</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <button
                          onClick={() => toggleProductAvailability(p.id)}
                          className={cn(
                            "px-3 py-2 rounded-xl text-xs font-black transition-all border min-w-[80px]",
                            p.available 
                              ? "bg-zinc-100 dark:bg-zinc-800 border-zinc-300 dark:border-zinc-700 text-zinc-900 dark:text-white hover:bg-zinc-200 dark:hover:bg-zinc-700" 
                              : "bg-emerald-600 border-emerald-600 text-white hover:bg-emerald-500"
                          )}
                        >
                          {p.available ? "Masquer" : "Activer"}
                        </button>
                        <button
                          onClick={() => deleteProduct(p.id)}
                          className="w-10 h-10 rounded-xl bg-red-50 dark:bg-red-950/40 text-red-600 dark:text-red-400 flex items-center justify-center hover:bg-red-100 dark:hover:bg-red-900/60 transition-all border border-red-200 dark:border-red-800/40 shrink-0"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                    
                    {/* Display Recipe summary */}
                    {p.recipe && p.recipe.length > 0 && (
                      <div className="pt-3 border-t border-zinc-200 dark:border-zinc-800">
                        <p className="text-xs text-zinc-500 dark:text-zinc-400 font-extrabold uppercase tracking-wider mb-2">Composants</p>
                        <div className="flex flex-wrap gap-2">
                          {p.recipe.map(r => {
                            const comp = stockItems.find(s => s.id === r.ingredientId);
                            return (
                              <span key={r.ingredientId} className="text-xs bg-zinc-100 dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 text-zinc-900 dark:text-white font-bold px-2.5 py-1 rounded-lg">
                                {comp ? comp.name : 'Inconnu'} <span className="font-black text-black dark:text-white ml-1">{r.quantity} {comp ? comp.unit : ''}</span>
                              </span>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    {/* Options section */}
                    <div className="pt-3 border-t border-zinc-200 dark:border-zinc-800">
                      <div className="flex items-center justify-between mb-2">
                        <p className="text-xs text-zinc-500 dark:text-zinc-400 font-extrabold uppercase tracking-wider flex items-center gap-1"><Settings2 className="w-3.5 h-3.5" /> Options ({(p.options || []).length})</p>
                        <button
                          onClick={() => setEditingOptionsProductId(editingOptionsProductId === p.id ? null : p.id)}
                          className="text-xs text-zinc-900 dark:text-white hover:underline flex items-center gap-1 font-extrabold"
                        >
                          <Plus className="w-3.5 h-3.5" /> Ajouter option
                        </button>
                      </div>
                      {/* Existing options */}
                      <div className="flex flex-wrap gap-2 mb-2">
                        {(p.options || []).map(opt => (
                          <div key={opt.id} className="flex items-center gap-1.5 bg-zinc-100 dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 rounded-lg px-2.5 py-1.5 group/opt">
                            <span className="text-xs font-black text-zinc-900 dark:text-white">{opt.name}:</span>
                            <span className="text-xs font-bold text-zinc-700 dark:text-zinc-300">{opt.choices.join(" / ")}</span>
                            {opt.required && <span className="text-[10px] text-amber-800 dark:text-amber-300 font-black bg-amber-100 dark:bg-amber-950/60 px-1 py-0.5 rounded border border-amber-300 dark:border-amber-700/50">*</span>}
                            <button onClick={() => deleteOptionGroup(p.id, opt.id)} className="ml-1 text-red-500 hover:text-red-700 opacity-0 group-hover/opt:opacity-100 transition-opacity">
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        ))}
                      </div>
                      {/* Add option form for this product */}
                      <AnimatePresence>
                        {editingOptionsProductId === p.id && (
                          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden">
                            <div className="bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl p-3 mt-2 grid grid-cols-1 sm:grid-cols-3 gap-2">
                              <input type="text" placeholder="Nom du groupe (ex: Mousse)" value={editOptGroupName} onChange={(e) => setEditOptGroupName(e.target.value)}
                                className="bg-white dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 rounded-lg px-3 py-2 text-zinc-900 dark:text-white text-xs font-semibold focus:outline-none" />
                              <input type="text" placeholder="Choix (ex: Sans mousse, Avec mousse)" value={editOptGroupChoices} onChange={(e) => setEditOptGroupChoices(e.target.value)}
                                className="bg-white dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 rounded-lg px-3 py-2 text-zinc-900 dark:text-white text-xs font-semibold focus:outline-none" />
                              <div className="flex gap-2 items-center">
                                <label className="flex items-center gap-1.5 text-[11px] font-bold text-zinc-700 dark:text-zinc-300 cursor-pointer">
                                  <input type="checkbox" checked={editOptGroupRequired} onChange={(e) => setEditOptGroupRequired(e.target.checked)} className="rounded" /> Obligatoire
                                </label>
                                <button onClick={() => handleAddOptionToExisting(p.id)}
                                  className="flex-1 bg-black text-white dark:bg-white dark:text-black rounded-lg px-3 py-2 font-bold text-xs hover:opacity-90 transition-all">
                                  Créer
                                </button>
                              </div>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  </motion.div>
                );
              })}
            </div>
            
            {products.length === 0 && (
              <div className="py-16 text-center border-2 border-dashed border-zinc-300 dark:border-zinc-700 rounded-3xl bg-white dark:bg-zinc-900">
                <MenuSquare className="w-12 h-12 text-zinc-400 dark:text-zinc-500 mx-auto mb-4" />
                <p className="text-lg font-bold text-zinc-900 dark:text-white">Aucun produit</p>
                <p className="text-zinc-500 dark:text-zinc-400 text-sm">Ajoutez votre premier produit ci-dessus</p>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
