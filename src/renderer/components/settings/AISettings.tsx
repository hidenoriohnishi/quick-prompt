import React, { useState } from 'react'
import { useSettingsStore, type AISettings } from '../../stores/settingsStore'

type ApiKeyInputProps = {
  label: string
  apiKey: string
  onApiKeyChange: (key: string) => void
}

function ApiKeyInput({ label, apiKey, onApiKeyChange }: ApiKeyInputProps) {
  const [showKey, setShowKey] = useState(false)
  return (
    <div className="py-3 border-b border-neutral-200 dark:border-neutral-700">
        <label className="block text-sm font-medium mb-1">{label}</label>
        <div className="relative">
            <input
                type={showKey ? 'text' : 'password'}
                value={apiKey}
                onChange={(e) => onApiKeyChange(e.target.value)}
                className="w-full p-2 pr-20 bg-neutral-100 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-md"
                placeholder={`Enter your ${label}`}
            />
            <button
                onClick={() => setShowKey(!showKey)}
                className="absolute inset-y-0 right-0 px-3 flex items-center text-sm text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white"
            >
                {showKey ? 'Hide' : 'Show'}
            </button>
        </div>
    </div>
  )
}


export function AISettings() {
  const aiSettings = useSettingsStore(state => state.settings.ai)
  const setAiSettings = useSettingsStore(state => state.setAiSettings)

  const handleApiKeyChange = (provider: keyof AISettings, key: string) => {
    setAiSettings({
        [provider]: { apiKey: key }
    })
  }

  return (
    <div className="flex flex-col h-full">
      <div className="mb-4">
        <h2 className="text-xl font-semibold">AI Settings</h2>
        <p className="text-sm text-neutral-500">
          Your API keys are stored securely on your local machine and are never shared.
        </p>
      </div>
      <div className="flex-grow overflow-y-auto pr-2">
        <ApiKeyInput
            label="OpenAI API Key"
            apiKey={aiSettings.openai.apiKey}
            onApiKeyChange={(key) => handleApiKeyChange('openai', key)}
        />
        <ApiKeyInput
            label="Anthropic API Key"
            apiKey={aiSettings.anthropic.apiKey}
            onApiKeyChange={(key) => handleApiKeyChange('anthropic', key)}
        />
      </div>
    </div>
  )
} 