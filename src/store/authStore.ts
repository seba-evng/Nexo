import { create } from 'zustand'
import { Profile, User } from '../types/app.types'

type AuthStore = {
  user: User | null
  profile: Profile | null
  isAuthenticated: boolean
  setUser: (user: User | null) => void
  setProfile: (profile: Profile | null) => void
  logout: () => void
}

export const useAuthStore = create<AuthStore>((set) => ({
  user: null,
  profile: null,
  isAuthenticated: false,
  setUser: (user) => set({ user, isAuthenticated: !!user }),
  setProfile: (profile) => set({ profile }),
  logout: () => set({ user: null, profile: null, isAuthenticated: false }),
}))