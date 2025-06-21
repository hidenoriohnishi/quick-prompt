import { usePromptStore } from '../../stores/promptStore'
import type { Prompt } from '../../../lib/types'
import { useAppStore } from '../../stores/appStore'
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
  KeyboardSensor
} from '@dnd-kit/core'
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { GripVertical } from 'lucide-react'

function SortableItem({ prompt }: { prompt: Prompt }) {
  const { setSettingsView, setSelectedPromptId } = useAppStore()
  const { deletePrompt } = usePromptStore()

  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: prompt.id
  })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 1 : 'auto',
    opacity: isDragging ? 0.5 : 1
  }

  const handleEdit = (id: string) => {
    setSelectedPromptId(id)
    setSettingsView('prompt-detail')
  }

  const handleDelete = (id: string) => {
    if (window.confirm('Are you sure you want to delete this prompt?')) {
      deletePrompt(id)
    }
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="bg-white dark:bg-neutral-900 border-b dark:border-neutral-800 flex items-center"
    >
      <div className="px-3 py-4 cursor-grab" {...attributes} {...listeners}>
        <GripVertical className="w-5 h-5 text-neutral-400" />
      </div>
      <div className="flex-1 flex items-center">
        <div className="px-6 py-4 w-1/4 font-medium text-neutral-900 dark:text-white whitespace-nowrap">
          {prompt.name}
        </div>
        <div className="px-6 py-4 w-2/4 text-neutral-600 dark:text-neutral-300">
          {prompt.description}
        </div>
        <div className="px-6 py-4 w-1/4 text-right space-x-2">
          <button
            onClick={() => handleEdit(prompt.id)}
            className="font-medium text-blue-600 dark:text-blue-500 hover:underline"
          >
            Edit
          </button>
          <button
            onClick={() => handleDelete(prompt.id)}
            className="font-medium text-red-600 dark:text-red-500 hover:underline"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  )
}

export function PromptList() {
  const { prompts, setPrompts, deletePrompt } = usePromptStore()
  const { setSettingsView, setSelectedPromptId } = useAppStore()

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates
    })
  )

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event
    if (over && active.id !== over.id) {
      const oldIndex = prompts.findIndex((p) => p.id === active.id)
      const newIndex = prompts.findIndex((p) => p.id === over.id)
      setPrompts(arrayMove(prompts, oldIndex, newIndex))
    }
  }

  const handleNew = () => {
    setSelectedPromptId(null) // Clear selection for new prompt
    setSettingsView('prompt-detail')
  }

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold">Prompts</h2>
        <button
          onClick={handleNew}
          className="px-4 py-2 rounded-md bg-blue-600 text-white hover:bg-blue-700"
        >
          + New Prompt
        </button>
      </div>
      <div className="flex-grow overflow-y-auto pr-2">
        <div className="w-full text-sm text-left text-neutral-500 dark:text-neutral-400">
          <div className="text-xs text-neutral-700 uppercase bg-neutral-50 dark:bg-neutral-800 dark:text-neutral-400 flex">
            <div className="pl-12 pr-6 py-3 w-1/4">Name</div>
            <div className="px-6 py-3 w-2/4">Description</div>
            <div className="px-6 py-3 w-1/4 text-right">Actions</div>
          </div>
          <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
            <SortableContext items={prompts} strategy={verticalListSortingStrategy}>
              <div>
                {prompts.map((prompt: Prompt) => (
                  <SortableItem key={prompt.id} prompt={prompt} />
                ))}
              </div>
            </SortableContext>
          </DndContext>
        </div>
      </div>
    </div>
  )
} 