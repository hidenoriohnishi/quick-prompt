import { create } from 'zustand'
import { v4 as uuidv4 } from 'uuid'
import type { Prompt } from '../../lib/types'

export type PromptStore = {
  prompts: Prompt[]
  formValues: { [key: string]: string }
  setPrompts: (prompts: Prompt[]) => void
  addPrompt: (prompt: Prompt) => void
  updatePrompt: (prompt: Prompt) => void
  deletePrompt: (id: string) => void
  getPromptById: (id: string) => Prompt | undefined
  isInitialized: boolean
  setInitialized: (isInitialized: boolean) => void
  setFormValues: (formValues: { [key: string]: string }) => void
  resetFormValues: () => void
}

export const usePromptStore = create<PromptStore>()((set, get) => ({
  prompts: [],
  formValues: {},
  isInitialized: false,
  setInitialized: (isInitialized) => set({ isInitialized }),
  getPromptById: (id) => get().prompts.find((p) => p.id === id),
  setPrompts: (prompts) => set({ prompts }),
  addPrompt: (prompt) => set((state) => ({ prompts: [...state.prompts, prompt] })),
  updatePrompt: (prompt) =>
    set((state) => ({
      prompts: state.prompts.map((p) =>
        p.id === prompt.id ? { ...prompt, updatedAt: new Date().toISOString() } : p
      )
    })),
  deletePrompt: (id) => set((state) => ({ prompts: state.prompts.filter((p) => p.id !== id) })),
  setFormValues: (formValues) => set({ formValues }),
  resetFormValues: () => set({ formValues: {} })
})) 