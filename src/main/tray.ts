import { app, Menu, Tray, BrowserWindow, nativeImage } from 'electron'
import path from 'path'
import { is } from '@electron-toolkit/utils'

let tray: Tray | null = null

export function createTray(win: BrowserWindow) {
  let iconPath: string
  if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
    iconPath = path.join(__dirname, '../../assets/icon.png')
  } else {
    iconPath = path.join(process.resourcesPath, 'icon.png')
  }

  const icon = nativeImage.createFromPath(iconPath)
  // macOSのダーク/ライトモードに対応させます
  icon.setTemplateImage(true)

  tray = new Tray(icon)

  const contextMenu = Menu.buildFromTemplate([
    {
      label: 'Show App',
      click: () => {
        win.show()
      }
    },
    {
      label: 'Settings',
      click: () => {
        win.show()
        win.webContents.send('navigate', 'settings')
      }
    },
    { type: 'separator' },
    {
      label: 'Quit',
      role: 'quit'
    }
  ])

  tray.setToolTip('QuickPrompt')
  tray.setContextMenu(contextMenu)
} 