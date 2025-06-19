import Store from 'electron-store'
import { ipcMain, IpcMain, NativeTheme, BrowserWindow } from 'electron'
import type { Settings, GeneralSettings, AISettings } from '../lib/types'
import { updateShortcut } from './shortcuts'

const store = new Store()

const defaultSettings: Settings = {
  general: {
    theme: 'system',
    launchAtLogin: false,
    showInDock: true,
    shortcut: 'Shift+Command+Space',
    language: 'en'
  },
  ai: {
    provider: 'openai',
    openai: {},
    anthropic: {}
  }
}

export const getSettings = (): Settings => {
  const persistedData = store.get('settings') as any

  if (!persistedData) {
    return defaultSettings
  }

  // Check for Zustand's persisted format `{ state: { settings: ... } }`
  if (persistedData.state && persistedData.state.settings) {
    // To be safe, merge with defaults in case of partial data
    return {
      ...defaultSettings,
      ...persistedData.state.settings,
      general: {
        ...defaultSettings.general,
        ...(persistedData.state.settings.general || {})
      },
      ai: {
        ...defaultSettings.ai,
        ...(persistedData.state.settings.ai || {})
      }
    }
  }

  // Check for old format (just the settings object)
  if (persistedData.general || persistedData.ai) {
    return {
      ...defaultSettings,
      ...persistedData,
      general: {
        ...defaultSettings.general,
        ...(persistedData.general || {})
      },
      ai: {
        ...defaultSettings.ai,
        ...(persistedData.ai || {})
      }
    }
  }

  return defaultSettings
}

export const saveSettings = (newSettings: Settings) => {
  const currentState = store.get('settings') as any
  const version = (currentState && currentState.version) || 0
  const newPersistedState = {
    state: {
      settings: newSettings
    },
    version: version
  }
  store.set('settings', newPersistedState)
}

export function setupStoreListeners() {
  ipcMain.handle('getStore', (_, key: string) => {
    return store.get(key)
  })
  ipcMain.handle('setStore', (_, key: string, value: any) => {
    store.set(key, value)
  })
  ipcMain.handle('clearStore', () => {
    store.clear()
  })
}

export function setupSettingsHandlers(
  ipc: IpcMain,
  nativeTheme: NativeTheme,
  mainWindow: BrowserWindow | null
) {
  ipc.handle('get-settings', () => {
    return getSettings()
  })

  ipc.handle(
    'set-settings',
    (_, newSettings: { general?: Partial<GeneralSettings>; ai?: Partial<AISettings> }) => {
      const currentSettings = getSettings()
      const mergedSettings: Settings = {
        ...currentSettings,
        general: { ...currentSettings.general, ...newSettings.general },
        ai: { ...currentSettings.ai, ...newSettings.ai }
      }
      saveSettings(mergedSettings)
    }
  )

  ipc.handle('update-shortcut', async (_, shortcut: string) => {
    if (mainWindow) {
      updateShortcut(shortcut, mainWindow)
    }
    const currentSettings = getSettings()
    currentSettings.general.shortcut = shortcut
    saveSettings(currentSettings)
  })

  ipc.handle('set-theme', (_, theme: 'light' | 'dark' | 'system') => {
    nativeTheme.themeSource = theme
    const currentSettings = getSettings()
    currentSettings.general.theme = theme
    saveSettings(currentSettings)
  })
}

export default store 