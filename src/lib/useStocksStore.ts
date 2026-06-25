import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

export interface StockItem {
  id: string;
  name: string;
  initialStock: number;
  usedToday: number;
  unit: string;
}

interface StocksStore {
  items: StockItem[];
  
  // Actions
  addStock: (itemId: string, quantity: number) => void;
  deductStock: (itemId: string, quantity: number) => void;
  resetDailyUsage: () => void;
  addStockItem: (name: string, unit: string) => string; // Returns the new item ID
}

const DEMO_ITEMS: StockItem[] = [
  { id: "i1", name: "Café Arabica", initialStock: 2000, usedToday: 1200, unit: "g" },
  { id: "i2", name: "Sucre", initialStock: 5000, usedToday: 3200, unit: "g" },
  { id: "i3", name: "Croissant", initialStock: 50, usedToday: 32, unit: "unités" },
  { id: "i4", name: "Lait Entier", initialStock: 10, usedToday: 8, unit: "L" },
  { id: "i5", name: "Gobelets Carton", initialStock: 500, usedToday: 480, unit: "unités" },
];

export const useStocksStore = create<StocksStore>()(
  persist(
    (set) => ({
      items: DEMO_ITEMS,

      addStock: (itemId, quantity) => set((state) => ({
        items: state.items.map(item => 
          item.id === itemId 
            ? { ...item, initialStock: item.initialStock + quantity } 
            : item
        )
      })),

      deductStock: (itemId, quantity) => set((state) => ({
        items: state.items.map(item => 
          item.id === itemId 
            ? { ...item, usedToday: item.usedToday + quantity } 
            : item
        )
      })),

      resetDailyUsage: () => set((state) => ({
        items: state.items.map(item => ({
          ...item,
          initialStock: item.initialStock - item.usedToday,
          usedToday: 0
        }))
      })),

      addStockItem: (name, unit) => {
        const id = `item-${Date.now()}`;
        set((state) => ({
          items: [...state.items, { id, name, unit, initialStock: 0, usedToday: 0 }]
        }));
        return id;
      }
    }),
    {
      name: "ija-admin-stocks-v2", // changed version to ignore old broken data
      storage: createJSONStorage(() => localStorage),
    }
  )
);
