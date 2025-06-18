import { useSettingsStore, type GeneralSettings } from '../../stores/settingsStore'
import React, { useEffect } from 'react'

type ToggleProps = {
  label: string
  description: string
  settingKey: keyof GeneralSettings
  isChecked: boolean
  onToggle: (key: keyof GeneralSettings, value: boolean) => void
}

function SettingToggle({ label, description, settingKey, isChecked, onToggle }: ToggleProps) {
  return (
    <div className="flex items-center justify-between py-3 border-b border-neutral-200 dark:border-neutral-700">
      <div>
        <p className="font-medium">{label}</p>
        <p className="text-sm text-neutral-500">{description}</p>
      </div>
      <label className="relative inline-flex items-center cursor-pointer">
        <input
          type="checkbox"
          checked={isChecked}
          onChange={(e) => onToggle(settingKey, e.target.checked)}
          className="sr-only peer"
        />
        <div className="w-11 h-6 bg-gray-200 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
      </label>
    </div>
  )
}

type SelectProps = {
  label: string
  description: string
  settingKey: keyof GeneralSettings
  value: string
  options: { value: string; label: string }[]
  onSelect: (key: keyof GeneralSettings, value: string) => void
}

function SettingSelect({ label, description, settingKey, value, options, onSelect }: SelectProps) {
  return (
    <div className="flex items-center justify-between py-3 border-b border-neutral-200 dark:border-neutral-700">
      <div>
        <p className="font-medium">{label}</p>
        <p className="text-sm text-neutral-500">{description}</p>
      </div>
      <select
        value={value}
        onChange={(e) => onSelect(settingKey, e.target.value)}
        className="p-2 bg-neutral-100 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  )
}

const shortcutOptions = [
  { value: 'Command+Space', label: 'Cmd + Space' },
  { value: 'Shift+Command+Space', label: 'Shift + Cmd + Space' },
  { value: 'Alt+Space', label: 'Option + Space' },
  { value: 'Shift+Alt+Space', label: 'Shift + Option + Space' },
  { value: 'Control+Space', label: 'Control + Space' },
  { value: 'Shift+Control+Space', label: 'Shift + Control + Space' },
]

export function GeneralSettings() {
  const generalSettings = useSettingsStore((state) => state.settings.general)
  const setGeneralSettings = useSettingsStore((state) => state.setGeneralSettings)

  const handleToggle = (key: keyof GeneralSettings, value: boolean) => {
    setGeneralSettings({ [key]: value })
    if (key === 'launchAtLogin') {
      window.electron.setLaunchAtLogin(value)
    }
  }

  const handleSelect = (key: keyof GeneralSettings, value: any) => {
    setGeneralSettings({ [key]: value })
    if (key === 'shortcut') {
      window.electron.updateShortcut(value)
    }
  }

  return (
    <div className="flex flex-col h-full">
      <div className="mb-4">
        <h2 className="text-xl font-semibold">General</h2>
      </div>
      <div className="flex-grow overflow-y-auto pr-2">
        <SettingToggle
          label="Launch at Login"
          description="Start QuickPrompt automatically when you log in."
          settingKey="launchAtLogin"
          isChecked={generalSettings.launchAtLogin}
          onToggle={handleToggle}
        />
        <SettingToggle
          label="Show in Dock"
          description="Show the application icon in the macOS Dock."
          settingKey="showInDock"
          isChecked={generalSettings.showInDock}
          onToggle={handleToggle}
        />
        <SettingSelect
          label="Theme"
          description="Choose the appearance of the application."
          settingKey="theme"
          value={generalSettings.theme}
          options={[
            { value: 'light', label: 'Light' },
            { value: 'dark', label: 'Dark' },
            { value: 'system', label: 'System' },
          ]}
          onSelect={handleSelect}
        />
        <SettingSelect
          label="Shortcut"
          description="Set the global shortcut to open the application."
          settingKey="shortcut"
          value={generalSettings.shortcut}
          options={shortcutOptions}
          onSelect={handleSelect}
        />
      </div>
    </div>
  )
} 