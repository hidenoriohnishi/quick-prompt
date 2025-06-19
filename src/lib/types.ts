export type GeneralSettings = {
  theme: 'system' | 'light' | 'dark'
  launchAtLogin: boolean
  showInDock: boolean
  shortcut: string
  language: string
}

export type AIProvider = {
  apiKey?: string
  model?: string
}

export type AISettings = {
  provider: 'openai' | 'anthropic'
  openai: AIProvider
  anthropic: AIProvider
}

export type Settings = {
  general: GeneralSettings
  ai: AISettings
} 