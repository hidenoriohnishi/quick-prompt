import { type IpcMainEvent, type IpcMain } from 'electron'
import { createOpenAI } from '@ai-sdk/openai'
import { createAnthropic } from '@ai-sdk/anthropic'
import { streamText } from 'ai'
import type { Settings } from '../lib/types'
import { v4 as uuidv4 } from 'uuid'
import type Store from 'electron-store'
import { getSettings } from './storage'

const activeRequests = new Map<string, AbortController>()

type LLMProvider = 'openai' | 'anthropic'

type LLMRequest = {
  provider: LLMProvider
  messages: { role: 'user' | 'assistant'; content: string }[]
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
  const { provider, messages, model } = request
  const aiProvider = provider || 'openai'
  const requestId = uuidv4()
  const abortController = new AbortController()
  activeRequests.set(requestId, abortController)

  try {
    const settings = getSettings()

    if (!settings) {
      throw new Error('Settings not found. Please configure your settings.')
    }

    if (!settings.ai) {
      throw new Error('AI settings are not configured. Please set them in the settings.')
    }
    
    const providerSettings = settings.ai[aiProvider]
    
    if (!providerSettings?.apiKey) {
      throw new Error(`API key not found for ${aiProvider}. Please set it in the AI settings.`)
    }
    
    let providerInstance
    if (aiProvider === 'openai') {
      providerInstance = createOpenAI({ apiKey: providerSettings.apiKey })
    } else if (aiProvider === 'anthropic') {
      providerInstance = createAnthropic({ apiKey: providerSettings.apiKey })
    } else {
      throw new Error(`Unsupported AI provider: ${aiProvider}`);
    }

    if (!providerInstance) {
      throw new Error(`Could not create AI provider instance for: ${aiProvider}`)
    }

    // Inform the renderer that the stream is starting
    onChunk({ type: 'chunk', data: '', requestId })

    const result = await streamText({
      model: providerInstance.chat(model || 'gpt-4o-mini'),
      messages: messages,
      // @ts-expect-error experimental_streamData is required for usage stats
      experimental_streamData: true,
      abortSignal: abortController.signal,
      onFinish: (result) => {
        // Vercel AI SDKの正しいusage取得方法
        const finalUsage = {
          promptTokens: result.usage?.promptTokens ?? 0,
          completionTokens: result.usage?.completionTokens ?? 0,
          totalTokens: result.usage?.totalTokens ?? 0
        }
        
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
      onChunk({ type: 'chunk', data: delta, requestId })
    }

    // 追加のデバッグ: result.usageプロミスも試してみる
    try {
      await result.usage
    } catch (error) {
      console.error('[LLM] Error getting usage from promise:', error)
    }

  } catch (error: any) {
    if (error.name !== 'AbortError') {
      console.error('[LLM] Error processing request:', error)
      onChunk({ type: 'error', data: error.message, requestId })
    }
  } finally {
    activeRequests.delete(requestId)
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

  ipcMain.on('llm-cancel', (_event, requestId: string) => {
    const controller = activeRequests.get(requestId)
    if (controller) {
      controller.abort()
      activeRequests.delete(requestId)
      console.log(`[LLM] Cancelled request ${requestId}`)
    }
  })
} 