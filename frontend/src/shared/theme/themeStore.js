import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export const useThemeStore = create(
  persist(
    (set) => ({
      mode: 'light',
      theme: 'clinical',
      setMode: (mode) => set({ mode }),
      setTheme: (theme) => set({ theme }),
      toggleMode: () =>
        set((state) => ({
          mode: state.mode === 'light' ? 'dark' : 'light',
        })),
    }),
    {
      name: 'aiia-theme-store',
    },
  ),
)
