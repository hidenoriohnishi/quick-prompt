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
import { usePromptStore } from './stores/promptStore'
import type { Settings, Prompt } from '../lib/types'

function App() {
  const { currentView, setCurrentView } = useAppStore()
  const { settings, setSettings, isInitialized: isSettingsInitialized, setInitialized: setSettingsInitialized } = useSettingsStore()
  const { prompts, setPrompts, isInitialized: isPromptsInitialized, setInitialized: setPromptsInitialized } = usePromptStore()

  useEffect(() => {
    const removeListener = window.electron.onSettingsInitialized((initialSettings: Settings) => {
      setSettings(initialSettings)
      setSettingsInitialized(true)
    })
    return () => removeListener()
  }, [setSettings, setSettingsInitialized])

  useEffect(() => {
    if (isSettingsInitialized) {
      window.electron.setSettings(settings)
    }
  }, [settings, isSettingsInitialized])

  useEffect(() => {
    const removeListener = window.electron.onPromptsInitialized((initialPrompts: Prompt[]) => {
      setPrompts(initialPrompts)
      setPromptsInitialized(true)
    })
    return () => removeListener()
  }, [setPrompts, setPromptsInitialized])

  useEffect(() => {
    if (isPromptsInitialized) {
      window.electron.setPrompts(prompts)
    }
  }, [prompts, isPromptsInitialized])

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
        try {
          const usageData = JSON.parse(chunk.data)
          setUsage(usageData)
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

  const theme = useSettingsStore((state) => state.settings.general.theme)

  useEffect(() => {
    const root = window.document.documentElement
    const isDark = theme === 'dark' || (theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches)
    
    root.classList.toggle('dark', isDark)

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
    const handleChange = (e: MediaQueryListEvent) => {
      if (theme === 'system') {
        root.classList.toggle('dark', e.matches)
      }
    }

    mediaQuery.addEventListener('change', handleChange)
    return () => {
      mediaQuery.removeEventListener('change', handleChange)
    }
  }, [theme])

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