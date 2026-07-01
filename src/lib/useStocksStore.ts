import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

export interface StockCategory {
  id: string;
  name: string;
}

export interface StockItem {
  id: string;
  name: string;
  initialStock: number;
  usedToday: number;
  unit: string;
  categoryId?: string;
}

export interface StockTransaction {
  id: string;
  itemId: string;
  type: "add" | "deduct" | "initial";
  quantity: number;
  date: string;
  userName: string;
  details?: string;
}

export interface JourneySnapshot {
  id: string;
  closedAt: string;
  closedBy: string;
  items: {
    itemId: string;
    itemName: string;
    initialStock: number;
    usedToday: number;
    finalStock: number;
    unit: string;
  }[];
}

interface StocksStore {
  items: StockItem[];
  categories: StockCategory[];
  transactions: StockTransaction[];
  journeys: JourneySnapshot[];
  
  // Actions
  addStock: (itemId: string, quantity: number, userName: string, details?: string) => void;
  deductStock: (itemId: string, quantity: number, userName: string, details?: string) => void;
  closeJourney: (userName: string) => void;
  addStockItem: (name: string, unit: string, userName: string, initialQty?: number, categoryId?: string) => string;
  updateStockItem: (id: string, updates: Partial<StockItem>) => void;
  deleteStockItem: (id: string) => void;
  
  // Category Actions
  addStockCategory: (name: string) => void;
  updateStockCategory: (id: string, name: string) => void;
  deleteStockCategory: (id: string) => void;
}

const DEFAULT_CATEGORIES: StockCategory[] = [
  { id: "cat-ingredients", name: "Ingrédients" },
  { id: "cat-emballages", name: "Emballages" },
  { id: "cat-boissons", name: "Boissons" },
  { id: "cat-divers", name: "Divers" }
];

const DEMO_ITEMS: StockItem[] = [
  { id: "i1", name: "Café Arabica", initialStock: 2000, usedToday: 1200, unit: "g", categoryId: "cat-ingredients" },
  { id: "i2", name: "Sucre", initialStock: 5000, usedToday: 3200, unit: "g", categoryId: "cat-ingredients" },
  { id: "i3", name: "Croissant", initialStock: 50, usedToday: 32, unit: "unités", categoryId: "cat-ingredients" },
  { id: "i4", name: "Lait Entier", initialStock: 10, usedToday: 8, unit: "L", categoryId: "cat-ingredients" },
  { id: "i5", name: "Gobelets Carton", initialStock: 500, usedToday: 480, unit: "unités", categoryId: "cat-emballages" },
];

const DEMO_TRANSACTIONS: StockTransaction[] = [
  {
    id: "t1",
    itemId: "i1",
    type: "add",
    quantity: 1000,
    date: new Date(Date.now() - 3600000 * 2).toISOString(),
    userName: "Alice (Manager)",
    details: "Approvisionnement hebdomadaire"
  },
  {
    id: "t2",
    itemId: "i1",
    type: "deduct",
    quantity: 15,
    date: new Date(Date.now() - 3600000).toISOString(),
    userName: "Jean (Serveur)",
    details: "Commande #1024"
  }
];

export const useStocksStore = create<StocksStore>()(
  persist(
    (set) => ({
      items: DEMO_ITEMS,
      categories: DEFAULT_CATEGORIES,
      transactions: DEMO_TRANSACTIONS,
      journeys: [],

      addStock: (itemId, quantity, userName, details) => set((state) => {
        const transaction: StockTransaction = {
          id: `tx-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          itemId,
          type: "add",
          quantity,
          date: new Date().toISOString(),
          userName,
          details: details || "Ajout manuel"
        };
        return {
          items: state.items.map(item => 
            item.id === itemId 
              ? { ...item, initialStock: item.initialStock + quantity } 
              : item
          ),
          transactions: [transaction, ...(state.transactions || [])]
        };
      }),

      deductStock: (itemId, quantity, userName, details) => set((state) => {
        const transaction: StockTransaction = {
          id: `tx-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          itemId,
          type: "deduct",
          quantity,
          date: new Date().toISOString(),
          userName,
          details: details || "Retrait manuel"
        };
        return {
          items: state.items.map(item => 
            item.id === itemId 
              ? { ...item, usedToday: item.usedToday + quantity } 
              : item
          ),
          transactions: [transaction, ...(state.transactions || [])]
        };
      }),

      closeJourney: (userName) => set((state) => {
        const snapshotItems = state.items.map(item => ({
          itemId: item.id,
          itemName: item.name,
          initialStock: item.initialStock,
          usedToday: item.usedToday,
          finalStock: item.initialStock - item.usedToday,
          unit: item.unit
        }));

        const snapshot: JourneySnapshot = {
          id: `j-${Date.now()}`,
          closedAt: new Date().toISOString(),
          closedBy: userName,
          items: snapshotItems
        };

        const resetTx: StockTransaction[] = state.items.map(item => ({
          id: `tx-reset-${item.id}-${Date.now()}`,
          itemId: item.id,
          type: "deduct",
          quantity: item.usedToday,
          date: new Date().toISOString(),
          userName,
          details: `Clôture de session - utilisé aujourd'hui`
        }));

        return {
          journeys: [snapshot, ...(state.journeys || [])],
          transactions: [...resetTx, ...(state.transactions || [])],
          items: state.items.map(item => ({
            ...item,
            initialStock: Math.max(0, item.initialStock - item.usedToday),
            usedToday: 0
          }))
        };
      }),

      addStockItem: (name, unit, userName, initialQty = 0, categoryId) => {
        const id = `item-${Date.now()}`;
        set((state) => {
          const transaction: StockTransaction = {
            id: `tx-${Date.now()}`,
            itemId: id,
            type: "initial",
            quantity: initialQty,
            date: new Date().toISOString(),
            userName,
            details: "Création de l'ingrédient"
          };
          return {
            items: [...state.items, { id, name, unit, initialStock: initialQty, usedToday: 0, categoryId }],
            transactions: [transaction, ...(state.transactions || [])]
          };
        });
        return id;
      },

      updateStockItem: (id, updates) => set((state) => ({
        items: state.items.map(item => item.id === id ? { ...item, ...updates } : item)
      })),

      deleteStockItem: (id) => set((state) => ({
        items: state.items.filter(item => item.id !== id)
      })),

      // Categories management implementations
      addStockCategory: (name) => set((state) => ({
        categories: [...state.categories, { id: `cat-${Date.now()}`, name }]
      })),

      updateStockCategory: (id, name) => set((state) => ({
        categories: state.categories.map(c => c.id === id ? { ...c, name } : c)
      })),

      deleteStockCategory: (id) => set((state) => {
        // Also clean up categoryId on items that belong to the deleted category
        return {
          categories: state.categories.filter(c => c.id !== id),
          items: state.items.map(item => item.categoryId === id ? { ...item, categoryId: undefined } : item)
        };
      })
    }),
    {
      name: "ija-admin-stocks-v4",
      storage: createJSONStorage(() => localStorage),
    }
  )
);
