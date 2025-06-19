import { app, BrowserWindow, ipcMain, dialog, Notification, nativeTheme } from 'electron'
import { join } from 'node:path'
import { electronApp, is } from '@electron-toolkit/utils'
import { createTray } from './tray'
import { setMainWindow, registerShortcut, unregisterAllShortcuts } from './shortcuts'
import {
  setupStoreListeners,
  setupSettingsHandlers,
  default as store
} from './storage'
import { handleLlm } from './llm'
import type { Settings, GeneralSettings, AISettings } from '../lib/types'

let mainWindow: BrowserWindow | null

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
    setupSettingsHandlers(ipcMain, nativeTheme, mainWindow)
  }

  setupStoreListeners()
  handleLlm(ipcMain, store)

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
