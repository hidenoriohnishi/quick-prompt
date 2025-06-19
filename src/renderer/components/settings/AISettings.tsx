import { useState } from 'react'
import { useSettingsStore } from '../../stores/settingsStore'
import type { AISettings } from '../../../lib/types'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

type EditableApiKeyInputProps = {
  label: string
  provider: 'openai' | 'anthropic'
  savedApiKey: string | undefined
}

function EditableApiKeyInput({ label, provider, savedApiKey }: EditableApiKeyInputProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [inputValue, setInputValue] = useState(savedApiKey || '')
  const setAiSettings = useSettingsStore((state) => state.setAiSettings)

  const handleSave = () => {
    setAiSettings({ [provider]: { apiKey: inputValue } })
    setIsEditing(false)
  }

  const handleCancel = () => {
    setInputValue(savedApiKey || '')
    setIsEditing(false)
  }

  const handleEdit = () => {
    setInputValue(savedApiKey || '')
    setIsEditing(true)
  }

  return (
    <div className="py-3 border-b border-neutral-200 dark:border-neutral-700">
      <label className="block text-sm font-medium mb-1">{label}</label>
      {isEditing ? (
        <div className="flex items-center space-x-2">
          <Input
            type="password"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            className="w-full"
            placeholder={`Enter your ${label}`}
          />
          <Button onClick={handleSave} className="bg-neutral-200 dark:bg-neutral-700 hover:bg-neutral-300 dark:hover:bg-neutral-600 text-black dark:text-white">
            Save
          </Button>
          <Button onClick={handleCancel} className="bg-transparent hover:bg-neutral-200 dark:hover:bg-neutral-700">
            Cancel
          </Button>
        </div>
      ) : (
        <div className="flex items-center space-x-2">
          <p className="flex-grow text-neutral-600 dark:text-neutral-400 font-mono">
            {savedApiKey ? '****************' : 'API key is not set'}
          </p>
          <Button onClick={handleEdit} className="bg-neutral-200 dark:bg-neutral-700 hover:bg-neutral-300 dark:hover:bg-neutral-600 text-black dark:text-white">
            Edit
          </Button>
        </div>
      )}
    </div>
  )
}

export function AISettings() {
  const aiSettings = useSettingsStore((state) => state.settings.ai)

  return (
    <div className="flex flex-col h-full">
      <div className="mb-4">
        <h2 className="text-xl font-semibold">AI Settings</h2>
        <p className="text-sm text-neutral-500">
          Your API keys are stored securely on your local machine and are never shared.
        </p>
      </div>
      <div className="flex-grow overflow-y-auto pr-2">
        <EditableApiKeyInput
          label="OpenAI API Key"
          provider="openai"
          savedApiKey={aiSettings?.openai?.apiKey}
        />
        <EditableApiKeyInput
          label="Anthropic API Key"
          provider="anthropic"
          savedApiKey={aiSettings?.anthropic?.apiKey}
        />
      </div>
    </div>
  )
} 