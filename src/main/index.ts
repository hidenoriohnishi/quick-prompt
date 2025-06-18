import { app, BrowserWindow, shell, ipcMain, dialog, Notification, nativeTheme } from 'electron'
import { release } from 'node:os'
import { join } from 'node:path'
import { electronApp, optimizer, is } from '@electron-toolkit/utils'
import { createTray } from './tray'
import { setupShortcuts } from './shortcuts'
import { setupStore } from './storage'
import './autoLaunch'
import { handleLlm } from './llm'

let mainWindow: BrowserWindow | null = null

const iconPath = process.platform === 'win32' 
  ? join(__dirname, 'icon.ico') 
  : join(__dirname, 'icon.svg');

function createWindow(): void {
  // Create the browser window.
  mainWindow = new BrowserWindow({
    width: 700,
    height: 500,
    show: false,
    frame: false,
    icon: iconPath,
    vibrancy: 'under-window',
    visualEffectState: 'active',
    trafficLightPosition: { x: 12, y: 22 },
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      sandbox: false,
    },
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
    mainWindow?.show()
  })

  mainWindow.on('show', () => {
    mainWindow?.webContents.send('window-visibility-changed', true)
  })

  mainWindow.on('hide', () => {
    mainWindow?.webContents.send('window-visibility-changed', false)
  })

  // HMR for renderer base on electron-vite cli.
  // Load the remote URL for development or the local html file for production.
  if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
    mainWindow.loadURL(process.env['ELECTRON_RENDERER_URL'])
    mainWindow.webContents.openDevTools()
  } else {
    mainWindow.loadFile(join(__dirname, '../renderer/index.html'))
  }

  mainWindow.webContents.on('did-finish-load', () => {
    mainWindow?.webContents.send('remove-loading')
  })

  setupStore(ipcMain)
  setupShortcuts(mainWindow)
  handleLlm(ipcMain)
}

app.whenReady().then(() => {
  electronApp.setAppUserModelId('com.example.quickprompt')
  
  app.on('browser-window-created', (_, window) => {
    optimizer.watchWindowShortcuts(window)
  })

  createWindow()
  if (mainWindow) {
    createTray(mainWindow)
  }

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