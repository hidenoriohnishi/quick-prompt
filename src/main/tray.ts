import { app, Menu, Tray, BrowserWindow, nativeImage } from 'electron'
import { join } from 'node:path'
import * as fs from 'fs'

let tray: Tray | null = null
let mainWindow: BrowserWindow | null = null

export function createTray(win: BrowserWindow) {
  mainWindow = win
  
  const iconPath = process.platform === 'win32'
    ? join(__dirname, 'icon.ico')
    : join(__dirname, 'icon.svg')
  
  console.log(`[Tray] Loading icon from: ${iconPath}`)
  if (!fs.existsSync(iconPath)) {
    console.error('[Tray] Icon file not found at path:', iconPath)
    return;
  }

  const icon = nativeImage.createFromPath(iconPath)
  
  if (process.platform === 'darwin') {
    icon.setTemplateImage(true)
  }

  tray = new Tray(icon)
  tray.setToolTip('QuickPrompt')

  const contextMenu = Menu.buildFromTemplate([
    {
      label: 'Show App',
      click: () => {
        mainWindow?.show()
      },
    },
    {
      label: 'Settings',
      click: () => {
        mainWindow?.show()
        mainWindow?.webContents.send('navigate', 'settings')
      },
    },
    { type: 'separator' },
    {
      label: 'Quit',
      click: () => {
        app.quit()
      },
    },
  ])

  tray.setContextMenu(contextMenu)
} 