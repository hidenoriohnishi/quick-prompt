import { useState, useEffect, useRef, useCallback } from 'react'
import TextareaAutosize from 'react-textarea-autosize'
import { useAppStore } from '../stores/appStore'
import { useLlmStore } from '../stores/llmStore'
import { usePromptStore } from '../stores/promptStore'
import { useGlobalShortcuts } from '../hooks/useGlobalShortcuts'

export function AdjustForm() {
  const { setCurrentView, setViewBeforeLoading } = useAppStore()
  const { handleAdjustment } = useLlmStore()
  const { selectedPromptId } = useAppStore()
  const { getPromptById } = usePromptStore()

  const [adjustmentText, setAdjustmentText] = useState('')
  const textAreaRef = useRef<HTMLTextAreaElement>(null)

  const selectedPrompt = selectedPromptId ? getPromptById(selectedPromptId) : null

  const submitAdjustment = useCallback(() => {
    if (!adjustmentText.trim() || !selectedPrompt) return
    setViewBeforeLoading('result')
    handleAdjustment(adjustmentText, selectedPrompt.aiProvider, selectedPrompt.model)
    setCurrentView('loading')
  }, [
    adjustmentText,
    selectedPrompt,
    setViewBeforeLoading,
    handleAdjustment,
    setCurrentView
  ])

  const handleCancel = useCallback(() => {
    setCurrentView('result')
  }, [setCurrentView])

  useGlobalShortcuts({
    'Escape': handleCancel,
    'Meta+Enter': submitAdjustment,
    'Ctrl+Enter': submitAdjustment,
    'Shift+Enter': submitAdjustment
  })

  useEffect(() => {
    textAreaRef.current?.focus()
  }, [])

  return (
    <div className="flex flex-col h-full p-4">
      <h2 className="text-lg font-bold mb-2">Adjust Response</h2>
      <p className="text-sm text-neutral-500 mb-4">
        Enter your instructions to adjust the previous response.
      </p>
      <div className="flex-grow">
        <TextareaAutosize
          ref={textAreaRef}
          value={adjustmentText}
          onChange={(e) => setAdjustmentText(e.target.value)}
          placeholder="e.g., Make it more formal."
          className="w-full h-full p-2 bg-neutral-100 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-md resize-none"
          minRows={5}
        />
      </div>
      <div className="flex justify-between items-center pt-4">
        <button
          type="button"
          onClick={handleCancel}
          className="px-4 py-2 rounded-md bg-neutral-200 dark:bg-neutral-700 text-neutral-900 dark:text-neutral-100 hover:bg-neutral-300 dark:hover:bg-neutral-600"
        >
          Cancel (Esc)
        </button>
        <button
          type="button"
          onClick={submitAdjustment}
          className="px-4 py-2 rounded-md bg-blue-600 text-white hover:bg-blue-700"
        >
          Regenerate (Cmd+Enter)
        </button>
      </div>
    </div>
  )
} 