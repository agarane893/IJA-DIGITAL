import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

export interface RestaurantTable {
  id: string; // The URL slug or simple ID (e.g., "12")
  name: string; // Display name (e.g., "Table 12", "Terrasse 1")
  capacity?: number;
}

interface TableStore {
  tables: RestaurantTable[];
  
  addTable: (table: RestaurantTable) => void;
  updateTable: (id: string, updates: Partial<RestaurantTable>) => void;
  deleteTable: (id: string) => void;
}

const DEMO_TABLES: RestaurantTable[] = [
  { id: "1", name: "Table 1", capacity: 4 },
  { id: "2", name: "Table 2", capacity: 2 },
  { id: "5", name: "Table 5", capacity: 4 },
  { id: "12", name: "Table 12", capacity: 6 },
  { id: "T1", name: "Terrasse 1", capacity: 2 },
];

export const useTableStore = create<TableStore>()(
  persist(
    (set) => ({
      tables: DEMO_TABLES,

      addTable: (table) => set((state) => ({
        tables: [...state.tables, table]
      })),

      updateTable: (id, updates) => set((state) => ({
        tables: state.tables.map((t) => (t.id === id ? { ...t, ...updates } : t))
      })),

      deleteTable: (id) => set((state) => ({
        tables: state.tables.filter((t) => t.id !== id)
      })),
    }),
    {
      name: "ija-admin-tables",
      storage: createJSONStorage(() => localStorage),
    }
  )
);
