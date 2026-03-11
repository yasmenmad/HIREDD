import { create } from 'zustand'
import api from '../services/api'

interface User {
  id: string
  nom: string
  prenom: string
  email: string
  role: string
  statut: string
  photo_profil?: string
}

interface AuthState {
  user: User | null
  loading: boolean
  login: (email: string, password: string) => Promise<void>
  register: (nom: string, prenom: string, email: string, password: string) => Promise<void>
  logout: () => void
  fetchMe: () => Promise<void>
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  loading: false,

  login: async (email, password) => {
    const res = await api.post('/auth/login', { email, mot_de_passe: password })
    localStorage.setItem('access_token', res.data.access_token)
    localStorage.setItem('refresh_token', res.data.refresh_token)
    const me = await api.get('/auth/me')
    set({ user: me.data })
  },

  register: async (nom, prenom, email, password) => {
    await api.post('/auth/register', { nom, prenom, email, mot_de_passe: password })
  },

  logout: () => {
    localStorage.removeItem('access_token')
    localStorage.removeItem('refresh_token')
    set({ user: null })
  },

  fetchMe: async () => {
    try {
      set({ loading: true })
      const res = await api.get('/auth/me')
      set({ user: res.data })
    } catch {
      set({ user: null })
    } finally {
      set({ loading: false })
    }
  },
}))
