import { create } from "zustand";

interface User {
  _id: string;
  name: string;
  email: string;
  role: "user" | "admin";
  address?: string;
}

interface AuthState {
  user: User | null;
  setUser: (user: User | null) => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  setUser: (user) => set({ user }),
}));