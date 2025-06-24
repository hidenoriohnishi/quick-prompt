import { useState, useEffect, useCallback } from 'react'
import { useLlmStore, type Usage } from '../stores/llmStore'
import { useAppStore } from '../stores/appStore'
import { usePromptStore } from '../stores/promptStore'
import { useGlobalShortcuts } from '../hooks/useGlobalShortcuts'

const modelCosts = {
  'gpt-4o': { prompt: 5.0, completion: 15.0 }, // per 1M tokens
  'gpt-4o-mini': { prompt: 0.15, completion: 0.6 },
  'gpt-4.1': { prompt: 2.0, completion: 8.0 },
  'gpt-4.1-mini': { prompt: 0.4, completion: 1.6 },
  'gpt-4.1-nano': { prompt: 0.1, completion: 0.4 },
  'claude-3-opus-20240229': { prompt: 15.0, completion: 75.0 },
  'claude-3.5-sonnet-20241022': { prompt: 3.0, completion: 15.0 },
  'claude-3-haiku-20241022': { prompt: 0.8, completion: 4.0 },
  'claude-opus-4-20250514': { prompt: 15.0, completion: 75.0 },
  'claude-sonnet-4-20250514': { prompt: 3.0, completion: 15.0 },
  'claude-3-7-sonnet-20250219': { prompt: 3.0, completion: 15.0 }
};

function calculateCost(model: string, usage: Usage): string | null {
  if (!usage || !usage.totalTokens) return null;

  const costs = modelCosts[model as keyof typeof modelCosts]
  if (!costs) return null;

  const cost =
    (usage.promptTokens * costs.prompt + usage.completionTokens * costs.completion) / 1_000_000
  return cost.toFixed(4)
}

export function Result() {
  const { messages, usage } = useLlmStore()
  const { setCurrentView } = useAppStore()

  const assistantMessage = messages.find((m) => m.role === 'assistant')?.content || ''
  const [editedResult, setEditedResult] = useState(assistantMessage)
  const [isCopied, setIsCopied] = useState(false)
  const [estimatedCost, setEstimatedCost] = useState<string | null>(null)

  useEffect(() => {
    setEditedResult(assistantMessage)
  }, [assistantMessage])

  useEffect(() => {
    if (usage) {
      const selectedPromptId = useAppStore.getState().selectedPromptId
      const prompts = usePromptStore.getState().prompts
      const currentPrompt = prompts.find((p) => p.id === selectedPromptId)
      if (currentPrompt) {
        setEstimatedCost(calculateCost(currentPrompt.model, usage))
      }
    }
  }, [usage])

  const handleBackToPrompt = useCallback(() => {
    setCurrentView('form')
  }, [setCurrentView])

  const handleCopy = useCallback(() => {
    navigator.clipboard.writeText(editedResult)
    setIsCopied(true)
    window.electron.showNotification({
      title: 'Copied to clipboard!',
      body: 'The result has been copied to your clipboard.'
    })
    window.electron.hideWindow()
  }, [editedResult])

  useGlobalShortcuts({
    'Escape': handleBackToPrompt,
    'Meta+Enter': handleCopy,
    'Ctrl+Enter': handleCopy
  })

  return (
    <div className="flex flex-col h-full p-4">
      <h2 className="text-xl font-bold mb-4">Result</h2>
      <div className="flex-grow mb-4">
        <textarea
          value={editedResult}
          onChange={(e) => {
            setEditedResult(e.target.value)
            setIsCopied(false)
          }}
          className="w-full h-full p-2 bg-neutral-100 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-md resize-none"
        />
      </div>
      {usage && usage.totalTokens > 0 && (
        <div className="text-xs text-neutral-500 mb-4">
          Tokens: {usage.totalTokens} (Prompt: {usage.promptTokens}, Completion: {usage.completionTokens}) / Cost: ${estimatedCost}
        </div>
      )}
      <div className="flex justify-end">
        <div className="flex space-x-2">
          <button
            onClick={handleBackToPrompt}
            className="px-4 py-2 rounded-md bg-neutral-200 dark:bg-neutral-700 hover:bg-neutral-300 dark:hover:bg-neutral-600"
          >
            Back to prompt (ESC)
          </button>
          <button
            onClick={handleCopy}
            disabled={isCopied}
            className="w-44 px-4 py-2 rounded-md bg-blue-600 text-white hover:bg-blue-700 disabled:bg-blue-700 disabled:cursor-not-allowed text-center"
          >
            Copy (Cmd+Enter)
          </button>
        </div>
      </div>
    </div>
  )
} 