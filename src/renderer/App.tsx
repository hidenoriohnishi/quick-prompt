import { FormInput } from './components/FormInput'
import { Loading } from './components/Loading'
import { Result } from './components/Result'
import { Settings } from './components/Settings'
import { PromptSelector } from './components/PromptSelector'
import { WindowFrame } from './components/WindowFrame'
import { useAppStore } from './stores/appStore'
import { useTheme } from './hooks/useTheme'
import { useAppEventListeners } from './hooks/useAppEventListeners'
import { useInitializers } from './hooks/useInitializers'

function App() {
  useTheme()
  useAppEventListeners()
  useInitializers()
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
        return <Settings />
      default:
        return <PromptSelector />
    }
  }

  return (
    <WindowFrame>
      <div className="h-full p-4">{renderView()}</div>
    </WindowFrame>
  )
}

export default App 