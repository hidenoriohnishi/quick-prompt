import { FormInput } from './components/FormInput'
import { Loading } from './components/Loading'
import { Result } from './components/Result'
import { SettingsLayout } from './components/settings/SettingsLayout'
import { PromptSelector } from './components/PromptSelector'
import { WindowFrame } from './components/WindowFrame'
import { useAppStore } from './stores/appStore'
import { useTheme } from './hooks/useTheme'
import { useAppEventListeners } from './hooks/useAppEventListeners'
import { useInitializers } from './hooks/useInitializers'
import { TitleBar } from './components/TitleBar'
import { useLlmListener } from './hooks/useLlmListener'

function App() {
  useTheme()
  useInitializers()
  useAppEventListeners()
  useLlmListener()

  const currentView = useAppStore((state) => state.currentView)

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
        <div className="flex-grow p-4 overflow-hidden">{renderView()}</div>
      </div>
    </WindowFrame>
  )
}

export default App 