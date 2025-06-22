import { create } from 'zustand'

type View = 'selector' | 'form' | 'loading' | 'result' | 'settings'
export type SettingsView = 'general' | 'prompts' | 'prompt-detail' | 'ai'

type AppState = {
  currentView: View
  settingsView: SettingsView
  selectedPromptId: string | null
  isWindowVisible: boolean
  lastSelectedPromptId: string | null

  setCurrentView: (view: View) => void
  setSettingsView: (view: SettingsView) => void
  setSelectedPromptId: (id: string | null) => void
  setLastSelectedPromptId: (id: string | null) => void
  showWindow: () => void
  hideWindow: () => void
}

export const useAppStore = create<AppState>((set) => ({
  currentView: 'selector',
  settingsView: 'general',
  selectedPromptId: null,
  isWindowVisible: false,
  lastSelectedPromptId: null,

  setCurrentView: (view) => set({ currentView: view }),
  setSettingsView: (view) => set({ settingsView: view }),
  setSelectedPromptId: (id) => set({ selectedPromptId: id }),
  setLastSelectedPromptId: (id) => set({ lastSelectedPromptId: id }),
  showWindow: () => set({ isWindowVisible: true }),
  hideWindow: () => set({ isWindowVisible: false, currentView: 'selector' }),
})) 