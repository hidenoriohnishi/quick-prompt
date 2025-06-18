import { ReactNode } from 'react'

type Props = {
  children: ReactNode
}

export function WindowFrame({ children }: Props) {
  return (
    <div className="h-screen bg-transparent text-neutral-800 dark:text-neutral-200">
      <div className="h-full w-full rounded-lg border border-neutral-200/50 bg-white/80 backdrop-blur-xl dark:border-neutral-800/50 dark:bg-neutral-950/80">
        {children}
      </div>
    </div>
  )
} 