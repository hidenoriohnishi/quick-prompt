import { StateStorage } from 'zustand/middleware'

const electronApiStorage: StateStorage = {
  getItem: async (name: string): Promise<string | null> => {
    return window.electron.getStore(name)
  },
  setItem: async (name: string, value: string): Promise<void> => {
    await window.electron.setStore(name, value)
  },
  removeItem: async (name: string): Promise<void> => {
    await window.electron.setStore(name, null)
  }
}

let hasHydrated = false

export const storage: StateStorage = {
  getItem: async (name: string): Promise<string | null> => {
    return window.electron.getStore(name)
  },
  setItem: async (name: string, value: string): Promise<void> => {
    await window.electron.setStore(name, value)
  },
  removeItem: async (name: string): Promise<void> => {
    await window.electron.setStore(name, null)
  }
} 