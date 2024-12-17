import { create } from "zustand";
import { persist } from "zustand/middleware";
import { mmkvStorage, getItem, setItem } from "./mmkv";
import { User, History } from "@/constants/Interfaces";

type States = {
  loading: boolean;
  user: User;
  locale: string;
  history: History[];
  isTabBarVisible: boolean;
};

type Actions = {
  setLoading: (loading: boolean) => void;
  setUser: (user: User) => void;
  setLocale: (locale: string) => void;
  setHistory: (history: History[]) => void;
  setTabBarVisible: (visible: boolean) => void;
};

export const useStore = create<States & Actions>()(
  persist(
    (set, get) => {
      return {
        loading: false,
        setLoading: (loading) => set({ loading }),
        user: {
          id: "",
          username: "",
          password: "",
        },
        setUser: (user) => set({ user }),
        locale: "",
        setLocale: (locale) => set({ locale }),
        history: [],
        setHistory: (history) => set({ history }),
        isTabBarVisible: true,
        setTabBarVisible: (visible) => set({ isTabBarVisible: visible }),
      };
    },
    {
      name: "store-mmkv-storage",
      storage: {
        getItem: (name) => Promise.resolve(getItem(name)),
        setItem: (name, value) => Promise.resolve(setItem(name, value)),
        removeItem: (name) => Promise.resolve(mmkvStorage.delete(name)),
      },
      partialize: (state: States & Actions) => ({
        user: state.user,
        locale: state.locale,
        history: state.history,
      }),
    }
  )
);
