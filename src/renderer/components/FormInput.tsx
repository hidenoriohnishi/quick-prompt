import { useState, useEffect, useRef } from 'react'
import { useAppStore } from '../stores/appStore'
import { usePromptStore } from '../stores/promptStore'
import { useLlmStore } from '../stores/llmStore'

export function FormInput() {
  const { setCurrentView } = useAppStore()
  const { getPromptById } = usePromptStore()
  const { handleSubmit } = useLlmStore()
  const formRef = useRef<HTMLFormElement>(null)
  const wrapperRef = useRef<HTMLDivElement>(null)

  const selectedPromptId = useAppStore(state => state.selectedPromptId)
  const selectedPrompt = selectedPromptId ? getPromptById(selectedPromptId) : null

  const [formValues, setFormValues] = useState<{ [key: string]: string }>({})

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
    if (selectedPrompt) {
      const initialValues: { [key: string]: string } = {}
      selectedPrompt.placeholders.forEach((p) => {
        initialValues[p.name] = p.defaultValue || ''
      })
      setFormValues(initialValues)

      setTimeout(() => {
        if (formRef.current) {
          const firstInput = formRef.current.querySelector('input, select, textarea') as HTMLElement | null
          if (firstInput) {
            firstInput.focus()
          } else if (wrapperRef.current) {
            wrapperRef.current.focus()
          }
        }
      }, 50)
    }
  }, [selectedPromptId, selectedPrompt])

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    setFormValues({
      ...formValues,
      [e.target.name]: e.target.value,
    })
  }

  const handleFormSubmit = (e?: React.FormEvent) => {
    e?.preventDefault()
    if (!selectedPrompt) return

    let processedTemplate = selectedPrompt.template
    for (const key in formValues) {
      processedTemplate = processedTemplate.replace(`{{${key}}}`, formValues[key])
    }

    handleSubmit(processedTemplate, selectedPrompt.aiProvider, selectedPrompt.model, processedTemplate)
    setCurrentView('loading')
  }

  const handleCancel = () => {
    setCurrentView('selector')
  }

  if (!selectedPrompt) {
    return <div>Select a prompt to begin.</div>
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
      e.preventDefault();
      handleFormSubmit();
    }
  }

  return (
    <div ref={wrapperRef} onKeyDown={handleKeyDown} className="flex flex-col h-full focus:outline-none" tabIndex={-1}>
      <h2 className="text-lg font-bold mb-2">{selectedPrompt.name}</h2>
      <p className="text-sm text-neutral-500 mb-4">{selectedPrompt.description}</p>
      <form ref={formRef} className="flex-grow space-y-4 overflow-y-auto pr-2">
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
                      <option key={option} value={option}>
                        {option}
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
                  <textarea
                    id={id}
                    name={name}
                    value={formValues[name] || defaultValue || ''}
                    onChange={handleInputChange}
                    placeholder={`Enter ${label}...`}
                    className="w-full h-24 p-2 bg-neutral-100 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-md"
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
        <div className="flex justify-end pt-4">
          <button
            type="button"
            onClick={() => handleFormSubmit()}
            className="px-4 py-2 rounded-md bg-blue-600 text-white hover:bg-blue-700"
          >
            Generate (Cmd+Enter)
          </button>
        </div>
      </form>
    </div>
  )
} 