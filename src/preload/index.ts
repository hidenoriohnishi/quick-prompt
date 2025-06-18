import { contextBridge, ipcRenderer, IpcRendererEvent } from 'electron'
import type { MessageBoxOptions, NotificationConstructorOptions } from 'electron'
// import type { LlmResponse } from '../main/llm' // This line causes issues, commenting out for now.
import type { Prompt } from '../renderer/stores/promptStore'
import type { Message } from '../renderer/stores/llmStore'

// Copied from src/main/llm.ts to avoid import issues in preload script.
export type LlmResponse = {
  type: 'chunk' | 'error' | 'end' | 'usage'
  data: string
  requestId?: string
}

export const api = {
  // ... (rest of the api methods)
  getStore: (key: string) => ipcRenderer.invoke('getStore', key),
  setStore: (key: string, value: any) => ipcRenderer.invoke('setStore', key, value),
  getSettings: () => ipcRenderer.invoke('get-settings'),
  setSettings: (settings: any) => ipcRenderer.invoke('set-settings', settings),
  updateShortcut: (shortcut: string) => ipcRenderer.invoke('update-shortcut', shortcut),
  setTheme: (theme: 'system' | 'light' | 'dark') => ipcRenderer.invoke('set-theme', theme),
  onStoreChange: (key: string, callback: (value: any) => void) => {
    const handler = (_event: IpcRendererEvent, value: any) => callback(value)
    ipcRenderer.on(`store-changed-${key}`, handler)
    return () => {
      ipcRenderer.removeListener(`store-changed-${key}`, handler)
    }
  },
  hideWindow: () => ipcRenderer.send('hide-window'),
  onWindowVisibilityChange: (callback: (isVisible: boolean) => void) => {
    const handler = (_event: IpcRendererEvent, isVisible: boolean) => callback(isVisible)
    ipcRenderer.on('window-visibility-changed', handler)
    return () => {
      ipcRenderer.removeListener('window-visibility-changed', handler)
    }
  },
  onNavigate: (callback: (view: 'settings') => void) => {
    const handler = (_event: IpcRendererEvent, view: 'settings') => callback(view)
    ipcRenderer.on('navigate', handler)
    return () => {
      ipcRenderer.removeListener('navigate', handler)
    }
  },
  openSettings: () => ipcRenderer.send('open-settings'),
  getTheme: () => ipcRenderer.invoke('get-theme'),
  onThemeUpdate: (callback: (theme: 'system' | 'light' | 'dark') => void) => {
    const handler = (_event: IpcRendererEvent, theme: 'system' | 'light' | 'dark') => callback(theme)
    ipcRenderer.on('theme-updated', handler)
    return () => ipcRenderer.removeListener('theme-updated', handler)
  },

  sendLlmRequest: (payload: { messages: Message[], aiProvider: Prompt['aiProvider'], model: Prompt['model']}) => {
    ipcRenderer.send('llm-request', payload)
  },
  cancelLlmRequest: (requestId: string) => ipcRenderer.send('llm-cancel', requestId),
  onLlmResponse: (callback: (response: LlmResponse & { requestId?: string }) => void) => {
    const handler = (_: IpcRendererEvent, response: LlmResponse & { requestId?: string }) => callback(response)
    ipcRenderer.on('llm-response', handler)
    return () => ipcRenderer.removeListener('llm-response', handler)
  },
  showConfirmationDialog: (options: MessageBoxOptions) => ipcRenderer.invoke('show-confirmation-dialog', options),
  showNotification: (options: NotificationConstructorOptions) => ipcRenderer.send('show-notification', options),
}

contextBridge.exposeInMainWorld('electron', api)

export type ElectronAPI = typeof api

// --------- Expose some API to the Renderer process ---------
contextBridge.exposeInMainWorld('ipcRenderer', {
  on: (channel: string, callback: (...args: any[]) => void) => {
    ipcRenderer.on(channel, (event, ...args) => callback(...args))
  },
  send: (channel: string, ...args: any[]) => {
    ipcRenderer.send(channel, ...args)
  },
})

// --------- Preload scripts running before renderer process ---------

function domReady(condition: DocumentReadyState[] = ['complete', 'interactive']) {
  return new Promise(resolve => {
    if (condition.includes(document.readyState)) {
      resolve(true)
    } else {
      document.addEventListener('readystatechange', () => {
        if (condition.includes(document.readyState)) {
          resolve(true)
        }
      })
    }
  })
}

const safeDOM = {
  append(parent: HTMLElement, child: HTMLElement) {
    if (!Array.from(parent.children).find(e => e === child)) {
      return parent.appendChild(child)
    }
  },
  remove(parent: HTMLElement, child: HTMLElement) {
    if (Array.from(parent.children).find(e => e === child)) {
      return parent.removeChild(child)
    }
  },
}

/**
 * https://tobiasahlin.com/spinkit
 * https://connoratherton.com/loaders
 * https://projects.lukehaas.me/css-loaders
 * https://matejkustec.github.io/SpinThatShit
 */
function useLoading() {
  const className = `loaders-css__square-spin`
  const styleContent = `
@keyframes square-spin {
  25% { transform: perspective(100px) rotateX(180deg) rotateY(0); }
  50% { transform: perspective(100px) rotateX(180deg) rotateY(180deg); }
  75% { transform: perspective(100px) rotateX(0) rotateY(180deg); }
  100% { transform: perspective(100px) rotateX(0) rotateY(0); }
}
.${className} > div {
  animation-fill-mode: forwards;
  width: 50px;
  height: 50px;
  background: #18181b;
  animation: square-spin 3s 0s cubic-bezier(0.09, 0.57, 0.49, 0.9) infinite;
  box-shadow: 3px 3px 3px 0px rgba(0,0,0,0.2);
}
.app-loading-wrap {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  background: #f2f2f2;
  z-index: 9999;
}
    `
  const oStyle = document.createElement('style')
  const oDiv = document.createElement('div')

  oStyle.id = 'app-loading-style'
  oStyle.innerHTML = styleContent
  oDiv.className = 'app-loading-wrap'
  oDiv.innerHTML = `<div class="${className}"><div></div></div>`

  return {
    appendLoading() {
      safeDOM.append(document.head, oStyle)
      safeDOM.append(document.body, oDiv)
    },
    removeLoading() {
      safeDOM.remove(document.head, oStyle)
      safeDOM.remove(document.body, oDiv)
    },
  }
}

const { appendLoading, removeLoading } = useLoading()
domReady().then(appendLoading)

ipcRenderer.on('remove-loading', removeLoading) 