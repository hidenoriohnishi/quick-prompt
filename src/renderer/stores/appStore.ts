import { create } from 'zustand'

export type View = 'selector' | 'form' | 'loading' | 'result' | 'settings' | 'adjust_form'
export type SettingsView = 'general' | 'prompts' | 'ai'

type AppState = {
  currentView: View
  settingsView: SettingsView
  selectedPromptId: string | null
  isWindowVisible: boolean
  lastSelectedPromptId: string | null
  viewBeforeLoading: View | null

  setCurrentView: (view: View) => void
  setSettingsView: (view: SettingsView) => void
  setSelectedPromptId: (id: string | null) => void
  setLastSelectedPromptId: (id: string | null) => void
  showWindow: () => void
  hideWindow: () => void
  setViewBeforeLoading: (view: View | null) => void
}

export const useAppStore = create<AppState>((set) => ({
  currentView: 'selector',
  settingsView: 'prompts',
  selectedPromptId: null,
  isWindowVisible: false,
  lastSelectedPromptId: null,
  viewBeforeLoading: null,

  setCurrentView: (view) => set({ currentView: view }),
  setSettingsView: (view) => set({ settingsView: view }),
  setSelectedPromptId: (id) => set({ selectedPromptId: id }),
  setLastSelectedPromptId: (id) => set({ lastSelectedPromptId: id }),
  showWindow: () => set({ isWindowVisible: true }),
  hideWindow: () => set({ isWindowVisible: false, currentView: 'selector' }),
  setViewBeforeLoading: (view) => set({ viewBeforeLoading: view }),
})) 