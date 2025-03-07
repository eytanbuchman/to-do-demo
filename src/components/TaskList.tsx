import React, { useEffect, useState } from 'react'
import { supabase, cachedQuery, createCacheKey, clearCache } from '../lib/supabase'
import { toast } from 'react-hot-toast'
import { useLocation } from 'react-router-dom'
import { TaskForm } from './TaskForm'
import { PlusIcon, XMarkIcon, FunnelIcon, ArrowsUpDownIcon } from '@heroicons/react/24/outline'

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
  task_categories?: Array<{ category_id: string }>
}

interface Filters {
  category: string | null
  priority: string | null
  sortBy: 'created_at' | 'due_date' | 'priority'
  sortOrder: 'asc' | 'desc'
}

export const TaskList = () => {
  const [tasks, setTasks] = useState<TaskType[]>([])
  const [loading, setLoading] = useState(true)
  const [categories, setCategories] = useState<Category[]>([])
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [isAddTaskExpanded, setIsAddTaskExpanded] = useState(false)
  const [editingTask, setEditingTask] = useState<Partial<TaskType> | null>(null)
  const [showFilters, setShowFilters] = useState(false)
  const [filters, setFilters] = useState<Filters>({
    category: null,
    priority: null,
    sortBy: 'created_at',
    sortOrder: 'desc'
  })
  const location = useLocation()

  useEffect(() => {
    fetchCategories()
    fetchTasks()
    
    // Check if we were navigated here with a selected category
    const locationState = location.state as { selectedCategory?: string }
    if (locationState?.selectedCategory) {
      setFilters(prev => ({ ...prev, category: locationState.selectedCategory || null }))
    }
  }, [location])

  const fetchCategories = async () => {
    try {
      console.log('Fetching categories...')
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('No user found')

      const cacheKey = createCacheKey('categories', { user_id: user.id })
      const { data, error } = await cachedQuery(
        cacheKey,
        async () => {
          const response = await supabase
            .from('categories')
            .select('*')
            .eq('user_id', user.id)
          return response
        }
      )

      if (error) throw error
      console.log('Categories fetched:', data)
      setCategories(data || [])
    } catch (error) {
      console.error('Error fetching categories:', error)
      toast.error('Failed to load categories')
    }
  }

  const fetchTasks = async () => {
    try {
      setLoading(true)
      console.log('Fetching tasks...')
      
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('No user found')

      const cacheKey = createCacheKey('todos', { 
        user_id: user.id,
        category: filters.category || 'all'
      })

      const { data, error } = await cachedQuery(
        cacheKey,
        async () => {
          let query = supabase
            .from('todos')
            .select(`
              *,
              task_categories!inner (
                category_id
              )
            `)
            .eq('user_id', user.id)

          if (filters.category) {
            query = query.eq('task_categories.category_id', filters.category)
          }

          if (filters.priority) {
            query = query.eq('priority', filters.priority.toLowerCase())
          }

          // Apply sorting
          query = query.order(filters.sortBy, { ascending: filters.sortOrder === 'asc' })

          return query
        }
      )

      if (error) throw error

      // Transform the data to include category IDs
      const tasksWithCategories = (data as TaskType[]).map(task => ({
        ...task,
        categories: task.task_categories?.map(tc => tc.category_id) || []
      }))

      console.log('Tasks fetched:', tasksWithCategories)
      setTasks(tasksWithCategories)
    } catch (error) {
      console.error('Error fetching tasks:', error)
      toast.error('Failed to load tasks')
    } finally {
      setLoading(false)
    }
  }

  const handleAddTask = async (task: Partial<TaskType>) => {
    try {
      setLoading(true)
      console.log('Adding task:', task)

      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('No user found')

      const { categories, ...taskData } = task
      const newTask = {
        ...taskData,
        user_id: user.id,
        created_at: new Date().toISOString()
      }

      // Insert the task
      const { data, error } = await supabase
        .from('todos')
        .insert([newTask])
        .select()

      if (error) throw error
      console.log('Task added:', data)

      // If there are categories, create the relationships
      if (categories && categories.length > 0 && data) {
        const categoryRelations = categories.map(categoryId => ({
          task_id: data[0].id,
          category_id: categoryId
        }))

        const { error: relationError } = await supabase
          .from('task_categories')
          .insert(categoryRelations)

        if (relationError) throw relationError
      }

      // Clear relevant caches
      clearCache(createCacheKey('todos', { user_id: user.id, category: 'all' }))
      if (selectedCategory) {
        clearCache(createCacheKey('todos', { 
          user_id: user.id,
          category: selectedCategory
        }))
      }

      // Add the new task to the state
      const taskWithCategories = {
        ...data[0],
        categories: categories || []
      }
      setTasks([...tasks, taskWithCategories])
      
      toast.success('Task added successfully')
    } catch (error) {
      console.error('Error adding task:', error)
      toast.error('Failed to add task')
    } finally {
      setLoading(false)
    }
  }

  const handleDuplicateTask = (task: TaskType) => {
    // Open TaskForm with pre-filled data
    const duplicatedTask = {
      ...task,
      title: `Copy of ${task.title}`,
      completed: false,
      created_at: new Date().toISOString()
    }
    // Emit an event that TaskForm can listen to
    const event = new CustomEvent('duplicate-task', { detail: duplicatedTask })
    window.dispatchEvent(event)
  }

  const handleUpdateTask = async (id: string, updates: Partial<TaskType>) => {
    try {
      setLoading(true)
      console.log('Updating task:', id, updates)

      const { error } = await supabase
        .from('todos')
        .update(updates)
        .eq('id', id)

      if (error) throw error

      setTasks(tasks.map(task => 
        task.id === id ? { ...task, ...updates } : task
      ))

      console.log('Task updated successfully')
      toast.success('Task updated successfully')
    } catch (error) {
      console.error('Error updating task:', error)
      toast.error('Failed to update task')
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteTask = async (id: string) => {
    try {
      setLoading(true)
      console.log('Deleting task:', id)

      const { error } = await supabase
        .from('todos')
        .delete()
        .eq('id', id)

      if (error) throw error

      setTasks(tasks.filter(task => task.id !== id))
      console.log('Task deleted successfully')
      toast.success('Task deleted successfully')
    } catch (error) {
      console.error('Error deleting task:', error)
      toast.error('Failed to delete task')
    } finally {
      setLoading(false)
    }
  }

  const handleEditTask = (task: TaskType) => {
    setEditingTask(task)
    setIsAddTaskExpanded(true)
  }

  const handleCancelEdit = () => {
    setEditingTask(null)
    setIsAddTaskExpanded(false)
  }

  useEffect(() => {
    fetchTasks()
  }, [filters])

  const handleFilterChange = (key: keyof Filters, value: string | null) => {
    setFilters(prev => ({ ...prev, [key]: value }))
  }

  if (loading && tasks.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-rebel-red"></div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-rebel-red to-rebel-red-light bg-clip-text text-transparent">
            Your Missions
          </h1>
          
          <div className="flex items-center space-x-4">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`flex items-center space-x-2 px-3 py-2 rounded-lg transition-colors duration-200
                        ${showFilters ? 'bg-dark-800 text-white' : 'text-gray-400 hover:text-white'}`}
            >
              <FunnelIcon className="w-5 h-5" />
              <span className="text-sm">Filters</span>
            </button>
            <button
              onClick={() => setIsAddTaskExpanded(!isAddTaskExpanded)}
              className="flex items-center space-x-2 px-4 py-2 bg-dark-800/50 text-rebel-red border border-rebel-red/20 
                       rounded-lg backdrop-blur-sm hover:bg-rebel-red hover:text-white 
                       transition-all duration-300 group"
            >
              {isAddTaskExpanded ? (
                <>
                  <XMarkIcon className="w-5 h-5" />
                  <span>Cancel</span>
                </>
              ) : (
                <>
                  <PlusIcon className="w-5 h-5" />
                  <span>New Mission</span>
                </>
              )}
            </button>
          </div>
        </div>

        {showFilters && (
          <div className="bg-dark-800/50 rounded-lg p-4 mb-6 grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1">Category</label>
              <select
                value={filters.category || ''}
                onChange={(e) => handleFilterChange('category', e.target.value || null)}
                className="w-full bg-dark-700 border border-dark-600 rounded-lg px-3 py-2 text-white text-sm"
              >
                <option value="">All Categories</option>
                {categories.map(category => (
                  <option key={category.id} value={category.id}>{category.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1">Priority</label>
              <select
                value={filters.priority || ''}
                onChange={(e) => handleFilterChange('priority', e.target.value || null)}
                className="w-full bg-dark-700 border border-dark-600 rounded-lg px-3 py-2 text-white text-sm"
              >
                <option value="">All Priorities</option>
                <option value="LOW">Low</option>
                <option value="MEDIUM">Medium</option>
                <option value="HIGH">High</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1">Sort By</label>
              <select
                value={filters.sortBy}
                onChange={(e) => handleFilterChange('sortBy', e.target.value as any)}
                className="w-full bg-dark-700 border border-dark-600 rounded-lg px-3 py-2 text-white text-sm"
              >
                <option value="created_at">Created Date</option>
                <option value="due_date">Due Date</option>
                <option value="priority">Priority</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1">Sort Order</label>
              <button
                onClick={() => handleFilterChange('sortOrder', filters.sortOrder === 'asc' ? 'desc' : 'asc')}
                className="w-full flex items-center justify-center space-x-2 px-3 py-2 bg-dark-700 
                         border border-dark-600 rounded-lg text-white text-sm hover:bg-dark-600 
                         transition-colors duration-200"
              >
                <ArrowsUpDownIcon className="w-5 h-5" />
                <span>{filters.sortOrder === 'asc' ? 'Ascending' : 'Descending'}</span>
              </button>
            </div>
          </div>
        )}

        <div className="space-y-4">
          {tasks.map(task => (
            <div
              key={task.id}
              onClick={() => setEditingTask(task)}
              className="group bg-dark-800/50 rounded-lg p-4 hover:bg-dark-800 transition-colors duration-200 cursor-pointer"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-3">
                    <input
                      type="checkbox"
                      checked={task.completed}
                      onChange={(e) => {
                        e.stopPropagation() // Prevent opening edit mode
                        handleUpdateTask(task.id, { completed: e.target.checked })
                      }}
                      className="form-checkbox h-5 w-5 text-rebel-red rounded border-dark-600
                               focus:ring-rebel-red focus:ring-offset-dark-900"
                    />
                    <h3 className={`text-lg font-medium ${task.completed ? 'text-gray-500 line-through' : 'text-white'}`}>
                      {task.title}
                    </h3>
                  </div>
                  {task.description && (
                    <p className="mt-1 text-gray-400 line-clamp-2">{task.description}</p>
                  )}
                  <div className="mt-2 flex flex-wrap gap-2">
                    {task.categories?.map(categoryId => {
                      const category = categories.find(c => c.id === categoryId)
                      if (!category) return null
                      return (
                        <span
                          key={category.id}
                          className="px-2 py-1 text-xs rounded-full"
                          style={{ backgroundColor: `${category.color}20`, color: category.color }}
                        >
                          {category.name}
                        </span>
                      )
                    })}
                    {task.priority && (
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        task.priority === 'high' ? 'bg-red-500/20 text-red-500' :
                        task.priority === 'medium' ? 'bg-yellow-500/20 text-yellow-500' :
                        'bg-blue-500/20 text-blue-500'
                      }`}>
                        {task.priority.charAt(0).toUpperCase() + task.priority.slice(1)} Priority
                      </span>
                    )}
                    {task.due_date && (
                      <span className="px-2 py-1 text-xs rounded-full bg-purple-500/20 text-purple-500">
                        Due {new Date(task.due_date).toLocaleDateString()}
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex items-center space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      handleDuplicateTask(task)
                    }}
                    className="p-1 text-gray-400 hover:text-white transition-colors"
                  >
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                    </svg>
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      handleDeleteTask(task.id)
                    }}
                    className="p-1 text-gray-400 hover:text-red-500 transition-colors"
                  >
                    <XMarkIcon className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {editingTask && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-dark-900 rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-bold text-white">Edit Task</h2>
                  <button
                    onClick={() => setEditingTask(null)}
                    className="text-gray-400 hover:text-white transition-colors"
                  >
                    <XMarkIcon className="w-6 h-6" />
                  </button>
                </div>
                <TaskForm
                  initialData={editingTask}
                  onSubmit={async (taskData) => {
                    await handleUpdateTask(editingTask.id!, taskData)
                    setEditingTask(null)
                  }}
                  onCancel={() => setEditingTask(null)}
                  availableCategories={categories}
                />
              </div>
            </div>
          </div>
        )}

        {isAddTaskExpanded && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-dark-900 rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-bold text-white">New Task</h2>
                  <button
                    onClick={() => setIsAddTaskExpanded(false)}
                    className="text-gray-400 hover:text-white transition-colors"
                  >
                    <XMarkIcon className="w-6 h-6" />
                  </button>
                </div>
                <TaskForm
                  onSubmit={async (taskData) => {
                    await handleAddTask(taskData)
                    setIsAddTaskExpanded(false)
                  }}
                  onCancel={() => setIsAddTaskExpanded(false)}
                  availableCategories={categories}
                />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
} 