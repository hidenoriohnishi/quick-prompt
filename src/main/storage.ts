import Store from 'electron-store'
import { ipcMain } from 'electron'

const store = new Store()

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