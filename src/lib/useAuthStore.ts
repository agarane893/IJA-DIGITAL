import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { AuthUser, DEMO_USERS, getDefaultRoute } from "./auth";

interface Notification {
  id: string;
  message: string;
  time: string;
  read: boolean;
  type: "order" | "stock" | "staff" | "system";
}

interface AuthState {
  user: AuthUser | null;
  isAuthenticated: boolean;
  notifications: Notification[];
  sidebarCollapsed: boolean;

  // Actions
  login: (userId: string) => { success: boolean; redirectTo: string };
  logout: () => void;
  markNotificationsRead: () => void;
  toggleSidebar: () => void;
  setSidebarCollapsed: (v: boolean) => void;
}

const DEMO_NOTIFICATIONS: Notification[] = [
  {
    id: "n1",
    message: "Commande #1024 – Table 4 prête en cuisine",
    time: "Il y a 2 min",
    read: false,
    type: "order",
  },
  {
    id: "n2",
    message: "Stock Café Arabica faible (< 500g restants)",
    time: "Il y a 15 min",
    read: false,
    type: "stock",
  },
  {
    id: "n3",
    message: "Nouvelle réservation pour 18h30 – Groupe de 8",
    time: "Il y a 30 min",
    read: false,
    type: "system",
  },
  {
    id: "n4",
    message: "Rapport journalier disponible – Ija Lac",
    time: "Il y a 1h",
    read: true,
    type: "system",
  },
];

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      isAuthenticated: false,
      notifications: DEMO_NOTIFICATIONS,
      sidebarCollapsed: false,

      login: (userId: string) => {
        const user = DEMO_USERS.find((u) => u.id === userId);
        if (!user) return { success: false, redirectTo: "/login" };

        set({
          user,
          isAuthenticated: true,
          notifications: DEMO_NOTIFICATIONS,
        });

        return { success: true, redirectTo: getDefaultRoute(user.role) };
      },

      logout: () => {
        set({
          user: null,
          isAuthenticated: false,
          notifications: DEMO_NOTIFICATIONS,
        });
      },

      markNotificationsRead: () => {
        set((state) => ({
          notifications: state.notifications.map((n) => ({ ...n, read: true })),
        }));
      },

      toggleSidebar: () => {
        set((state) => ({ sidebarCollapsed: !state.sidebarCollapsed }));
      },

      setSidebarCollapsed: (v: boolean) => {
        set({ sidebarCollapsed: v });
      },
    }),
    {
      name: "ija-auth-storage",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
        sidebarCollapsed: state.sidebarCollapsed,
      }),
    }
  )
);
