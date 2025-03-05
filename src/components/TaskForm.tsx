import React, { useState } from 'react'
import { supabase } from '../lib/supabase'
import toast from 'react-hot-toast'

interface TaskFormProps {
  onTaskAdded: () => void
}

export const TaskForm = ({ onTaskAdded }: TaskFormProps) => {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [dueDate, setDueDate] = useState('')
  const [priority, setPriority] = useState('medium')
  const [category, setCategory] = useState('')
  const [status, setStatus] = useState('todo')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!title.trim()) {
      toast.error('Title is required!')
      return
    }

    try {
      console.log('Creating new task...')
      const { error } = await supabase
        .from('tasks')
        .insert([
          {
            title,
            description,
            due_date: dueDate || null,
            priority,
            category: category.trim() || null,
            status,
            created_at: new Date().toISOString()
          }
        ])

      if (error) throw error

      console.log('Task created successfully')
      toast.success('Task added successfully!')
      
      // Reset form
      setTitle('')
      setDescription('')
      setDueDate('')
      setPriority('medium')
      setCategory('')
      setStatus('todo')
      
      onTaskAdded()
    } catch (error) {
      console.error('Error creating task:', error)
      toast.error('Failed to create task')
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-dark-400 mb-1">
          Title
        </label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full bg-dark-700 text-white rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-rebel-red"
          placeholder="Enter task title"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-dark-400 mb-1">
          Description
        </label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="w-full bg-dark-700 text-white rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-rebel-red"
          placeholder="Enter task description"
          rows={3}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-dark-400 mb-1">
            Due Date
          </label>
          <input
            type="date"
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
            className="w-full bg-dark-700 text-white rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-rebel-red"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-dark-400 mb-1">
            Priority
          </label>
          <select
            value={priority}
            onChange={(e) => setPriority(e.target.value)}
            className="w-full bg-dark-700 text-white rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-rebel-red"
          >
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-dark-400 mb-1">
            Category
          </label>
          <input
            type="text"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="w-full bg-dark-700 text-white rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-rebel-red"
            placeholder="Enter category"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-dark-400 mb-1">
            Status
          </label>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="w-full bg-dark-700 text-white rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-rebel-red"
          >
            <option value="todo">To Do</option>
            <option value="in_progress">In Progress</option>
            <option value="done">Done</option>
          </select>
        </div>
      </div>

      <div className="flex justify-end">
        <button
          type="submit"
          className="bg-rebel-red hover:bg-rebel-red-light text-white px-6 py-2 rounded-lg transition-colors"
        >
          Add Mission
        </button>
      </div>
    </form>
  )
} 