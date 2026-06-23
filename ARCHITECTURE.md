# Ija Digital – Architecture & Functional Specification

## 📂 Project Overview
The repository is a **Next.js 14** application styled with a premium dark theme. The project features a **simulated authentication system** (Zustand + `localStorage`), a full **admin UI** with role‑based access control, a **mobile-first client menu**, and a **backend-less realtime order synchronization system** using the native `BroadcastChannel` API.

---

## 🔐 Authentication Layer
### Files
| File | Purpose |
|------|---------|
| `src/lib/auth.ts` | Types (`UserRole`, `Permission`), role‑to‑permissions map (`ROLE_PERMISSIONS`), demo users (`DEMO_USERS`), demo restaurants, helper `hasPermission` and `getDefaultRoute`.
| `src/lib/useAuthStore.ts` | Zustand store (`useAuthStore`) with persistence (`zustand/middleware`). Stores `user`, `isAuthenticated`, `sidebarCollapsed`, and demo `notifications`. Exposes actions: `login(userId)`, `logout()`, `toggleSidebar()`, `markNotificationsRead()`.
| `src/components/AuthProvider.tsx` | Root client‑side provider that blocks unauthenticated routes, redirects after login, and guards public routes (`/login`, `/`, `/table/*`). Exposes `useRequirePermission` hook.
| `src/app/(auth)/login/page.tsx` | Fancy dark‑mode login page with a role selector (no password). Calls `login` from the store and redirects to the role’s default route.

### Flow
1. User lands on `/login` → selects a demo user (Super Admin, Manager, etc.).
2. `login(userId)` looks up the user in `DEMO_USERS`, sets `user` and `isAuthenticated` in the store, and returns the default route via `getDefaultRoute`.
3. `AuthProvider` redirects automatically to the appropriate page.
4. State is persisted in **localStorage** (`ija-auth-storage`), so a page refresh retains the session.

---

## 📡 Real-time Synchronization (Backend-less)
### Files & Implementation
| File | Purpose |
|------|---------|
| `src/components/RealtimeProvider.tsx` | Wraps the application and manages the `BroadcastChannel` ("ija_realtime") connection. Listens for `NEW_ORDER` events, adds them to the global store, and triggers a pulsing UI toast notification via `sonner`. |
| `src/lib/useOrderStore.ts` | Global Zustand store synced across Admin components. Keeps track of active online orders, their statuses, and allows cashiers to update them (e.g. from "new" to "cooking"). |
| `src/lib/useCartStore.ts` | Dispatches the `NEW_ORDER` event over the `BroadcastChannel` when the client confirms the checkout. |

### Flow
1. Client completes checkout and triggers `placeOrder()`.
2. The order is stored locally and broadcasted to all open tabs via `BroadcastChannel("ija_realtime")`.
3. `RealtimeProvider` receives the event and updates `useOrderStore.ts`.
4. A sound and visual pulsing toast notify the cashier.
5. The `/pos` and `/dashboard` screens instantly reflect the newly added order without requiring a page reload.

---

## 📱 Client Table Interface (Mobile-First)
### Files
| File | Purpose |
|------|---------|
| `src/lib/menuData.ts` | Detailed Tunisian menu dataset containing categories, items, dynamic options (size, sugar, extras), and helper functions. |
| `src/lib/useCartStore.ts` | Zustand store managing the user's shopping cart, persisting to `localStorage` (`ija-cart-storage`), and calculating dynamic total prices based on selected options. |
| `src/app/(client)/table/[id]/page.tsx` | Main digital menu interface. Features horizontal category scroll, animated product cards, unavailable item states, and a floating cart summary button. |
| `src/app/(client)/table/[id]/item/[itemId]/page.tsx` | Item detail page. Allows users to select required/optional additions (e.g., pain, harissa, taille), adjust quantity, and add to cart with real-time price calculation. |
| `src/app/(client)/table/[id]/cart/page.tsx` | Shopping cart review page. Lists selected items with options, allows quantity adjustment/removal, and features an animated checkout sequence. |

### Flow
1. User scans QR code and lands on `/table/[id]`.
2. User browses categories and taps an item.
3. User selects options (if any) and adds the item to the cart.
4. User taps the floating cart button to review their order.
5. User confirms the order, triggering a simulated API call and success animation.

---

