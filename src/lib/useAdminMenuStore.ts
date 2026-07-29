import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

export interface RecipeItem {
  ingredientId: string;
  quantity: number;
}

/** One configurable option group for a product (e.g. "Mousse" → ["Sans mousse", "Avec mousse"]) */
export interface ProductOptionGroup {
  id: string;
  name: string;       // e.g. "Mousse"
  required: boolean;  // must customer choose?
  choices: string[];  // e.g. ["Sans mousse", "Avec mousse"]
}

export interface AdminProduct {
  id: string;
  name: string;
  categoryId: string;
  price: number;
  available: boolean;
  image: string;
  recipe: RecipeItem[];
  options: ProductOptionGroup[]; // customisation groups
}

export interface AdminCategory {
  id: string;
  name: string;
}

interface MenuStore {
  categories: AdminCategory[];
  products: AdminProduct[];

  addProduct: (p: AdminProduct) => void;
  updateProduct: (id: string, p: Partial<AdminProduct>) => void;
  deleteProduct: (id: string) => void;
  toggleProductAvailability: (id: string) => void;

  addCategory: (c: AdminCategory) => void;
  updateCategory: (id: string, c: Partial<AdminCategory>) => void;
  deleteCategory: (id: string) => void;

  // Option group management
  addOptionGroup: (productId: string, group: ProductOptionGroup) => void;
  updateOptionGroup: (productId: string, groupId: string, updates: Partial<ProductOptionGroup>) => void;
  deleteOptionGroup: (productId: string, groupId: string) => void;
}

const DEMO_CATEGORIES: AdminCategory[] = [
  { id: "c1", name: "Boissons" },
  { id: "c2", name: "Plats" },
  { id: "c3", name: "Pâtisseries" },
];

const DEMO_PRODUCTS: AdminProduct[] = [
  {
    id: "p1",
    name: "Café Express",
    categoryId: "c1",
    price: 3.5,
    available: true,
    image: "https://images.unsplash.com/photo-1511920170033-f8396924c348?w=400&q=80",
    recipe: [
      { ingredientId: "i1", quantity: 0.015 },
      { ingredientId: "i2", quantity: 0.005 },
    ],
    options: [
      {
        id: "opt-sucre",
        name: "Sucre",
        required: false,
        choices: ["Sans sucre", "1 sucre", "2 sucres"],
      },
    ],
  },
  {
    id: "p2",
    name: "Capucin",
    categoryId: "c1",
    price: 4.0,
    available: true,
    image: "https://images.unsplash.com/photo-1572442388796-11668a67e53d?w=400&q=80",
    recipe: [
      { ingredientId: "i1", quantity: 0.015 },
      { ingredientId: "i3", quantity: 0.05 },
    ],
    options: [
      {
        id: "opt-mousse",
        name: "Mousse",
        required: true,
        choices: ["Sans mousse", "Avec mousse"],
      },
      {
        id: "opt-sucre",
        name: "Sucre",
        required: false,
        choices: ["Sans sucre", "1 sucre", "2 sucres"],
      },
    ],
  },
];

export const useAdminMenuStore = create<MenuStore>()(
  persist(
    (set) => ({
      categories: DEMO_CATEGORIES,
      products: DEMO_PRODUCTS,

      addProduct: (p) => set((s) => ({ products: [...s.products, p] })),
      updateProduct: (id, updates) =>
        set((s) => ({
          products: s.products.map((p) =>
            p.id === id ? { ...p, ...updates } : p
          ),
        })),
      deleteProduct: (id) =>
        set((s) => ({
          products: s.products.filter((p) => p.id !== id),
        })),
      toggleProductAvailability: (id) =>
        set((s) => ({
          products: s.products.map((p) =>
            p.id === id ? { ...p, available: !p.available } : p
          ),
        })),

      addCategory: (c) => set((s) => ({ categories: [...s.categories, c] })),
      updateCategory: (id, updates) =>
        set((s) => ({
          categories: s.categories.map((c) =>
            c.id === id ? { ...c, ...updates } : c
          ),
        })),
      deleteCategory: (id) =>
        set((s) => ({
          categories: s.categories.filter((c) => c.id !== id),
        })),

      addOptionGroup: (productId, group) =>
        set((s) => ({
          products: s.products.map((p) =>
            p.id === productId
              ? { ...p, options: [...(p.options || []), group] }
              : p
          ),
        })),

      updateOptionGroup: (productId, groupId, updates) =>
        set((s) => ({
          products: s.products.map((p) =>
            p.id === productId
              ? {
                  ...p,
                  options: (p.options || []).map((g) =>
                    g.id === groupId ? { ...g, ...updates } : g
                  ),
                }
              : p
          ),
        })),

      deleteOptionGroup: (productId, groupId) =>
        set((s) => ({
          products: s.products.map((p) =>
            p.id === productId
              ? {
                  ...p,
                  options: (p.options || []).filter((g) => g.id !== groupId),
                }
              : p
          ),
        })),
    }),
    {
      name: "ija-admin-menu-v2",
      storage: createJSONStorage(() => localStorage),
    }
  )
);
