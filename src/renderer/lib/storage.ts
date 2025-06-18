import { StateStorage } from 'zustand/middleware'

export const storage: StateStorage = {
  getItem: async (name: string): Promise<string | null> => {
    const store = await window.electron.getStore()
    return store[name] ?? null
  },
  setItem: async (name: string, value: string): Promise<void> => {
    await window.electron.setStore(name, value)
  },
  removeItem: async (name: string): Promise<void> => {
    // electron-store doesn't have a direct equivalent to removeItem for a sub-key.
    // We'd have to get the whole object, delete the key, and set it again.
    // For now, this is a no-op, as it's not strictly required by the prompt store.
  },
} 