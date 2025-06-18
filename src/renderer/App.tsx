import { useEffect } from 'react'
import { WindowFrame } from './components/WindowFrame'
import { TitleBar } from './components/TitleBar'
import { useAppStore } from './stores/appStore'
import { PromptSelector } from './components/PromptSelector'
import { FormInput } from './components/FormInput'
import { Loading } from './components/Loading'
import { Result } from './components/Result'
import { SettingsLayout } from './components/settings/SettingsLayout'
import { useSettingsStore } from './stores/settingsStore'
import { useLlmStore } from './stores/llmStore'

function App() {
  const { currentView, setCurrentView } = useAppStore()

  useEffect(() => {
    const { 
      addMessageChunk, 
      setUsage, 
      setError, 
      setIsLoading, 
      setCurrentRequestId 
    } = useLlmStore.getState()

    const removeListener = window.electron.onLlmResponse((chunk: any) => {
      if (chunk.requestId) {
        setCurrentRequestId(chunk.requestId)
      }

      if (chunk.type === 'chunk') {
        addMessageChunk(chunk.data)
      } else if (chunk.type === 'error') {
        setError(new Error(chunk.data))
        setIsLoading(false)
      } else if (chunk.type === 'usage') {
        console.log('[App] Received usage chunk:', chunk)
        try {
          const usageData = JSON.parse(chunk.data)
          console.log('[App] Parsed usage data:', usageData)
          setUsage(usageData)
          console.log('[App] Usage set in store')
        } catch (e) {
          console.error("Failed to parse usage data", e)
        }
      } else if (chunk.type === 'end') {
        setIsLoading(false)
        setCurrentRequestId(null)
        useAppStore.getState().setCurrentView('result')
      }
    })
    return () => removeListener()
  }, [])

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        const appState = useAppStore.getState()
        if (appState.currentView === 'settings') {
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

  useEffect(() => {
    // Apply theme from settings
    const settings = useSettingsStore.getState().settings
    if (settings.general.theme === 'dark') {
      document.documentElement.classList.add('dark')
    } else if (settings.general.theme === 'light') {
      document.documentElement.classList.remove('dark')
    } else {
      // Logic for system theme
      const darkModeQuery = window.matchMedia('(prefers-color-scheme: dark)')
      if (darkModeQuery.matches) {
        document.documentElement.classList.add('dark')
      } else {
        document.documentElement.classList.remove('dark')
      }
    }
  }, [useSettingsStore.getState().settings.general.theme])

  const renderView = () => {
    switch (currentView) {
      case 'selector':
        return <PromptSelector />
      case 'form':
        return <FormInput />
      case 'loading':
        return <Loading />
      case 'result':
        return <Result />
      case 'settings':
        return <SettingsLayout />
      default:
        return <PromptSelector />
    }
  }

  return (
    <WindowFrame>
      <div className="flex h-full flex-col">
        <TitleBar />
        <div className="flex-grow p-4 overflow-hidden">
          {renderView()}
        </div>
      </div>
    </WindowFrame>
  )
}

export default App 