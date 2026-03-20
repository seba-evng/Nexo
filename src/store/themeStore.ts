import { create } from 'zustand'

type Theme = 'dark' | 'light'

type ThemeStore = {
  theme: Theme
  toggleTheme: () => void
  isDark: boolean
}

export const useThemeStore = create<ThemeStore>((set, get) => ({
  theme: 'dark',
  isDark: true,
  toggleTheme: () => {
    const next = get().theme === 'dark' ? 'light' : 'dark'
    set({ theme: next, isDark: next === 'dark' })
  },
}))