"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Utensils,
  Bell,
  MessageSquare,
  ShoppingBag,
  ChevronRight,
  CheckCircle2,
  Sparkles,
  Info,
  MapPin,
  Clock,
  Phone,
  ExternalLink,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  CATEGORIES,
  MENU_ITEMS,
  RESTAURANT_NAME,
  RESTAURANT_TAGLINE,
  RESTAURANT_LOCATION,
  RESTAURANT_MAPS_URL,
  RESTAURANT_DESCRIPTION,
  RESTAURANT_HOURS,
  RESTAURANT_PHONE,
  CategoryId,
  formatPrice,
} from "@/lib/menuData";
import { useCartStore } from "@/lib/useCartStore";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { AmbientBackground } from "@/components/AmbientBackground";

export default function ClientTablePage() {
  const params = useParams();
  const id = params?.id || "12";
  const router = useRouter();

  const { getCartCount, getCartTotal, setTableId } = useCartStore();
  const cartCount = getCartCount();
  const cartTotal = getCartTotal();

  const [calledWaiter, setCalledWaiter] = useState(false);
  const [activeCategory, setActiveCategory] = useState<CategoryId>("boissons");
  const [showIntro, setShowIntro] = useState(true);

  useEffect(() => {
    setTableId(id as string);
  }, [id, setTableId]);

  // Auto-dismiss intro after 4 seconds
  useEffect(() => {
    const t = setTimeout(() => setShowIntro(false), 4000);
    return () => clearTimeout(t);
  }, []);

  const handleCallWaiter = () => {
    if (calledWaiter) return;
    setCalledWaiter(true);
    setTimeout(() => setCalledWaiter(false), 5000);
  };

  const filteredItems = MENU_ITEMS.filter((item) => item.categoryId === activeCategory);

  return (
    <main className="min-h-screen bg-zen-50 text-zen-900 pb-32 font-sans select-none relative overflow-x-hidden">
      {/* Zen Ambient Background */}
      <AmbientBackground variant="light" />

      {/* ─── INTRO OVERLAY ─────────────────────────────────────────── */}
      <AnimatePresence>
        {showIntro && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
            transition={{ duration: 0.35 }}
            className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-0 sm:p-6"
          >
            {/* Backdrop */}
            <div
              className="absolute inset-0 bg-zen-900/70 backdrop-blur-md"
              onClick={() => setShowIntro(false)}
            />

            {/* Card */}
            <motion.div
              initial={{ y: 80, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 60, opacity: 0 }}
              transition={{ type: "spring", bounce: 0.28, duration: 0.55 }}
              className="relative w-full sm:max-w-sm bg-white rounded-t-[2.5rem] sm:rounded-3xl overflow-hidden shadow-2xl"
            >
              {/* Top hero gradient strip */}
              <div className="h-32 bg-gradient-to-br from-zen-700 via-zen-600 to-zen-500 relative overflow-hidden">
                <div className="absolute inset-0 opacity-20"
                  style={{
                    backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
                  }}
                />
                {/* Logo circle */}
                <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2 w-16 h-16 rounded-2xl bg-white shadow-xl flex items-center justify-center">
                  <span className="font-black text-2xl text-zen-700">I</span>
                </div>

                {/* Close button */}
                <button
                  onClick={() => setShowIntro(false)}
                  className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 backdrop-blur flex items-center justify-center text-white transition-all"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Content */}
              <div className="pt-12 pb-7 px-6 text-center space-y-4">
                {/* Name + tagline */}
                <div>
                  <div className="inline-flex items-center gap-1.5 bg-zen-50 text-zen-600 text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-widest border border-zen-200 mb-2">
                    <Sparkles className="w-3 h-3" />
                    Bienvenue
                  </div>
                  <h1 className="font-heading text-2xl font-black text-zen-900 leading-tight">
                    {RESTAURANT_NAME}
                  </h1>
                  <p className="text-xs text-zen-500 font-semibold mt-1">
                    {RESTAURANT_TAGLINE}
                  </p>
                </div>

                {/* Description */}
                <p className="text-xs text-zen-600/80 leading-relaxed font-medium text-left px-1">
                  {RESTAURANT_DESCRIPTION}
                </p>

                {/* Info cards */}
                <div className="space-y-2.5 text-left">
                  {/* Location */}
                  <a
                    href={RESTAURANT_MAPS_URL}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-start gap-3 bg-zen-50 hover:bg-zen-100 border border-zen-200 rounded-2xl px-4 py-3 transition-all group"
                  >
                    <div className="w-8 h-8 rounded-xl bg-zen-500/10 border border-zen-200 flex items-center justify-center shrink-0 mt-0.5">
                      <MapPin className="w-4 h-4 text-zen-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[10px] font-bold text-zen-500 uppercase tracking-wider mb-0.5">
                        Localisation
                      </p>
                      <p className="text-xs font-bold text-zen-900 leading-snug">
                        {RESTAURANT_LOCATION}
                      </p>
                    </div>
                    <ExternalLink className="w-3.5 h-3.5 text-zen-400 group-hover:text-zen-600 shrink-0 mt-1 transition-colors" />
                  </a>

                  {/* Hours */}
                  <div className="flex items-center gap-3 bg-zen-50 border border-zen-200 rounded-2xl px-4 py-3">
                    <div className="w-8 h-8 rounded-xl bg-zen-500/10 border border-zen-200 flex items-center justify-center shrink-0">
                      <Clock className="w-4 h-4 text-zen-600" />
                    </div>
                    <div>
                      <p className="text-[10px] font-bold text-zen-500 uppercase tracking-wider mb-0.5">
                        Horaires
                      </p>
                      <p className="text-xs font-bold text-zen-900 leading-snug">
                        {RESTAURANT_HOURS}
                      </p>
                    </div>
                  </div>

                  {/* Phone */}
                  <a
                    href={`tel:${RESTAURANT_PHONE.replace(/\s/g, "")}`}
                    className="flex items-center gap-3 bg-zen-50 hover:bg-zen-100 border border-zen-200 rounded-2xl px-4 py-3 transition-all"
                  >
                    <div className="w-8 h-8 rounded-xl bg-zen-500/10 border border-zen-200 flex items-center justify-center shrink-0">
                      <Phone className="w-4 h-4 text-zen-600" />
                    </div>
                    <div>
                      <p className="text-[10px] font-bold text-zen-500 uppercase tracking-wider mb-0.5">
                        Téléphone
                      </p>
                      <p className="text-xs font-bold text-zen-900">{RESTAURANT_PHONE}</p>
                    </div>
                  </a>
                </div>

                {/* CTA */}
                <button
                  onClick={() => setShowIntro(false)}
                  className="w-full bg-zen-900 hover:bg-zen-800 text-white font-bold text-sm py-3.5 rounded-2xl transition-all shadow-lg shadow-zen-900/20 active:scale-[0.98] flex items-center justify-center gap-2"
                >
                  <Utensils className="w-4 h-4" />
                  Voir le Menu
                </button>

                {/* Auto-dismiss progress indicator */}
                <div className="w-full bg-zen-100 h-0.5 rounded-full overflow-hidden">
                  <motion.div
                    className="h-full bg-zen-400 rounded-full"
                    initial={{ width: "100%" }}
                    animate={{ width: "0%" }}
                    transition={{ duration: 4, ease: "linear" }}
                  />
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header */}
      <header className="sticky top-0 bg-zen-50/90 backdrop-blur-xl border-b border-zen-200/50 px-4 py-3 flex items-center justify-between z-40">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-zen-500 to-zen-400 flex items-center justify-center text-white font-black text-lg shadow-md shadow-zen-500/20">
            I
          </div>
          <div>
            <h1 className="font-heading font-black text-zen-900 text-sm leading-tight line-clamp-1">
              {RESTAURANT_NAME}
            </h1>
            <p className="text-[10px] text-zen-500 font-bold">
              {RESTAURANT_TAGLINE}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {/* Reopen intro button */}
          <button
            onClick={() => setShowIntro(true)}
            className="w-8 h-8 rounded-xl border border-zen-200 bg-white flex items-center justify-center text-zen-500 hover:text-zen-700 hover:bg-zen-50 transition-all"
            title="Infos du restaurant"
          >
            <MapPin className="w-3.5 h-3.5" />
          </button>
          <div className="bg-zen-900 text-white font-bold px-3 py-1.5 rounded-xl text-xs shadow-sm flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
            Table {id}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-md mx-auto space-y-6 pt-6">
        
        {/* Welcome Section */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="px-4"
        >
          <div className="bg-white border border-zen-200 rounded-3xl p-6 relative overflow-hidden shadow-sm">
            <div className="absolute -right-8 -top-8 w-32 h-32 bg-gradient-to-br from-zen-50 to-zen-100 rounded-full opacity-50"></div>
            <div className="relative z-10 space-y-4">
              <span className="inline-flex items-center gap-1.5 bg-zen-500/10 text-zen-500 text-[11px] font-bold px-3 py-1 rounded-full uppercase tracking-wider">
                <Sparkles className="w-3.5 h-3.5" />
                Bienvenue
              </span>
              <h2 className="font-heading text-2xl font-black text-zen-900 leading-tight">
                Scannez, Commandez, Savourez.
              </h2>
              <p className="text-xs text-zen-900/70 leading-relaxed font-medium">
                Découvrez notre menu numérique interactif, passez commande depuis votre mobile et réglez en un clic.
              </p>

              {/* Location mini-banner */}
              <a
                href={RESTAURANT_MAPS_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 bg-zen-50 hover:bg-zen-100 border border-zen-200 rounded-xl px-3 py-2 transition-all w-fit group"
              >
                <MapPin className="w-3.5 h-3.5 text-zen-500 shrink-0" />
                <span className="text-[11px] font-bold text-zen-700 truncate">{RESTAURANT_LOCATION}</span>
                <ExternalLink className="w-3 h-3 text-zen-400 group-hover:text-zen-600 shrink-0 transition-colors" />
              </a>
            </div>
          </div>
        </motion.div>

        {/* Quick Actions */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-2 gap-3 px-4"
        >
          <button 
            onClick={handleCallWaiter}
            className={cn(
              "h-16 rounded-2xl border bg-white flex flex-col justify-center items-center gap-1.5 transition-all active:scale-95",
              calledWaiter 
                ? "border-emerald-500/30 bg-emerald-500/5 text-emerald-600 shadow-sm" 
                : "border-zen-200 text-zen-900 hover:bg-zen-50 hover:border-zen-500/30"
            )}
          >
            {calledWaiter ? (
              <>
                <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                <span className="text-[11px] font-bold">Appel envoyé !</span>
              </>
            ) : (
              <>
                <Bell className="w-5 h-5 text-zen-500" />
                <span className="text-[11px] font-bold">Appeler Serveur</span>
              </>
            )}
          </button>

          <button className="h-16 rounded-2xl border border-zen-200 bg-white text-zen-900 hover:bg-zen-50 flex flex-col justify-center items-center gap-1.5 transition-all active:scale-95">
            <MessageSquare className="w-5 h-5 text-zen-500" />
            <span className="text-[11px] font-bold">Laisser un Avis</span>
          </button>
        </motion.div>

        {/* Menu Section */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="space-y-4"
        >
          <div className="px-4 flex items-center justify-between">
            <h3 className="font-heading text-lg font-black flex items-center gap-2">
              <Utensils className="w-5 h-5 text-zen-500" />
              Menu Digital
            </h3>
          </div>

          {/* Categories Horizontal Scroll */}
          <div className="px-4 pb-2 -mx-4 overflow-x-auto scrollbar-none flex gap-2 w-[calc(100%+2rem)] pl-4 pr-4">
            {CATEGORIES.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={cn(
                  "flex-shrink-0 px-4 py-2.5 rounded-2xl text-sm font-bold transition-all flex items-center gap-2 border",
                  activeCategory === cat.id
                    ? "bg-zen-900 text-white border-zen-900 shadow-md"
                    : "bg-white text-zen-900/70 border-zen-200 hover:border-zen-900/30 hover:text-zen-900"
                )}
              >
                <span>{cat.emoji}</span>
                {cat.label}
              </button>
            ))}
          </div>

          {/* Items List */}
          <div className="px-4 space-y-3 pb-8">
            <AnimatePresence mode="popLayout">
              {filteredItems.map((item) => (
                <motion.div
                  layout
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.2 }}
                  key={item.id}
                >
                  <Link href={`/table/${id}/item/${item.id}`} className="block">
                    <div className={cn(
                      "bg-white border rounded-2xl p-4 flex gap-4 transition-all hover:shadow-md active:scale-[0.98]",
                      item.available ? "border-zen-200 hover:border-zen-500" : "border-gray-200 opacity-60 grayscale-[0.5]"
                    )}>
                      {/* Placeholder Image / Emoji box */}
                      <div className="w-24 h-24 shrink-0 rounded-xl bg-gradient-to-br from-zen-50 to-zen-100 flex items-center justify-center text-4xl shadow-inner relative overflow-hidden">
                        <span className="relative z-10">{item.emoji}</span>
                        {!item.available && (
                          <div className="absolute inset-0 bg-white/50 backdrop-blur-[2px] z-20 flex items-center justify-center">
                            <span className="bg-gray-800 text-white text-[9px] font-bold px-2 py-1 rounded-full rotate-[-15deg]">ÉPUISÉ</span>
                          </div>
                        )}
                      </div>

                      <div className="flex-1 flex flex-col justify-between py-0.5">
                        <div className="space-y-1">
                          <div className="flex items-start justify-between gap-2">
                            <h4 className="font-bold text-zen-900 text-sm leading-tight line-clamp-2">
                              {item.name}
                            </h4>
                            {item.popular && (
                              <span className="shrink-0 bg-zen-500/10 text-zen-500 text-[9px] font-black px-1.5 py-0.5 rounded uppercase tracking-wider">
                                Populaire
                              </span>
                            )}
                          </div>
                          <p className="text-[11px] text-zen-900/50 line-clamp-2 leading-snug">
                            {item.description}
                          </p>
                        </div>

                        <div className="flex items-center justify-between mt-2">
                          <span className="text-sm font-black text-zen-500">
                            {formatPrice(item.price)}
                          </span>
                          {item.available && (
                            <div className="w-8 h-8 rounded-full bg-zen-900 text-white flex items-center justify-center shadow-md">
                              <span className="font-black text-lg leading-none mb-0.5">+</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </Link>
                </motion.div>
              ))}
              {filteredItems.length === 0 && (
                <div className="text-center py-8">
                  <Info className="w-8 h-8 text-zen-900/20 mx-auto mb-2" />
                  <p className="text-sm text-zen-900/50 font-medium">Aucun article dans cette catégorie.</p>
                </div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>

      </div>

      {/* Floating Action Bar (Cart) */}
      <AnimatePresence>
        {cartCount > 0 && (
          <motion.div 
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            className="fixed bottom-6 left-4 right-4 max-w-md mx-auto z-50"
          >
            <Link href={`/table/${id}/cart`}>
              <div className="bg-zen-900 text-white p-3.5 rounded-2xl shadow-2xl flex items-center justify-between cursor-pointer active:scale-95 transition-transform border border-white/10">
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <div className="bg-white/10 p-2.5 rounded-xl">
                      <ShoppingBag className="w-5 h-5 text-white" />
                    </div>
                    <div className="absolute -top-2 -right-2 w-5 h-5 bg-zen-500 rounded-full text-[10px] font-black flex items-center justify-center shadow-sm border-2 border-zen-900">
                      {cartCount}
                    </div>
                  </div>
                  <div>
                    <p className="text-sm font-bold">Voir mon panier</p>
                    <p className="text-[11px] text-white/60 font-medium">{formatPrice(cartTotal)}</p>
                  </div>
                </div>
                <div className="bg-zen-500 text-white hover:bg-zen-500/90 font-bold px-4 py-2 text-xs rounded-xl flex items-center gap-1 shadow-md shadow-zen-500/20 transition-colors">
                  Commander
                  <ChevronRight className="w-4 h-4" />
                </div>
              </div>
            </Link>
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  );
}
