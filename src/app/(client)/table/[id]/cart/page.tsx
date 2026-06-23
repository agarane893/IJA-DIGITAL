"use client";

import React, { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, Plus, Minus, Trash2, Receipt, ArrowRight, UtensilsCrossed, CheckCircle2, QrCode, CreditCard, Banknote } from "lucide-react";
import { useCartStore, PlacedOrder } from "@/lib/useCartStore";
import { formatPrice } from "@/lib/menuData";
import { cn } from "@/lib/utils";

export default function CartPage() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string;

  const { items, updateQuantity, removeItem, placeOrder, getCartTotal, globalComment, setGlobalComment } = useCartStore();
  const cartTotal = getCartTotal();

  const [isOrdering, setIsOrdering] = useState(false);
  const [placedOrder, setPlacedOrder] = useState<PlacedOrder | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<"cash" | "card">("cash");

  const handlePlaceOrder = () => {
    setIsOrdering(true);
    // Simulate API call
    setTimeout(() => {
      setIsOrdering(false);
      const order = placeOrder(paymentMethod);
      setPlacedOrder(order);
      // We don't automatically redirect, we let the user see the success page
      // They can go back manually or click a button
    }, 1500);
  };

  if (placedOrder) {
    return (
      <main className="min-h-screen bg-[#D95D39] text-white flex flex-col items-center justify-center p-6 text-center">
        <motion.div 
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", stiffness: 200, damping: 15 }}
          className="w-24 h-24 bg-white rounded-full flex items-center justify-center mb-6 shadow-2xl"
        >
          <motion.div
             initial={{ pathLength: 0 }}
             animate={{ pathLength: 1 }}
             transition={{ duration: 0.8, delay: 0.2 }}
          >
             <CheckCircle2 className="w-12 h-12 text-[#D95D39]" />
          </motion.div>
        </motion.div>
        
        <motion.h1 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="font-heading text-3xl font-black mb-2"
        >
          Commande Confirmée !
        </motion.h1>
        
        <motion.p 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="text-white/80 font-medium mb-8"
        >
          La cuisine a bien reçu votre commande.<br/>
          Elle sera préparée dans un instant.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.5 }}
          className="bg-white text-[#131924] rounded-3xl p-6 w-full max-w-sm space-y-4 shadow-xl"
        >
          <div className="flex items-center justify-between border-b border-[#EADCB9] pb-4">
            <div className="text-left">
              <p className="text-xs font-bold text-[#131924]/50 uppercase tracking-wider">Numéro</p>
              <p className="font-black text-xl text-[#D95D39]">{placedOrder.id}</p>
            </div>
            <div className="text-right">
              <p className="text-xs font-bold text-[#131924]/50 uppercase tracking-wider">Table</p>
              <p className="font-black text-xl text-[#131924]">{placedOrder.tableId}</p>
            </div>
          </div>
          
          <div className="flex flex-col items-center justify-center py-4">
            <div className="w-32 h-32 bg-[#FDF6E9] rounded-2xl flex items-center justify-center border border-[#EADCB9]">
              {/* Mock QR Code */}
              <QrCode className="w-20 h-20 text-[#131924]" />
            </div>
            <p className="text-xs text-[#131924]/50 font-bold mt-3">Scannez pour suivre la préparation</p>
          </div>
          
          <button 
            onClick={() => router.push(`/table/${id}`)}
            className="w-full bg-[#131924] text-white font-bold py-3.5 rounded-xl active:scale-95 transition-all"
          >
            Retour au menu
          </button>
        </motion.div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#FDF6E9] text-[#131924] font-sans pb-40">
      {/* Header */}
      <header className="sticky top-0 bg-[#FDF6E9]/90 backdrop-blur-xl border-b border-[#EADCB9]/50 px-4 py-3 flex items-center gap-4 z-40">
        <button 
          onClick={() => router.back()}
          className="w-10 h-10 rounded-2xl bg-white border border-[#EADCB9] flex items-center justify-center text-[#131924] shadow-sm active:scale-95 transition-transform"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
        <div>
          <h1 className="font-heading font-black text-[#131924] text-lg leading-tight">
            Mon Panier
          </h1>
          <p className="text-[10px] text-[#D95D39] font-bold">
            Table {id}
          </p>
        </div>
      </header>

      {items.length === 0 ? (
        <div className="flex flex-col items-center justify-center p-12 text-center h-[60vh]">
          <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center mb-4 shadow-sm border border-[#EADCB9]">
            <UtensilsCrossed className="w-8 h-8 text-[#D95D39]/40" />
          </div>
          <h2 className="font-heading text-xl font-bold text-[#131924] mb-2">Votre panier est vide</h2>
          <p className="text-sm text-[#131924]/50 font-medium mb-6">Ajoutez de délicieux plats pour commencer.</p>
          <button 
            onClick={() => router.back()}
            className="bg-[#131924] text-white font-bold px-6 py-3 rounded-xl active:scale-95 transition-transform"
          >
            Voir le menu
          </button>
        </div>
      ) : (
        <div className="max-w-md mx-auto px-4 py-6 space-y-6">
          <div className="space-y-4">
            <AnimatePresence mode="popLayout">
              {items.map((cartItem) => (
                <motion.div
                  layout
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95, x: -20 }}
                  key={cartItem.id}
                  className="bg-white border border-[#EADCB9] rounded-3xl p-4 shadow-sm"
                >
                  <div className="flex gap-4">
                    <div className="w-16 h-16 shrink-0 rounded-2xl bg-gradient-to-br from-[#FDF6E9] to-[#F3DEC2] flex items-center justify-center text-3xl shadow-inner">
                      {cartItem.menuItem.emoji}
                    </div>
                    
                    <div className="flex-1 flex flex-col justify-between">
                      <div>
                        <div className="flex items-start justify-between gap-2">
                          <h4 className="font-bold text-[#131924] text-sm leading-tight">
                            {cartItem.menuItem.name}
                          </h4>
                          <button 
                            onClick={() => removeItem(cartItem.id)}
                            className="text-[#131924]/20 hover:text-red-500 transition-colors p-1 -mr-2 -mt-2"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                        
                        {/* Options */}
                        {Object.keys(cartItem.options).length > 0 && (
                          <p className="text-[10px] text-[#131924]/50 mt-1 font-medium leading-snug">
                            {Object.entries(cartItem.options).map(([k, v]) => `${v}`).join(", ")}
                          </p>
                        )}
                        {/* Item specific comment */}
                        {cartItem.comment && (
                          <p className="text-[10px] text-[#D95D39] font-bold mt-1 bg-[#D95D39]/10 px-2 py-0.5 rounded-md inline-block">
                            "{cartItem.comment}"
                          </p>
                        )}
                      </div>

                      <div className="flex items-center justify-between mt-3">
                        <span className="font-black text-[#D95D39] text-sm">
                          {formatPrice(cartItem.totalPrice)}
                        </span>
                        
                        {/* Quantity Selector Mini */}
                        <div className="flex items-center bg-[#FDF6E9] rounded-xl p-0.5 border border-[#EADCB9]/60">
                          <button 
                            onClick={() => updateQuantity(cartItem.id, -1)}
                            className="w-7 h-7 rounded-lg bg-white flex items-center justify-center text-[#131924] shadow-sm active:scale-95 transition-all"
                          >
                            <Minus className="w-3 h-3" />
                          </button>
                          <span className="w-6 text-center font-black text-xs text-[#131924]">{cartItem.quantity}</span>
                          <button 
                            onClick={() => updateQuantity(cartItem.id, 1)}
                            className="w-7 h-7 rounded-lg bg-white flex items-center justify-center text-[#131924] shadow-sm active:scale-95 transition-all"
                          >
                            <Plus className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>

          {/* Global Order Comment */}
          <div className="space-y-2">
             <h3 className="font-bold text-[#131924] text-xs uppercase tracking-wider">Note pour la cuisine</h3>
             <textarea
               value={globalComment}
               onChange={(e) => setGlobalComment(e.target.value)}
               placeholder="Une demande globale ? (Ex: Servir ensemble, table propre...)"
               className="w-full bg-white border border-[#EADCB9] rounded-2xl p-4 text-sm text-[#131924] placeholder:text-[#131924]/30 outline-none focus:border-[#D95D39] transition-all resize-none h-20 shadow-sm"
             />
          </div>

          {/* Payment Method */}
          <div className="space-y-2">
             <h3 className="font-bold text-[#131924] text-xs uppercase tracking-wider">Moyen de paiement</h3>
             <div className="grid grid-cols-2 gap-3">
               <button
                 onClick={() => setPaymentMethod("cash")}
                 className={cn(
                   "flex items-center gap-2 p-3 rounded-2xl border transition-all active:scale-[0.98]",
                   paymentMethod === "cash" 
                     ? "bg-[#131924] text-white border-[#131924] shadow-md"
                     : "bg-white text-[#131924]/70 border-[#EADCB9] hover:border-[#131924]/30"
                 )}
               >
                 <Banknote className={cn("w-4 h-4", paymentMethod === "cash" ? "text-emerald-400" : "")} />
                 <span className="text-sm font-bold">Espèces</span>
               </button>
               <button
                 onClick={() => setPaymentMethod("card")}
                 className={cn(
                   "flex items-center gap-2 p-3 rounded-2xl border transition-all active:scale-[0.98]",
                   paymentMethod === "card" 
                     ? "bg-[#131924] text-white border-[#131924] shadow-md"
                     : "bg-white text-[#131924]/70 border-[#EADCB9] hover:border-[#131924]/30"
                 )}
               >
                 <CreditCard className={cn("w-4 h-4", paymentMethod === "card" ? "text-blue-400" : "")} />
                 <span className="text-sm font-bold">Carte</span>
               </button>
             </div>
          </div>

          {/* Receipt summary */}
          <div className="bg-[#131924] rounded-3xl p-5 mt-4 text-white space-y-3 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-[#D95D39]" />
            <div className="flex justify-between text-sm text-white/60 font-medium">
              <span>Sous-total</span>
              <span>{formatPrice(cartTotal)}</span>
            </div>
            <div className="flex justify-between text-sm text-white/60 font-medium pb-3 border-b border-white/10">
              <span>TVA (19%) incluse</span>
              <span>{formatPrice(cartTotal * 0.19)}</span>
            </div>
            <div className="flex justify-between items-end pt-1">
              <span className="text-sm font-bold text-white">Total à payer</span>
              <span className="font-black text-2xl text-[#D95D39]">{formatPrice(cartTotal)}</span>
            </div>
          </div>
        </div>
      )}

      {/* Checkout Action Bar */}
      {items.length > 0 && (
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-[#EADCB9] p-4 pb-safe shadow-[0_-10px_40px_rgba(0,0,0,0.05)] z-50">
          <div className="max-w-md mx-auto">
            <button 
              onClick={handlePlaceOrder}
              disabled={isOrdering}
              className="w-full bg-gradient-to-r from-[#D95D39] to-[#E68867] text-white rounded-2xl h-[56px] flex items-center justify-center gap-2 shadow-lg shadow-[#D95D39]/25 active:scale-[0.98] transition-all disabled:opacity-70"
            >
              {isOrdering ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span className="font-bold text-sm">Envoi en cuisine...</span>
                </>
              ) : (
                <>
                  <span className="font-bold text-sm">Confirmer la commande</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>
        </div>
      )}
    </main>
  );
}