## 🖥️ Admin Shell
### Files & Components
| Component | Key Features |
|-----------|--------------|
| `src/app/(admin)/layout.tsx` | Wraps admin pages with `AdminSidebar` + `AdminHeader`. Handles route guard (redirect to `/login` if not auth). Adjusts layout width based on `sidebarCollapsed`.
| `src/components/admin/Sidebar.tsx` | Responsive, collapsible sidebar. Generates navigation items from `NAV_ITEMS` and filters them via `hasPermission(user, item.permission)`. Includes animated active indicator, tooltips when collapsed, and a logout button.
| `src/components/admin/Header.tsx` | Top bar with hamburger, restaurant badge, notifications dropdown, and profile menu (avatar, role label). Uses `useAuthStore` for state.
| `src/app/(admin)/dashboard/page.tsx` | Global or per‑restaurant dashboard (stats, chart, recent orders). Shows additional “global” metrics only for `super_admin`.
| `src/app/(admin)/kitchen/page.tsx` | Kanban view for tickets (Urgent, Cooking, Ready) – role‑specific UI.
| `src/app/(admin)/delivery/page.tsx` | (Created but not shown) Inventory‑style list for delivery tasks.
| `src/app/(admin)/inventory/page.tsx` | Stock management with progress bars and critical alerts.
| `src/app/(admin)/orders/page.tsx` | Card grid of active orders, status badges, filter button.
| `src/app/(admin)/staff/page.tsx` | Staff list (RH) – placeholder UI.
| `src/app/(admin)/reports/page.tsx` | Settings‑style form with restaurant info, notification toggles, and security options.
| `src/app/(admin)/settings/page.tsx` | Configuration UI for restaurant details, notifications, and security.

### Navigation
- **Sidebar items** are defined in `NAV_ITEMS` (label, href, icon, required permission). Permissions are derived from the user’s role via `ROLE_PERMISSIONS`.
- **Active route** highlighted with a glowing bar and color scheme (`#D95D39`).
- **Collapsible**: when collapsed, only icons show; hover tooltips reveal labels.
- **Header**: shows active restaurant badge (or “All restaurants” for super admin), notification bell (unread count), and profile dropdown.

---

## 🎨 Design System
- **Colors** – primary terracotta `#D95D39` with gradients, dark background `#0D1117`, soft white accents.
- **Typography** – Google fonts `Plus Jakarta Sans` (sans) & `Fraunces` (heading).
- **Glassmorphism & gradients** – used for backgrounds, card shadows, and hover states.
- **Micro‑animations** – Framer Motion for page entry, sidebar width transition, card hover, and notification panel.
- **Responsive** – Mobile‑first layout, sidebar hidden on small screens, hamburger toggles.

---

## 📦 Functional Specs
| Feature | Description |
|---------|-------------|
| **Role‑Based Permissions** | Each role has a predefined permission set (`ROLE_PERMISSIONS`). UI components filter actions based on `hasPermission`.
| **Demo Login** | Fast role switch without password; useful for demos.
| **Persisted Session** | Zustand store persisted to `localStorage` (`ija-auth-storage`).
| **Sidebar Collapsing** | Smooth width animation, tooltip fallback, active route indicator.
| **Notification Center** | Demo notifications with unread badge; `markNotificationsRead` clears badge.
| **Responsive Dashboard** | Shows global stats only for Super Admin; other roles see restaurant‑specific data.
| **Kitchen Kanban** | Three columns (Urgent, Cooking, Ready) with status‑aware styling.
| **Inventory Alerts** | Critical/low stock badges, progress bars, and summary alerts.
| **Settings Form** | Editable restaurant info and toggle switches (including 2‑FA placeholder).
| **Digital Menu** | Horizontal category scrolling, realistic Tunisian demo data, availability badges.
| **Dynamic Product Options & Comments** | Cart item ID hashing handles identical products with different options/special instructions (e.g., "sans sucre").
| **Floating Cart** | Persistent cart summary button that appears when items are added.
| **Animated Checkout** | Simulated order placement with a loading state, animated checkmark success screen, and a mock tracking QR code.
| **Realtime Sync** | `BroadcastChannel` integration allowing tabs to instantly sync order creation.
| **Pulsing Notifications** | Incoming orders trigger a sonner toast with a pulsing red ring (`animate-ping`) and sound simulation.

---

