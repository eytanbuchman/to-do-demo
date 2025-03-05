import React, { useState } from 'react'
import { supabase } from '../lib/supabase'
import toast from 'react-hot-toast'
import { useAuth } from '../contexts/AuthContext'

interface TaskFormProps {
  onSubmit: (task: {
    title: string
    description: string
    completed: boolean
    priority: string
    tags: string[]
    due_date?: string
    is_recurring: boolean
    recurrence_pattern?: string
    subtasks: any[]
  }) => void
}

export const TaskForm: React.FC<TaskFormProps> = ({ onSubmit }) => {
  const { user } = useAuth()
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [priority, setPriority] = useState('medium')
  const [dueDate, setDueDate] = useState('')
  const [tags, setTags] = useState<string[]>([])
  const [tagInput, setTagInput] = useState('')
  const [isRecurring, setIsRecurring] = useState(false)
  const [recurrencePattern, setRecurrencePattern] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    console.log('Submitting task form with values:', {
      title,
      description,
      priority,
      dueDate,
      tags,
      isRecurring,
      recurrencePattern
    })

    onSubmit({
      title,
      description,
      completed: false,
      priority,
      tags,
      due_date: dueDate || undefined,
      is_recurring: isRecurring,
      recurrence_pattern: recurrencePattern || undefined,
      subtasks: []
    })

    // Reset form
    setTitle('')
    setDescription('')
    setPriority('medium')
    setDueDate('')
    setTags([])
    setTagInput('')
    setIsRecurring(false)
    setRecurrencePattern('')
  }

  const handleAddTag = () => {
    if (tagInput.trim() && !tags.includes(tagInput.trim())) {
      setTags([...tags, tagInput.trim()])
      setTagInput('')
    }
  }

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove))
  }

  const handleTagInputKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      handleAddTag()
    }
  }

  return (
    <form onSubmit={handleSubmit} className="bg-dark-800 rounded-lg p-6">
      <div className="space-y-4">
        <div>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Task title"
            required
            className="w-full bg-dark-700 text-white px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-rebel-red"
          />
        </div>

        <div>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Task description"
            rows={3}
            className="w-full bg-dark-700 text-white px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-rebel-red"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <select
              value={priority}
              onChange={(e) => setPriority(e.target.value)}
              className="w-full bg-dark-700 text-white px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-rebel-red"
            >
              <option value="low">Low Priority</option>
              <option value="medium">Medium Priority</option>
              <option value="high">High Priority</option>
            </select>
          </div>

          <div>
            <input
              type="datetime-local"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              className="w-full bg-dark-700 text-white px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-rebel-red"
            />
          </div>
        </div>

        <div>
          <div className="flex gap-2">
            <input
              type="text"
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              onKeyPress={handleTagInputKeyPress}
              placeholder="Add tags"
              className="flex-1 bg-dark-700 text-white px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-rebel-red"
            />
            <button
              type="button"
              onClick={handleAddTag}
              className="px-4 py-2 bg-dark-700 text-white rounded-lg hover:bg-dark-600 transition-colors"
            >
              Add Tag
            </button>
          </div>
          {tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-2">
              {tags.map((tag, index) => (
                <span
                  key={index}
                  className="px-2 py-1 bg-dark-700 text-white rounded-full flex items-center gap-1"
                >
                  {tag}
                  <button
                    type="button"
                    onClick={() => handleRemoveTag(tag)}
                    className="text-dark-400 hover:text-white ml-1"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          )}
        </div>

        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="isRecurring"
              checked={isRecurring}
              onChange={(e) => setIsRecurring(e.target.checked)}
              className="bg-dark-700 text-rebel-red rounded focus:ring-rebel-red"
            />
            <label htmlFor="isRecurring" className="text-white">
              Recurring Task
            </label>
          </div>
          {isRecurring && (
            <select
              value={recurrencePattern}
              onChange={(e) => setRecurrencePattern(e.target.value)}
              className="w-full bg-dark-700 text-white px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-rebel-red"
            >
              <option value="">Select Recurrence Pattern</option>
              <option value="daily">Daily</option>
              <option value="weekly">Weekly</option>
              <option value="monthly">Monthly</option>
            </select>
          )}
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            className="bg-rebel-red hover:bg-rebel-red-light text-white px-6 py-2 rounded-lg transition-colors"
          >
            Add Task
          </button>
        </div>
      </div>
    </form>
  )
}

export default TaskForm 