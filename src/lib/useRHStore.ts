import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

export interface Employee {
  id: string;
  name: string;
  role: string;
  phone: string;
  status: "present" | "absent" | "leave";
  shifts: Record<string, string>; // e.g. "lun" -> "09:00-17:00"
}

interface RHStore {
  employees: Employee[];
  
  addEmployee: (e: Employee) => void;
  updateEmployee: (id: string, e: Partial<Employee>) => void;
  checkIn: (id: string) => void;
  checkOut: (id: string) => void;
}

const DEMO_EMPLOYEES: Employee[] = [
  {
    id: "e1",
    name: "Ahmed Zine",
    role: "Manager",
    phone: "+216 55 123 456",
    status: "present",
    shifts: { "Lun": "09:00-18:00", "Mar": "09:00-18:00", "Mer": "09:00-18:00", "Jeu": "09:00-18:00", "Ven": "09:00-18:00", "Sam": "Off", "Dim": "Off" }
  },
  {
    id: "e2",
    name: "Karim Tlili",
    role: "Caissier",
    phone: "+216 22 987 654",
    status: "present",
    shifts: { "Lun": "Off", "Mar": "14:00-22:00", "Mer": "14:00-22:00", "Jeu": "14:00-22:00", "Ven": "14:00-22:00", "Sam": "10:00-20:00", "Dim": "10:00-20:00" }
  },
  {
    id: "e3",
    name: "Sonia Hamdi",
    role: "Cuisinier",
    phone: "+216 98 456 123",
    status: "absent",
    shifts: { "Lun": "08:00-16:00", "Mar": "08:00-16:00", "Mer": "Off", "Jeu": "08:00-16:00", "Ven": "08:00-16:00", "Sam": "08:00-16:00", "Dim": "08:00-16:00" }
  },
  {
    id: "e4",
    name: "Fares Gharbi",
    role: "Livreur",
    phone: "+216 50 111 222",
    status: "leave",
    shifts: { "Lun": "18:00-02:00", "Mar": "18:00-02:00", "Mer": "18:00-02:00", "Jeu": "18:00-02:00", "Ven": "18:00-02:00", "Sam": "18:00-02:00", "Dim": "Off" }
  }
];

export const useRHStore = create<RHStore>()(
  persist(
    (set) => ({
      employees: DEMO_EMPLOYEES,

      addEmployee: (e) => set((s) => ({ employees: [...s.employees, e] })),
      
      updateEmployee: (id, updates) => set((s) => ({
        employees: s.employees.map(e => e.id === id ? { ...e, ...updates } : e)
      })),

      checkIn: (id) => set((s) => ({
        employees: s.employees.map(e => e.id === id ? { ...e, status: "present" } : e)
      })),

      checkOut: (id) => set((s) => ({
        employees: s.employees.map(e => e.id === id ? { ...e, status: "absent" } : e)
      })),
    }),
    {
      name: "ija-admin-rh",
      storage: createJSONStorage(() => localStorage),
    }
  )
);
