import { useState } from 'react'
import { PencilIcon, DocumentDuplicateIcon, TrashIcon } from '@heroicons/react/24/outline'
import { format } from 'date-fns'
import { supabase } from '../lib/supabase'
import toast from 'react-hot-toast'

interface TaskProps {
  task: {
    id: string
    title: string
    description: string
    due_date?: string
    priority: string
    category: string
    status: string
  }
  onDelete: (id: string) => void
  onUpdate: (task: any) => void
}

const Task = ({ task, onDelete, onUpdate }: TaskProps) => {
  const [isEditing, setIsEditing] = useState(false)
  const [editedTask, setEditedTask] = useState(task)

  const handleEdit = () => {
    setIsEditing(true)
  }

  const handleDuplicate = async () => {
    console.log('Duplicating task:', task)
    try {
      const { data, error } = await supabase
        .from('tasks')
        .insert([{
          ...task,
          id: undefined,
          title: `${task.title} (Copy)`,
          created_at: new Date().toISOString()
        }])

      if (error) throw error

      toast.success('Task duplicated successfully!')
      console.log('Task duplicated:', data)
      // Refresh the task list
      window.location.reload()
    } catch (error) {
      console.error('Error duplicating task:', error)
      toast.error('Failed to duplicate task')
    }
  }

  const handleSave = async () => {
    console.log('Saving edited task:', editedTask)
    try {
      const { error } = await supabase
        .from('tasks')
        .update(editedTask)
        .eq('id', task.id)

      if (error) throw error

      setIsEditing(false)
      onUpdate(editedTask)
      toast.success('Task updated successfully!')
    } catch (error) {
      console.error('Error updating task:', error)
      toast.error('Failed to update task')
    }
  }

  const handleCancel = () => {
    setEditedTask(task)
    setIsEditing(false)
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
          <div className="flex gap-4">
            <select
              value={editedTask.priority}
              onChange={(e) => setEditedTask({ ...editedTask, priority: e.target.value })}
              className="bg-dark-700 text-white p-2 rounded"
            >
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
            </select>
            <input
              type="text"
              value={editedTask.category}
              onChange={(e) => setEditedTask({ ...editedTask, category: e.target.value })}
              className="bg-dark-700 text-white p-2 rounded"
              placeholder="Category"
            />
            <select
              value={editedTask.status}
              onChange={(e) => setEditedTask({ ...editedTask, status: e.target.value })}
              className="bg-dark-700 text-white p-2 rounded"
            >
              <option value="todo">To Do</option>
              <option value="in_progress">In Progress</option>
              <option value="done">Done</option>
            </select>
          </div>
          <div className="flex justify-end gap-2">
            <button
              onClick={handleCancel}
              className="px-4 py-2 bg-dark-600 text-white rounded hover:bg-dark-500"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="px-4 py-2 bg-rebel-red text-white rounded hover:bg-rebel-red-light"
            >
              Save
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-dark-800 p-4 rounded-lg shadow-lg mb-4">
      <div className="flex justify-between items-start mb-2">
        <h3 className="text-xl font-bold text-white">{task.title}</h3>
        <div className="flex gap-2">
          <button
            onClick={handleEdit}
            className="p-2 text-gray-400 hover:text-rebel-red transition-colors"
            title="Edit task"
          >
            <PencilIcon className="h-5 w-5" />
          </button>
          <button
            onClick={handleDuplicate}
            className="p-2 text-gray-400 hover:text-rebel-red transition-colors"
            title="Duplicate task"
          >
            <DocumentDuplicateIcon className="h-5 w-5" />
          </button>
          <button
            onClick={() => onDelete(task.id)}
            className="p-2 text-gray-400 hover:text-rebel-red transition-colors"
            title="Delete task"
          >
            <TrashIcon className="h-5 w-5" />
          </button>
        </div>
      </div>
      <p className="text-gray-300 mb-2">{task.description}</p>
      <div className="flex flex-wrap gap-2 text-sm">
        <span className={`px-2 py-1 rounded ${
          task.priority === 'high' ? 'bg-red-900 text-red-100' :
          task.priority === 'medium' ? 'bg-yellow-900 text-yellow-100' :
          'bg-green-900 text-green-100'
        }`}>
          {task.priority.charAt(0).toUpperCase() + task.priority.slice(1)}
        </span>
        {task.category && (
          <span className="px-2 py-1 bg-dark-600 text-gray-300 rounded">
            {task.category}
          </span>
        )}
        <span className={`px-2 py-1 rounded ${
          task.status === 'done' ? 'bg-green-900 text-green-100' :
          task.status === 'in_progress' ? 'bg-blue-900 text-blue-100' :
          'bg-gray-700 text-gray-300'
        }`}>
          {task.status.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
        </span>
        {task.due_date && (
          <span className="px-2 py-1 bg-dark-600 text-gray-300 rounded">
            Due: {format(new Date(task.due_date), 'MMM d, yyyy')}
          </span>
        )}
      </div>
    </div>
  )
}

export default Task 