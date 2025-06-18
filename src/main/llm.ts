import { createOpenAI } from '@ai-sdk/openai'
import { createAnthropic } from '@ai-sdk/anthropic'
import { streamText } from 'ai'
import store from './storage'
import type { Message } from 'ai'
import type { Settings } from '../renderer/stores/settingsStore'
import { IpcMain } from 'electron'
import { v4 as uuidv4 } from 'uuid'

export type LlmResponse = {
  type: 'chunk' | 'error' | 'end'
  data: string
}

async function handleLLMRequest(
  messages: Message[],
  aiProvider: 'openai' | 'anthropic',
  model: string,
  signal: AbortSignal,
  onChunk: (chunk: { type: 'chunk'; data: string }) => void,
  onFinish: (chunk: { type: 'end'; data: string }) => void,
  onError: (chunk: { type: 'error'; data: string }) => void,
) {
  try {
    const persistedState = store.get('settings-storage') as string | undefined
    if (!persistedState) {
      throw new Error('Settings not found. Please go to Settings > AI to set your API key.')
    }
    const { state } = JSON.parse(persistedState)
    const settings = state.settings as Settings
    const apiKey = settings.ai[aiProvider]?.apiKey

    if (!apiKey) {
      throw new Error(`API key not found for ${aiProvider}. Please set it in the AI settings.`)
    }

    let llm

    if (aiProvider === 'openai') {
      const openai = createOpenAI({
        apiKey,
        compatibility: 'strict',
      })
      llm = openai(model)
    } else if (aiProvider === 'anthropic') {
      const anthropic = createAnthropic({ apiKey })
      llm = anthropic(model)
    } else {
      throw new Error(`Unsupported AI provider: ${aiProvider}`)
    }

    const result = await streamText({
      model: llm,
      messages,
      abortSignal: signal,
    })

    for await (const delta of result.textStream) {
      onChunk({ type: 'chunk', data: delta })
    }

    const [finishReason, usage] = await Promise.all([result.finishReason, result.usage])

    console.log('[LLM] Request finished. Final usage:', usage)
    console.log('[LLM] Request finished. Final finishReason:', finishReason)

    onFinish({
      type: 'end',
      data: JSON.stringify({ finishReason, usage }),
    })
  } catch (error) {
    if (error instanceof Error && error.name === 'AbortError') {
      console.log('LLM request aborted.')
    } else {
      console.error('LLM request failed:', error)
      onError({
        type: 'error',
        data: error instanceof Error ? error.message : 'An unknown error occurred',
      })
    }
  }
}

const llmRequestControllers = new Map<string, AbortController>()

export function handleLlm(ipcMain: IpcMain) {
  ipcMain.on('llm-request', async (event, { messages, aiProvider, model }) => {
    const requestId = uuidv4()
    const controller = new AbortController()
    llmRequestControllers.set(requestId, controller)

    const onChunk = (chunk: { type: 'chunk'; data: string }) => {
      event.sender.send('llm-response', { ...chunk, requestId })
    }
    const onFinish = (chunk: { type: 'end'; data: string }) => {
      event.sender.send('llm-response', { ...chunk, requestId })
      llmRequestControllers.delete(requestId)
    }
    const onError = (chunk: { type: 'error'; data: string }) => {
      event.sender.send('llm-response', { ...chunk, requestId })
      llmRequestControllers.delete(requestId)
    }

    try {
      await handleLLMRequest(messages, aiProvider, model, controller.signal, onChunk, onFinish, onError)
    } catch (error) {
      if (error instanceof Error && error.name !== 'AbortError') {
        onError({
          type: 'error',
          data: error.message ?? 'An unexpected error occurred in handleLLMRequest',
        })
      }
    }
  })

  ipcMain.on('llm-cancel', (_, requestId: string) => {
    const controller = llmRequestControllers.get(requestId)
    if (controller) {
      controller.abort()
      llmRequestControllers.delete(requestId)
    }
  })
} 