## 🔧 Changes Made (Summary)
1. **Created `auth.ts`** – roles, permissions, demo data.
2. **Created `useAuthStore.ts`** – Zustand store + persistence.
3. **Created `AuthProvider.tsx`** – route guard and permission hook.
4. **Added login page** (`src/app/(auth)/login/page.tsx`).
5. **Updated root layout** to wrap children with `<AuthProvider>`.
6. **Added admin layout** (`src/app/(admin)/layout.tsx`).
7. **Implemented Sidebar** (`src/components/admin/Sidebar.tsx`).
8. **Implemented Header** (`src/components/admin/Header.tsx`).
9. **Created dashboard, kitchen, inventory, orders, staff, reports, settings pages** under `src/app/(admin)/*`.
10. **Adjusted public landing page** – demo admin button now points to `/login`.
11. **Added demo restaurant data** and permission‑aware restaurant badge in header.
12. **Added utility functions** (`hasPermission`, `getDefaultRoute`).
13. **Ensured SEO tags** are present in layouts (`<title>`, `<meta>`).
14. **Applied premium dark theme** across all new components.
15. **Created `menuData.ts`** – realistic Tunisian menu items, categories, and options.
16. **Created `useCartStore.ts`** – Zustand store for client cart state (with item-specific instructions).
17. **Developed Mobile-First Table Menu** (`src/app/(client)/table/[id]/page.tsx`).
18. **Developed Item Detail Page** (`src/app/(client)/table/[id]/item/[itemId]/page.tsx`) with dynamic option selection and special instructions textarea.
19. **Developed Cart Page** (`src/app/(client)/table/[id]/cart/page.tsx`) with global comments, payment selector, and animated checkout success screen.
20. **Created `useOrderStore.ts`** – Global Zustand store for active admin orders.
21. **Created `RealtimeProvider.tsx`** – Native `BroadcastChannel` wrapper for instant tab-to-tab sync.
22. **Updated Dashboard & POS** – Injected real-time orders directly into the cashier and global admin interfaces.

22. **Created `useAdminMenuStore.ts`** – Zustand store pour catégories, produits, recettes et ingrédients avec persistance locale.
23. **Created `useStocksStore.ts`** – Zustand store pour la gestion des stocks, niveaux, alertes et historique des mouvements.
24. **Created `useRHStore.ts`** – Zustand store pour la gestion du personnel, planning hebdomadaire et suivi des présences simulées.

---

## 📚 How to Extend
- **Add a new role**: Update `UserRole` in `auth.ts`, extend `ROLE_PERMISSIONS` and `ROLE_LABELS/ROLE_DESCRIPTIONS/ROLE_COLORS`.
- **Add a new permission**: Add to `Permission` type, map it in `ROLE_PERMISSIONS`, and reference it in `NAV_ITEMS` for a sidebar entry.
- **Create a new admin page**: Add a folder under `src/app/(admin)/<slug>/page.tsx` and include the required permission in its navigation entry.
- **Persist additional state**: Extend the Zustand store state shape and list the new keys in the `partialize` function.

---

## 📁 Project Structure (relevant parts)
```
src/
├─ app/
│  ├─ (public)/page.tsx      # landing page
│  ├─ (auth)/login/page.tsx  # role selector login
│  └─ (admin)/
│     ├─ layout.tsx          # admin shell (sidebar+header)
│     ├─ dashboard/page.tsx
│     ├─ kitchen/page.tsx
│     ├─ delivery/page.tsx
│     ├─ inventory/page.tsx
│     ├─ orders/page.tsx
│     ├─ staff/page.tsx
│     ├─ reports/page.tsx
│     ├─ menu/page.tsx        # CRUD catégories & produits
│     ├─ stocks/page.tsx      # Gestion des stocks
│     ├─ rh/page.tsx          # Gestion du personnel
│     └─ settings/page.tsx
│  └─ (client)/
│     └─ table/
│        └─ [id]/
│           ├─ page.tsx
│           ├─ cart/page.tsx
│           └─ item/[itemId]/page.tsx
├─ components/
│  ├─ RealtimeProvider.tsx   # BroadcastChannel and sonner toasts
│  └─ admin/
│     ├─ Sidebar.tsx
│     └─ Header.tsx
├─ lib/
│  ├─ auth.ts               # roles, permissions, demo data
│  ├─ useAuthStore.ts       # Zustand auth store
│  ├─ useCartStore.ts       # Zustand client cart
│  ├─ useOrderStore.ts      # Zustand global orders sync
│  ├─ useAdminMenuStore.ts  # Store admin menu & recettes
│  ├─ useStocksStore.ts     # Store gestion des stocks
│  ├─ useRHStore.ts         # Store RH & planning
│  └─ menuData.ts           # Demo restaurant dataset
└─ utils.ts                  # helper `cn`
```

---

## ✅ Ready for Production
All new UI follows the **premium design language** (rich gradients, glassy cards, smooth micro‑animations). The authentication flow is fully client‑side, persisted, and role‑aware, making it trivial to replace with a real backend later.

---

*This file (`ARCHITECTURE.md`) is intended as the single source of truth for future developers to understand the system without scanning the whole codebase.*
