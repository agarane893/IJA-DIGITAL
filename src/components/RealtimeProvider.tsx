"use client";

import React, { useEffect, useState } from "react";
import { toast } from "sonner";
import { useOrderStore } from "@/lib/useOrderStore";
import { PlacedOrder } from "@/lib/useCartStore";
import { BellRing, CheckCircle2 } from "lucide-react";

// Realtime connection state
import { create } from "zustand";

interface RealtimeState {
  isConnected: boolean;
  setConnected: (status: boolean) => void;
}

export const useRealtimeStore = create<RealtimeState>((set) => ({
  isConnected: false,
  setConnected: (status) => set({ isConnected: status }),
}));

export const RealtimeProvider = ({ children }: { children: React.ReactNode }) => {
  const setConnected = useRealtimeStore((state) => state.setConnected);
  const addOrder = useOrderStore((state) => state.addOrder);

  useEffect(() => {
    let channel: BroadcastChannel | null = null;
    try {
      channel = new BroadcastChannel("ija_realtime");
      setConnected(true);

      channel.onmessage = (event) => {
        if (event.data.type === "NEW_ORDER") {
          const newOrder: PlacedOrder = event.data.payload;
          
          // Play a sound (optional if we had an audio file, using a simple beep here)
          // const audio = new Audio('/notification.mp3');
          // audio.play().catch(e => console.log('Audio play failed', e));

          // Add to global orders store
          addOrder(newOrder);

          // Show pulsing toast notification
          toast.custom((t) => (
            <div className="bg-zen-900 border border-zen-500 rounded-2xl p-4 shadow-2xl flex items-start gap-4 min-w-[300px] animate-in slide-in-from-right-8 fade-in">
              <div className="w-10 h-10 rounded-full bg-zen-500/20 flex items-center justify-center text-zen-500 shrink-0 relative">
                <span className="absolute inset-0 rounded-full border-2 border-zen-500 animate-ping opacity-75"></span>
                <BellRing className="w-5 h-5 relative z-10" />
              </div>
              <div className="flex-1">
                <h4 className="font-heading font-black text-white text-sm">Nouvelle Commande</h4>
                <p className="text-white/60 text-xs mt-0.5">
                  Table {newOrder.tableId} • {newOrder.items.length} article(s)
                </p>
                <div className="mt-3 flex items-center gap-2">
                  <span className="bg-zen-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-sm">
                    {newOrder.id}
                  </span>
                  <span className="font-black text-white text-sm ml-auto">
                    {newOrder.total.toFixed(3)} TND
                  </span>
                </div>
              </div>
            </div>
          ), { duration: 5000 });
        }
      };
    } catch (e) {
      console.error("BroadcastChannel not supported", e);
      setConnected(false);
    }

    return () => {
      if (channel) {
        channel.close();
      }
    };
  }, [addOrder, setConnected]);

  return <>{children}</>;
};
