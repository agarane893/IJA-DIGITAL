import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { PlacedOrder } from "./useCartStore";
import { useStocksStore } from "./useStocksStore";
import { useAdminMenuStore } from "./useAdminMenuStore";
import { useAuthStore } from "./useAuthStore";
import { toast } from "sonner";

interface OrderStore {
  orders: PlacedOrder[];
  addOrder: (order: PlacedOrder) => void;
  updateOrder: (id: string, updates: Partial<PlacedOrder>) => void;
  updateOrderStatus: (id: string, status: PlacedOrder["status"]) => void;
  cancelOrder: (id: string, reason: string, cancelledBy: string) => void;
  markAsPaid: (id: string, paidBy: string, paymentMethod?: "cash" | "card") => void;
  clearOrders: () => void;
}


function deductStockForOrder(order: PlacedOrder) {
  const { products } = useAdminMenuStore.getState();
  const { items: stockItems, deductStock } = useStocksStore.getState();
  const activeUser = useAuthStore.getState().user;
  const userName = activeUser ? `${activeUser.name} (${activeUser.role === 'manager' ? 'Manager' : 'Serveur'})` : "Système";

  let deductedCount = 0;
  let lowStockAlerts: string[] = [];

  order.items?.forEach(orderItem => {
    const adminProduct = products.find(p => p.name.toLowerCase() === orderItem.menuItem?.name?.toLowerCase());
    
    if (adminProduct && adminProduct.recipe) {
      adminProduct.recipe.forEach(recipeItem => {
        const amountToDeduct = recipeItem.quantity * orderItem.quantity;
        deductStock(recipeItem.ingredientId, amountToDeduct, userName, `Commande #${order.id}`);
        deductedCount++;
        
        const updatedStock = useStocksStore.getState().items.find(i => i.id === recipeItem.ingredientId);
        if (updatedStock) {
          const remaining = updatedStock.initialStock - updatedStock.usedToday;
          if (updatedStock.initialStock > 0 && remaining < updatedStock.initialStock * 0.2) {
            lowStockAlerts.push(`${updatedStock.name} (Reste ${remaining.toFixed(2)}${updatedStock.unit})`);
          }
        }
      });
    }
  });

  if (deductedCount > 0) {
    toast.success(`Commande servie ! Stock mis à jour (${deductedCount} composants).`);
  }

  if (lowStockAlerts.length > 0) {
    const uniqueAlerts = Array.from(new Set(lowStockAlerts));
    toast.warning(`Alerte Stock Faible : ${uniqueAlerts.join(", ")}`, { duration: 8000 });
  }
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
  },
  {
    // delivered but not paid yet → "À encaisser"
    id: "CMD-804",
    tableId: "1",
    total: 19.000,
    paymentMethod: "cash",
    globalComment: "",
    status: "delivered",
    paid: false,
    createdAt: new Date(Date.now() - 1000 * 60 * 40).toISOString(),
    items: [
      {
        id: "item-6",
        menuItem: { id: "6", name: "Lablabi", price: 9.0, categoryId: "plats", emoji: "🥣", available: true, description: "" },
        quantity: 2,
        options: {},
        comment: "",
        unitPrice: 9.0,
        totalPrice: 18.0,
      },
      {
        id: "item-7",
        menuItem: { id: "7", name: "Eau Minérale", price: 1.0, categoryId: "boissons", emoji: "💧", available: true, description: "" },
        quantity: 1,
        options: {},
        comment: "",
        unitPrice: 1.0,
        totalPrice: 1.0,
      }
    ]
  },
  {
    // paid → table libérée
    id: "CMD-805",
    tableId: "T1",
    total: 11.500,
    paymentMethod: "card",
    globalComment: "",
    status: "delivered",
    paid: true,
    paidAt: new Date(Date.now() - 1000 * 60 * 10).toISOString(),
    paidBy: "Serveur Demo",
    createdAt: new Date(Date.now() - 1000 * 60 * 55).toISOString(),
    items: [
      {
        id: "item-8",
        menuItem: { id: "8", name: "Capucin", price: 4.0, categoryId: "boissons", emoji: "☕", available: true, description: "" },
        quantity: 2,
        options: {},
        comment: "",
        unitPrice: 4.0,
        totalPrice: 8.0,
      },
      {
        id: "item-9",
        menuItem: { id: "9", name: "Makroud", price: 3.5, categoryId: "patisseries", emoji: "🍰", available: true, description: "" },
        quantity: 1,
        options: {},
        comment: "",
        unitPrice: 3.5,
        totalPrice: 3.5,
      }
    ]
  },
  {
    // annulée → tracée avec motif
    id: "CMD-800",
    tableId: "5",
    total: 6.500,
    paymentMethod: "cash",
    globalComment: "",
    status: "rejected",
    cancelledBy: "Ahmed (Serveur)",
    cancelledAt: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
    cancelReason: "Client parti avant service",
    createdAt: new Date(Date.now() - 1000 * 60 * 35).toISOString(),
    items: [
      {
        id: "item-10",
        menuItem: { id: "1", name: "Thé Vert aux Pignons", price: 5.5, categoryId: "boissons", emoji: "🍵", available: true, description: "" },
        quantity: 1,
        options: {},
        comment: "",
        unitPrice: 5.5,
        totalPrice: 5.5,
      }
    ]
  }
];

export const useOrderStore = create<OrderStore>()(
  persist(
    (set) => ({
      orders: DEMO_ORDERS,
      addOrder: (order) => set((state) => {
        if (state.orders.some((o) => o.id === order.id)) return state;
        return { orders: [order, ...state.orders] };
      }),
      updateOrder: (id, updates) => set((state) => {
        const order = state.orders.find(o => o.id === id);
        if (order && updates.status === "delivered" && order.status !== "delivered") {
          deductStockForOrder(order);
        }
        return {
          orders: state.orders.map((o) => (o.id === id ? { ...o, ...updates } : o)),
        };
      }),
      updateOrderStatus: (id, status) => set((state) => {
        const order = state.orders.find(o => o.id === id);
        if (order && status === "delivered" && order.status !== "delivered") {
          deductStockForOrder(order);
        }
        return {
          orders: state.orders.map((o) => (o.id === id ? { ...o, status } : o)),
        };
      }),
      cancelOrder: (id, reason, cancelledBy) => set((state) => ({
        orders: state.orders.map((o) =>
          o.id === id
            ? {
                ...o,
                status: "rejected" as const,
                cancelledBy,
                cancelledAt: new Date().toISOString(),
                cancelReason: reason,
              }
            : o
        ),
      })),
      markAsPaid: (id, paidBy, paymentMethod) => set((state) => ({
        orders: state.orders.map((o) =>
          o.id === id
            ? {
                ...o,
                paid: true,
                paidAt: new Date().toISOString(),
                paidBy,
                paymentMethod: paymentMethod || o.paymentMethod || "cash",
              }
            : o
        ),
      })),
      clearOrders: () => set({ orders: [] }),
    }),
    {
      name: "ija-global-orders",
      storage: createJSONStorage(() => localStorage),
    }
  )
);
