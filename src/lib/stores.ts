import { create } from "zustand";
import { persist } from "zustand/middleware";

interface WalletState {
  address: string | null;
  userId: string | null;
  username: string | null;
  avatar: string | null;
  isConnected: boolean;
  isConnecting: boolean;
  setWallet: (data: {
    address: string;
    userId: string;
    username?: string | null;
    avatar?: string | null;
  }) => void;
  setConnecting: (connecting: boolean) => void;
  disconnect: () => void;
  updateProfile: (data: { username?: string; bio?: string; avatar?: string }) => void;
}

export const useWalletStore = create<WalletState>()(
  persist(
    (set) => ({
      address: null,
      userId: null,
      username: null,
      avatar: null,
      isConnected: false,
      isConnecting: false,
      setWallet: (data) =>
        set({
          address: data.address,
          userId: data.userId,
          username: data.username ?? null,
          avatar: data.avatar ?? null,
          isConnected: true,
          isConnecting: false,
        }),
      setConnecting: (connecting) => set({ isConnecting: connecting }),
      disconnect: () =>
        set({
          address: null,
          userId: null,
          username: null,
          avatar: null,
          isConnected: false,
          isConnecting: false,
        }),
      updateProfile: (data) =>
        set((state) => ({
          username: data.username ?? state.username,
          avatar: data.avatar ?? state.avatar,
        })),
    }),
    { name: "molten-wallet" }
  )
);

interface FeedState {
  paused: boolean;
  sortBy: "trending" | "new" | "aboutToGraduate" | "graduated" | "marketCap";
  searchQuery: string;
  setPaused: (paused: boolean) => void;
  setSortBy: (sort: FeedState["sortBy"]) => void;
  setSearchQuery: (query: string) => void;
}

export const useFeedStore = create<FeedState>((set) => ({
  paused: false,
  sortBy: "trending",
  searchQuery: "",
  setPaused: (paused) => set({ paused }),
  setSortBy: (sortBy) => set({ sortBy }),
  setSearchQuery: (searchQuery) => set({ searchQuery }),
}));

interface FlashState {
  flashedTokens: Record<string, "green" | "red" | null>;
  setFlash: (tokenId: string, direction: "green" | "red") => void;
  clearFlash: (tokenId: string) => void;
}

export const useFlashStore = create<FlashState>((set) => ({
  flashedTokens: {},
  setFlash: (tokenId, direction) =>
    set((state) => ({
      flashedTokens: { ...state.flashedTokens, [tokenId]: direction },
    })),
  clearFlash: (tokenId) =>
    set((state) => ({
      flashedTokens: { ...state.flashedTokens, [tokenId]: null },
    })),
}));
