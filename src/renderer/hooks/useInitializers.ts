import { useEffect } from 'react'
import { useSettingsStore } from '../stores/settingsStore'
import { usePromptStore } from '../stores/promptStore'
import type { Settings, Prompt } from '../../lib/types'

export function useInitializers() {
  const { settings, setSettings, isInitialized: isSettingsInitialized, setInitialized: setSettingsInitialized } = useSettingsStore()
  const { prompts, setPrompts, isInitialized: isPromptsInitialized, setInitialized: setPromptsInitialized } = usePromptStore()

  useEffect(() => {
    const removeListener = window.electron.onSettingsInitialized((initialSettings: Settings) => {
      setSettings(initialSettings)
      setSettingsInitialized(true)
    })
    return () => removeListener()
  }, [setSettings, setSettingsInitialized])

  useEffect(() => {
    if (isSettingsInitialized) {
      window.electron.setSettings(settings)
    }
  }, [settings, isSettingsInitialized])

  useEffect(() => {
    const removeListener = window.electron.onPromptsInitialized((initialPrompts: Prompt[]) => {
      setPrompts(initialPrompts)
      setPromptsInitialized(true)
    })
    return () => removeListener()
  }, [setPrompts, setPromptsInitialized])

  useEffect(() => {
    if (isPromptsInitialized) {
      window.electron.setPrompts(prompts)
    }
  }, [prompts, isPromptsInitialized])
} 