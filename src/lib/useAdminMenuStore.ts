import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

export interface Ingredient {
  id: string;
  name: string;
  unit: string;
  costPerUnit: number;
}

export interface RecipeItem {
  ingredientId: string;
  quantity: number;
}

export interface AdminProduct {
  id: string;
  name: string;
  categoryId: string;
  price: number;
  available: boolean;
  image: string;
  recipe: RecipeItem[];
}

export interface AdminCategory {
  id: string;
  name: string;
}

interface MenuStore {
  categories: AdminCategory[];
  products: AdminProduct[];
  ingredients: Ingredient[];
  
  addProduct: (p: AdminProduct) => void;
  updateProduct: (id: string, p: Partial<AdminProduct>) => void;
  deleteProduct: (id: string) => void;
  
  addCategory: (c: AdminCategory) => void;
  updateCategory: (id: string, c: Partial<AdminCategory>) => void;
  deleteCategory: (id: string) => void;
}

const DEMO_CATEGORIES: AdminCategory[] = [
  { id: "c1", name: "Boissons" },
  { id: "c2", name: "Plats" },
  { id: "c3", name: "Pâtisseries" }
];

const DEMO_INGREDIENTS: Ingredient[] = [
  { id: "i1", name: "Café grain", unit: "kg", costPerUnit: 25 },
  { id: "i2", name: "Sucre", unit: "kg", costPerUnit: 2 },
  { id: "i3", name: "Lait", unit: "L", costPerUnit: 1.5 },
  { id: "i4", name: "Thé vert", unit: "kg", costPerUnit: 18 },
];

const DEMO_PRODUCTS: AdminProduct[] = [
  {
    id: "p1",
    name: "Café Express",
    categoryId: "c1",
    price: 3.5,
    available: true,
    image: "https://images.unsplash.com/photo-1511920170033-f8396924c348?w=400&q=80",
    recipe: [{ ingredientId: "i1", quantity: 0.015 }, { ingredientId: "i2", quantity: 0.005 }]
  },
  {
    id: "p2",
    name: "Capucin",
    categoryId: "c1",
    price: 4.0,
    available: true,
    image: "https://images.unsplash.com/photo-1572442388796-11668a67e53d?w=400&q=80",
    recipe: [{ ingredientId: "i1", quantity: 0.015 }, { ingredientId: "i3", quantity: 0.05 }]
  }
];

export const useAdminMenuStore = create<MenuStore>()(
  persist(
    (set) => ({
      categories: DEMO_CATEGORIES,
      products: DEMO_PRODUCTS,
      ingredients: DEMO_INGREDIENTS,

      addProduct: (p) => set((s) => ({ products: [...s.products, p] })),
      updateProduct: (id, updates) => set((s) => ({
        products: s.products.map(p => p.id === id ? { ...p, ...updates } : p)
      })),
      deleteProduct: (id) => set((s) => ({
        products: s.products.filter(p => p.id !== id)
      })),

      addCategory: (c) => set((s) => ({ categories: [...s.categories, c] })),
      updateCategory: (id, updates) => set((s) => ({
        categories: s.categories.map(c => c.id === id ? { ...c, ...updates } : c)
      })),
      deleteCategory: (id) => set((s) => ({
        categories: s.categories.filter(c => c.id !== id)
      })),
    }),
    {
      name: "ija-admin-menu",
      storage: createJSONStorage(() => localStorage),
    }
  )
);
