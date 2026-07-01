import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { MenuItem } from "./menuData";

export interface CartItem {
  id: string; // Unique ID (item.id + options hash + comment hash)
  menuItem: MenuItem;
  quantity: number;
  options: Record<string, string>; // label -> choice.label
  comment: string; // Item specific comment
  unitPrice: number; // base price + options price
  totalPrice: number;
}

export interface PlacedOrder {
  id: string;
  tableId: string;
  items: CartItem[];
  total: number;
  paymentMethod: "cash" | "card";
  globalComment: string;
  status: "new" | "cooking" | "ready" | "delivered" | "rejected";
  estimatedTime?: string;
  createdAt: string;
  // Payment tracking
  paid?: boolean;
  paidAt?: string;
  paidBy?: string;
  // Cancellation tracking
  cancelledBy?: string;
  cancelledAt?: string;
  cancelReason?: string;
}

interface CartState {
  items: CartItem[];
  tableId: string | null;
  globalComment: string;
  orderHistory: PlacedOrder[];

  setTableId: (id: string) => void;
  setGlobalComment: (comment: string) => void;
  addItem: (item: Omit<CartItem, "id" | "totalPrice">) => void;
  removeItem: (id: string) => void;
  updateQuantity: (id: string, delta: number) => void;
  clearCart: () => void;
  getCartTotal: () => number;
  getCartCount: () => number;
  placeOrder: (paymentMethod: "cash" | "card") => PlacedOrder;
}

// Generate a deterministic ID based on item, options, and comment
const generateCartItemId = (itemId: string, options: Record<string, string>, comment: string) => {
  const sortedOptions = Object.entries(options)
    .sort(([keyA], [keyB]) => keyA.localeCompare(keyB))
    .map(([k, v]) => `${k}:${v}`)
    .join("|");
  const commentHash = comment.trim().toLowerCase();
  return `${itemId}::${sortedOptions}::${commentHash}`;
};

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      tableId: null,
      globalComment: "",
      orderHistory: [],

      setTableId: (id: string) => set({ tableId: id }),
      
      setGlobalComment: (comment: string) => set({ globalComment: comment }),

      addItem: (newItemInfo) => {
        set((state) => {
          const cartItemId = generateCartItemId(
            newItemInfo.menuItem.id,
            newItemInfo.options,
            newItemInfo.comment
          );
          
          const existingItemIndex = state.items.findIndex((i) => i.id === cartItemId);
          
          if (existingItemIndex >= 0) {
            // Item exists with same options and comment, just increment quantity
            const newItems = [...state.items];
            const existing = newItems[existingItemIndex];
            existing.quantity += newItemInfo.quantity;
            existing.totalPrice = existing.quantity * existing.unitPrice;
            return { items: newItems };
          }

          // New item
          const newItem: CartItem = {
            ...newItemInfo,
            id: cartItemId,
            totalPrice: newItemInfo.quantity * newItemInfo.unitPrice,
          };
          
          return { items: [...state.items, newItem] };
        });
      },

      removeItem: (id: string) => {
        set((state) => ({
          items: state.items.filter((item) => item.id !== id),
        }));
      },

      updateQuantity: (id: string, delta: number) => {
        set((state) => {
          const newItems = state.items
            .map((item) => {
              if (item.id === id) {
                const newQuantity = Math.max(0, item.quantity + delta);
                return {
                  ...item,
                  quantity: newQuantity,
                  totalPrice: newQuantity * item.unitPrice,
                };
              }
              return item;
            })
            .filter((item) => item.quantity > 0);

          return { items: newItems };
        });
      },

      clearCart: () => set({ items: [], globalComment: "" }),

      getCartTotal: () => {
        return get().items.reduce((total, item) => total + item.totalPrice, 0);
      },

      getCartCount: () => {
        return get().items.reduce((count, item) => count + item.quantity, 0);
      },

      placeOrder: (paymentMethod: "cash" | "card") => {
        const state = get();
        const orderId = `CMD-${Math.floor(100 + Math.random() * 900)}`; // Simple ID like CMD-492
        
        const newOrder: PlacedOrder = {
          id: orderId,
          tableId: state.tableId || "unknown",
          items: [...state.items],
          total: state.getCartTotal(),
          paymentMethod,
          globalComment: state.globalComment,
          status: "new",
          createdAt: new Date().toISOString(),
        };

        // Dispatch global event for the admin side (simulation)
        if (typeof window !== "undefined") {
          window.dispatchEvent(new CustomEvent("new_order", { detail: newOrder }));
          try {
            const channel = new BroadcastChannel("ija_realtime");
            channel.postMessage({ type: "NEW_ORDER", payload: newOrder });
            channel.close();
          } catch (e) {
            console.error("BroadcastChannel failed", e);
          }
        }

        set((s) => ({
          orderHistory: [newOrder, ...s.orderHistory],
          items: [], // Clear cart after placing order
          globalComment: "",
        }));

        return newOrder;
      },
    }),
    {
      name: "ija-cart-storage",
      storage: createJSONStorage(() => localStorage),
    }
  )
);
