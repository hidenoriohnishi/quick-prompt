import { create } from 'zustand'
import { v4 as uuidv4 } from 'uuid'
import type { Prompt, Placeholder } from '../../lib/types'

export type SelectOption = {
  id: string
  label: string
  value: string
}

// Re-define types here to avoid importing from main process
export type Placeholder = {
  id: string
  name: string
  label: string
  type: 'text' | 'select' | 'textarea'
  options?: SelectOption[]
  defaultValue?: string
}

export type Prompt = {
  id: string
  name: string
  description: string
  template: string
  placeholders: Placeholder[]
  aiProvider: string // 'openai' | 'anthropic' etc.
  model: string
  createdAt: Date
}

type StoreType = {
  prompts: Prompt[]
  // other store properties
}

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