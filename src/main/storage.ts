import Store from 'electron-store'
import { ipcMain, IpcMain, NativeTheme, BrowserWindow } from 'electron'
import type { Settings, GeneralSettings, AISettings, Prompt } from '../lib/types'
import { updateShortcut } from './shortcuts'
import { merge } from 'lodash'

const store = new Store<Record<string, any>>({
  watch: true
})

const defaultSettings: Settings = {
  general: {
    theme: 'system',
    launchAtLogin: false,
    showInMenuBar: true,
    shortcut: 'Shift+Command+Space',
    language: 'en'
  },
  ai: {
    provider: 'openai',
    openai: {},
    anthropic: {}
  }
}

export function getSettings(): Settings {
  const persistedSettings = store.get('settings') as Settings
  // Use lodash merge for deep merge
  return merge({}, defaultSettings, persistedSettings)
}

export function setSetting(key: string, value: any): void {
  store.set(`settings.${key}`, value)
}

function getPrompts(): Prompt[] {
  return (store.get('prompts') as Prompt[]) || []
}

export function setupSettingsHandlers(
  ipc: IpcMain,
  nativeTheme: NativeTheme,
  mainWindow: BrowserWindow
) {
  ipc.handle('get-settings', () => {
    return getSettings()
  })

  ipc.handle('set-settings', async (_, newSettings: Settings) => {
    const currentSettings = getSettings()
    const updatedSettings = merge({}, currentSettings, newSettings)
    store.set('settings', updatedSettings)

    // Apply side effects from settings changes
    if (newSettings.general?.shortcut && newSettings.general.shortcut !== currentSettings.general.shortcut) {
      updateShortcut(newSettings.general.shortcut, mainWindow)
    }
    if (newSettings.general?.theme && newSettings.general.theme !== currentSettings.general.theme) {
      nativeTheme.themeSource = newSettings.general.theme
    }
    return updatedSettings
  })

  // When the window is ready, send the initial settings
  mainWindow.webContents.on('did-finish-load', () => {
    mainWindow.webContents.send('settings-initialized', getSettings())
  })

  // Prompts handlers
  ipc.handle('get-prompts', () => {
    return getPrompts()
  })

  ipc.handle('set-prompts', (_, prompts: Prompt[]) => {
    store.set('prompts', prompts)
    return true
  })

  // Send initial prompts when the window is ready
  mainWindow.webContents.on('did-finish-load', () => {
    mainWindow.webContents.send('prompts-initialized', getPrompts())
  })
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

export default store 