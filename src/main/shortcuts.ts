import { app, globalShortcut, BrowserWindow } from 'electron'

let mainWindow: BrowserWindow | null = null

export function setMainWindow(win: BrowserWindow) {
  mainWindow = win
}

export function setupShortcuts(mainWindow: BrowserWindow) {
  globalShortcut.register('CommandOrControl+Shift+Space', () => {
    if (mainWindow) {
      if (mainWindow.isVisible()) {
        mainWindow.hide()
      } else {
        mainWindow.show()
      }
    }
  })
}

export function unregisterShortcuts() {
  globalShortcut.unregisterAll()
}

app.on('will-quit', unregisterShortcuts) 