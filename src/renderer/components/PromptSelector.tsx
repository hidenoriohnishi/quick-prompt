import { usePromptStore } from '../stores/promptStore'
import { useAppStore } from '../stores/appStore'
import { useEffect, useState } from 'react'
import { clsx } from 'clsx'

export function PromptSelector() {
  const { prompts } = usePromptStore()
  const { setCurrentView, setSelectedPromptId } = useAppStore()
  const [activeIndex, setActiveIndex] = useState(0)

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowDown') {
        e.preventDefault()
        setActiveIndex((prev) => (prev + 1) % prompts.length)
      } else if (e.key === 'ArrowUp') {
        e.preventDefault()
        setActiveIndex((prev) => (prev - 1 + prompts.length) % prompts.length)
      } else if (e.key === 'Enter') {
        e.preventDefault()
        const selectedPrompt = prompts[activeIndex]
        if (selectedPrompt) {
          handleSelectPrompt(selectedPrompt.id)
        }
      } else if (e.key === 'Escape') {
        window.electron.hideWindow()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => {
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [activeIndex, prompts])

  const handleSelectPrompt = (id: string) => {
    setSelectedPromptId(id)
    setCurrentView('form')
  }

  return (
    <div className="flex flex-col h-full">
      <h2 className="text-lg font-bold mb-4">Select a Prompt</h2>
      <div className="flex-grow overflow-y-auto space-y-2 pr-2">
        {prompts.map((prompt, index) => (
          <div
            key={prompt.id}
            onClick={() => handleSelectPrompt(prompt.id)}
            className={clsx(
              'p-3 rounded-md cursor-pointer border',
              {
                'bg-blue-100 dark:bg-blue-900/50 border-blue-300 dark:border-blue-700': activeIndex === index,
                'bg-neutral-50 dark:bg-neutral-800/50 border-transparent hover:bg-neutral-100 dark:hover:bg-neutral-800': activeIndex !== index,
              }
            )}
          >
            <h3 className="font-semibold">{prompt.name}</h3>
            <p className="text-sm text-neutral-500">{prompt.description}</p>
          </div>
        ))}
        {prompts.length === 0 && (
            <div className="text-center text-neutral-500 py-10">
                <p>No prompts found.</p>
                <p className="text-sm">Go to Settings &gt; Prompts to create one.</p>
            </div>
        )}
      </div>
    </div>
  )
} 