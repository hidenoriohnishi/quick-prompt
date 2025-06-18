import type { ElectronAPI } from '../../src/preload'

declare global {
  interface Window {
    electron: ElectronAPI
  }
}

export {} 