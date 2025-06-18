import { useEffect, useRef } from 'react'
import { useLlmStore } from '../stores/llmStore'
import { useAppStore } from '../stores/appStore'

export function Loading() {
  const { messages, cancelRequest } = useLlmStore()
  const { setCurrentView } = useAppStore()
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [messages])

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        cancelRequest()
        setCurrentView('form')
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => {
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [cancelRequest, setCurrentView])
  
  const assistantMessage = messages.find(m => m.role === 'assistant')?.content || ''

  return (
    <div className="flex flex-col items-center justify-center h-full text-center">
      <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
      <p className="mt-4 text-lg">Generating response...</p>
      {assistantMessage && (
        <div ref={scrollRef} className="mt-4 p-4 bg-neutral-100 dark:bg-neutral-800 rounded-md w-full max-h-48 overflow-y-auto">
          <p className="text-left text-sm text-neutral-600 dark:text-neutral-300 whitespace-pre-wrap">
            {assistantMessage}
          </p>
        </div>
      )}
      <button 
        onClick={() => {
          cancelRequest()
          setCurrentView('form')
        }} 
        className="mt-6 px-4 py-2 text-sm rounded-md bg-neutral-200 dark:bg-neutral-700 hover:bg-neutral-300 dark:hover:bg-neutral-600"
      >
        Cancel (Esc)
      </button>
    </div>
  )
} 