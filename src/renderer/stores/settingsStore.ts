import { create } from 'zustand'
import type { Settings, GeneralSettings, AISettings } from '../../lib/types'

type SettingsState = {
  settings: Settings
  setSettings: (newSettings: Partial<Settings>) => void
  setGeneralSettings: (newGeneralSettings: Partial<GeneralSettings>) => void
  setAiSettings: (newAiSettings: Partial<AISettings>) => void
  isInitialized: boolean
  setInitialized: (isInitialized: boolean) => void
}

export const useSettingsStore = create<SettingsState>()((set) => ({
  settings: {
    general: {
      theme: 'system',
      launchAtLogin: false,
      showInDock: true,
      shortcut: 'Shift+Command+Space',
      language: 'en'
    },
    ai: {
      provider: 'openai',
      openai: {
        apiKey: ''
      },
      anthropic: {
        apiKey: ''
      }
    }
  },
  isInitialized: false,
  setInitialized: (isInitialized) => set({ isInitialized }),
  setSettings: (newSettings) =>
    set((state) => ({
      settings: { ...state.settings, ...newSettings }
    })),
  setGeneralSettings: (newGeneralSettings) =>
    set((state) => ({
      settings: { ...state.settings, general: { ...state.settings.general, ...newGeneralSettings } }
    })),
  setAiSettings: (newAiSettings) => {
    set((state) => {
      const currentAiSettings = state.settings.ai
      const updatedAiSettings = { ...currentAiSettings }

      if (newAiSettings.provider) {
        updatedAiSettings.provider = newAiSettings.provider
      }
      if (newAiSettings.openai) {
        updatedAiSettings.openai = { ...currentAiSettings.openai, ...newAiSettings.openai }
      }
      if (newAiSettings.anthropic) {
        updatedAiSettings.anthropic = { ...currentAiSettings.anthropic, ...newAiSettings.anthropic }
      }

      return {
        settings: {
          ...state.settings,
          ai: updatedAiSettings
        }
      }
    })
  }
})) 