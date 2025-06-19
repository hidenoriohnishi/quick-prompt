import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import { storage } from '../lib/storage'
import type { Settings, GeneralSettings, AISettings } from '../../lib/types'

// export type GeneralSettings = {
//   theme: 'system' | 'light' | 'dark'
//   launchAtLogin: boolean
//   showInDock: boolean
//   shortcut: string
//   language: string
// }
//
// export type AIProvider = {
//   apiKey?: string
//   model?: string
// }
//
// export type AISettings = {
//   provider: 'openai' | 'anthropic'
//   openai: AIProvider
//   anthropic: AIProvider
// }
//
// export type Settings = {
//   general: GeneralSettings,
//   ai: AISettings
// }

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
      setAiSettings: (newAiSettings) =>
        set((state) => ({
          settings: { ...state.settings, ai: { ...state.settings.ai, ...newAiSettings } }
        }))
    }),
    {
      name: 'settings', // key in the storage
      storage: createJSONStorage(() => storage)
    }
  )
) 