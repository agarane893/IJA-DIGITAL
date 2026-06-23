import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { PlacedOrder } from "./useCartStore";

interface OrderStore {
  orders: PlacedOrder[];
  addOrder: (order: PlacedOrder) => void;
  updateOrder: (id: string, updates: Partial<PlacedOrder>) => void;
  updateOrderStatus: (id: string, status: PlacedOrder["status"]) => void;
  clearOrders: () => void;
}

const DEMO_ORDERS: PlacedOrder[] = [
  {
    id: "CMD-801",
    tableId: "5",
    total: 24.500,
    paymentMethod: "cash",
    globalComment: "Servir le thé avec les gâteaux",
    status: "new",
    createdAt: new Date(Date.now() - 1000 * 60 * 2).toISOString(), // 2 mins ago
    items: [
      {
        id: "item-1",
        menuItem: { id: "1", name: "Thé Vert aux Pignons", price: 5.5, categoryId: "boissons", emoji: "🍵", available: true, description: "" },
        quantity: 2,
        options: {},
        comment: "Extra pignons svp",
        unitPrice: 5.5,
        totalPrice: 11.0,
      },
      {
        id: "item-2",
        menuItem: { id: "2", name: "Assortiment Baklawa", price: 13.5, categoryId: "patisseries", emoji: "🍯", available: true, description: "" },
        quantity: 1,
        options: { "Taille": "Moyen" },
        comment: "",
        unitPrice: 13.5,
        totalPrice: 13.5,
      }
    ]
  },
  {
    id: "CMD-802",
    tableId: "12",
    total: 14.000,
    paymentMethod: "card",
    globalComment: "",
    status: "cooking",
    estimatedTime: "10 min",
    createdAt: new Date(Date.now() - 1000 * 60 * 12).toISOString(), // 12 mins ago
    items: [
      {
        id: "item-3",
        menuItem: { id: "3", name: "Ojja Merguez", price: 14.0, categoryId: "plats", emoji: "🍳", available: true, description: "" },
        quantity: 1,
        options: { "Piquant": "Moyennement" },
        comment: "Sans poivrons",
        unitPrice: 14.0,
        totalPrice: 14.0,
      }
    ]
  },
  {
    id: "CMD-803",
    tableId: "2",
    total: 8.500,
    paymentMethod: "cash",
    globalComment: "",
    status: "ready",
    createdAt: new Date(Date.now() - 1000 * 60 * 25).toISOString(), // 25 mins ago
    items: [
      {
        id: "item-4",
        menuItem: { id: "4", name: "Café Express", price: 3.5, categoryId: "boissons", emoji: "☕", available: true, description: "" },
        quantity: 1,
        options: {},
        comment: "",
        unitPrice: 3.5,
        totalPrice: 3.5,
      },
      {
        id: "item-5",
        menuItem: { id: "5", name: "Jus d'Orange Frais", price: 5.0, categoryId: "boissons", emoji: "🍊", available: true, description: "" },
        quantity: 1,
        options: {},
        comment: "Sans glaçons",
        unitPrice: 5.0,
        totalPrice: 5.0,
      }
    ]
  }
];

export const useOrderStore = create<OrderStore>()(
  persist(
    (set) => ({
      // Initialize with demo orders if empty
      orders: DEMO_ORDERS,
      addOrder: (order) => set((state) => {
        if (state.orders.some((o) => o.id === order.id)) return state;
        return { orders: [order, ...state.orders] };
      }),
      updateOrder: (id, updates) => set((state) => ({
        orders: state.orders.map((o) => (o.id === id ? { ...o, ...updates } : o)),
      })),
      updateOrderStatus: (id, status) => set((state) => ({
        orders: state.orders.map((o) => (o.id === id ? { ...o, status } : o)),
      })),
      clearOrders: () => set({ orders: [] }),
    }),
    {
      name: "ija-global-orders",
      storage: createJSONStorage(() => localStorage),
    }
  )
);
