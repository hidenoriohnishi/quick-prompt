import { useEffect, useRef } from 'react'

type ShortcutHandler = (event: KeyboardEvent) => void;
export type Shortcuts = Record<string, ShortcutHandler>;

/**
 * A custom hook to manage global keyboard shortcuts.
 * It takes a map of shortcut combinations and their handlers.
 * The listener is added on mount and removed on unmount.
 *
 * @example
 * useGlobalShortcuts({
 *   'Escape': () => console.log('Escape pressed'),
 *   'Meta+Enter': () => console.log('Cmd+Enter pressed'),
 *   'Ctrl+Enter': () => console.log('Ctrl+Enter pressed'),
 * });
 */
export function useGlobalShortcuts(shortcuts: Shortcuts) {
  const shortcutsRef = useRef(shortcuts)
  shortcutsRef.current = shortcuts

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      const currentShortcuts = shortcutsRef.current
      const pressedKeys = []

      if (event.metaKey) pressedKeys.push('Meta')
      if (event.ctrlKey) pressedKeys.push('Ctrl')
      if (event.shiftKey) pressedKeys.push('Shift')
      if (event.altKey) pressedKeys.push('Alt')
      
      pressedKeys.push(event.key)

      const shortcutKey = pressedKeys.join('+')

      if (currentShortcuts[shortcutKey]) {
        event.preventDefault()
        currentShortcuts[shortcutKey](event)
        return
      }

      // Fallback for single key presses without modifiers
      if (pressedKeys.length === 1 && currentShortcuts[event.key]) {
        event.preventDefault()
        currentShortcuts[event.key](event)
      }
    }

    console.log('[useGlobalShortcuts] Adding event listener for shortcuts:', Object.keys(shortcuts))
    window.addEventListener('keydown', handleKeyDown)

    return () => {
      console.log('[useGlobalShortcuts] Removing event listener for shortcuts:', Object.keys(shortcuts))
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [shortcuts])
} 