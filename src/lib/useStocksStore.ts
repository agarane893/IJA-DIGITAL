import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

export interface StockItem {
  id: string;
  name: string;
  currentLevel: number;
  minThreshold: number;
  maxCapacity: number;
  unit: string;
}

export interface StockMovement {
  id: string;
  itemId: string;
  type: "in" | "out";
  quantity: number;
  date: string;
  note: string;
}

interface StocksStore {
  items: StockItem[];
  movements: StockMovement[];
  
  updateStock: (itemId: string, quantity: number, type: "in" | "out", note: string) => void;
  updateThreshold: (itemId: string, threshold: number) => void;
}

const DEMO_ITEMS: StockItem[] = [
  { id: "i1", name: "Café grain", currentLevel: 15, minThreshold: 5, maxCapacity: 50, unit: "kg" },
  { id: "i2", name: "Sucre", currentLevel: 4, minThreshold: 10, maxCapacity: 100, unit: "kg" }, // Alert status
  { id: "i3", name: "Lait Demi-écrémé", currentLevel: 80, minThreshold: 20, maxCapacity: 200, unit: "L" },
  { id: "i4", name: "Thé Vert Gunpowder", currentLevel: 8, minThreshold: 5, maxCapacity: 30, unit: "kg" },
  { id: "i5", name: "Gobelets Carton", currentLevel: 450, minThreshold: 500, maxCapacity: 2000, unit: "unités" }, // Alert status
];

export const useStocksStore = create<StocksStore>()(
  persist(
    (set) => ({
      items: DEMO_ITEMS,
      movements: [
        { id: "m1", itemId: "i1", type: "in", quantity: 10, date: new Date(Date.now() - 86400000).toISOString(), note: "Livraison hebdomadaire" },
        { id: "m2", itemId: "i2", type: "out", quantity: 2, date: new Date().toISOString(), note: "Sortie cuisine" },
      ],

      updateStock: (itemId, quantity, type, note) => set((s) => {
        const item = s.items.find(i => i.id === itemId);
        if (!item) return s;

        const delta = type === "in" ? quantity : -quantity;
        const newLevel = Math.max(0, item.currentLevel + delta);

        const movement: StockMovement = {
          id: `m-${Date.now()}`,
          itemId,
          type,
          quantity,
          date: new Date().toISOString(),
          note
        };

        return {
          items: s.items.map(i => i.id === itemId ? { ...i, currentLevel: newLevel } : i),
          movements: [movement, ...s.movements]
        };
      }),

      updateThreshold: (itemId, minThreshold) => set((s) => ({
        items: s.items.map(i => i.id === itemId ? { ...i, minThreshold } : i)
      }))
    }),
    {
      name: "ija-admin-stocks",
      storage: createJSONStorage(() => localStorage),
    }
  )
);
