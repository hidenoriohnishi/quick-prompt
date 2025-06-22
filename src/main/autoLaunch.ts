import { app } from 'electron'

export function setLaunchAtLogin(enabled: boolean): void {
  const settings = app.getLoginItemSettings()

  if (settings.openAtLogin === enabled) {
    return
  }

  app.setLoginItemSettings({ openAtLogin: enabled })
}

export function isAutoLaunchEnabled(): boolean {
  return app.getLoginItemSettings().openAtLogin
} 