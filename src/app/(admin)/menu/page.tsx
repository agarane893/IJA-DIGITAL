"use client";
import React, { useState } from "react";
import { motion } from "framer-motion";
import { useAdminMenuStore } from "@/lib/useAdminMenuStore";
import { Plus, Edit, Trash2 } from "lucide-react";

export default function AdminMenuPage() {
  const { categories, products, addCategory, updateCategory, deleteCategory, addProduct, updateProduct, deleteProduct, toggleProductAvailability } = useAdminMenuStore();

  // Simple local state for new entries
  const [newCatName, setNewCatName] = useState("");
  const [newProd, setNewProd] = useState({ name: "", price: "", categoryId: "", available: true, image: "", recipe: [] as any[] });

  const handleAddCategory = () => {
    if (!newCatName.trim()) return;
    const id = `c${Date.now()}`;
    addCategory({ id, name: newCatName.trim() });
    setNewCatName("");
  };

  const handleAddProduct = () => {
    if (!newProd.name.trim() || !newProd.price || !newProd.categoryId) return;
    const id = `p${Date.now()}`;
    addProduct({
      id,
      name: newProd.name.trim(),
      price: parseFloat(newProd.price),
      available: newProd.available,
      image: newProd.image || "https://via.placeholder.com/150",
      categoryId: newProd.categoryId,
      recipe: []
    } as any);
    setNewProd({ name: "", price: "", categoryId: "", available: true, image: "", recipe: [] });
  };

  return (
    <div className="p-6 space-y-8">
      <h1 className="text-3xl font-black text-white">📋 Menu & Produits (admin)</h1>

      {/* Categories */}
      <section className="bg-[#0D1117] p-4 rounded-xl">
        <h2 className="text-xl font-bold text-[#D95D39] mb-4">🗂️ Catégories</h2>
        <ul className="space-y-2 mb-4">
          {categories.map((c) => (
            <li key={c.id} className="flex justify-between items-center text-white">
              <span>{c.name}</span>
              <button onClick={() => deleteCategory(c.id)} className="p-1 text-red-500 hover:text-red-300 transition">
                <Trash2 className="w-4 h-4" />
              </button>
            </li>
          ))}
        </ul>
        <div className="flex gap-2 items-center">
          <input
            type="text"
            placeholder="Nouvelle catégorie"
            value={newCatName}
            onChange={(e) => setNewCatName(e.target.value)}
            className="bg-[#161B22] border border-white/10 rounded-xl px-3 py-2 text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-[#D95D39]"
          />
          <button
            onClick={handleAddCategory}
            className="flex items-center gap-1 bg-[#D95D39] text-white px-3 py-2 rounded-xl hover:bg-[#D95D39]/80 transition"
          >
            <Plus className="w-4 h-4" /> Ajouter
          </button>
        </div>
      </section>

      {/* Products */}
      <section className="bg-[#0D1117] p-4 rounded-xl">
        <h2 className="text-xl font-bold text-[#D95D39] mb-4">🍽️ Produits</h2>
        <ul className="space-y-3 mb-4">
          {products.map((p) => (
            <li key={p.id} className="flex justify-between items-center text-white p-2 bg-[#161B22] rounded-lg">
              <div>
                <span className="font-bold">{p.name}</span> – {p.price} TND ({p.available ? "disponible" : "indisponible"})
              </div>
              <div className="flex gap-2 items-center">
                <button onClick={() => toggleProductAvailability(p.id)} className="text-xs bg-white/10 hover:bg-white/20 rounded px-2 py-1 text-white">
                  {p.available ? "Masquer" : "Rendre disponible"}
                </button>
                <button onClick={() => deleteProduct(p.id)} className="p-1 text-red-500 hover:text-red-300 transition">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </li>
          ))}
        </ul>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <input
            type="text"
            placeholder="Nom du produit"
            value={newProd.name}
            onChange={(e) => setNewProd({ ...newProd, name: e.target.value })}
            className="bg-[#161B22] border border-white/10 rounded-xl px-3 py-2 text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-[#D95D39]"
          />
          <input
            type="number"
            placeholder="Prix (TND)"
            value={newProd.price}
            onChange={(e) => setNewProd({ ...newProd, price: e.target.value })}
            className="bg-[#161B22] border border-white/10 rounded-xl px-3 py-2 text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-[#D95D39]"
          />
          <select
            value={newProd.categoryId}
            onChange={(e) => setNewProd({ ...newProd, categoryId: e.target.value })}
            className="bg-[#161B22] border border-white/10 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-[#D95D39]"
          >
            <option value="">Sélectionner catégorie</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
          <input
            type="text"
            placeholder="URL image (optionnel)"
            value={newProd.image}
            onChange={(e) => setNewProd({ ...newProd, image: e.target.value })}
            className="bg-[#161B22] border border-white/10 rounded-xl px-3 py-2 text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-[#D95D39]"
          />
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={newProd.available}
              onChange={(e) => setNewProd({ ...newProd, available: e.target.checked })}
            />
            <label className="text-white">Disponible</label>
          </div>
          <button
            onClick={handleAddProduct}
            className="flex items-center gap-1 bg-[#D95D39] text-white px-4 py-2 rounded-xl hover:bg-[#D95D39]/80 transition"
          >
            <Plus className="w-4 h-4" /> Ajouter produit
          </button>
        </div>
      </section>
    </div>
  );
}
