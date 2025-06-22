import { useEffect } from 'react'
import { useAppStore } from '../stores/appStore'

export function useAppEventListeners() {
  const { setCurrentView } = useAppStore()

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