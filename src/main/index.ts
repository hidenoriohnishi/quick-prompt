import { app, BrowserWindow, shell, ipcMain, dialog, Notification, nativeTheme, screen } from 'electron'
import { release } from 'node:os'
import { join } from 'node:path'
import { electronApp, optimizer, is } from '@electron-toolkit/utils'
import { createTray } from './tray'
import { setupShortcuts, setMainWindow } from './shortcuts'
import { setupStoreListeners, default as store } from './storage'
import './autoLaunch'
import { handleLlm } from './llm'

let mainWindow: BrowserWindow | null

function createWindow(): void {
  const { width, height } = screen.getPrimaryDisplay().workAreaSize
  const icon = is.dev
    ? join(__dirname, '../../assets/icon.png')
    : join(process.resourcesPath, 'icon.png')

  mainWindow = new BrowserWindow({
    width: width,
    height: height,
    show: false,
    frame: false,
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
    setMainWindow(mainWindow)
  })

  mainWindow.on('show', () => {
    mainWindow?.webContents.send('window-visibility-changed', true)
  })

  mainWindow.on('hide', () => {
    mainWindow?.webContents.send('window-visibility-changed', false)
  })

  mainWindow.webContents.setWindowOpenHandler((details) => {
    // and ignore CommandOrControl + R in production.
    // see https://github.com/alex8088/electron-toolkit/tree/master/packages/utils
    return { action: 'deny' }
  })

  if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
    mainWindow.loadURL(process.env['ELECTRON_RENDERER_URL'])
    mainWindow.webContents.openDevTools()
  } else {
    mainWindow.loadFile(join(__dirname, '../renderer/index.html'))
  }

  mainWindow.webContents.on('did-finish-load', () => {
    mainWindow?.webContents.send('remove-loading')
  })
}

app.whenReady().then(() => {
  electronApp.setAppUserModelId('com.electron')

  app.on('browser-window-created', (_, window) => {
    // optimizer.watch(window)
  })

  createWindow()
  
  if (!mainWindow) {
    throw new Error('"mainWindow" is not defined')
  }

  setupStoreListeners()
  handleLlm(ipcMain, store)
  createTray(mainWindow)
  setupShortcuts(mainWindow)

  app.on('activate', function () {
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

nativeTheme.on('updated', () => {
  mainWindow?.webContents.send('theme-updated', nativeTheme.themeSource)
}) 