"use client";

import { Settings, Bell, Globe, Shield, Palette } from "lucide-react";

const SECTIONS = [
  {
    title: "Restaurant",
    icon: <Globe className="w-4 h-4" />,
    fields: [
      { label: "Nom du restaurant", value: "Ija Tunis", type: "text" },
      { label: "Adresse", value: "12 Rue de Carthage, Tunis", type: "text" },
      { label: "Téléphone", value: "+216 71 000 000", type: "tel" },
      { label: "Email", value: "contact@ija.digital", type: "email" },
    ],
  },
  {
    title: "Notifications",
    icon: <Bell className="w-4 h-4" />,
    toggles: [
      { label: "Nouvelles commandes", desc: "Alerte sonore pour chaque commande", enabled: true },
      { label: "Stock faible", desc: "Notification quand un article passe sous le seuil", enabled: true },
      { label: "Rapport journalier", desc: "Résumé automatique à 23h chaque soir", enabled: false },
    ],
  },
  {
    title: "Sécurité",
    icon: <Shield className="w-4 h-4" />,
    toggles: [
      { label: "Double authentification", desc: "Sécurité renforcée pour tous les comptes", enabled: false },
      { label: "Déconnexion automatique", desc: "Après 30 min d'inactivité", enabled: true },
    ],
  },
];

export default function SettingsPage() {
  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="font-heading text-2xl font-black text-white flex items-center gap-2">
          <Settings className="w-7 h-7 text-white/60" />
          Paramètres
        </h1>
        <p className="text-sm text-white/40 mt-1">Configuration générale de la plateforme</p>
      </div>

      {SECTIONS.map((section) => (
        <div key={section.title} className="bg-zen-800 border border-white/6 rounded-2xl overflow-hidden">
          <div className="flex items-center gap-2.5 px-5 py-4 border-b border-white/6">
            <div className="w-8 h-8 rounded-lg bg-white/5 border border-white/8 flex items-center justify-center text-white/50">
              {section.icon}
            </div>
            <h2 className="font-heading text-base font-bold text-white">{section.title}</h2>
          </div>

          <div className="p-5 space-y-4">
            {section.fields?.map((f) => (
              <div key={f.label} className="space-y-1.5">
                <label className="text-xs font-bold text-white/40 uppercase tracking-wider">{f.label}</label>
                <input
                  type={f.type}
                  defaultValue={f.value}
                  className="w-full bg-white/5 border border-white/8 rounded-xl px-4 py-2.5 text-sm text-white placeholder-white/20 outline-none focus:border-zen-500/40 focus:bg-white/8 transition-all"
                />
              </div>
            ))}
            {section.toggles?.map((t) => (
              <div key={t.label} className="flex items-center justify-between py-1">
                <div>
                  <p className="text-sm font-bold text-white/80">{t.label}</p>
                  <p className="text-xs text-white/30 mt-0.5">{t.desc}</p>
                </div>
                <div className={`w-11 h-6 rounded-full border relative cursor-pointer transition-all ${t.enabled ? "bg-zen-500/70 border-zen-500/40" : "bg-white/8 border-white/10"}`}>
                  <div className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow-sm transition-all ${t.enabled ? "left-[calc(100%-22px)]" : "left-0.5"}`} />
                </div>
              </div>
            ))}
          </div>

          {section.fields && (
            <div className="px-5 pb-5">
              <button className="bg-zen-500 text-white font-bold text-xs px-5 py-2.5 rounded-xl hover:bg-zen-500/90 transition-all shadow-md shadow-zen-500/20">
                Sauvegarder
              </button>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
