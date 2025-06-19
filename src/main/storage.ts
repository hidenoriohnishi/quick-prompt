import Store from 'electron-store'
import { ipcMain, IpcMain, NativeTheme, BrowserWindow } from 'electron'
import type { Settings, GeneralSettings, AISettings } from '../lib/types'
import { updateShortcut } from './shortcuts'

const store = new Store<Record<string, any>>({
  watch: true
})

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

function initialGetSettings(): Settings {
  const persistedData = store.get('settings') as any
  if (!persistedData) {
    return defaultSettings
  }
  if (persistedData.state && persistedData.state.settings) {
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

let cachedSettings: Settings = initialGetSettings()

export const getSettings = (): Settings => {
  return cachedSettings
}

export const saveSettings = (newSettings: Settings) => {
  cachedSettings = newSettings
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

store.onDidAnyChange((newValue) => {
  if (newValue && newValue.settings) {
    cachedSettings = newValue.settings
  }
})

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