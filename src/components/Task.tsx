import React, { useState } from 'react'
import { PencilIcon, DocumentDuplicateIcon, TrashIcon } from '@heroicons/react/24/outline'
import { format } from 'date-fns'
import { supabase } from '../lib/supabase'
import toast from 'react-hot-toast'

interface TaskProps {
  task: {
    id: string
    title: string
    description: string
    completed: boolean
    priority: string
    tags: string[]
    due_date?: string
    is_recurring: boolean
    recurrence_pattern?: string
    subtasks: any[]
    created_at: string
  }
  onDelete: (id: string) => void
  onUpdate: (task: TaskProps['task']) => void
}

const Task = ({ task, onDelete, onUpdate }: TaskProps) => {
  const [isEditing, setIsEditing] = useState(false)
  const [editedTask, setEditedTask] = useState(task)

  const handleEdit = () => {
    setIsEditing(true)
  }

  const handleDuplicate = async () => {
    const { id, ...taskWithoutId } = task
    const duplicatedTask = {
      ...taskWithoutId,
      id: crypto.randomUUID(),
      title: `${task.title} (Copy)`,
      created_at: new Date().toISOString()
    }
    onUpdate(duplicatedTask)
  }

  const handleSave = () => {
    onUpdate(editedTask)
    setIsEditing(false)
  }

  const handleCancel = () => {
    setEditedTask(task)
    setIsEditing(false)
  }

  const handleStatusChange = () => {
    const updatedTask = {
      ...task,
      completed: !task.completed
    }
    onUpdate(updatedTask)
  }

  if (isEditing) {
    return (
      <div className="bg-dark-800 p-4 rounded-lg shadow-lg mb-4">
        <div className="space-y-4">
          <input
            type="text"
            value={editedTask.title}
            onChange={(e) => setEditedTask({ ...editedTask, title: e.target.value })}
            className="w-full bg-dark-700 text-white p-2 rounded"
          />
          <textarea
            value={editedTask.description}
            onChange={(e) => setEditedTask({ ...editedTask, description: e.target.value })}
            className="w-full bg-dark-700 text-white p-2 rounded"
          />
          <div className="grid grid-cols-2 gap-4">
            <div>
              <select
                value={editedTask.priority}
                onChange={(e) => setEditedTask({ ...editedTask, priority: e.target.value })}
                className="w-full bg-dark-700 text-white p-2 rounded"
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </div>
            <div>
              <input
                type="datetime-local"
                value={editedTask.due_date || ''}
                onChange={(e) => setEditedTask({ ...editedTask, due_date: e.target.value })}
                className="w-full bg-dark-700 text-white p-2 rounded"
              />
            </div>
          </div>
          <div className="flex justify-end space-x-2">
            <button
              onClick={handleCancel}
              className="px-4 py-2 text-dark-400 hover:text-white transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="bg-rebel-red hover:bg-rebel-red-light text-white px-4 py-2 rounded-lg transition-colors"
            >
              Save
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-dark-800 rounded-lg p-6 hover:bg-dark-700 transition-colors">
      <div className="flex items-start justify-between">
        <div className="flex items-start space-x-3">
          <button
            onClick={handleStatusChange}
            className={`mt-1 w-5 h-5 rounded border-2 flex items-center justify-center transition-colors ${
              task.completed
                ? 'bg-rebel-red border-rebel-red text-white'
                : 'border-dark-400 hover:border-rebel-red'
            }`}
          >
            {task.completed && (
              <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            )}
          </button>
          <div>
            <h3 className={`text-lg font-semibold ${task.completed ? 'text-dark-400 line-through' : 'text-white'}`}>
              {task.title}
            </h3>
            {task.description && (
              <p className={`mt-1 text-sm ${task.completed ? 'text-dark-400 line-through' : 'text-dark-300'}`}>
                {task.description}
              </p>
            )}
            <div className="mt-2 flex flex-wrap gap-2">
              {task.tags?.map((tag, index) => (
                <span
                  key={index}
                  className="px-2 py-1 text-xs rounded-full bg-dark-700 text-dark-300"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <span className={`text-sm px-2 py-1 rounded-full ${
            task.priority === 'high'
              ? 'bg-red-500/10 text-red-400'
              : task.priority === 'medium'
              ? 'bg-yellow-500/10 text-yellow-400'
              : 'bg-blue-500/10 text-blue-400'
          }`}>
            {task.priority}
          </span>
          <button
            onClick={handleEdit}
            className="text-dark-400 hover:text-white transition-colors"
          >
            Edit
          </button>
          <button
            onClick={handleDuplicate}
            className="text-dark-400 hover:text-white transition-colors"
          >
            Duplicate
          </button>
          <button
            onClick={() => onDelete(task.id)}
            className="text-dark-400 hover:text-red-400 transition-colors"
          >
            Delete
          </button>
        </div>
      </div>
      {task.due_date && (
        <div className="mt-2 text-sm text-dark-400">
          Due: {new Date(task.due_date).toLocaleDateString()}
        </div>
      )}
      {task.is_recurring && task.recurrence_pattern && (
        <div className="mt-1 text-sm text-dark-400">
          Repeats: {task.recurrence_pattern}
        </div>
      )}
    </div>
  )
}

export default Task 