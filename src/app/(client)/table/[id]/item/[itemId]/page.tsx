"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { ChevronLeft, Info, Plus, Minus, Check } from "lucide-react";
import { getItemById, formatPrice } from "@/lib/menuData";
import { useCartStore } from "@/lib/useCartStore";
import { cn } from "@/lib/utils";

export default function ItemDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string;
  const itemId = params?.itemId as string;

  const item = getItemById(itemId);
  const { addItem } = useCartStore();

  const [quantity, setQuantity] = useState(1);
  const [selectedOptions, setSelectedOptions] = useState<Record<string, string>>({});
  const [totalPrice, setTotalPrice] = useState(0);
  const [comment, setComment] = useState("");

  // Initialize default options
  useEffect(() => {
    if (item && item.options) {
      const defaults: Record<string, string> = {};
      item.options.forEach((opt) => {
        defaults[opt.label] = opt.choices[0].label;
      });
      setSelectedOptions(defaults);
    }
  }, [item]);

  // Calculate dynamic price
  useEffect(() => {
    if (!item) return;
    let base = item.price;
    if (item.options) {
      item.options.forEach((opt) => {
        const selectedLabel = selectedOptions[opt.label];
        const choice = opt.choices.find((c) => c.label === selectedLabel);
        if (choice) {
          base += choice.priceDelta;
        }
      });
    }
    setTotalPrice(base * quantity);
  }, [item, selectedOptions, quantity]);

  if (!item) {
    return (
      <div className="min-h-screen bg-zen-50 flex flex-col items-center justify-center p-6 text-center">
        <Info className="w-12 h-12 text-zen-500 mb-4" />
        <h2 className="font-heading text-xl font-bold text-zen-900 mb-2">Produit introuvable</h2>
        <button onClick={() => router.back()} className="text-zen-500 font-bold text-sm">
          Retour au menu
        </button>
      </div>
    );
  }

  const unitPrice = totalPrice / quantity;

  const handleAddToCart = () => {
    addItem({
      menuItem: item,
      quantity,
      options: selectedOptions,
      comment,
      unitPrice,
    });
    router.back();
  };

  const handleOptionSelect = (optionLabel: string, choiceLabel: string) => {
    setSelectedOptions((prev) => ({
      ...prev,
      [optionLabel]: choiceLabel,
    }));
  };

  return (
    <main className="min-h-screen bg-zen-50 text-zen-900 font-sans pb-32">
      {/* Header Image Area */}
      <div className="relative h-64 bg-gradient-to-br from-zen-50 to-zen-100 flex items-center justify-center rounded-b-[40px] shadow-sm">
        <div className="absolute top-4 left-4 z-10">
          <button 
            onClick={() => router.back()}
            className="w-10 h-10 rounded-full bg-white/80 backdrop-blur-md flex items-center justify-center text-zen-900 shadow-sm active:scale-95 transition-transform"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
        </div>
        <motion.div 
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring" }}
          className="text-8xl drop-shadow-xl"
        >
          {item.emoji}
        </motion.div>
      </div>

      <div className="max-w-md mx-auto px-6 -mt-6 relative z-10 space-y-6">
        
        {/* Title Card */}
        <div className="bg-white rounded-3xl p-6 shadow-md border border-zen-200">
          <div className="flex justify-between items-start gap-4 mb-2">
            <h1 className="font-heading text-2xl font-black text-zen-900 leading-tight">
              {item.name}
            </h1>
            <span className="font-black text-zen-500 text-xl shrink-0">
              {formatPrice(unitPrice)}
            </span>
          </div>
          {item.nameAr && (
            <p className="text-right font-medium text-lg text-zen-900/40 mb-3" dir="rtl">{item.nameAr}</p>
          )}
          <p className="text-sm text-zen-900/70 leading-relaxed font-medium">
            {item.description}
          </p>
        </div>

        {/* Options */}
        {item.options && item.options.length > 0 && (
          <div className="space-y-6">
            {item.options.map((opt) => (
              <div key={opt.label} className="space-y-3">
                <h3 className="font-bold text-zen-900 text-sm uppercase tracking-wider flex justify-between items-end">
                  {opt.label}
                  <span className="text-[10px] text-zen-500 bg-zen-500/10 px-2 py-0.5 rounded-sm">Obligatoire</span>
                </h3>
                <div className="space-y-2">
                  {opt.choices.map((choice) => {
                    const isSelected = selectedOptions[opt.label] === choice.label;
                    return (
                      <button
                        key={choice.id}
                        onClick={() => handleOptionSelect(opt.label, choice.label)}
                        className={cn(
                          "w-full flex items-center justify-between p-4 rounded-2xl border transition-all active:scale-[0.98]",
                          isSelected
                            ? "bg-zen-900 border-zen-900 text-white shadow-md"
                            : "bg-white border-zen-200 text-zen-900 hover:border-zen-900/30"
                        )}
                      >
                        <span className="text-sm font-bold">{choice.label}</span>
                        <div className="flex items-center gap-3">
                          {choice.priceDelta > 0 && (
                            <span className={cn("text-xs font-bold", isSelected ? "text-white/70" : "text-zen-900/50")}>
                              +{formatPrice(choice.priceDelta)}
                            </span>
                          )}
                          <div className={cn(
                            "w-5 h-5 rounded-full border flex items-center justify-center",
                            isSelected ? "border-zen-500 bg-zen-500" : "border-zen-200/60"
                          )}>
                            {isSelected && <Check className="w-3 h-3 text-white" />}
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Item Comment */}
        <div className="space-y-3 pb-8">
          <h3 className="font-bold text-zen-900 text-sm uppercase tracking-wider">
            Instructions spéciales
          </h3>
          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Ex: Sans sucre, allergie arachides..."
            className="w-full bg-white border border-zen-200 rounded-2xl p-4 text-sm text-zen-900 placeholder:text-zen-900/30 outline-none focus:border-zen-500 focus:ring-1 focus:ring-zen-500 transition-all resize-none h-24"
          />
        </div>

      </div>

      {/* Bottom Action Bar */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-zen-200 p-4 pb-safe shadow-[0_-10px_40px_rgba(0,0,0,0.05)] z-50">
        <div className="max-w-md mx-auto flex items-center gap-4">
          
          {/* Quantity Selector */}
          <div className="flex items-center bg-zen-50 border border-zen-200 rounded-2xl p-1 shrink-0 h-[56px]">
            <button 
              onClick={() => setQuantity(Math.max(1, quantity - 1))}
              disabled={quantity <= 1}
              className="w-10 h-10 rounded-xl bg-white flex items-center justify-center text-zen-900 shadow-sm disabled:opacity-50 active:scale-95 transition-all"
            >
              <Minus className="w-4 h-4" />
            </button>
            <span className="w-8 text-center font-black text-zen-900">{quantity}</span>
            <button 
              onClick={() => setQuantity(quantity + 1)}
              className="w-10 h-10 rounded-xl bg-white flex items-center justify-center text-zen-900 shadow-sm active:scale-95 transition-all"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>

          {/* Add to cart button */}
          <button 
            onClick={handleAddToCart}
            className="flex-1 bg-gradient-to-r from-zen-500 to-zen-400 text-white rounded-2xl h-[56px] flex items-center justify-between px-6 shadow-lg shadow-zen-500/25 active:scale-[0.98] transition-all"
          >
            <span className="font-bold text-sm">Ajouter</span>
            <span className="font-black text-lg">{formatPrice(totalPrice)}</span>
          </button>

        </div>
      </div>
    </main>
  );
}
