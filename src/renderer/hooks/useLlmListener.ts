import { useEffect } from 'react'
import { useAppStore } from '../stores/appStore'
import { useLlmStore } from '../stores/llmStore'

export function useLlmListener() {
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
} 