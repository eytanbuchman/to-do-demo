import { useState } from 'react'
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
  const [showAdvanced, setShowAdvanced] = useState(false)

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
    <form onSubmit={handleSubmit} className="bg-dark-800 p-6 rounded-lg shadow-lg">
      <div className="space-y-4">
        <div>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Enter task title"
            className="w-full bg-dark-700 text-white p-2 rounded"
            required
          />
        </div>

        <div>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Enter task description"
            className="w-full bg-dark-700 text-white p-2 rounded"
            rows={3}
          />
        </div>

        <button
          type="button"
          onClick={() => setShowAdvanced(!showAdvanced)}
          className="text-rebel-red hover:text-rebel-red-light transition-colors"
        >
          {showAdvanced ? '- Hide Advanced Options' : '+ Show Advanced Options'}
        </button>

        {showAdvanced && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-gray-400 mb-1">Due Date</label>
                <input
                  type="date"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  className="w-full bg-dark-700 text-white p-2 rounded"
                />
              </div>

              <div>
                <label className="block text-gray-400 mb-1">Priority</label>
                <select
                  value={priority}
                  onChange={(e) => setPriority(e.target.value)}
                  className="w-full bg-dark-700 text-white p-2 rounded"
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-gray-400 mb-1">Category</label>
                <input
                  type="text"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  placeholder="Enter category"
                  className="w-full bg-dark-700 text-white p-2 rounded"
                />
              </div>

              <div>
                <label className="block text-gray-400 mb-1">Status</label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  className="w-full bg-dark-700 text-white p-2 rounded"
                >
                  <option value="todo">To Do</option>
                  <option value="in_progress">In Progress</option>
                  <option value="done">Done</option>
                </select>
              </div>
            </div>
          </div>
        )}

        <div className="flex justify-end">
          <button
            type="submit"
            className="bg-rebel-red hover:bg-rebel-red-light text-white px-6 py-2 rounded transition-colors"
          >
            Add Task
          </button>
        </div>
      </div>
    </form>
  )
} 