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

export type SelectOption = {
  id: string
  label: string
  value: string
}

export type Placeholder = {
  id: string
  name: string
  label: string
  type: 'text' | 'select' | 'textarea'
  options?: SelectOption[]
  defaultValue?: string
}

export type Prompt = {
  id: string
  name: string
  description: string
  template: string
  placeholders: Placeholder[]
  aiProvider: string // 'openai' | 'anthropic' etc.
  model: string
  createdAt: string
  updatedAt: string
} 