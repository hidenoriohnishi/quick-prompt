import { useAppStore, type SettingsView } from '../../stores/appStore'
import { GeneralSettings } from './GeneralSettings'
import { PromptList } from './PromptList'
import { PromptDetail } from './PromptDetail'
import { AISettings } from './AISettings'
import { clsx } from 'clsx'
import React from 'react'

type NavItemProps = {
  view: SettingsView
  currentView: SettingsView
  setView: (view: SettingsView) => void
  children: React.ReactNode
}

function NavItem({ view, currentView, setView, children }: NavItemProps) {
  const isActive = view === currentView
  return (
    <button
      onClick={() => setView(view)}
      className={clsx(
        'w-full text-left px-3 py-2 rounded-md text-sm font-medium',
        isActive
          ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-white'
          : 'text-neutral-600 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800'
      )}
    >
      {children}
    </button>
  )
}

export function SettingsLayout() {
  const { settingsView, setSettingsView, setCurrentView } = useAppStore()

  const renderContent = () => {
    switch (settingsView) {
      case 'general':
        return <GeneralSettings />
      case 'prompts':
        return <PromptList />
      case 'prompt-detail':
        return <PromptDetail />
      case 'ai':
        return <AISettings />
      default:
        return <GeneralSettings />
    }
  }

  return (
    <div className="flex h-full">
      <div className="w-56 flex-shrink-0 border-r border-neutral-200 dark:border-neutral-800 pr-4">
        <div className="flex flex-col space-y-1">
          <p className="px-3 py-2 text-xs font-semibold text-neutral-500 uppercase tracking-wider">Settings</p>
          <NavItem view="general" currentView={settingsView} setView={setSettingsView}>General</NavItem>
          <NavItem view="prompts" currentView={settingsView} setView={setSettingsView}>Prompts</NavItem>
          <NavItem view="ai" currentView={settingsView} setView={setSettingsView}>AI</NavItem>
        </div>
        <div className="absolute bottom-4 left-4">
           <button onClick={() => setCurrentView('selector')} className="px-4 py-2 text-sm rounded-md bg-neutral-200 dark:bg-neutral-700 hover:bg-neutral-300 dark:hover:bg-neutral-600">
            Close Settings
          </button>
        </div>
      </div>
      <div className="flex-grow pl-4">
        {renderContent()}
      </div>
    </div>
  )
} 