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
    model: Prompt['model'],
    prompt: string
  ) => void
  cancelRequest: () => void
  handleAdjustment: (adjustmentText: string, aiProvider: Prompt['aiProvider'], model: Prompt['model']) => void
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
  
  setUsage: (usage) => {
    set((state) => ({
      usage: {
        promptTokens: state.usage.promptTokens + usage.promptTokens,
        completionTokens: state.usage.completionTokens + usage.completionTokens,
        totalTokens: state.usage.totalTokens + usage.totalTokens,
      }
    }))
  },
  setIsLoading: (isLoading) => set({ isLoading }),
  setError: (error) => set({ error }),
  setCurrentRequestId: (id) => set({ currentRequestId: id }),
  
  clear: () => set({ messages: [], usage: { promptTokens: 0, completionTokens: 0, totalTokens: 0 }, error: undefined, isLoading: false, currentRequestId: null }),

  handleSubmit: (userMessageContent, aiProvider, model, prompt) => {
    get().clear()
    const finalContent = prompt.replace('{input}', userMessageContent)
    const messages: Message[] = [{ role: 'user', content: finalContent }]
    set({
      messages: messages,
      isLoading: true,
      error: undefined,
    })
    window.electron.sendLlmRequest({
      messages,
      provider: aiProvider,
      model,
    })
  },
  
  cancelRequest: () => {
    const { currentRequestId } = get()
    if (currentRequestId) {
      window.electron.cancelLlmRequest(currentRequestId)
      set({ isLoading: false, currentRequestId: null })
    }
  },

  handleAdjustment: (adjustmentText, aiProvider, model) => {
    const currentMessages = get().messages
    const newMessages = [...currentMessages, { role: 'user', content: adjustmentText }]

    set({ messages: newMessages, isLoading: true, error: undefined })
    
    window.electron.sendLlmRequest({
      messages: newMessages,
      provider: aiProvider,
      model,
    })
  }
})) 