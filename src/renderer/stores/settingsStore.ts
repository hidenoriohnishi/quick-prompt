import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import { storage } from '../lib/storage'
import type { Settings, GeneralSettings, AISettings } from '../../lib/types'


type SettingsState = {
  settings: Settings,
  setSettings: (newSettings: Partial<Settings>) => void,
  setGeneralSettings: (newGeneralSettings: Partial<GeneralSettings>) => void,
  setAiSettings: (newAiSettings: Partial<AISettings>) => void
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
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
    }),
    {
      name: 'settings',
      storage: createJSONStorage(() => storage)
    }
  )
) 