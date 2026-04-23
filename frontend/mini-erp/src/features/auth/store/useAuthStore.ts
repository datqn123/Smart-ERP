import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type UserRole = "Owner" | "Admin" | "Manager" | "Staff" | "Warehouse";

interface User {
  id: number;
  fullName: string;
  email: string;
  role: UserRole;
}

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  login: (user: User) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      // Mocking a logined Owner for development
      user: {
        id: 1,
        fullName: "Chủ Cửa Hàng",
        email: "owner@minierp.com",
        role: "Owner" 
      },
      isAuthenticated: true,
      
      login: (user) => set({ user, isAuthenticated: true }),
      logout: () => set({ user: null, isAuthenticated: false }),
    }),
    {
      name: 'auth-storage',
    }
  )
);
