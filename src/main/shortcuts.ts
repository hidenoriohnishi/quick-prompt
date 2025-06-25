import { app, globalShortcut, BrowserWindow } from 'electron'
import store from './storage'

let mainWindow: BrowserWindow | null = null
let currentShortcut: string

export function setMainWindow(win: BrowserWindow) {
  mainWindow = win
}

function getShortcutFromStore(): string {
  // The default is now Shift+Command+Space as per user request.
  // Electron uses 'Command' for macOS's Cmd key.
  return (store.get('shortcut') as string) || 'Shift+Command+Space'
}

export function registerShortcut(win: BrowserWindow) {
  currentShortcut = getShortcutFromStore()

  // It's a good practice to ensure the shortcut is valid before registering.
  // For now, we trust the input.
  globalShortcut.register(currentShortcut, () => {
    if (win.isVisible()) {
      win.hide()
    } else {
      win.show()
      win.focus()
    }
  })
}

export function unregisterShortcut() {
  if (currentShortcut) {
    globalShortcut.unregister(currentShortcut)
  }
}

export function updateShortcut(shortcut: string, win: BrowserWindow) {
  // Unregister the previously registered shortcut.
  unregisterShortcut()

  // Now, update the global variable and the store.
  currentShortcut = shortcut
  store.set('shortcut', shortcut)

  // And register the new shortcut directly.
  const ret = globalShortcut.register(shortcut, () => {
    if (win.isVisible()) {
      win.hide()
    } else {
      win.show()
      win.focus()
    }
  })
  
  if (!ret) {
    console.error('Failed to register shortcut:', shortcut)
  }
}

export function unregisterAllShortcuts() {
  globalShortcut.unregisterAll()
}

app.on('will-quit', unregisterAllShortcuts) 