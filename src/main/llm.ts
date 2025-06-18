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
    let persistedData = store.get('settings') as any

    if (typeof persistedData === 'string') {
      try {
        persistedData = JSON.parse(persistedData)
      } catch (e) {
        console.error('Failed to parse settings from store:', e)
        throw new Error('Could not parse settings.')
      }
    }

    let settings: Settings | undefined

    if (persistedData && persistedData.state && persistedData.state.settings) {
      settings = persistedData.state.settings // Handle Zustand's persisted format
    } else if (persistedData) {
      settings = persistedData // Handle raw settings object
    }

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
      const config: { apiKey: string; baseURL?: string } = { apiKey: providerSettings.apiKey }
      if ('baseURL' in providerSettings && providerSettings.baseURL) {
        config.baseURL = providerSettings.baseURL
      }
      providerInstance = createOpenAI(config)
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
      prompt: finalPrompt,
      // @ts-expect-error experimental_streamData is required for usage stats
      experimental_streamData: true,
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