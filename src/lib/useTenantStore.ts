import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

export interface Restaurant {
  id: string;
  name: string;
  location: string;
  avatar: string;
}

const DEMO_RESTAURANTS: Restaurant[] = [
  { id: 'r1', name: 'Le Comptoir de Tunis', location: 'Centre-Ville, Tunis', avatar: '🏛️' },
  { id: 'r2', name: 'Café Sidi Bou Saïd', location: 'Sidi Bou Saïd, Tunis', avatar: '☕' },
];

interface TenantStore {
  restaurants: Restaurant[];
  currentRestaurantId: string;
  switchRestaurant: (id: string) => void;
  reset: () => void;
}

export const useTenantStore = create<TenantStore>()(
  persist(
    (set) => ({
      restaurants: DEMO_RESTAURANTS,
      currentRestaurantId: DEMO_RESTAURANTS[0].id,
      switchRestaurant: (id) => set(() => ({ currentRestaurantId: id })),
      reset: () => set(() => ({
        restaurants: DEMO_RESTAURANTS,
        currentRestaurantId: DEMO_RESTAURANTS[0].id,
      })),
    }),
    {
      name: 'ija-tenant',
      storage: createJSONStorage(() => localStorage),
    }
  )
);
