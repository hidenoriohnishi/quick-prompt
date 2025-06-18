import { useState, useEffect } from 'react'
import { usePromptStore, type Prompt, type Placeholder } from '../../stores/promptStore'
import { useAppStore } from '../../stores/appStore'

const aiproviders = [
  { id: 'openai', name: 'OpenAI' },
  { id: 'anthropic', name: 'Anthropic' },
]

const openAIModels = ['gpt-4o', 'gpt-4-turbo', 'gpt-3.5-turbo']
const anthropicModels = ['claude-3-opus-20240229', 'claude-3-sonnet-20240229', 'claude-3-haiku-20240307']

export function PromptDetail() {
  const { selectedPromptId, setSettingsView } = useAppStore()
  const { prompts, addPrompt, updatePrompt } = usePromptStore()
  const [prompt, setPrompt] = useState<Omit<Prompt, 'id' | 'createdAt'>>()

  useEffect(() => {
    if (selectedPromptId) {
      const existingPrompt = prompts.find(p => p.id === selectedPromptId)
      if (existingPrompt) {
        setPrompt(existingPrompt)
      }
    } else {
      // Set default values for a new prompt
      setPrompt({
        name: '',
        description: '',
        template: '',
        placeholders: [],
        aiProvider: 'openai',
        model: 'gpt-4o',
      })
    }
  }, [selectedPromptId, prompts])

  const handleSave = () => {
    if (!prompt) return;

    if (selectedPromptId) {
      const originalPrompt = prompts.find(p => p.id === selectedPromptId)
      if (originalPrompt) {
        // We need to pass the full prompt object, including the original createdAt
        updatePrompt({ ...prompt, id: selectedPromptId, createdAt: originalPrompt.createdAt })
      }
    } else {
      // addPrompt now takes the partial prompt and handles id/createdAt
      addPrompt(prompt)
    }
    setSettingsView('prompts')
  }
  
  const handleCancel = () => {
    setSettingsView('prompts')
  }

  if (!prompt) {
    return <div>Loading prompt...</div>
  }

  const handlePlaceholderChange = (index: number, field: keyof Placeholder, value: string) => {
    const updatedPlaceholders = [...prompt.placeholders]
    updatedPlaceholders[index] = { ...updatedPlaceholders[index], [field]: value }
    setPrompt({ ...prompt, placeholders: updatedPlaceholders })
  }

  const addPlaceholder = () => {
    const newPlaceholder: Placeholder = {
      id: `ph_${Date.now()}`,
      name: '',
      label: '',
      type: 'text',
    }
    setPrompt({ ...prompt, placeholders: [...prompt.placeholders, newPlaceholder] })
  }

  const removePlaceholder = (index: number) => {
    const updatedPlaceholders = prompt.placeholders.filter((_, i) => i !== index)
    setPrompt({ ...prompt, placeholders: updatedPlaceholders })
  }

  return (
    <div className="flex flex-col h-full">
      <div className="mb-4">
        <h2 className="text-xl font-semibold">
          {selectedPromptId ? 'Edit Prompt' : 'New Prompt'}
        </h2>
      </div>

      <div className="flex-grow space-y-4 overflow-y-auto pr-2">
        <div>
          <label className="block text-sm font-medium mb-1">Name</label>
          <input
            type="text"
            value={prompt.name}
            onChange={(e) => setPrompt({ ...prompt, name: e.target.value })}
            className="w-full p-2 bg-neutral-100 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-md"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Description</label>
          <input
            type="text"
            value={prompt.description}
            onChange={(e) => setPrompt({ ...prompt, description: e.target.value })}
            className="w-full p-2 bg-neutral-100 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-md"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Template</label>
          <textarea
            value={prompt.template}
            onChange={(e) => setPrompt({ ...prompt, template: e.target.value })}
            rows={5}
            className="w-full p-2 bg-neutral-100 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-md"
            placeholder="e.g., Translate the following text to {{language}}: {{text}}"
          />
        </div>
        
        <div className="border-t pt-4 mt-4">
          <div className="flex justify-between items-center mb-2">
            <h3 className="text-lg font-semibold">Placeholders</h3>
            <button onClick={addPlaceholder} className="text-sm px-3 py-1 rounded-md bg-blue-600 text-white hover:bg-blue-700">
              + Add
            </button>
          </div>
          <div className="space-y-2">
            {prompt.placeholders.map((p, index) => (
              <div key={index} className="grid grid-cols-12 gap-2 items-center p-2 rounded-md bg-neutral-100 dark:bg-neutral-800/50">
                <div className="col-span-4">
                  <label className="text-xs text-neutral-500">Name</label>
                  <input
                    type="text"
                    value={p.name}
                    onChange={(e) => handlePlaceholderChange(index, 'name', e.target.value)}
                    className="w-full p-1.5 text-sm bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-md"
                    placeholder="e.g., text"
                  />
                </div>
                <div className="col-span-4">
                  <label className="text-xs text-neutral-500">Label</label>
                  <input
                    type="text"
                    value={p.label}
                    onChange={(e) => handlePlaceholderChange(index, 'label', e.target.value)}
                    className="w-full p-1.5 text-sm bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-md"
                    placeholder="e.g., Text to translate"
                  />
                </div>
                <div className="col-span-3">
                  <label className="text-xs text-neutral-500">Type</label>
                  <select
                    value={p.type}
                    onChange={(e) => handlePlaceholderChange(index, 'type', e.target.value)}
                    className="w-full p-1.5 text-sm bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-md"
                  >
                    <option value="text">Text</option>
                    <option value="select">Select</option>
                  </select>
                </div>
                <div className="col-span-1 pt-4 text-right">
                  <button onClick={() => removePlaceholder(index)} className="text-red-500 hover:text-red-700">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm4 0a1 1 0 012 0v6a1 1 0 11-2 0V8z" clipRule="evenodd" />
                    </svg>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
        
        <h3 className="text-lg font-semibold border-t pt-4 mt-4">AI Settings</h3>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">AI Provider</label>
            <select
              value={prompt.aiProvider}
              onChange={(e) => setPrompt({ ...prompt, aiProvider: e.target.value, model: '' })}
              className="w-full p-2 bg-neutral-100 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-md"
            >
              {aiproviders.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Model</label>
            <select
              value={prompt.model}
              onChange={(e) => setPrompt({ ...prompt, model: e.target.value })}
              className="w-full p-2 bg-neutral-100 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-md"
              disabled={!prompt.aiProvider}
            >
              {(prompt.aiProvider === 'openai' ? openAIModels : anthropicModels).map(m => <option key={m} value={m}>{m}</option>)}
            </select>
          </div>
        </div>

      </div>
      
      <div className="flex justify-end pt-4 mt-4 border-t border-neutral-200 dark:border-neutral-700 space-x-2">
        <button onClick={handleCancel} className="px-4 py-2 rounded-md bg-neutral-200 dark:bg-neutral-700 hover:bg-neutral-300 dark:hover:bg-neutral-600">
          Cancel
        </button>
        <button onClick={handleSave} className="px-4 py-2 rounded-md bg-blue-600 text-white hover:bg-blue-700">
          Save
        </button>
      </div>
    </div>
  )
} 