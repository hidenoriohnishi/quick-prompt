import { useEffect } from 'react'
import { useAppStore } from '../stores/appStore'

export function useAppEventListeners() {
  const { setCurrentView } = useAppStore()

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        const appState = useAppStore.getState()
        if (appState.currentView === 'settings' || appState.currentView === 'form') {
          appState.setCurrentView('selector')
        } else if (appState.currentView !== 'result' && appState.currentView !== 'loading') {
          window.electron.hideWindow()
        }
      }
    }

    window.addEventListener('keydown', handleKeyDown)

    return () => {
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [])

  useEffect(() => {
    const removeListener = window.electron.onWindowVisibilityChange((isVisible: boolean) => {
      if (!isVisible) {
        useAppStore.getState().setCurrentView('selector')
      }
    })
    return () => removeListener()
  }, [])

  useEffect(() => {
    const removeListener = window.electron.onNavigate((view: 'settings') => {
      if (view === 'settings') {
        setCurrentView('settings')
      }
    })
    return () => removeListener()
  }, [setCurrentView])
} 