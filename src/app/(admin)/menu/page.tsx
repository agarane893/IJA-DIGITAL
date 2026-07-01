"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAdminMenuStore } from "@/lib/useAdminMenuStore";
import { useStocksStore } from "@/lib/useStocksStore";
import { useAuthStore } from "@/lib/useAuthStore";
import { Plus, Trash2, MenuSquare, CheckCircle2, XCircle, Search, Package } from "lucide-react";
import { cn } from "@/lib/utils";

export default function AdminMenuPage() {
  const { categories, products, addCategory, deleteCategory, addProduct, deleteProduct, toggleProductAvailability } = useAdminMenuStore();
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
      recipe: recipe.map(r => ({ ingredientId: r.ingredientId, quantity: r.quantity }))
    });
    
    // Reset product form
    setNewProdName("");
    setNewProdPrice("");
    setNewProdCategory("");
    setNewProdAvailable(true);
    setRecipe([]);
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-heading text-3xl font-black text-white flex items-center gap-3">
            <MenuSquare className="w-8 h-8 text-zen-500" />
            Gestion du Menu
          </h1>
          <p className="text-white/40 mt-1 font-medium">
            Gérez vos catégories, produits et recettes
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-white/6 pb-4">
        <button
          onClick={() => setActiveTab("products")}
          className={`px-5 py-3 rounded-xl text-sm font-bold transition-all min-w-[120px] ${
            activeTab === "products"
              ? "bg-zen-500/15 text-zen-500 border border-zen-500/20 shadow-lg"
              : "text-white/50 hover:text-white hover:bg-white/5"
          }`}
        >
          Produits
        </button>
        <button
          onClick={() => setActiveTab("categories")}
          className={`px-5 py-3 rounded-xl text-sm font-bold transition-all min-w-[120px] ${
            activeTab === "categories"
              ? "bg-zen-500/15 text-zen-500 border border-zen-500/20 shadow-lg"
              : "text-white/50 hover:text-white hover:bg-white/5"
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
            <div className="bg-zen-800 border border-white/10 rounded-2xl p-6">
              <h2 className="text-lg font-bold text-white mb-4">Ajouter une catégorie</h2>
              <div className="flex flex-col sm:flex-row gap-3">
                <input
                  type="text"
                  placeholder="Nom de la nouvelle catégorie"
                  value={newCatName}
                  onChange={(e) => setNewCatName(e.target.value)}
                  className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-white/30 focus:outline-none focus:ring-2 focus:ring-zen-500/50 min-h-[44px]"
                />
                <button
                  onClick={handleAddCategory}
                  className="flex items-center justify-center gap-2 bg-zen-500 text-white px-6 py-3 rounded-xl font-bold hover:bg-zen-500/80 transition-all min-h-[44px]"
                >
                  <Plus className="w-5 h-5" /> Ajouter
                </button>
              </div>
            </div>

            {/* List Categories */}
            <div className="bg-zen-800 border border-white/10 rounded-2xl overflow-hidden">
              <ul className="divide-y divide-white/5">
                {categories.map((c) => (
                  <li key={c.id} className="flex justify-between items-center px-6 py-4 hover:bg-white/5 transition">
                    <span className="text-lg font-bold text-white">{c.name}</span>
                    <button
                      onClick={() => deleteCategory(c.id)}
                      className="w-10 h-10 rounded-lg bg-red-500/10 text-red-500 flex items-center justify-center hover:bg-red-500/20 transition-all"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </li>
                ))}
                {categories.length === 0 && (
                  <li className="px-6 py-8 text-center text-white/40">Aucune catégorie existante.</li>
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
            <div className="bg-zen-800 border border-white/10 rounded-2xl p-6">
              <h2 className="text-xl font-bold text-white mb-6">Nouveau Produit</h2>
              
              <div className="space-y-8">
                {/* Product Basics */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  <input
                    type="text"
                    placeholder="Nom du produit"
                    value={newProdName}
                    onChange={(e) => setNewProdName(e.target.value)}
                    className="bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-white/30 focus:outline-none focus:ring-2 focus:ring-zen-500/50 min-h-[44px]"
                  />
                  <input
                    type="number"
                    placeholder="Prix (TND)"
                    value={newProdPrice}
                    onChange={(e) => setNewProdPrice(e.target.value)}
                    className="bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-white/30 focus:outline-none focus:ring-2 focus:ring-zen-500/50 min-h-[44px]"
                  />
                  <select
                    value={newProdCategory}
                    onChange={(e) => setNewProdCategory(e.target.value)}
                    className="bg-zen-800 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-zen-500/50 min-h-[44px] appearance-none"
                  >
                    <option value="">Sélectionner une catégorie...</option>
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>

                {/* Recipe Builder */}
                <div className="border border-white/10 rounded-xl p-5 bg-white/2">
                  <h3 className="text-sm font-bold text-white/60 uppercase tracking-wider mb-4 flex items-center gap-2">
                    <Package className="w-4 h-4" />
                    Recette & Composants (Optionnel)
                  </h3>

                  {/* Current Recipe Items */}
                  {recipe.length > 0 && (
                    <ul className="mb-4 space-y-2">
                      {recipe.map((r, idx) => (
                        <li key={idx} className="flex items-center justify-between bg-white/5 px-4 py-2 rounded-lg border border-white/5">
                          <span className="text-white font-medium">{r.name}</span>
                          <div className="flex items-center gap-4">
                            <span className="text-zen-500 font-bold">{r.quantity} {r.unit}</span>
                            <button onClick={() => handleRemoveRecipeComponent(idx)} className="text-red-400 hover:text-red-300">
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
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                      <input
                        type="text"
                        placeholder="Chercher ou créer un composant..."
                        value={compSearch}
                        onChange={(e) => setCompSearch(e.target.value)}
                        className="w-full bg-zen-800 border border-white/10 rounded-xl py-2 pl-9 pr-3 text-white focus:outline-none focus:border-zen-500/50"
                      />
                      
                      {/* Dropdown for search results */}
                      {compSearch.trim().length > 0 && (
                        <div className="absolute top-full left-0 right-0 mt-2 bg-[#1C2128] border border-white/10 rounded-xl shadow-xl overflow-hidden z-10">
                          {filteredStockItems.map(item => (
                            <div key={item.id} className="px-4 py-3 hover:bg-white/5 border-b border-white/5 flex items-center justify-between">
                              <span className="text-white font-medium">{item.name} <span className="text-white/40 text-sm">({item.unit})</span></span>
                              <div className="flex items-center gap-2">
                                <input
                                  type="number"
                                  placeholder={`Qté`}
                                  value={compQuantity}
                                  onChange={e => setCompQuantity(e.target.value)}
                                  className="w-16 bg-zen-900 border border-white/10 rounded px-2 py-1 text-white text-sm"
                                  onClick={e => e.stopPropagation()}
                                />
                                <button
                                  onClick={() => handleAddRecipeComponent(item.id, item.name, item.unit)}
                                  disabled={!compQuantity || parseFloat(compQuantity) <= 0}
                                  className="bg-emerald-500/20 text-emerald-400 px-3 py-1 rounded font-bold text-sm disabled:opacity-50"
                                >
                                  Ajouter
                                </button>
                              </div>
                            </div>
                          ))}

                          {showCreateComponent && (
                            <div className="p-4 bg-zen-500/10 flex flex-col gap-3">
                              <p className="text-sm text-white/70">"{compSearch}" n'existe pas dans le stock.</p>
                              <div className="flex items-center gap-2">
                                <input
                                  type="text"
                                  placeholder="Unité (ex: g, L)"
                                  value={compUnit}
                                  onChange={e => setCompUnit(e.target.value)}
                                  className="w-24 bg-zen-900 border border-zen-500/30 rounded px-2 py-1.5 text-white text-sm"
                                />
                                <input
                                  type="number"
                                  placeholder="Qté"
                                  value={compQuantity}
                                  onChange={e => setCompQuantity(e.target.value)}
                                  className="w-20 bg-zen-900 border border-zen-500/30 rounded px-2 py-1.5 text-white text-sm"
                                />
                                <button
                                  onClick={handleCreateAndAddComponent}
                                  disabled={!compQuantity || parseFloat(compQuantity) <= 0 || !compUnit.trim()}
                                  className="flex-1 bg-zen-500 text-white px-3 py-1.5 rounded font-bold text-sm disabled:opacity-50"
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

                <div className="flex items-center justify-between border-t border-white/10 pt-6">
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={newProdAvailable}
                      onChange={(e) => setNewProdAvailable(e.target.checked)}
                      className="w-5 h-5 rounded border-white/20 text-zen-500 focus:ring-zen-500/50 bg-transparent"
                    />
                    <span className="text-white font-medium select-none">Produit Actif</span>
                  </label>
                  
                  <button
                    onClick={handleAddProduct}
                    className="flex items-center justify-center gap-2 bg-zen-500 text-white px-8 py-3 rounded-xl font-bold hover:bg-zen-500/80 transition-all min-h-[44px]"
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
                    className="bg-zen-800 border border-white/10 rounded-2xl p-5 flex flex-col gap-4"
                  >
                    <div className="flex items-center justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-3 mb-1">
                          <h3 className="text-lg font-bold text-white truncate">{p.name}</h3>
                          {p.available ? (
                            <span className="inline-flex items-center gap-1 bg-emerald-500/10 text-emerald-400 text-[10px] font-bold px-2 py-0.5 rounded-md border border-emerald-500/20">
                              <CheckCircle2 className="w-3 h-3" /> Actif
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 bg-red-500/10 text-red-400 text-[10px] font-bold px-2 py-0.5 rounded-md border border-red-500/20">
                              <XCircle className="w-3 h-3" /> Inactif
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-3 text-sm text-white/40">
                          <span className="font-bold text-white/80">{p.price.toFixed(3)} TND</span>
                          <span className="w-1 h-1 rounded-full bg-white/20" />
                          <span>{category?.name || "Sans catégorie"}</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <button
                          onClick={() => toggleProductAvailability(p.id)}
                          className={cn(
                            "px-3 py-2 rounded-lg text-xs font-bold transition-all border min-w-[80px]",
                            p.available 
                              ? "bg-white/5 border-white/10 text-white hover:bg-white/10" 
                              : "bg-emerald-500/10 border-emerald-500/20 text-emerald-400 hover:bg-emerald-500/20"
                          )}
                        >
                          {p.available ? "Masquer" : "Activer"}
                        </button>
                        <button
                          onClick={() => deleteProduct(p.id)}
                          className="w-10 h-10 rounded-lg bg-red-500/10 text-red-500 flex items-center justify-center hover:bg-red-500/20 transition-all shrink-0"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                    
                    {/* Display Recipe summary */}
                    {p.recipe && p.recipe.length > 0 && (
                      <div className="pt-3 border-t border-white/5">
                        <p className="text-xs text-white/30 font-bold uppercase tracking-wider mb-2">Composants</p>
                        <div className="flex flex-wrap gap-2">
                          {p.recipe.map(r => {
                            const comp = stockItems.find(s => s.id === r.ingredientId);
                            return (
                              <span key={r.ingredientId} className="text-xs bg-white/5 border border-white/10 text-white/70 px-2 py-1 rounded-md">
                                {comp ? comp.name : 'Inconnu'} <span className="text-zen-500 font-bold ml-1">{r.quantity} {comp ? comp.unit : ''}</span>
                              </span>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </motion.div>
                );
              })}
            </div>
            
            {products.length === 0 && (
              <div className="py-12 text-center border-2 border-dashed border-white/10 rounded-3xl bg-zen-800/50">
                <MenuSquare className="w-12 h-12 text-white/20 mx-auto mb-4" />
                <p className="text-lg font-bold text-white/60">Aucun produit</p>
                <p className="text-white/30">Ajoutez votre premier produit ci-dessus</p>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
