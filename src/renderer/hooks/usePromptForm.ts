import { useState, useEffect } from 'react'
import { usePromptStore } from '../stores/promptStore'
import type { Prompt, Placeholder, SelectOption } from '../../lib/types'
import { v4 as uuidv4 } from 'uuid'

export function usePromptForm(promptId: string | null) {
  const { prompts, addPrompt, updatePrompt } = usePromptStore()
  const [prompt, setPrompt] = useState<Omit<Prompt, 'id' | 'createdAt' | 'updatedAt'>>()

  useEffect(() => {
    if (promptId) {
      const existingPrompt = prompts.find((p) => p.id === promptId)
      if (existingPrompt) {
        setPrompt(existingPrompt)
      }
    } else {
      setPrompt({
        name: '',
        description: '',
        template: '',
        placeholders: [],
        aiProvider: 'openai',
        model: 'gpt-4o-mini'
      })
    }
  }, [promptId, prompts])

  const handleSave = () => {
    if (!prompt) return false

    if (promptId) {
      const originalPrompt = prompts.find((p) => p.id === promptId)
      if (originalPrompt) {
        updatePrompt({ ...prompt, id: promptId, createdAt: originalPrompt.createdAt, updatedAt: new Date().toISOString() })
      }
    } else {
      addPrompt({
        ...prompt,
        id: uuidv4(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      } as Prompt)
    }
    return true
  }

  const handlePlaceholderChange = (
    index: number,
    field: keyof Placeholder,
    value: string | SelectOption[]
  ) => {
    if (!prompt) return
    const updatedPlaceholders = [...prompt.placeholders]
    const currentPlaceholder = { ...updatedPlaceholders[index] }
    ;(currentPlaceholder[field] as any) = value

    if (field === 'type' && value === 'select' && !currentPlaceholder.options) {
      currentPlaceholder.options = []
    }

    updatedPlaceholders[index] = currentPlaceholder
    setPrompt({ ...prompt, placeholders: updatedPlaceholders })
  }

  const handlePlaceholderOptionChange = (
    placeholderIndex: number,
    optionIndex: number,
    field: keyof SelectOption,
    value: string
  ) => {
    if (!prompt || !prompt.placeholders[placeholderIndex].options) return

    const updatedOptions = [...(prompt.placeholders[placeholderIndex].options || [])]
    updatedOptions[optionIndex] = { ...updatedOptions[optionIndex], [field]: value }

    handlePlaceholderChange(placeholderIndex, 'options', updatedOptions)
  }

  const addPlaceholderOption = (placeholderIndex: number) => {
    if (!prompt) return
    const newOption: SelectOption = { id: `opt_${Date.now()}`, label: '', value: '' }
    const updatedOptions = [...(prompt.placeholders[placeholderIndex].options || []), newOption]
    handlePlaceholderChange(placeholderIndex, 'options', updatedOptions)
  }

  const removePlaceholderOption = (placeholderIndex: number, optionIndex: number) => {
    if (!prompt) return
    const updatedOptions = (prompt.placeholders[placeholderIndex].options || []).filter(
      (_, i) => i !== optionIndex
    )
    handlePlaceholderChange(placeholderIndex, 'options', updatedOptions)
  }

  const addPlaceholder = () => {
    if (!prompt) return
    const newPlaceholder: Placeholder = {
      id: `ph_${Date.now()}`,
      name: '',
      label: '',
      type: 'text'
    }
    setPrompt({ ...prompt, placeholders: [...prompt.placeholders, newPlaceholder] })
  }

  const removePlaceholder = (index: number) => {
    if (!prompt) return
    const updatedPlaceholders = prompt.placeholders.filter((_, i) => i !== index)
    setPrompt({ ...prompt, placeholders: updatedPlaceholders })
  }

  return {
    prompt,
    setPrompt,
    handleSave,
    handlePlaceholderChange,
    handlePlaceholderOptionChange,
    addPlaceholderOption,
    removePlaceholderOption,
    addPlaceholder,
    removePlaceholder
  }
} 