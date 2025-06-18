import { type IpcMainEvent, type IpcMain } from 'electron'
import { createOpenAI } from '@ai-sdk/openai'
import { createAnthropic } from '@ai-sdk/anthropic'
import { streamText } from 'ai'
import type { Settings } from '../renderer/stores/settingsStore'
import { v4 as uuidv4 } from 'uuid'
import type Store from 'electron-store'

type LLMProvider = 'openai' | 'anthropic'

type LLMRequest = {
  input: string
  provider: LLMProvider
  prompt: string
  model: string
}

export type LlmResponse = {
  type: 'chunk' | 'error' | 'end' | 'usage'
  data: string
  requestId?: string
}

async function handleLLMRequest(
  event: IpcMainEvent,
  request: LLMRequest,
  store: Store,
  onChunk: (chunk: LlmResponse) => void
) {
  const { provider, input, prompt, model } = request
  const finalPrompt = prompt.replace('{input}', input)
  const aiProvider = provider || 'openai'
  const requestId = uuidv4()

  try {
    const persistedStateJSON = store.get('settings') as string | undefined
    if (!persistedStateJSON) {
      throw new Error('Settings not found. Please configure your settings.')
    }

    const { state } = JSON.parse(persistedStateJSON)
    const settings = state.settings as Settings | undefined

    if (!settings) {
      throw new Error('Settings data is malformed. Please re-configure your settings.')
    }

    const providerSettings = settings.ai[aiProvider]
    const apiKey = providerSettings?.apiKey
    const baseURL = providerSettings?.baseURL

    if (!apiKey) {
      throw new Error(`API key not found for ${aiProvider}. Please set it in the AI settings.`)
    }

    let providerInstance
    if (aiProvider === 'openai') {
      const config = { apiKey, ...(baseURL ? { baseURL } : {}) }
      providerInstance = createOpenAI(config)
    } else {
      providerInstance = createAnthropic({ apiKey })
    }

    if (!providerInstance) {
      throw new Error(`Unsupported AI provider: ${aiProvider}`)
    }

    // Inform the renderer that the stream is starting
    onChunk({ type: 'chunk', data: '', requestId })

    const result = await streamText({
      model: providerInstance.chat(model || 'gpt-4o-mini'),
      prompt: finalPrompt,
      // @ts-expect-error experimental_streamData is required for usage stats
      experimental_streamData: true,
      onFinish: (result) => {
        console.log('[LLM] onFinish called with result:', result)
        console.log('[LLM] result.usage:', result.usage)
        console.log('[LLM] result.usage type:', typeof result.usage)
        console.log('[LLM] result.usage keys:', Object.keys(result.usage || {}))
        
        // Vercel AI SDKの正しいusage取得方法
        const finalUsage = {
          promptTokens: result.usage?.promptTokens ?? 0,
          completionTokens: result.usage?.completionTokens ?? 0,
          totalTokens: result.usage?.totalTokens ?? 0
        }
        console.log('[LLM] Final usage calculated:', finalUsage)
        
        onChunk({
          type: 'usage',
          data: JSON.stringify(finalUsage),
          requestId
        })
        
        onChunk({
          type: 'end',
          data: JSON.stringify({ finishReason: result.finishReason }),
          requestId
        })
      }
    })

    for await (const delta of result.textStream) {
      console.log('[LLM] delta received:', JSON.stringify(delta, null, 2));
      onChunk({ type: 'chunk', data: delta, requestId })
    }

    // 追加のデバッグ: result.usageプロミスも試してみる
    try {
      const usageFromPromise = await result.usage
      console.log('[LLM] Usage from result.usage promise:', usageFromPromise)
    } catch (error) {
      console.log('[LLM] Error getting usage from promise:', error)
    }

  } catch (error: any) {
    console.error('[LLM] Error processing request:', error)
    onChunk({ type: 'error', data: error.message, requestId })
  }
}

export function handleLlm(ipcMain: IpcMain, store: Store) {
  ipcMain.on('llm-request', (event, request: LLMRequest) => {
    const onChunk = (chunk: LlmResponse) => {
      if (event.sender && !event.sender.isDestroyed()) {
        event.sender.send('llm-response', chunk)
      }
    }
    handleLLMRequest(event, request, store, onChunk)
  })
} 