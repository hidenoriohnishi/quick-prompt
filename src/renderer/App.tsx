import { WindowFrame } from './components/WindowFrame'
import { TitleBar } from './components/TitleBar'
import { useAppStore } from './stores/appStore'
import { PromptSelector } from './components/PromptSelector'
import { FormInput } from './components/FormInput'
import { Loading } from './components/Loading'
import { Result } from './components/Result'
import { SettingsLayout } from './components/settings/SettingsLayout'
import { useInitializers } from './hooks/useInitializers'
import { useLlmListener } from './hooks/useLlmListener'
import { useAppEventListeners } from './hooks/useAppEventListeners'
import { useTheme } from './hooks/useTheme'
import { AdjustForm } from './components/AdjustForm'

function App() {
  const { currentView } = useAppStore()

  useInitializers()
  useLlmListener()
  useAppEventListeners()
  useTheme()

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
      case 'adjust_form':
        return <AdjustForm />
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