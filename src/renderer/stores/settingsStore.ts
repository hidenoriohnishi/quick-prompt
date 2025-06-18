import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import { storage } from '../lib/storage'

// Re-define types here to avoid importing from main process
export type GeneralSettings = {
  theme: 'system' | 'light' | 'dark'
  launchAtLogin: boolean
  showInDock: boolean
  shortcut: string
}

export type AISettings = {
  openai: {
    apiKey: string
  }
  anthropic: {
    apiKey: string
  }
}

export type Settings = {
  general: GeneralSettings,
  ai: AISettings
}

type SettingsState = {
  settings: Settings
  setSettings: (newSettings: Partial<Settings>) => void
  setGeneralSettings: (newGeneralSettings: Partial<GeneralSettings>) => void,
  setAiSettings: (newAiSettings: Partial<AISettings>) => void
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set, get) => ({
      settings: {
        general: {
          theme: 'system',
          launchAtLogin: false,
          showInDock: true,
          shortcut: 'Shift+Command+Space',
        },
        ai: {
          openai: { apiKey: '' },
          anthropic: { apiKey: '' },
        },
      },
      setSettings: (newSettings) => set((state) => ({ settings: { ...state.settings, ...newSettings } })),
      setGeneralSettings: (newGeneralSettings) => set((state) => ({
        settings: { ...state.settings, general: { ...state.settings.general, ...newGeneralSettings } }
      })),
      setAiSettings: (newAiSettings) => set((state) => ({
        settings: {
          ...state.settings,
          ai: {
            openai: {
              ...state.settings.ai.openai,
              ...newAiSettings.openai,
            },
            anthropic: {
              ...state.settings.ai.anthropic,
              ...newAiSettings.anthropic,
            },
          },
        },
      })),
    }),
    {
      name: 'settings', // key in the storage
      storage: createJSONStorage(() => storage),
    }
  )
) 