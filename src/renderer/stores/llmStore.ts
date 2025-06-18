import { create } from 'zustand'
import type { Prompt } from './promptStore'

export type Message = {
  role: 'user' | 'assistant'
  content: string
}

export type Usage = {
  promptTokens: number
  completionTokens: number
  totalTokens: number
}

type LlmState = {
  messages: Message[]
  usage: Usage
  isLoading: boolean
  error?: Error
  currentRequestId: string | null
}

type LlmActions = {
  setMessages: (messages: Message[]) => void
  addMessageChunk: (chunk: string) => void
  setUsage: (usage: Usage) => void
  setIsLoading: (isLoading: boolean) => void
  setError: (error?: Error) => void
  setCurrentRequestId: (id: string | null) => void
  clear: () => void
  handleSubmit: (
    userMessageContent: string, 
    aiProvider: Prompt['aiProvider'], 
    model: Prompt['model']
  ) => void
  cancelRequest: () => void
}

const initialState: LlmState = {
  messages: [],
  usage: { promptTokens: 0, completionTokens: 0, totalTokens: 0 },
  isLoading: false,
  error: undefined,
  currentRequestId: null,
}

export const useLlmStore = create<LlmState & LlmActions>((set, get) => ({
  ...initialState,
  
  setMessages: (messages) => set({ messages }),
  
  addMessageChunk: (chunk) => {
    set((state) => {
      const lastMessage = state.messages[state.messages.length - 1]
      if (lastMessage?.role === 'assistant') {
        return {
          messages: [
            ...state.messages.slice(0, -1),
            { ...lastMessage, content: lastMessage.content + chunk },
          ],
        }
      }
      return {
        messages: [...state.messages, { role: 'assistant', content: chunk }],
      }
    })
  },
  
  setUsage: (usage) => set({ usage }),
  setIsLoading: (isLoading) => set({ isLoading }),
  setError: (error) => set({ error }),
  setCurrentRequestId: (id) => set({ currentRequestId: id }),
  
  clear: () => set(initialState),

  handleSubmit: (userMessageContent, aiProvider, model) => {
    get().clear()
    const newUserMessage: Message = { role: 'user', content: userMessageContent }
    set({ 
      messages: [newUserMessage], 
      isLoading: true, 
      error: undefined 
    })
    window.electron.sendLlmRequest({ messages: [newUserMessage], aiProvider, model })
  },
  
  cancelRequest: () => {
    const { currentRequestId } = get()
    if (currentRequestId) {
      window.electron.cancelLlmRequest(currentRequestId)
      set({ isLoading: false, currentRequestId: null })
    }
  },
})) 