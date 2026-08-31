import { create } from "zustand";

interface WishlistState {
  itemIds: string[];
  setItemIds: (ids: string[]) => void;
  addId: (id: string) => void;
  removeId: (id: string) => void;
}

export const useWishlistStore = create<WishlistState>((set) => ({
  itemIds: [],
  setItemIds: (ids) => set({ itemIds: ids }),
  addId: (id) => set((state) => ({ itemIds: [...state.itemIds, id] })),
  removeId: (id) =>
    set((state) => ({ itemIds: state.itemIds.filter((i) => i !== id) })),
}));