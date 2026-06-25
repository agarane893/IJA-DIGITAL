"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  LayoutDashboard, 
  Plus, 
  Copy, 
  Check, 
  Trash2, 
  Edit3,
  X,
  Users
} from "lucide-react";
import { useTableStore, RestaurantTable } from "@/lib/useTableStore";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export default function TablesPage() {
  const { tables, addTable, updateTable, deleteTable } = useTableStore();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTable, setEditingTable] = useState<RestaurantTable | null>(null);

  // Form State
  const [id, setId] = useState("");
  const [name, setName] = useState("");
  const [capacity, setCapacity] = useState("2");

  const handleOpenModal = (table?: RestaurantTable) => {
    if (table) {
      setEditingTable(table);
      setId(table.id);
      setName(table.name);
      setCapacity(table.capacity?.toString() || "2");
    } else {
      setEditingTable(null);
      setId("");
      setName("");
      setCapacity("2");
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!id || !name) {
      toast.error("Veuillez remplir l'ID et le nom de la table");
      return;
    }

    if (editingTable) {
      updateTable(editingTable.id, { id, name, capacity: parseInt(capacity) || 2 });
      toast.success("Table modifiée avec succès");
    } else {
      // Check if ID already exists
      if (tables.some(t => t.id === id)) {
        toast.error("Cet identifiant de table existe déjà !");
        return;
      }
      addTable({ id, name, capacity: parseInt(capacity) || 2 });
      toast.success("Table ajoutée avec succès");
    }
    handleCloseModal();
  };

  const handleDelete = (tableId: string) => {
    if (confirm("Êtes-vous sûr de vouloir supprimer cette table ?")) {
      deleteTable(tableId);
      toast.success("Table supprimée");
    }
  };

  return (
    <div className="space-y-6 h-full flex flex-col p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-heading text-2xl font-black text-white flex items-center gap-2">
            <LayoutDashboard className="w-7 h-7 text-zen-500" />
            Gestion des Tables
          </h1>
          <p className="text-sm text-white/40 mt-1">Configurez le plan de salle et les accès QR Code</p>
        </div>

        <button 
          onClick={() => handleOpenModal()}
          className="bg-zen-500 hover:bg-[#E68867] text-white px-5 py-2.5 rounded-xl font-bold flex items-center gap-2 transition-all shadow-lg shadow-zen-500/20 active:scale-95"
        >
          <Plus className="w-5 h-5" />
          Ajouter une table
        </button>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mt-6">
        <AnimatePresence mode="popLayout">
          {tables.map((table) => (
            <TableCard 
              key={table.id} 
              table={table} 
              onEdit={() => handleOpenModal(table)}
              onDelete={() => handleDelete(table.id)}
            />
          ))}
        </AnimatePresence>
      </div>

      {/* Empty State */}
      {tables.length === 0 && (
        <div className="flex flex-col items-center justify-center py-20 text-white/40 border border-dashed border-white/10 rounded-3xl bg-white/5">
          <LayoutDashboard className="w-16 h-16 mb-4 opacity-50" />
          <h2 className="text-xl font-bold mb-2">Aucune table configurée</h2>
          <p className="text-sm mb-6">Ajoutez votre première table pour commencer</p>
          <button 
            onClick={() => handleOpenModal()}
            className="bg-white/10 hover:bg-white/20 text-white px-6 py-3 rounded-xl font-bold flex items-center gap-2 transition-all"
          >
            <Plus className="w-5 h-5" />
            Créer une table
          </button>
        </div>
      )}

      {/* Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-zen-800 border border-white/10 rounded-2xl p-6 w-full max-w-md shadow-2xl relative"
            >
              <button 
                onClick={handleCloseModal}
                className="absolute top-4 right-4 text-white/40 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
              
              <h2 className="text-xl font-bold text-white mb-6">
                {editingTable ? "Modifier la table" : "Nouvelle table"}
              </h2>

              <form onSubmit={handleSave} className="space-y-4">
                <div>
                  <label className="block text-sm font-bold text-white/70 mb-1.5">Identifiant (ID)</label>
                  <input 
                    type="text" 
                    required
                    value={id}
                    onChange={(e) => setId(e.target.value)}
                    placeholder="Ex: 12, T1..."
                    disabled={!!editingTable}
                    className="w-full bg-zen-900 border border-white/10 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-zen-500 disabled:opacity-50"
                  />
                  <p className="text-[10px] text-white/30 mt-1">Sert pour l'URL du menu (ne peut pas être modifié plus tard).</p>
                </div>

                <div>
                  <label className="block text-sm font-bold text-white/70 mb-1.5">Nom d'affichage</label>
                  <input 
                    type="text" 
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Ex: Table 12, Terrasse Vue Mer..."
                    className="w-full bg-zen-900 border border-white/10 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-zen-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-white/70 mb-1.5">Capacité (personnes)</label>
                  <input 
                    type="number" 
                    min="1"
                    value={capacity}
                    onChange={(e) => setCapacity(e.target.value)}
                    className="w-full bg-zen-900 border border-white/10 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-zen-500"
                  />
                </div>

                <div className="pt-4 flex gap-3">
                  <button 
                    type="button"
                    onClick={handleCloseModal}
                    className="flex-1 px-4 py-2.5 rounded-xl font-bold text-white/70 hover:bg-white/10 transition-colors border border-transparent"
                  >
                    Annuler
                  </button>
                  <button 
                    type="submit"
                    className="flex-1 bg-zen-500 text-white px-4 py-2.5 rounded-xl font-bold hover:bg-[#E68867] transition-colors shadow-lg shadow-zen-500/20"
                  >
                    {editingTable ? "Enregistrer" : "Créer"}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

// --- Subcomponents ---

function TableCard({ table, onEdit, onDelete }: { table: RestaurantTable, onEdit: () => void, onDelete: () => void }) {
  const [copied, setCopied] = useState(false);

  // Generate URL for the table
  const tableUrl = typeof window !== 'undefined' ? `${window.location.origin}/table/${table.id}` : `/table/${table.id}`;

  const handleCopy = () => {
    navigator.clipboard.writeText(tableUrl);
    setCopied(true);
    toast.success("Lien copié dans le presse-papier !");
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <motion.div 
      layout
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      className="bg-zen-800 border border-white/10 rounded-2xl p-5 hover:border-zen-500/50 transition-colors group relative flex flex-col"
    >
      {/* Actions */}
      <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
        <button onClick={onEdit} className="p-1.5 bg-white/10 hover:bg-white/20 rounded-lg text-white/70 hover:text-white transition-colors" title="Modifier">
          <Edit3 className="w-4 h-4" />
        </button>
        <button onClick={onDelete} className="p-1.5 bg-red-500/10 hover:bg-red-500/20 text-red-500 rounded-lg transition-colors" title="Supprimer">
          <Trash2 className="w-4 h-4" />
        </button>
      </div>

      {/* Info */}
      <div className="mb-4 pr-16">
        <h3 className="text-lg font-black text-white">{table.name}</h3>
        <p className="text-xs text-white/40 font-mono mt-0.5">ID: {table.id}</p>
      </div>

      <div className="flex items-center gap-4 mb-6">
        <div className="flex items-center gap-1.5 text-xs font-bold text-white/60 bg-white/5 px-2.5 py-1 rounded-lg">
          <Users className="w-3.5 h-3.5" />
          {table.capacity} places
        </div>
      </div>

      {/* QR/Link Action */}
      <div className="mt-auto pt-4 border-t border-white/5">
        <button 
          onClick={handleCopy}
          className="w-full flex items-center justify-center gap-2 bg-zen-500/10 hover:bg-zen-500/20 text-zen-500 px-4 py-2.5 rounded-xl text-sm font-bold transition-colors"
        >
          {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
          {copied ? "Lien copié !" : "Copier le lien Menu"}
        </button>
      </div>
    </motion.div>
  );
}
