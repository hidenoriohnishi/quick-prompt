import { useEffect, useState } from 'react'
import { useSettingsStore } from '@/stores/settingsStore'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

export function Settings() {
  const [apiKey, setApiKey] = useState('')
  const storeApiKey = useSettingsStore((state) => state.settings.ai.openai.apiKey)
  const setAiSettings = useSettingsStore((state) => state.setAiSettings)

  useEffect(() => {
    if (storeApiKey) {
      setApiKey(storeApiKey)
    }
  }, [storeApiKey])

  const handleSave = () => {
    setAiSettings({ openai: { apiKey } })
    // TODO: Add a visual confirmation that settings have been saved
  }

  return (
    <div className="p-4 space-y-4">
      <h2 className="text-lg font-bold">Settings</h2>
      <div className="space-y-2">
        <Label htmlFor="api-key">OpenAI API Key</Label>
        <Input
          id="api-key"
          type="password"
          value={apiKey}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setApiKey(e.target.value)}
          placeholder="Enter your OpenAI API key"
        />
      </div>
      <Button onClick={handleSave}>Save</Button>
    </div>
  )
} 