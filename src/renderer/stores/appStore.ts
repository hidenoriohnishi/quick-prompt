import { create } from 'zustand'

type View = 'selector' | 'form' | 'loading' | 'result' | 'settings'

type AppState = {
  currentView: View
  selectedPromptId: string | null
  isWindowVisible: boolean

  setCurrentView: (view: View) => void
  setSelectedPromptId: (id: string | null) => void
  showWindow: () => void
  hideWindow: () => void
}

export const useAppStore = create<AppState>((set) => ({
  currentView: 'selector',
  selectedPromptId: null,
  isWindowVisible: false,

  setCurrentView: (view) => set({ currentView: view }),
  setSelectedPromptId: (id) => set({ selectedPromptId: id }),
  showWindow: () => set({ isWindowVisible: true }),
  hideWindow: () => set({ isWindowVisible: false, currentView: 'selector' }),
})) 