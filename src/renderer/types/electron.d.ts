import type { ElectronAPI } from '../../src/preload'
import type { Settings, Prompt } from '../../lib/types'

declare global {
  interface Window {
    electron: ElectronAPI & {
      onSettingsInitialized: (callback: (settings: Settings) => void) => () => void
      onPromptsInitialized: (callback: (prompts: Prompt[]) => void) => () => void
      setPrompts: (prompts: Prompt[]) => Promise<void>
    }
  }
}

export {} 