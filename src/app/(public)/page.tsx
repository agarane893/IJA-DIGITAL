"use client";

import React, { useState } from "react";
import Link from "next/link";
import { motion, Variants } from "framer-motion";
import { 
  QrCode, 
  ChefHat, 
  TrendingUp, 
  Clock, 
  Trash2, 
  Smartphone, 
  ChevronRight, 
  ArrowRight,
  Check,
  Star,
  Sparkles,
  ShieldCheck,
  Award
} from "lucide-react";
import { Button } from "@/components/ui/button";

export default function LandingPage() {
  const [savingsOrders, setSavingsOrders] = useState(60);
  const [ticketAvg, setTicketAvg] = useState(25); // average ticket in TND

  // Monthly savings estimation formula:
  // (orders * ticketAvg) * 15% increase in rotation/sales + (orders * 1 TND saved from waste/errors) * 30 days
  const estimatedSavings = Math.round(((savingsOrders * ticketAvg * 0.12) + (savingsOrders * 1.5)) * 30);

  const features = [
    {
      icon: QrCode,
      title: "Menu QR Code Tactile",
      desc: "Vos clients scannent la table, visualisent votre menu en haute définition et commandent en toute autonomie sans attendre."
    },
    {
      icon: ChefHat,
      title: "Caisse & POS Connectée",
      desc: "Une caisse ergonomique synchronisée en direct avec les commandes des tables et l'état de préparation en cuisine."
    },
    {
      icon: Clock,
      title: "Optimisation du Service",
      desc: "Moins de trajets inutiles pour vos serveurs. Les commandes arrivent instantanément sur l'écran de préparation en cuisine."
    },
    {
      icon: Trash2,
      title: "Anti-Gaspillage Intelligent",
      desc: "Gérez vos fiches techniques et ajustez vos stocks au gramme près pour réduire vos pertes alimentaires de 30%."
    },
    {
      icon: TrendingUp,
      title: "Analyses de Ventes en TND",
      desc: "Suivez vos marges, vos plats les plus rentables et votre chiffre d'affaires journalier d'un simple coup d'œil."
    },
    {
      icon: Smartphone,
      title: "Fidélisation & Avis Express",
      desc: "Récupérez les avis de vos clients directement à la table avant qu'ils ne quittent votre établissement."
    }
  ];

  const advantages = [
    {
      metric: "+25%",
      label: "Rotation des tables",
      detail: "Les clients commandent et payent plus rapidement, libérant les tables pour les clients suivants aux heures de pointe.",
      color: "from-zen-500 to-zen-400"
    },
    {
      metric: "-30%",
      label: "Gaspillage alimentaire",
      detail: "Grâce à notre suivi d'ingrédients précis et à la réduction des erreurs de saisie des serveurs entre la table et la cuisine.",
      color: "from-[#C8502E] to-[#D95D39]"
    },
    {
      metric: "100% cloud",
      label: "Analytics en temps réel",
      detail: "Pilotez vos marges en Dinars Tunisiens (TND) depuis votre smartphone, où que vous soyez en Tunisie.",
      color: "from-[#E68867] to-zen-100"
    }
  ];

  // Animation variants
  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15
      }
    }
  };

  const itemVariants: Variants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        type: "spring",
        stiffness: 100,
        damping: 15
      }
    }
  };

  return (
    <div className="min-h-screen bg-zen-50 text-zen-900 relative overflow-hidden bg-warm-gradient">
      
      {/* Decorative Organic Shapes (Artistic Backdrop) */}
      <div className="absolute top-[-10%] left-[-10%] w-[50vw] h-[50vw] bg-zen-100 rounded-full filter blur-[80px] opacity-40 mix-blend-multiply animate-pulseWarm pointer-events-none"></div>
      <div className="absolute top-[40%] right-[-10%] w-[45vw] h-[45vw] bg-zen-500/10 rounded-full filter blur-[100px] opacity-30 mix-blend-screen pointer-events-none"></div>
      <div className="absolute bottom-[-10%] left-[20%] w-[60vw] h-[60vw] bg-[#EADCB9]/40 rounded-full filter blur-[120px] opacity-40 pointer-events-none"></div>

      {/* Header */}
      <header className="relative z-50 max-w-7xl mx-auto px-6 py-5 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <div className="w-10 h-10 rounded-full bg-zen-500 flex items-center justify-center text-white font-bold text-lg shadow-md hover:scale-105 transition-all">
            I
          </div>
          <div>
            <span className="font-heading font-extrabold text-xl text-zen-900 tracking-tight">Ija Digital</span>
            <span className="text-[10px] bg-zen-500/10 text-zen-500 px-2 py-0.2 rounded-full font-bold ml-2 border border-zen-500/20">Tunisie</span>
          </div>
        </Link>
        
        {/* Navigation links - hidden on small mobile, beautiful styling */}
        <nav className="hidden md:flex items-center gap-8 text-sm font-semibold text-zen-900/85">
          <a href="#features" className="hover:text-zen-500 transition-colors">Fonctionnalités</a>
          <a href="#advantages" className="hover:text-zen-500 transition-colors">Avantages</a>
          <a href="#simulator" className="hover:text-zen-500 transition-colors">Simulateur</a>
        </nav>

        {/* Demo trigger links */}
        <div className="flex items-center gap-3">
          <Link href="/login">
            <Button variant="ghost" className="text-zen-900 hover:text-zen-500 font-bold text-xs md:text-sm">
              Démo Admin
            </Button>
          </Link>
          <Link href="/table/12">
            <Button className="bg-zen-500 text-white hover:bg-zen-500/90 font-bold text-xs md:text-sm shadow-md rounded-xl transition-all hover:-translate-y-0.5">
              Menu Table
            </Button>
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative z-10 max-w-7xl mx-auto px-6 pt-12 pb-20 md:pt-20 md:pb-32 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
        
        {/* Hero Left Content */}
        <div className="lg:col-span-7 space-y-8 text-left">
          
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="inline-flex items-center gap-2 bg-zen-500/10 border border-zen-500/20 px-3.5 py-1.5 rounded-full text-xs font-extrabold text-zen-500 uppercase tracking-wider"
          >
            <Sparkles className="w-4 h-4 text-zen-500 animate-spin" />
            La restauration connectée en Tunisie
          </motion.div>

          <motion.h2 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="font-heading text-4xl sm:text-5xl md:text-6xl font-black text-zen-900 leading-[1.1] tracking-tight"
          >
            Gérez votre restaurant ou salon de thé <span className="text-zen-500 relative inline-block">
              intelligemment.
              <span className="absolute bottom-1 left-0 w-full h-[6px] bg-[#EADCB9] -z-10 rounded-full"></span>
            </span>
          </motion.h2>

          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-zen-900/80 text-lg md:text-xl leading-relaxed max-w-2xl font-light"
          >
            Digitalisez vos tables avec notre menu QR code immersif, encaissez en un éclair avec notre caisse tactile cloud, et optimisez vos marges en temps réel. Conçu spécifiquement pour le marché tunisien.
          </motion.p>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="flex flex-wrap gap-4"
          >
            <Link href="/pos">
              <Button size="lg" className="bg-zen-500 text-white hover:bg-zen-500/90 font-bold px-8 py-6 h-auto text-base rounded-2xl shadow-lg hover:shadow-xl transition-all hover:-translate-y-1 flex items-center gap-2 group">
                Tester la Caisse POS
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
            <a href="#simulator">
              <Button size="lg" variant="outline" className="border-zen-200 bg-white text-zen-900 hover:bg-zen-50 font-bold px-8 py-6 h-auto text-base rounded-2xl transition-all">
                Simuler mes Gains
              </Button>
            </a>
          </motion.div>

          {/* Social Proof */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="pt-6 border-t border-zen-200/60 flex flex-wrap items-center gap-6"
          >
            <div className="flex -space-x-3">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="w-10 h-10 rounded-full border-2 border-[#FDF6E9] bg-[#EADCB9] flex items-center justify-center text-xs font-bold text-zen-900">
                  {i}
                </div>
              ))}
            </div>
            <div>
              <div className="flex gap-1 text-amber-500">
                {[1, 2, 3, 4, 5].map((i) => (
                  <Star key={i} className="w-4 h-4 fill-current" />
                ))}
              </div>
              <p className="text-xs text-zen-900/70 font-semibold mt-1">+120 restaurants et salons de thé partenaires en Tunisie</p>
            </div>
          </motion.div>

        </div>

        {/* Hero Right Visuals (Artistic Interactive Mockups) */}
        <div className="lg:col-span-5 relative mt-10 lg:mt-0 flex justify-center items-center">
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, type: "spring" }}
            className="relative w-full max-w-[340px] md:max-w-[400px] h-[480px]"
          >
            {/* Organic main card */}
            <div className="absolute inset-0 bg-zen-500 organic-shape-1 shadow-2xl opacity-10 animate-float pointer-events-none"></div>

            {/* Simulated Smartphone Frame */}
            <div className="absolute z-20 left-4 top-4 w-[240px] h-[450px] bg-zen-900 rounded-[40px] p-3 shadow-2xl border-4 border-zen-200 hover:rotate-2 transition-transform duration-500">
              <div className="w-full h-full bg-zen-50 rounded-[32px] overflow-hidden flex flex-col relative">
                {/* Speaker */}
                <div className="w-20 h-4 bg-zen-900 mx-auto rounded-b-xl absolute top-0 left-1/2 -translate-x-1/2 z-30"></div>
                
                {/* Mock QR Menu UI */}
                <div className="p-4 pt-6 space-y-4 flex-1 flex flex-col justify-between">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold text-zen-500">Table 08</span>
                      <span className="w-5 h-5 rounded-full bg-zen-900 flex items-center justify-center text-[8px] text-white">★</span>
                    </div>
                    <div className="h-2 w-24 bg-[#EADCB9] rounded-full"></div>
                    <div className="h-6 w-36 bg-zen-500/20 rounded-lg"></div>
                    <div className="space-y-1.5">
                      <div className="h-10 bg-white border border-zen-200/40 rounded-xl p-2 flex items-center justify-between">
                        <div className="w-16 h-2 bg-zen-900/20 rounded-full"></div>
                        <div className="w-8 h-3 bg-zen-500 rounded-md"></div>
                      </div>
                      <div className="h-10 bg-white border border-zen-200/40 rounded-xl p-2 flex items-center justify-between">
                        <div className="w-20 h-2 bg-zen-900/20 rounded-full"></div>
                        <div className="w-8 h-3 bg-zen-500 rounded-md"></div>
                      </div>
                    </div>
                  </div>

                  <div className="bg-zen-500 text-white p-3 rounded-xl flex items-center justify-between text-[11px] font-bold">
                    <span>Voir ma commande</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </div>
                </div>
              </div>
            </div>

            {/* Overlapping Admin card */}
            <div className="absolute z-30 right-[-10px] bottom-10 w-[200px] bg-white border border-zen-200 rounded-2xl p-4 shadow-xl hover:-translate-y-2 transition-transform duration-500 space-y-3">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
                <span className="text-[10px] font-bold text-zen-900/60">Ventes du jour</span>
              </div>
              <h4 className="font-heading text-lg font-bold text-zen-900">1,850 TND</h4>
              <div className="w-full h-8 flex items-end gap-1.5">
                <div className="h-[40%] w-full bg-[#EADCB9] rounded-sm"></div>
                <div className="h-[60%] w-full bg-[#EADCB9] rounded-sm"></div>
                <div className="h-[90%] w-full bg-zen-500 rounded-sm"></div>
                <div className="h-[50%] w-full bg-[#EADCB9] rounded-sm"></div>
              </div>
            </div>

            {/* Small floating QR Code */}
            <div className="absolute z-30 top-12 right-0 bg-zen-50 border-2 border-zen-500 rounded-2xl p-3 shadow-lg rotate-12 animate-float">
              <QrCode className="w-8 h-8 text-zen-500" />
            </div>

          </motion.div>
        </div>

      </section>

      {/* Features Section (6 features, stagger entry animations) */}
      <section id="features" className="relative z-10 max-w-7xl mx-auto px-6 py-24 border-t border-zen-200/60">
        <div className="text-center max-w-3xl mx-auto space-y-4 mb-20">
          <h3 className="font-heading text-xs font-extrabold uppercase tracking-widest text-zen-500">Fonctionnalités Clés</h3>
          <h2 className="font-heading text-3xl sm:text-4xl md:text-5xl font-black text-zen-900 leading-tight">
            Tout ce dont vous avez besoin pour exceller.
          </h2>
          <p className="text-zen-900/75 max-w-xl mx-auto font-light">
            {"Une suite d'outils interconnectés conçue pour éliminer les frictions en salle et maximiser les performances de votre cuisine."}
          </p>
        </div>

        <motion.div 
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
        >
          {features.map((feat, idx) => (
            <motion.div 
              key={idx} 
              variants={itemVariants}
              className="bg-white border border-zen-200 rounded-2xl p-6 shadow-sm hover:border-zen-500 hover:shadow-md transition-all group relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-24 h-24 bg-zen-50 rounded-bl-full group-hover:bg-zen-500/5 transition-colors -z-0"></div>
              <div className="relative z-10 space-y-4">
                <div className="w-12 h-12 bg-zen-50 rounded-xl flex items-center justify-center text-zen-500 border border-zen-200/40 group-hover:bg-zen-500 group-hover:text-white transition-colors duration-300">
                  <feat.icon className="w-6 h-6" />
                </div>
                <h4 className="font-heading text-xl font-bold text-zen-900">{feat.title}</h4>
                <p className="text-sm text-zen-900/70 leading-relaxed">{feat.desc}</p>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* Advantages Section */}
      <section id="advantages" className="relative z-10 bg-zen-900 text-white py-24 px-6 overflow-hidden">
        
        {/* Organic backdrop for dark section */}
        <div className="absolute top-[-20%] left-[-20%] w-[60vw] h-[60vw] bg-zen-500/10 rounded-full filter blur-[150px] pointer-events-none"></div>

        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-16 items-center">
          
          {/* Advantage Text */}
          <div className="lg:col-span-5 space-y-6">
            <span className="font-heading text-xs font-bold text-[#E68867] uppercase tracking-wider block">Avantages Compétitifs</span>
            <h2 className="font-heading text-3xl sm:text-4xl md:text-5xl font-black text-white leading-tight">
              {"Prenez une longueur d'avance."}
            </h2>
            <p className="text-white/70 font-light leading-relaxed">
              En optimisant la rotation de vos tables, en éliminant les pertes de matières premières et en pilotant vos données de vente, vous augmentez instantanément votre rentabilité.
            </p>
            <div className="space-y-3 pt-4">
              <div className="flex items-center gap-3">
                <div className="w-5 h-5 rounded-full bg-[#E68867]/20 flex items-center justify-center text-[#E68867]">
                  <Check className="w-3.5 h-3.5" />
                </div>
                <span className="text-sm text-white/90 font-medium">Installation en moins de 48 heures</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-5 h-5 rounded-full bg-[#E68867]/20 flex items-center justify-center text-[#E68867]">
                  <Check className="w-3.5 h-3.5" />
                </div>
                <span className="text-sm text-white/90 font-medium">Support technique local basé à Tunis</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-5 h-5 rounded-full bg-[#E68867]/20 flex items-center justify-center text-[#E68867]">
                  <Check className="w-3.5 h-3.5" />
                </div>
                <span className="text-sm text-white/90 font-medium">{"Aucun abonnement caché ni frais d'installation"}</span>
              </div>
            </div>
          </div>

          {/* Metrics Grid */}
          <div className="lg:col-span-7 grid grid-cols-1 md:grid-cols-3 gap-6">
            {advantages.map((adv, idx) => (
              <div 
                key={idx} 
                className="bg-white/5 border border-white/10 rounded-2xl p-6 hover:border-[#E68867]/30 transition-all flex flex-col justify-between h-72"
              >
                <div className="space-y-4">
                  <span className="font-heading text-4xl font-black text-[#E68867] block">{adv.metric}</span>
                  <h4 className="text-lg font-bold text-white leading-tight">{adv.label}</h4>
                </div>
                <p className="text-xs text-white/60 leading-relaxed mt-4">{adv.detail}</p>
              </div>
            ))}
          </div>

        </div>
      </section>

      {/* Tunisia ROI Simulator Section */}
      <section id="simulator" className="relative z-10 max-w-7xl mx-auto px-6 py-24">
        <div className="bg-white border border-zen-200 rounded-[32px] p-8 md:p-12 shadow-xl grid grid-cols-1 lg:grid-cols-12 gap-12 relative overflow-hidden">
          
          <div className="absolute right-[-10%] bottom-[-10%] w-[30vw] h-[30vw] bg-zen-50 rounded-full -z-0 opacity-80 pointer-events-none"></div>

          {/* Left Column: Sliders */}
          <div className="lg:col-span-7 space-y-8 relative z-10">
            <div>
              <span className="font-heading text-xs font-bold text-zen-500 uppercase tracking-wider block">Estimez vos économies</span>
              <h2 className="font-heading text-2xl sm:text-3xl md:text-4xl font-black text-zen-900 mt-2">
                Simulateur de Gains en Tunisie
              </h2>
              <p className="text-sm text-zen-900/65 mt-2">
                Ajustez les curseurs pour voir combien Ija Digital peut vous faire économiser ou gagner par mois.
              </p>
            </div>

            <div className="space-y-6">
              {/* Slider 1: Orders per day */}
              <div className="space-y-2">
                <div className="flex justify-between items-center text-sm font-bold">
                  <span>Commandes journalières</span>
                  <span className="text-zen-500 text-base">{savingsOrders} commandes / jour</span>
                </div>
                <input 
                  type="range" 
                  min="20" 
                  max="300" 
                  step="5" 
                  value={savingsOrders} 
                  onChange={(e) => setSavingsOrders(Number(e.target.value))}
                  className="w-full accent-[#D95D39] cursor-pointer bg-[#EADCB9] h-2 rounded-lg"
                />
                <div className="flex justify-between text-xs text-zen-900/50">
                  <span>20 cmd</span>
                  <span>150 cmd</span>
                  <span>300 cmd</span>
                </div>
              </div>

              {/* Slider 2: Average Ticket */}
              <div className="space-y-2">
                <div className="flex justify-between items-center text-sm font-bold">
                  <span>Panier moyen par table</span>
                  <span className="text-zen-500 text-base">{ticketAvg} TND</span>
                </div>
                <input 
                  type="range" 
                  min="5" 
                  max="120" 
                  step="5" 
                  value={ticketAvg} 
                  onChange={(e) => setTicketAvg(Number(e.target.value))}
                  className="w-full accent-[#D95D39] cursor-pointer bg-[#EADCB9] h-2 rounded-lg"
                />
                <div className="flex justify-between text-xs text-zen-900/50">
                  <span>5 TND</span>
                  <span>60 TND</span>
                  <span>120 TND</span>
                </div>
              </div>
            </div>

            {/* Assumptions details */}
            <div className="bg-zen-50/60 border border-zen-200/40 p-4 rounded-xl text-xs text-zen-900/65 leading-relaxed space-y-1">
              <p>{"📌 *Cette estimation repose sur une réduction de 30% du gaspillage, l'élimination totale des erreurs de caisse et une hausse moyenne de 12% des ventes grâce au menu QR digital.*"}</p>
            </div>
          </div>

          {/* Right Column: Saving Visual */}
          <div className="lg:col-span-5 bg-zen-50 border border-zen-200 rounded-2xl p-8 flex flex-col justify-between text-center relative z-10">
            <div className="space-y-3">
              <span className="text-xs font-bold text-zen-900/50 uppercase tracking-widest block">Économies Estimées</span>
              <p className="text-[10px] bg-zen-500/10 text-zen-500 px-2.5 py-0.5 rounded-full font-bold inline-block border border-zen-500/20">Gains mensuels nets</p>
              
              <div className="pt-6">
                <span className="font-heading text-4xl sm:text-5xl font-black text-zen-500">{savingsOrders ? estimatedSavings.toLocaleString() : 0}</span>
                <span className="font-heading text-lg font-bold text-zen-500 ml-1">TND</span>
              </div>
              <p className="text-xs text-zen-900/60">Équivaut à environ {(estimatedSavings * 12).toLocaleString()} TND par an réinjectés dans votre trésorerie.</p>
            </div>

            <div className="pt-8">
              <a href="#cta">
                <Button className="w-full bg-zen-500 text-white hover:bg-zen-500/90 font-bold py-4 rounded-xl shadow-md flex items-center justify-center gap-1.5">
                  Commencer à économiser
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </a>
            </div>
          </div>

        </div>
      </section>

      {/* Call to Action Section */}
      <section id="cta" className="relative z-10 max-w-7xl mx-auto px-6 pb-24">
        <div className="bg-zen-500 text-white rounded-[32px] p-8 md:p-16 text-center relative overflow-hidden shadow-2xl">
          
          {/* Organic shape overlays */}
          <div className="absolute left-[-10%] top-[-10%] w-[35vw] h-[35vw] bg-white/5 rounded-full pointer-events-none organic-shape-2"></div>
          <div className="absolute right-[-15%] bottom-[-15%] w-[40vw] h-[40vw] bg-white/5 rounded-full pointer-events-none organic-shape-1"></div>

          <div className="max-w-3xl mx-auto space-y-8 relative z-10">
            <span className="text-xs font-bold bg-white/20 text-white px-3 py-1 rounded-full uppercase tracking-widest inline-block border border-white/10">
              Essai Gratuit 14 Jours
            </span>
            <h2 className="font-heading text-3xl sm:text-4xl md:text-5xl font-black leading-tight">
              Prêt à transformer votre restaurant ?
            </h2>
            <p className="text-white/80 text-base md:text-lg font-light leading-relaxed max-w-xl mx-auto">
              {"Rejoignez les meilleurs restaurateurs tunisiens et modernisez votre service dès aujourd'hui. Aucune carte bancaire requise."}
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center max-w-md mx-auto pt-2">
              <input 
                type="email" 
                placeholder="Votre adresse email" 
                className="px-5 py-3.5 rounded-xl text-zen-900 placeholder-[#131924]/40 outline-none w-full border border-white/25 focus:ring-2 focus:ring-[#EADCB9]"
              />
              <Button className="bg-zen-900 text-white hover:bg-zen-900/90 font-bold px-8 py-3.5 h-auto rounded-xl shadow-lg shrink-0">
                Commencer
              </Button>
            </div>
            
            <div className="flex flex-wrap items-center justify-center gap-6 pt-4 text-xs text-white/70">
              <span className="flex items-center gap-1.5"><ShieldCheck className="w-4 h-4" /> {"Pas d'engagement"}</span>
              <span className="flex items-center gap-1.5"><Award className="w-4 h-4" /> Support 7j/7</span>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 bg-white border-t border-zen-200 py-12 px-6">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-8">
          
          <div className="space-y-4 md:col-span-1">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-zen-500 flex items-center justify-center text-white font-bold text-sm">
                I
              </div>
              <span className="font-heading font-extrabold text-lg text-zen-900 tracking-tight">Ija Digital</span>
            </div>
            <p className="text-xs text-zen-900/60 leading-relaxed">
              {"La solution complète de digitalisation des restaurants, cafés et salons de thé en Tunisie. Conçue pour améliorer l'expérience client et stimuler les profits."}
            </p>
          </div>

          <div className="space-y-3">
            <h5 className="font-bold text-xs text-zen-500 uppercase tracking-wider">Liens Utiles</h5>
            <ul className="space-y-2 text-xs text-zen-900/85">
              <li><a href="#features" className="hover:underline">Fonctionnalités</a></li>
              <li><a href="#advantages" className="hover:underline">Avantages</a></li>
              <li><a href="#simulator" className="hover:underline">Calculateur ROI</a></li>
            </ul>
          </div>

          <div className="space-y-3">
            <h5 className="font-bold text-xs text-zen-500 uppercase tracking-wider">Liens Démo</h5>
            <ul className="space-y-2 text-xs text-zen-900/85">
              <li><Link href="/login" className="hover:underline">Accès Admin (Login)</Link></li>
              <li><Link href="/pos" className="hover:underline">Caisse Enregistreuse POS</Link></li>
              <li><Link href="/table/12" className="hover:underline">Expérience Client QR (Table 12)</Link></li>
            </ul>
          </div>

          <div className="space-y-3">
            <h5 className="font-bold text-xs text-zen-500 uppercase tracking-wider">Contact & Support</h5>
            <ul className="space-y-2 text-xs text-zen-900/85">
              <li className="text-zen-900/60">✉ contact@ija.digital</li>
              <li className="text-zen-900/60">☎ +216 71 000 000</li>
              <li className="text-zen-900/60">📍 Tunis, Tunisie</li>
            </ul>
          </div>

        </div>

        <div className="max-w-7xl mx-auto pt-8 mt-8 border-t border-zen-200/40 flex flex-col sm:flex-row items-center justify-between text-xs text-zen-900/40">
          <p>© {new Date().getFullYear()} Ija Digital Tunisie. Tous droits réservés.</p>
          <div className="flex gap-4 mt-4 sm:mt-0">
            <a href="#" className="hover:underline">Mentions légales</a>
            <a href="#" className="hover:underline">Politique de confidentialité</a>
          </div>
        </div>
      </footer>

    </div>
  );
}
