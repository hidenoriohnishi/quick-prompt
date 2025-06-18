import { app, BrowserWindow, ipcMain, dialog, Notification, nativeTheme } from 'electron'
import { join } from 'node:path'
import { electronApp, is } from '@electron-toolkit/utils'
import { createTray } from './tray'
import { setMainWindow, registerShortcut, updateShortcut, unregisterAllShortcuts } from './shortcuts'
import { setupStoreListeners, default as store } from './storage'
import { handleLlm } from './llm'

// Type definitions copied from renderer process to avoid import issues
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

// End of type definitions

let mainWindow: BrowserWindow | null

const getSettings = (): Settings => {
  const persistedData = store.get('settings') as any

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

const saveSettings = (newSettings: Settings) => {
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


function createWindow(): void {
  const icon = is.dev
    ? join(__dirname, '../../assets/icon.png')
    : join(process.resourcesPath, 'icon.png')

  mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    show: false,
    frame: false,
    resizable: false,
    ...(process.platform !== 'darwin' && { icon }),
    vibrancy: 'under-window',
    visualEffectState: 'active',
    trafficLightPosition: { x: 12, y: 22 },
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      sandbox: false
    }
  })

  ipcMain.on('hide-window', () => {
    mainWindow?.hide()
  })

  ipcMain.handle('show-confirmation-dialog', async (_, options) => {
    if (!mainWindow) return
    const result = await dialog.showMessageBox(mainWindow, options)
    return result
  })

  ipcMain.on('show-notification', (_, options) => {
    new Notification(options).show()
  })

  mainWindow.on('ready-to-show', () => {
    if (!mainWindow) {
      throw new Error('"mainWindow" is not defined')
    }
    mainWindow.show()
  })

  mainWindow.on('show', () => {
    mainWindow?.webContents.send('window-visibility-changed', true)
  })

  mainWindow.on('hide', () => {
    mainWindow?.webContents.send('window-visibility-changed', false)
  })

  mainWindow.webContents.setWindowOpenHandler(() => {
    return { action: 'deny' }
  })

  if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
    mainWindow.loadURL(process.env['ELECTRON_RENDERER_URL'])
  } else {
    mainWindow.loadFile(join(__dirname, '../renderer/index.html'))
  }

  mainWindow.webContents.on('did-finish-load', () => {
    mainWindow?.webContents.send('remove-loading')
  })
}

app.whenReady().then(() => {
  electronApp.setAppUserModelId('com.electron')

  app.on('browser-window-created', () => {
    // optimizer.watch(window) // This seems to be deprecated or causing issues.
  })

  createWindow()

  if (mainWindow) {
    setMainWindow(mainWindow)
    createTray(mainWindow)
    registerShortcut(mainWindow)
  }

  setupStoreListeners()
  handleLlm(ipcMain, store)

  ipcMain.handle('get-settings', () => {
    return getSettings()
  })

  ipcMain.handle(
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

  ipcMain.handle('update-shortcut', async (_, shortcut: string) => {
    if (mainWindow) {
      updateShortcut(shortcut, mainWindow)
    }
    const currentSettings = getSettings()
    currentSettings.general.shortcut = shortcut
    saveSettings(currentSettings)
  })

  ipcMain.handle('set-theme', (_, theme: 'light' | 'dark' | 'system') => {
    nativeTheme.themeSource = theme
    const currentSettings = getSettings()
    currentSettings.general.theme = theme
    saveSettings(currentSettings)
  })

  nativeTheme.on('updated', () => {
    mainWindow?.webContents.send('theme-updated', nativeTheme.themeSource)
  })

  app.on('activate', function () {
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('will-quit', () => {
  unregisterAllShortcuts()
})
