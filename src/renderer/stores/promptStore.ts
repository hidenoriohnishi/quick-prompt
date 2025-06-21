import { create } from 'zustand'
import { v4 as uuidv4 } from 'uuid'
import type { Prompt } from '../../lib/types'

type PromptState = {
  prompts: Prompt[]
  setPrompts: (prompts: Prompt[]) => void
  addPrompt: (prompt: Omit<Prompt, 'id' | 'createdAt' | 'updatedAt'>) => void
  updatePrompt: (prompt: Prompt) => void
  deletePrompt: (id: string) => void
  getPromptById: (id: string) => Prompt | undefined
  isInitialized: boolean
  setInitialized: (isInitialized: boolean) => void
}

export const usePromptStore = create<PromptState>()((set, get) => ({
  prompts: [],
  isInitialized: false,
  setInitialized: (isInitialized) => set({ isInitialized }),
  getPromptById: (id) => get().prompts.find((p) => p.id === id),
  setPrompts: (prompts) => set({ prompts }),
  addPrompt: (prompt) => {
    const newPrompt: Prompt = {
      ...prompt,
      id: uuidv4(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
    set((state) => ({ prompts: [...state.prompts, newPrompt] }))
  },
  updatePrompt: (prompt) =>
    set((state) => ({
      prompts: state.prompts.map((p) =>
        p.id === prompt.id ? { ...prompt, updatedAt: new Date().toISOString() } : p
      )
    })),
  deletePrompt: (id) => set((state) => ({ prompts: state.prompts.filter((p) => p.id !== id) }))
})) 