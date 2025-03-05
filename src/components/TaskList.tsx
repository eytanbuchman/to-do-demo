import React, { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { TaskForm } from './TaskForm'
import Task from './Task'
import { PlusIcon, FunnelIcon } from '@heroicons/react/24/outline'
import toast from 'react-hot-toast'

interface TaskType {
  id: string
  title: string
  description: string
  category: string
  priority: string
  status: string
  due_date?: string
}

export const TaskList = () => {
  const [tasks, setTasks] = useState<TaskType[]>([])
  const [loading, setLoading] = useState(true)
  const [showNewTaskForm, setShowNewTaskForm] = useState(false)
  const [filters, setFilters] = useState({
    priority: '',
    category: '',
    status: ''
  })
  const [categories, setCategories] = useState<string[]>([])

  useEffect(() => {
    fetchTasks()
    fetchCategories()
  }, [])

  const fetchCategories = async () => {
    try {
      console.log('Fetching categories...')
      const { data, error } = await supabase
        .from('categories')
        .select('name')

      if (error) throw error

      setCategories(data.map(c => c.name))
      console.log('Categories fetched:', data)
    } catch (error) {
      console.error('Error fetching categories:', error)
      toast.error('Failed to load categories')
    }
  }

  const fetchTasks = async () => {
    try {
      console.log('Fetching tasks with filters:', filters)
      let query = supabase
        .from('tasks')
        .select('*')
        .order('created_at', { ascending: false })

      if (filters.priority) {
        query = query.eq('priority', filters.priority)
      }
      if (filters.category) {
        query = query.eq('category', filters.category)
      }
      if (filters.status) {
        query = query.eq('status', filters.status)
      }

      const { data, error } = await query

      if (error) throw error

      console.log('Tasks fetched:', data)
      setTasks(data || [])
      setLoading(false)
    } catch (error) {
      console.error('Error fetching tasks:', error)
      toast.error('Failed to load tasks')
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchTasks()
  }, [filters])

  const handleTaskAdded = () => {
    fetchTasks()
    setShowNewTaskForm(false)
  }

  const handleDelete = async (id: string) => {
    try {
      const { error } = await supabase
        .from('tasks')
        .delete()
        .eq('id', id)

      if (error) throw error

      fetchTasks()
      toast.success('Task deleted successfully!')
    } catch (error) {
      console.error('Error deleting task:', error)
      toast.error('Failed to delete task')
    }
  }

  const handleUpdate = async (updatedTask: TaskType) => {
    try {
      const { error } = await supabase
        .from('tasks')
        .update(updatedTask)
        .eq('id', updatedTask.id)

      if (error) throw error

      fetchTasks()
      toast.success('Task updated successfully!')
    } catch (error) {
      console.error('Error updating task:', error)
      toast.error('Failed to update task')
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-4rem)]">
        <div className="animate-pulse text-dark-400">Loading tasks...</div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold text-white">Your Missions</h1>
        <button
          onClick={() => setShowNewTaskForm(!showNewTaskForm)}
          className="bg-rebel-red hover:bg-rebel-red-light text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
        >
          <PlusIcon className="w-5 h-5" />
          New Mission
        </button>
      </div>

      <div className="bg-dark-800 rounded-lg p-4 mb-6">
        <div className="flex items-center gap-4">
          <FunnelIcon className="w-5 h-5 text-dark-400" />
          <select
            value={filters.priority}
            onChange={(e) => setFilters({ ...filters, priority: e.target.value })}
            className="bg-dark-700 text-white rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-rebel-red"
          >
            <option value="">All Priorities</option>
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
          </select>

          <select
            value={filters.category}
            onChange={(e) => setFilters({ ...filters, category: e.target.value })}
            className="bg-dark-700 text-white rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-rebel-red"
          >
            <option value="">All Categories</option>
            {categories.map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>

          <select
            value={filters.status}
            onChange={(e) => setFilters({ ...filters, status: e.target.value })}
            className="bg-dark-700 text-white rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-rebel-red"
          >
            <option value="">All Statuses</option>
            <option value="todo">To Do</option>
            <option value="in_progress">In Progress</option>
            <option value="done">Done</option>
          </select>
        </div>
      </div>

      {showNewTaskForm && (
        <div className="fixed inset-0 bg-dark-900/80 flex items-center justify-center p-4 z-50">
          <div className="bg-dark-800 p-6 rounded-lg shadow-xl max-w-md w-full">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-white">New Mission</h2>
              <button 
                onClick={() => setShowNewTaskForm(false)}
                className="text-dark-400 hover:text-white"
              >
                ✕
              </button>
            </div>
            <TaskForm onTaskAdded={handleTaskAdded} />
          </div>
        </div>
      )}

      <div className="space-y-4">
        {tasks.length === 0 ? (
          <div className="text-center text-dark-400 py-8">
            No tasks found. Start by adding a new mission!
          </div>
        ) : (
          tasks.map((task) => (
            <Task
              key={task.id}
              task={task}
              onDelete={handleDelete}
              onUpdate={handleUpdate}
            />
          ))
        )}
      </div>
    </div>
  )
} 