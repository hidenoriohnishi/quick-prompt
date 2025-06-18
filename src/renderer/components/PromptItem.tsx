import type { Prompt } from '../stores/promptStore'

type Props = {
  prompt: Prompt
}

export function PromptItem({ prompt }: Props) {
  return (
    <div className="flex items-center justify-between p-2 rounded-md hover:bg-neutral-200 dark:hover:bg-neutral-800">
      <div className="flex flex-col">
        <span className="font-semibold">{prompt.name}</span>
        <span className="text-sm text-neutral-500">{prompt.description}</span>
      </div>
      {prompt.shortcut && (
        <span className="text-xs text-neutral-400 dark:text-neutral-500 bg-neutral-100 dark:bg-neutral-800 px-2 py-1 rounded-md">
          {prompt.shortcut}
        </span>
      )}
    </div>
  )
} 