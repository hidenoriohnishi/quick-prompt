import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import { storage } from '../lib/storage'
import { v4 as uuidv4 } from 'uuid'

// Re-define types here to avoid importing from main process
export type Placeholder = {
  id: string
  name: string
  label: string
  type: 'text' | 'select'
  options?: string[]
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
      prompts: [
        {
          id: '1',
          name: 'Translate',
          description: 'Translate text to a specified language.',
          template: 'Translate the following text to {{language}}: {{text}}',
          placeholders: [
            { id: '1', name: 'language', label: 'Language', type: 'text', defaultValue: 'Japanese' },
            { id: '2', name: 'text', label: 'Text', type: 'text', defaultValue: '' },
          ],
          aiProvider: 'openai',
          model: 'gpt-4o-mini',
          createdAt: new Date(),
        },
        {
          id: 'p_2',
          name: 'Translate',
          description: 'Translate text to a specified language.',
          template: 'Translate the following text to {{language}}: {{text}}',
          placeholders: [
            { id: 'ph_1', name: 'content', label: 'Content', type: 'text' }
          ],
          aiProvider: 'openai',
          model: 'gpt-4o-mini',
          createdAt: new Date(),
        }
      ],
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