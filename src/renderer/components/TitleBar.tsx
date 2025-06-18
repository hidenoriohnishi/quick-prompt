import { useAppStore } from '../stores/appStore'

export function TitleBar() {
  const { setCurrentView } = useAppStore()

  const handleSettingsClick = () => {
    setCurrentView('settings')
  }

  const handleMinimizeClick = () => {
    // TODO: ipcRenderer.send('minimize-window')
    console.log('Minimize clicked')
  }

  const handleCloseClick = () => {
    window.electron.hideWindow()
  }

  return (
    <div className="flex h-8 items-center" style={{ WebkitAppRegion: 'drag' } as React.CSSProperties}>
      <span className="font-semibold pl-2">QuickPrompt</span>
      <div className="flex-grow" />
      <div style={{ WebkitAppRegion: 'no-drag' } as React.CSSProperties}>
        <button onClick={handleSettingsClick} className="p-1 hover:bg-neutral-200 dark:hover:bg-neutral-800 rounded">
          {/* Settings Icon */}
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 0 2.4l-.15.08a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.38a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1 0-2.4l.15.08a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"/><circle cx="12" cy="12" r="3"/></svg>
        </button>
        <button onClick={handleMinimizeClick} className="p-1 hover:bg-neutral-200 dark:hover:bg-neutral-800 rounded">
          {/* Minimize Icon */}
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12"/></svg>
        </button>
        <button onClick={handleCloseClick} className="p-1 hover:bg-neutral-200 dark:hover:bg-neutral-800 rounded">
          {/* Close Icon */}
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
        </button>
      </div>
    </div>
  )
} 