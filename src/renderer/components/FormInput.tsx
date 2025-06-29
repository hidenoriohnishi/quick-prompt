import { useState, useEffect, useRef, useCallback } from 'react'
import TextareaAutosize from 'react-textarea-autosize'
import { useAppStore } from '../stores/appStore'
import { usePromptStore } from '../stores/promptStore'
import { useLlmStore } from '../stores/llmStore'
import { useGlobalShortcuts } from '../hooks/useGlobalShortcuts'

export function FormInput() {
  const { setCurrentView } = useAppStore()
  const { getPromptById, formValues, setFormValues } = usePromptStore()
  const { handleSubmit } = useLlmStore()
  const formRef = useRef<HTMLFormElement>(null)
  const wrapperRef = useRef<HTMLDivElement>(null)

  const selectedPromptId = useAppStore((state) => state.selectedPromptId)
  const { lastSelectedPromptId, setLastSelectedPromptId } = useAppStore()
  const selectedPrompt = selectedPromptId ? getPromptById(selectedPromptId) : null

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setCurrentView('selector')
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => {
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [setCurrentView])

  useEffect(() => {
    if (selectedPrompt && selectedPromptId !== lastSelectedPromptId) {
      const initialValues: { [key: string]: string } = {}
      selectedPrompt.placeholders.forEach((p) => {
        if (p.type === 'select' && !p.defaultValue) {
          initialValues[p.name] = p.options?.[0]?.value || ''
        } else {
          initialValues[p.name] = p.defaultValue || ''
        }
      })
      setFormValues(initialValues)
    }
    if (selectedPromptId) {
      setLastSelectedPromptId(selectedPromptId)
    }
  }, [
    selectedPromptId,
    selectedPrompt,
    setFormValues,
    lastSelectedPromptId,
    setLastSelectedPromptId
  ])

  useEffect(() => {
    const timer = setTimeout(() => {
      if (formRef.current) {
        const firstInput = formRef.current.querySelector(
          'input, select, textarea'
        ) as HTMLElement | null
        if (firstInput) {
          firstInput.focus()
        } else if (wrapperRef.current) {
          wrapperRef.current.focus()
        }
      }
    }, 50)
    return () => clearTimeout(timer)
  }, [selectedPromptId])

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    setFormValues({
      ...formValues,
      [e.target.name]: e.target.value
    })
  }

  const handleFormSubmit = useCallback(() => {
    if (!selectedPrompt) return

    let processedTemplate = selectedPrompt.template
    for (const key in formValues) {
      processedTemplate = processedTemplate.replace(`{{${key}}}`, formValues[key])
    }

    handleSubmit(processedTemplate, selectedPrompt.aiProvider, selectedPrompt.model, processedTemplate)
    setCurrentView('loading')
  }, [selectedPrompt, formValues, handleSubmit, setCurrentView])

  const handleCancel = useCallback(() => {
    setCurrentView('selector')
  },[setCurrentView])

  useGlobalShortcuts({
    'Escape': handleCancel,
    'Meta+Enter': handleFormSubmit,
    'Ctrl+Enter': handleFormSubmit,
  })

  if (!selectedPrompt) {
    return <div>Select a prompt to begin.</div>
  }

  return (
    <div ref={wrapperRef} className="flex flex-col h-full focus:outline-none" tabIndex={-1}>
      <h2 className="text-lg font-bold mb-2">{selectedPrompt.name}</h2>
      <p className="text-sm text-neutral-500 mb-4">{selectedPrompt.description}</p>
      <form
        ref={formRef}
        onSubmit={(e) => {
          e.preventDefault()
          handleFormSubmit()
        }}
        className="flex-grow space-y-4 overflow-y-auto pr-2"
      >
        {selectedPrompt.placeholders.length > 0 ? (
          selectedPrompt.placeholders.map((placeholder) => {
            const { id, name, label, type, options, defaultValue } = placeholder
            if (type === 'select') {
              return (
                <div key={id}>
                  <label htmlFor={id} className="block text-sm font-medium mb-1">
                    {label}
                  </label>
                  <select
                    id={id}
                    name={name}
                    value={formValues[name] || defaultValue || ''}
                    onChange={handleInputChange}
                    className="w-full p-2 bg-neutral-100 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-md"
                  >
                    {options?.map((option) => (
                      <option key={option.id} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>
              )
            } else if (type === 'textarea') {
              return (
                <div key={id}>
                  <label htmlFor={id} className="block text-sm font-medium mb-1">
                    {label}
                  </label>
                  <TextareaAutosize
                    id={id}
                    name={name}
                    value={formValues[name] || defaultValue || ''}
                    onChange={handleInputChange}
                    placeholder={`Enter ${label}...`}
                    className="w-full p-2 bg-neutral-100 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-md"
                    minRows={3}
                  />
                </div>
              )
            } else {
              // Default to text input
              return (
                <div key={id}>
                  <label htmlFor={id} className="block text-sm font-medium mb-1">
                    {label}
                  </label>
                  <input
                    type="text"
                    id={id}
                    name={name}
                    value={formValues[name] || defaultValue || ''}
                    onChange={handleInputChange}
                    placeholder={`Enter ${label}...`}
                    className="w-full p-2 bg-neutral-100 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-md"
                  />
                </div>
              )
            }
          })
        ) : (
          <div className="text-center text-neutral-500 py-10">
            <p>This prompt requires no input.</p>
            <p className="text-sm">Press Cmd+Enter to continue.</p>
          </div>
        )}
        <div className="flex justify-between items-center pt-4">
          <button
            type="button"
            onClick={handleCancel}
            className="px-4 py-2 rounded-md bg-neutral-200 dark:bg-neutral-700 text-neutral-900 dark:text-neutral-100 hover:bg-neutral-300 dark:hover:bg-neutral-600"
          >
            Back (Esc)
          </button>
          <button
            type="button"
            onClick={handleFormSubmit}
            className="px-4 py-2 rounded-md bg-blue-600 text-white hover:bg-blue-700"
          >
            Generate (Cmd+Enter)
          </button>
        </div>
      </form>
    </div>
  )
} 