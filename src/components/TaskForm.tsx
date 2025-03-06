import React, { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'
import { toast } from 'react-hot-toast'

interface Category {
  id: string
  name: string
  color: string
}

interface TaskType {
  id: string
  title: string
  description: string
  completed: boolean
  due_date?: string
  priority: 'low' | 'medium' | 'high'
  tags: string[]
  is_recurring: boolean
  recurrence_pattern?: string
  subtasks: any[]
  categories?: string[]
  created_at: string
}

interface TaskFormProps {
  onSubmit: (task: Partial<TaskType>) => void
  onCancel: () => void
  initialData?: Partial<TaskType> | null
  availableCategories: Category[]
}

export const TaskForm: React.FC<TaskFormProps> = ({ onSubmit, onCancel, initialData, availableCategories }) => {
  const { user } = useAuth()
  const [title, setTitle] = useState(initialData?.title || '')
  const [description, setDescription] = useState(initialData?.description || '')
  const [dueDate, setDueDate] = useState(initialData?.due_date || '')
  const [priority, setPriority] = useState<'low' | 'medium' | 'high'>(initialData?.priority || 'medium')
  const [tags, setTags] = useState<string[]>(initialData?.tags || [])
  const [isRecurring, setIsRecurring] = useState(initialData?.is_recurring || false)
  const [recurrencePattern, setRecurrencePattern] = useState(initialData?.recurrence_pattern || '')
  const [selectedCategories, setSelectedCategories] = useState<string[]>(
    initialData?.categories || []
  )

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) {
      toast.error('Please sign in to add tasks')
      return
    }

    const taskData = {
      title,
      description,
      due_date: dueDate || undefined,
      priority,
      tags,
      is_recurring: isRecurring,
      recurrence_pattern: isRecurring ? recurrencePattern : undefined,
      categories: selectedCategories
    }

    onSubmit(taskData)
    if (!initialData) {
      setTitle('')
      setDescription('')
      setDueDate('')
      setPriority('medium')
      setTags([])
      setIsRecurring(false)
      setRecurrencePattern('')
      setSelectedCategories([])
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">
          Title
        </label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
          className="w-full px-3 py-2 bg-dark-800 border border-dark-700 rounded-lg text-white 
                   focus:ring-2 focus:ring-rebel-red focus:border-transparent"
          placeholder="Enter task title"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">
          Description
        </label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="w-full px-3 py-2 bg-dark-800 border border-dark-700 rounded-lg text-white 
                   focus:ring-2 focus:ring-rebel-red focus:border-transparent"
          placeholder="Enter task description"
          rows={3}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Due Date
          </label>
          <input
            type="date"
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
            className="w-full px-3 py-2 bg-dark-800 border border-dark-700 rounded-lg text-white 
                     focus:ring-2 focus:ring-rebel-red focus:border-transparent"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Priority
          </label>
          <select
            value={priority}
            onChange={(e) => setPriority(e.target.value as 'low' | 'medium' | 'high')}
            className="w-full px-3 py-2 bg-dark-800 border border-dark-700 rounded-lg text-white 
                     focus:ring-2 focus:ring-rebel-red focus:border-transparent"
          >
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
          </select>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">
          Categories
        </label>
        <div className="flex flex-wrap gap-2">
          {availableCategories.map((category) => (
            <button
              key={category.id}
              type="button"
              onClick={() => {
                setSelectedCategories(prev => 
                  prev.includes(category.id)
                    ? prev.filter(id => id !== category.id)
                    : [...prev, category.id]
                )
              }}
              className={`px-3 py-1 rounded-full text-sm font-medium transition-all duration-200
                       ${selectedCategories.includes(category.id)
                         ? 'bg-rebel-red text-white'
                         : 'bg-dark-700 text-gray-400 hover:bg-dark-600'}`}
            >
              {category.name}
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="flex items-center space-x-2">
          <input
            type="checkbox"
            checked={isRecurring}
            onChange={(e) => setIsRecurring(e.target.checked)}
            className="form-checkbox h-4 w-4 text-rebel-red border-dark-700 rounded 
                     focus:ring-rebel-red focus:ring-offset-dark-900"
          />
          <span className="text-sm font-medium text-gray-300">Recurring Task</span>
        </label>

        {isRecurring && (
          <input
            type="text"
            value={recurrencePattern}
            onChange={(e) => setRecurrencePattern(e.target.value)}
            className="mt-2 w-full px-3 py-2 bg-dark-800 border border-dark-700 rounded-lg text-white 
                     focus:ring-2 focus:ring-rebel-red focus:border-transparent"
            placeholder="e.g., daily, weekly, monthly"
          />
        )}
      </div>

      <div className="flex justify-end space-x-4">
        <button
          type="button"
          onClick={onCancel}
          className="px-6 py-2 border border-dark-700 rounded-lg text-gray-400 
                   hover:text-white hover:border-rebel-red transition-colors"
        >
          Cancel
        </button>
        <button
          type="submit"
          className="bg-rebel-red hover:bg-rebel-red-light text-white px-6 py-2 rounded-lg transition-colors"
        >
          {initialData ? 'Update Task' : 'Add Task'}
        </button>
      </div>
    </form>
  )
}

export default TaskForm 