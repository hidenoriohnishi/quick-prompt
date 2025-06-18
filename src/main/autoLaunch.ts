import AutoLaunch from 'electron-auto-launch'

const autoLauncher = new AutoLaunch({
  name: 'QuickPrompt',
})

export function enableAutoLaunch() {
  return autoLauncher.enable()
}

export function disableAutoLaunch() {
  return autoLauncher.disable()
}

export function isAutoLaunchEnabled() {
  return autoLauncher.isEnabled()
} 