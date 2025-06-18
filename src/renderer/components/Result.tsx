import { useState, useEffect } from 'react'
import { useLlmStore, type Usage } from '../stores/llmStore'
import { useAppStore } from '../stores/appStore'
import { usePromptStore } from '../stores/promptStore'

const modelCosts = {
  'gpt-4o': { prompt: 5.0, completion: 15.0 }, // per 1M tokens
  'gpt-4o-mini': { prompt: 0.15, completion: 0.6 },
  'gpt-4-turbo': { prompt: 10.0, completion: 30.0 },
  'gpt-3.5-turbo': { prompt: 0.5, completion: 1.5 },
  'gpt-4.1': { prompt: 2.0, completion: 8.0 },
  'gpt-4.1-mini': { prompt: 0.4, completion: 1.6 },
  'gpt-4.1-nano': { prompt: 0.1, completion: 0.4 },
  'claude-3-opus-20240229': { prompt: 15.0, completion: 75.0 },
  'claude-3-sonnet-20240229': { prompt: 3.0, completion: 15.0 },
  'claude-3-haiku-20240307': { prompt: 0.25, completion: 1.25 },
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
  const { messages, usage, clear: clearLlm } = useLlmStore()
  const { setCurrentView, setSelectedPromptId } = useAppStore()
  
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
      const currentPrompt = prompts.find(p => p.id === selectedPromptId)
      if (currentPrompt) {
        setEstimatedCost(calculateCost(currentPrompt.model, usage))
      }
    }
  }, [usage])

  const handleBack = () => {
    clearLlm()
    setCurrentView('selector')
  }

  const handleCopy = () => {
    navigator.clipboard.writeText(editedResult)
    setIsCopied(true)
    window.electron.showNotification({
      title: 'Copied to clipboard!',
      body: 'The result has been copied to your clipboard.',
    })
    setTimeout(() => setIsCopied(false), 2000)
  }
  
  const resetAndClose = () => {
    clearLlm()
    setCurrentView('selector')
    setSelectedPromptId(null)
    window.electron.hideWindow()
  }

  const handleClose = async () => {
    if (isCopied) {
      resetAndClose()
    } else {
      const result = await window.electron.showConfirmationDialog({
        type: 'warning',
        title: 'Confirm Close',
        message: 'The result has not been copied. Are you sure you want to close?',
        buttons: ['Yes, Close', 'No, Cancel'],
        defaultId: 1,
        cancelId: 1,
      })
      if (result.response === 0) {
        resetAndClose()
      }
    }
  }

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault()
        handleClose()
      } else if (e.key === 'Enter' && e.shiftKey) {
        e.preventDefault()
        handleCopy()
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => {
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [editedResult, isCopied])

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
            onClick={handleBack}
            className="px-4 py-2 rounded-md bg-neutral-200 dark:bg-neutral-700 hover:bg-neutral-300 dark:hover:bg-neutral-600"
          >
            Back to Prompts
          </button>
          <button
            onClick={handleClose}
            className="px-4 py-2 rounded-md bg-neutral-200 dark:bg-neutral-700 hover:bg-neutral-300 dark:hover:bg-neutral-600"
          >
            Close (ESC)
          </button>
          <button
            onClick={handleCopy}
            disabled={isCopied}
            className="px-4 py-2 rounded-md bg-blue-600 text-white hover:bg-blue-700 disabled:bg-green-600 disabled:cursor-not-allowed"
          >
            {isCopied ? 'Copied!' : 'Copy (Shift+Enter)'}
          </button>
        </div>
      </div>
    </div>
  )
} 