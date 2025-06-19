import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import { storage } from '../lib/storage'
import { v4 as uuidv4 } from 'uuid'

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
  addPrompt: (prompt: Omit<Prompt, 'id' | 'createdAt'>) => void
  updatePrompt: (prompt: Prompt) => void
  deletePrompt: (id: string) => void
  initialize: () => Promise<void>
  getPromptById: (id: string) => Prompt | undefined
}

export const usePromptStore = create<PromptState>()(
  persist(
    (set, get) => ({
      prompts: [],
      getPromptById: (id) => get().prompts.find((p) => p.id === id),
      setPrompts: (prompts) => set({ prompts }),
      addPrompt: (prompt) => {
        const newPrompt: Prompt = {
          ...prompt,
          id: uuidv4(),
          createdAt: new Date(),
        }
        set((state) => ({ prompts: [...state.prompts, newPrompt] }))
      },
      updatePrompt: (prompt) =>
        set((state) => ({
          prompts: state.prompts.map((p) => (p.id === prompt.id ? prompt : p)),
        })),
      deletePrompt: (id) =>
        set((state) => ({ prompts: state.prompts.filter((p) => p.id !== id) })),
      initialize: async () => {
        const store = (await window.electron.getStore()) as StoreType
        set({ prompts: store.prompts || [] })
      },
    }),
    {
      name: 'prompt-storage',
      storage: createJSONStorage(() => storage),
    }
  )
) 